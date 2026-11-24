import {
  getNamedType,
  isInterfaceType,
  isObjectType,
  isUnionType,
  Kind,
  type DirectiveNode,
  type DocumentNode,
  type FieldNode,
  type GraphQLInterfaceType,
  type GraphQLNamedType,
  type GraphQLObjectType,
  type GraphQLSchema,
  type GraphQLUnionType,
  type SelectionSetNode,
  type ValueNode,
  type VariableDefinitionNode,
} from "graphql";
import { fieldShape, isPageType, type Store } from "./store.ts";

/** The clearance from which every result states its weight (SDD 3.3). */
export const WEIGHT_REPORTED_FROM = 6;

/** The clearance from which the clerk refuses a request over the limit. */
export const WEIGHT_LIMITED_FROM = 9;

/** The most a request may weigh from clearance 9 (SDD 3.3). Provisional. */
export const WEIGHT_LIMIT = 200;

type RecordType = GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType;

function isRecordType(
  type: GraphQLNamedType | undefined | null,
): type is RecordType {
  return isObjectType(type) || isInterfaceType(type) || isUnionType(type);
}

const longest = new WeakMap<Store, Map<string, number>>();

/**
 * A list's declared maximum: the longest that list is on any record in the
 * archive. The archive is fixed, so this is as much as the list can ever
 * return. A list at the top level of the schema holds every record of its
 * type, and is counted where it is used.
 */
function listMaximum(store: Store, parent: string, field: string): number {
  let table = longest.get(store);
  if (!table) {
    table = new Map();
    longest.set(store, table);
  }
  const key = `${parent}.${field}`;
  const known = table.get(key);
  if (known !== undefined) return known;
  let most = 0;
  for (const record of store.all(parent)) {
    const value = record[field];
    if (Array.isArray(value)) most = Math.max(most, value.length);
  }
  table.set(key, most);
  return most;
}

/**
 * Request weight (SDD 3.3): the number of records a request could return,
 * computed from the request before it is transmitted. A list counts for its
 * declared maximum. Introspection and `__typename` return descriptions of the
 * archive rather than its records, so they weigh nothing. Where a document
 * holds several operations, only the one transmitted is weighed.
 */
export function requestWeight(
  schema: GraphQLSchema,
  store: Store,
  document: DocumentNode,
  variables: Readonly<Record<string, unknown>> = {},
  operationName?: string,
): number {
  let declared: readonly VariableDefinitionNode[] = [];
  /** The page size a field asks for, written in the query or as a variable. */
  const pageSize = (node: FieldNode): number | null => {
    const value: ValueNode | undefined = node.arguments?.find(
      (a) => a.name.value === "first",
    )?.value;
    if (!value) return null;
    if (value.kind === Kind.INT) return Number(value.value);
    if (value.kind !== Kind.VARIABLE) return null;
    const name = value.name.value;
    const given = variables[name];
    if (typeof given === "number") return given;
    if (given === null) return null;
    const fallback = declared.find(
      (d) => d.variable.name.value === name,
    )?.defaultValue;
    return fallback?.kind === Kind.INT ? Number(fallback.value) : null;
  };
  /**
   * The value of a directive's `if`: written in the query, sent as a
   * variable, or the variable's declared default. Null when it cannot be
   * read, so that the selection is counted.
   */
  const condition = (directive: DirectiveNode): boolean | null => {
    const value = directive.arguments?.find(
      (a) => a.name.value === "if",
    )?.value;
    if (!value) return null;
    if (value.kind === Kind.BOOLEAN) return value.value;
    if (value.kind !== Kind.VARIABLE) return null;
    const name = value.name.value;
    const given = variables[name];
    if (typeof given === "boolean") return given;
    const fallback = declared.find(
      (d) => d.variable.name.value === name,
    )?.defaultValue;
    return fallback?.kind === Kind.BOOLEAN ? fallback.value : null;
  };
  /** Whether `@skip` or `@include` leaves a selection out (SDD 3.3). */
  const excluded = (directives: readonly DirectiveNode[] | undefined) =>
    (directives ?? []).some((d) => {
      const value = condition(d);
      if (value === null) return false;
      if (d.name.value === "skip") return value;
      if (d.name.value === "include") return !value;
      return false;
    });
  const fragments = new Map(
    document.definitions.flatMap((d) =>
      d.kind === Kind.FRAGMENT_DEFINITION ? [[d.name.value, d] as const] : [],
    ),
  );
  const query = schema.getQueryType();

  const weigh = (
    set: SelectionSetNode,
    type: RecordType,
    seen: ReadonlySet<string>,
    /** On a page, how many records its `nodes` can hold. */
    onPage = 0,
  ): number => {
    let total = 0;
    for (const selection of set.selections) {
      if (excluded(selection.directives)) continue;
      if (selection.kind === Kind.FIELD) {
        const name = selection.name.value;
        if (name.startsWith("__")) continue;
        // A union has no fields of its own: only its inline fragments and
        // spreads ask for records.
        const field = isUnionType(type) ? undefined : type.getFields()[name];
        if (!field || !selection.selectionSet) continue;
        const named = getNamedType(field.type);
        if (!isRecordType(named)) continue;
        const root = type === query;
        const shape = fieldShape(field.type);
        const most = root
          ? store.all(named.name).length
          : listMaximum(store, type.name, name);
        const asked = pageSize(selection);
        const size = asked === null ? most : Math.max(0, Math.min(asked, most));
        if (isPageType(named)) {
          // A page is not a record. Its `nodes` hold the records.
          total += weigh(selection.selectionSet, named, seen, size);
          continue;
        }
        if (isPageType(type)) {
          // `pageInfo` is not a record either.
          if (name === "nodes") {
            total += onPage * (1 + weigh(selection.selectionSet, named, seen));
          }
          continue;
        }
        const count = shape.list ? size : 1;
        total += count * (1 + weigh(selection.selectionSet, named, seen));
      } else if (selection.kind === Kind.INLINE_FRAGMENT) {
        const condition = selection.typeCondition
          ? schema.getType(selection.typeCondition.name.value)
          : type;
        if (isRecordType(condition)) {
          total += weigh(selection.selectionSet, condition, seen, onPage);
        }
      } else {
        const name = selection.name.value;
        const fragment = fragments.get(name);
        if (!fragment || seen.has(name)) continue;
        const condition = schema.getType(fragment.typeCondition.name.value);
        if (isRecordType(condition)) {
          total += weigh(
            fragment.selectionSet,
            condition,
            new Set([...seen, name]),
            onPage,
          );
        }
      }
    }
    return total;
  };

  let total = 0;
  for (const definition of document.definitions) {
    if (definition.kind !== Kind.OPERATION_DEFINITION) continue;
    if (
      operationName !== undefined &&
      definition.name?.value !== operationName
    ) {
      continue;
    }
    declared = definition.variableDefinitions ?? [];
    // A mutation's receipts are records, weighed as a query's are.
    const root =
      definition.operation === "query"
        ? query
        : definition.operation === "mutation"
          ? schema.getMutationType()
          : schema.getSubscriptionType();
    if (root) total += weigh(definition.selectionSet, root, new Set());
  }
  return total;
}
