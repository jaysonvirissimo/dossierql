import {
  getNamedType,
  isInterfaceType,
  isObjectType,
  Kind,
  type DocumentNode,
  type GraphQLInterfaceType,
  type GraphQLNamedType,
  type GraphQLObjectType,
  type GraphQLSchema,
  type SelectionSetNode,
} from "graphql";
import { fieldShape, type Store } from "./store.ts";

/** The clearance from which every result states its weight (SDD 3.3). */
export const WEIGHT_REPORTED_FROM = 6;

type RecordType = GraphQLObjectType | GraphQLInterfaceType;

function isRecordType(
  type: GraphQLNamedType | undefined | null,
): type is RecordType {
  return isObjectType(type) || isInterfaceType(type);
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
 * archive rather than its records, so they weigh nothing.
 */
export function requestWeight(
  schema: GraphQLSchema,
  store: Store,
  document: DocumentNode,
): number {
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
  ): number => {
    let total = 0;
    for (const selection of set.selections) {
      if (selection.kind === Kind.FIELD) {
        const name = selection.name.value;
        if (name.startsWith("__")) continue;
        const field = type.getFields()[name];
        if (!field || !selection.selectionSet) continue;
        const named = getNamedType(field.type);
        if (!isRecordType(named)) continue;
        const root = type === query;
        const shape = fieldShape(field.type);
        const count = shape.list
          ? root
            ? store.all(named.name).length
            : listMaximum(store, type.name, name)
          : 1;
        total += count * (1 + weigh(selection.selectionSet, named, seen));
      } else if (selection.kind === Kind.INLINE_FRAGMENT) {
        const condition = selection.typeCondition
          ? schema.getType(selection.typeCondition.name.value)
          : type;
        if (isRecordType(condition)) {
          total += weigh(selection.selectionSet, condition, seen);
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
          );
        }
      }
    }
    return total;
  };

  let total = 0;
  for (const definition of document.definitions) {
    if (definition.kind !== Kind.OPERATION_DEFINITION) continue;
    const root = definition.operation === "query" ? query : null;
    if (root) total += weigh(definition.selectionSet, root, new Set());
  }
  return total;
}
