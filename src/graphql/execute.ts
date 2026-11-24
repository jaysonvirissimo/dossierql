import {
  execute,
  getOperationAST,
  getNamedType,
  GraphQLError,
  isObjectType,
  Kind,
  parse,
  specifiedRules,
  validate,
  type ASTVisitor,
  type DocumentNode,
  type ExecutionResult,
  type GraphQLFieldResolver,
  type GraphQLObjectType,
  type GraphQLSchema,
  type ValidationContext,
} from "graphql";
import { factKey, type Fact, type FactOccurrence } from "./facts.ts";
import { schemaFor } from "./schema.ts";
import {
  fieldShape,
  isPageType,
  refOf,
  type RawRecord,
  type Store,
} from "./store.ts";
import {
  requestWeight,
  WEIGHT_LIMIT,
  WEIGHT_LIMITED_FROM,
  WEIGHT_REPORTED_FROM,
} from "./weight.ts";

export interface Transmission {
  operation: string;
  variables?: Record<string, unknown> | undefined;
  /** The clearance in force (SDD 3.8). */
  clearance: number;
}

export interface TransmissionResult {
  /**
   * False when the request never reached the archive: it failed to parse or
   * to validate, and the clerk returns it at no cost.
   */
  transmitted: boolean;
  result: ExecutionResult;
  facts: FactOccurrence[];
}

const MAX_DEPTH = 12;
const MAX_FIELDS = 20_000;

function depthLimit(context: ValidationContext): ASTVisitor {
  let depth = 0;
  let reported = false;
  return {
    SelectionSet: {
      enter(node) {
        depth++;
        if (depth > MAX_DEPTH && !reported) {
          reported = true;
          context.reportError(
            new GraphQLError(
              `This request nests selections more than ${String(MAX_DEPTH)} levels deep.`,
              { nodes: node },
            ),
          );
        }
      },
      leave() {
        depth--;
      },
    },
  };
}

/** The engine accepts an empty pair of braces; the archive does not. */
function noEmptySelections(context: ValidationContext): ASTVisitor {
  return {
    SelectionSet(node, _key, parent) {
      if (node.selections.length > 0) return;
      const where =
        parent && "kind" in parent && parent.kind === Kind.FIELD
          ? `The braces after "${parent.name.value}"`
          : "The request's braces";
      context.reportError(
        new GraphQLError(`${where} are empty.`, { nodes: node }),
      );
    },
  };
}

interface Context {
  store: Store;
  clearance: number;
  occurrences: FactOccurrence[];
  resolved: number;
}

function pathArray(path: {
  prev: unknown;
  key: string | number;
}): (string | number)[] {
  const out: (string | number)[] = [];
  let current: { prev: unknown; key: string | number } | undefined = path;
  while (current) {
    out.unshift(current.key);
    current = current.prev as typeof current;
  }
  return out;
}

/** A type's name as an enum value names it: `InterceptLog` is `INTERCEPT_LOG`. */
export function enumName(type: string): string {
  return type.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();
}

/** Text compared as a player would type it: case and accents aside. */
function plain(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

/**
 * Whether a record passes the arguments that filter its list. A field that
 * points at another record, such as a city, matches that record by its id
 * or by its name. A true-or-false field the record does not mention is false.
 * The arguments `kind` and `kinds`, on a field that returns an interface or a
 * union, match a record by the type it was filed as, written as an enum value:
 * a `Vessel` is `VESSEL`.
 */
function matches(
  record: RawRecord,
  args: Record<string, unknown>,
  store: Store,
  schema: GraphQLSchema,
): boolean {
  return Object.entries(args).every(([name, wanted]) => {
    if (wanted === null || wanted === undefined) return true;
    if (name === "kind" || name === "kinds") {
      const kinds: unknown[] = Array.isArray(wanted) ? wanted : [wanted];
      return kinds.includes(enumName(record.type));
    }
    const actual = record[name] ?? (name === "id" ? record.id : undefined);
    if (typeof wanted === "boolean") return (actual ?? false) === wanted;
    if (typeof actual === "string" && typeof wanted === "string") {
      if (plain(actual) === plain(wanted)) return true;
      const type = schema.getType(record.type);
      const field = isObjectType(type) ? type.getFields()[name] : undefined;
      const target = field ? fieldShape(field.type).target : null;
      const other = target ? store.get(target, actual) : undefined;
      return (
        typeof other?.name === "string" && plain(other.name) === plain(wanted)
      );
    }
    return actual === wanted;
  });
}

/** One page of a longer list, as a field that returns a page resolves it. */
interface Page {
  kind: "page";
  /** The record whose list the page is cut from, and that list's field. */
  owner: RawRecord;
  field: string;
  records: RawRecord[];
  /** Whether the page holds the whole list, unfiltered. */
  complete: boolean;
  hasNextPage: boolean;
  endCursor: string | null;
}

interface PageEnd {
  kind: "page-info";
  hasNextPage: boolean;
  endCursor: string | null;
}

function isPage(value: unknown): value is Page | PageEnd {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    (value.kind === "page" || value.kind === "page-info")
  );
}

/** A record's cursor: the reference written beside it, or its id. */
function cursorOf(record: RawRecord): string {
  return typeof record.reference === "string" ? record.reference : record.id;
}

/**
 * A record withheld above the clearance in force takes its place in a list
 * as an error. Where the list's entries may not be null, the error blanks
 * the whole list (SDD 3.7).
 */
function withholding(
  records: readonly RawRecord[],
  clearance: number,
): (RawRecord | GraphQLError)[] {
  return records.map((record) =>
    record.withheld !== undefined && record.withheld > clearance
      ? new GraphQLError(
          `${record.type} ${cursorOf(record)} is classified above your clearance.`,
        )
      : record,
  );
}

/** The page that `first` and `after` cut from a record's list. */
function cutPage(
  record: RawRecord,
  field: string,
  pageType: GraphQLObjectType,
  args: Record<string, unknown>,
  store: Store,
  schema: GraphQLSchema,
): Page {
  const { first, after, ...filters } = args;
  const nodes = pageType.getFields().nodes;
  const target = nodes ? fieldShape(nodes.type).target : null;
  const raw = record[field];
  const ids = Array.isArray(raw) ? (raw as string[]) : [];
  const filtered = Object.values(filters).some((v) => v != null);
  const records = ids
    .map((id) => (target ? store.get(target, id) : undefined))
    .filter((r): r is RawRecord => r !== undefined)
    .filter((r) => matches(r, filters, store, schema));
  let start = 0;
  if (typeof after === "string") {
    const at = records.findIndex((r) => plain(cursorOf(r)) === plain(after));
    if (at < 0) {
      throw new GraphQLError(
        `${record.type}.${field} has no entry "${after}" to start after.`,
      );
    }
    start = at + 1;
  }
  if (typeof first === "number" && first < 0) {
    throw new GraphQLError(
      `A page cannot hold fewer than no entries. This request asked for first: ${String(first)}.`,
    );
  }
  const end =
    typeof first === "number"
      ? Math.min(records.length, start + first)
      : records.length;
  const page = records.slice(start, end);
  const last = page[page.length - 1];
  return {
    kind: "page",
    owner: record,
    field,
    records: page,
    complete: !filtered && start === 0 && end === records.length,
    hasNextPage: end < records.length,
    endCursor: last ? cursorOf(last) : null,
  };
}

const resolveField: GraphQLFieldResolver<unknown, Context> = (
  source,
  args: Record<string, unknown>,
  context,
  info,
) => {
  if (++context.resolved > MAX_FIELDS) {
    throw new GraphQLError(
      "The archive declines to copy out this many records in one request.",
    );
  }
  const shape = fieldShape(info.returnType);
  const { store } = context;

  if (info.parentType === info.schema.getQueryType()) {
    if (shape.target === null) return null;
    const candidates = store.all(shape.target);
    if (shape.list)
      return candidates.filter((r) => matches(r, args, store, info.schema));
    const supplied = Object.values(args).some((v) => v != null);
    return supplied
      ? (candidates.find((r) => matches(r, args, store, info.schema)) ?? null)
      : null;
  }

  if (isPage(source)) {
    const field = info.fieldName;
    if (source.kind === "page-info") {
      return field === "hasNextPage" ? source.hasNextPage : source.endCursor;
    }
    if (field === "pageInfo") {
      const end: PageEnd = {
        kind: "page-info",
        hasNextPage: source.hasNextPage,
        endCursor: source.endCursor,
      };
      return end;
    }
    // The records on a page are a fact about the list they were cut from.
    const owner = refOf(source.owner.type, source.owner.id);
    context.occurrences.push({
      fact: {
        key: factKey(owner, source.field),
        entity: owner,
        field: source.field,
        value: {
          kind: "list",
          refs: source.records.map((r) => refOf(r.type, r.id)),
          complete: source.complete,
        },
      },
      path: pathArray(info.path),
    });
    return withholding(source.records, context.clearance);
  }

  const record = source as RawRecord;
  const field = info.fieldName;
  const needed = record.classified?.[field];
  if (needed !== undefined && needed > context.clearance) {
    throw new GraphQLError(
      `${info.parentType.name}.${field} is classified above your clearance.`,
    );
  }
  const entity = refOf(record.type, record.id);
  const raw = field === "id" ? (record[field] ?? record.id) : record[field];
  const note = (value: Fact["value"]) => {
    context.occurrences.push({
      fact: { key: factKey(entity, field), entity, field, value },
      path: pathArray(info.path),
    });
  };

  const named = getNamedType(info.returnType);
  if (isPageType(named)) {
    return cutPage(record, field, named, args, store, info.schema);
  }

  if (shape.target === null) {
    const value = (raw ?? null) as string | number | boolean | null;
    note({ kind: "scalar", value });
    return value;
  }
  const target = shape.target;
  if (shape.list) {
    const ids = Array.isArray(raw) ? (raw as string[]) : [];
    const filtered = Object.values(args).some((v) => v != null);
    const records = ids
      .map((id) => store.get(target, id))
      .filter((r): r is RawRecord => r !== undefined)
      .filter((r) => matches(r, args, store, info.schema));
    note({
      kind: "list",
      refs: records.map((r) => refOf(r.type, r.id)),
      complete: !filtered,
    });
    return withholding(records, context.clearance);
  }
  const found = typeof raw === "string" ? store.get(target, raw) : undefined;
  note({ kind: "ref", ref: found ? refOf(found.type, found.id) : null });
  return found ?? null;
};

function valueAt(data: unknown, path: readonly (string | number)[]): unknown {
  let current = data;
  for (const key of path) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string | number, unknown>)[key];
  }
  return current;
}

export function parseOperation(
  source: string,
): { document: DocumentNode } | { errors: GraphQLError[] } {
  try {
    return { document: parse(source) };
  } catch (error) {
    return {
      errors: [
        error instanceof GraphQLError ? error : new GraphQLError(String(error)),
      ],
    };
  }
}

/** Parse and validation errors for an operation, without running it. */
export function check(
  source: string,
  schema: GraphQLSchema,
): readonly GraphQLError[] {
  const parsed = parseOperation(source);
  if ("errors" in parsed) return parsed.errors;
  const errors = validate(schema, parsed.document, [
    ...specifiedRules,
    depthLimit,
    noEmptySelections,
  ]);
  if (errors.length > 0) return errors;
  const operations = parsed.document.definitions.filter(
    (d) => d.kind === Kind.OPERATION_DEFINITION,
  );
  if (operations.length === 0) {
    return [new GraphQLError("The request contains no operation.")];
  }
  if (operations.length > 1) {
    return [
      new GraphQLError(
        "A transmission carries one operation. This request contains several.",
      ),
    ];
  }
  const operation = getOperationAST(parsed.document);
  if (operation && operation.operation !== "query") {
    return [
      new GraphQLError(
        `The archive answers queries. It does not accept a ${operation.operation}.`,
      ),
    ];
  }
  return [];
}

/**
 * Runs one operation against the archive. The facts are recorded while the
 * operation executes, from the records being resolved, and not recovered
 * from the response afterwards.
 */
export function transmit(
  store: Store,
  transmission: Transmission,
): TransmissionResult {
  const schema = schemaFor(transmission.clearance);
  const errors = check(transmission.operation, schema);
  if (errors.length > 0) {
    return { transmitted: false, result: { errors }, facts: [] };
  }
  const context: Context = {
    store,
    clearance: transmission.clearance,
    occurrences: [],
    resolved: 0,
  };
  const document = parse(transmission.operation);
  const weight = requestWeight(
    schema,
    store,
    document,
    transmission.variables ?? {},
  );
  if (transmission.clearance >= WEIGHT_LIMITED_FROM && weight > WEIGHT_LIMIT) {
    // Like a request that fails validation, a request over the limit is
    // returned before transmission, and costs nothing (SDD 3.3).
    return {
      transmitted: false,
      result: {
        errors: [
          new GraphQLError(
            `The records clerk weighed this request at ${String(weight)}. The limit at your clearance is ${String(WEIGHT_LIMIT)}.`,
          ),
        ],
      },
      facts: [],
    };
  }
  const outcome = execute({
    schema,
    document,
    variableValues: transmission.variables ?? {},
    contextValue: context,
    fieldResolver: resolveField,
    // A record reached through an interface or a union answers with the
    // type it was filed as.
    typeResolver: (value) => (value as RawRecord).type,
  });
  if (outcome instanceof Promise) {
    throw new Error("The archive resolves synchronously.");
  }
  const result: ExecutionResult =
    transmission.clearance >= WEIGHT_REPORTED_FROM
      ? {
          ...outcome,
          extensions: { weight },
        }
      : outcome;
  if (result.data === undefined || result.data === null) {
    // Variables were refused, or an error emptied the whole response.
    const never = context.resolved === 0;
    return { transmitted: !never, result, facts: [] };
  }
  // A fact counts only if its value survived into the response.
  const facts = context.occurrences.filter((occurrence) => {
    const value = valueAt(result.data, occurrence.path);
    if (value === undefined) return false;
    return occurrence.fact.value.kind === "list" ? value !== null : true;
  });
  return { transmitted: true, result, facts };
}
