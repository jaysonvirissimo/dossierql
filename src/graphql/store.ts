import {
  getNamedType,
  isAbstractType,
  isListType,
  isNonNullType,
  isObjectType,
  type GraphQLObjectType,
  type GraphQLOutputType,
  type GraphQLSchema,
} from "graphql";

export type Scalar = string | number | boolean | null;
/** A record as authored: scalars, and identifiers of other records. */
export interface RawRecord {
  type: string;
  id: string;
  /** Fields withheld below a clearance level, by field name. */
  classified?: Record<string, number>;
  /** The clearance below which the whole record is withheld from a list. */
  withheld?: number;
  [field: string]: unknown;
}

/** "Type:id", the stable identity evidence refers to. */
export type RecordRef = string;

export function refOf(type: string, id: string): RecordRef {
  return `${type}:${id}`;
}

export function parseRef(ref: RecordRef): { type: string; id: string } {
  const at = ref.indexOf(":");
  return { type: ref.slice(0, at), id: ref.slice(at + 1) };
}

export interface FieldShape {
  /**
   * The record type the field points at, or null for a scalar. For a field
   * that returns an interface, this is the interface, and each record keeps
   * the type it was filed as.
   */
  target: string | null;
  list: boolean;
}

/**
 * A page of a longer list (SDD 5.3): a type with the fields `nodes`, the
 * records on the page, and `pageInfo`, where the page ends. A page is not a
 * record. It has no identity of its own, records no fact, and weighs nothing.
 */
export function isPageType(type: unknown): type is GraphQLObjectType {
  if (!isObjectType(type)) return false;
  const fields = type.getFields();
  return "nodes" in fields && "pageInfo" in fields;
}

export function fieldShape(type: GraphQLOutputType): FieldShape {
  const named = getNamedType(type);
  // A page is cut from the list a record holds: read as data, the field is
  // that list of the records on its pages.
  if (isPageType(named)) {
    const nodes = named.getFields().nodes;
    if (nodes) return { target: fieldShape(nodes.type).target, list: true };
  }
  const inner = isNonNullType(type) ? type.ofType : type;
  return {
    target: isObjectType(named) || isAbstractType(named) ? named.name : null,
    list: isListType(inner),
  };
}

/**
 * Every record the archive holds, with the lists that `@inverse` derives
 * already filled in, so a record's fields are plain data everywhere.
 */
export class Store {
  private readonly byType = new Map<string, Map<string, RawRecord>>();
  /** The types that implement each interface. */
  private readonly kinds = new Map<string, string[]>();

  constructor(records: readonly RawRecord[], fullSchema: GraphQLSchema) {
    for (const record of records) {
      let table = this.byType.get(record.type);
      if (!table) {
        table = new Map();
        this.byType.set(record.type, table);
      }
      const existing = table.get(record.id);
      // A later file may add fields to a record an earlier one introduced.
      table.set(
        record.id,
        existing
          ? {
              ...existing,
              ...record,
              classified: { ...existing.classified, ...record.classified },
            }
          : { ...record },
      );
    }
    for (const type of Object.values(fullSchema.getTypeMap())) {
      if (isAbstractType(type)) {
        this.kinds.set(
          type.name,
          fullSchema.getPossibleTypes(type).map((kind) => kind.name),
        );
      }
    }
    this.fillInverses(fullSchema);
  }

  private fillInverses(schema: GraphQLSchema): void {
    for (const type of Object.values(schema.getTypeMap())) {
      if (!isObjectType(type) || type.name.startsWith("__")) continue;
      for (const field of Object.values(type.getFields())) {
        const inverse = inverseOf(type, field.name);
        if (inverse === null) continue;
        const shape = fieldShape(field.type);
        if (shape.target === null) continue;
        for (const record of this.all(type.name)) {
          const matches = this.all(shape.target)
            .filter((other) => {
              const value = other[inverse];
              return Array.isArray(value)
                ? value.includes(record.id)
                : value === record.id;
            })
            .map((other) => other.id);
          record[field.name] = shape.list ? matches : (matches[0] ?? null);
        }
      }
    }
  }

  /** Every record of a type, or of every type that implements an interface. */
  all(type: string): RawRecord[] {
    const kinds = this.kinds.get(type);
    if (kinds) return kinds.flatMap((kind) => this.all(kind));
    return [...(this.byType.get(type)?.values() ?? [])];
  }

  /** One record, looked up by a type or by an interface it implements. */
  get(type: string, id: string): RawRecord | undefined {
    const kinds = this.kinds.get(type);
    if (kinds) {
      for (const kind of kinds) {
        const found = this.get(kind, id);
        if (found) return found;
      }
      return undefined;
    }
    return this.byType.get(type)?.get(id);
  }

  /**
   * The reference to a record that a field of type `type` points at. A
   * record reached through an interface is referred to by its own type.
   */
  refFor(type: string, id: string): RecordRef {
    const found = this.get(type, id);
    return found ? refOf(found.type, found.id) : refOf(type, id);
  }

  getRef(ref: RecordRef): RawRecord | undefined {
    const { type, id } = parseRef(ref);
    return this.get(type, id);
  }

  types(): string[] {
    return [...this.byType.keys()];
  }

  /**
   * The archive with more records filed in it, such as the receipts for the
   * paperwork a player filed. The records must not need `@inverse` lists:
   * this store's inverses are not computed again.
   */
  with(records: readonly RawRecord[]): Store {
    if (records.length === 0) return this;
    const byType = new Map(this.byType);
    for (const record of records) {
      const table = new Map(byType.get(record.type) ?? []);
      table.set(record.id, record);
      byType.set(record.type, table);
    }
    const copy = Object.create(Store.prototype) as Store;
    return Object.assign(copy, { byType, kinds: this.kinds });
  }
}

export function inverseOf(
  type: GraphQLObjectType,
  fieldName: string,
): string | null {
  const node = type.getFields()[fieldName]?.astNode;
  const directive = node?.directives?.find((d) => d.name.value === "inverse");
  const arg = directive?.arguments?.[0]?.value;
  return arg?.kind === "StringValue" ? arg.value : null;
}
