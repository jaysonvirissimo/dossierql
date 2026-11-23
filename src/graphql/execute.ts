import {
  execute,
  getOperationAST,
  GraphQLError,
  Kind,
  parse,
  specifiedRules,
  validate,
  type ASTVisitor,
  type DocumentNode,
  type ExecutionResult,
  type GraphQLFieldResolver,
  type GraphQLSchema,
  type ValidationContext,
} from "graphql";
import { factKey, type Fact, type FactOccurrence } from "./facts.ts";
import { schemaFor } from "./schema.ts";
import { fieldShape, refOf, type RawRecord, type Store } from "./store.ts";
import { requestWeight, WEIGHT_REPORTED_FROM } from "./weight.ts";

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

function matches(record: RawRecord, args: Record<string, unknown>): boolean {
  return Object.entries(args).every(([name, wanted]) => {
    if (wanted === null || wanted === undefined) return true;
    const actual = record[name] ?? (name === "id" ? record.id : undefined);
    if (typeof actual === "string" && typeof wanted === "string") {
      return actual.trim().toLowerCase() === wanted.trim().toLowerCase();
    }
    return actual === wanted;
  });
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
    if (shape.list) return candidates.filter((r) => matches(r, args));
    const supplied = Object.values(args).some((v) => v != null);
    return supplied ? (candidates.find((r) => matches(r, args)) ?? null) : null;
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
      .filter((r) => matches(r, args));
    note({
      kind: "list",
      refs: records.map((r) => refOf(r.type, r.id)),
      complete: !filtered,
    });
    return records;
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
  const outcome = execute({
    schema,
    document,
    variableValues: transmission.variables ?? {},
    contextValue: context,
    fieldResolver: resolveField,
  });
  if (outcome instanceof Promise) {
    throw new Error("The archive resolves synchronously.");
  }
  const result: ExecutionResult =
    transmission.clearance >= WEIGHT_REPORTED_FROM
      ? {
          ...outcome,
          extensions: { weight: requestWeight(schema, store, document) },
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
