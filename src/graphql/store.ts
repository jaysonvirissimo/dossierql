import {
  getNamedType,
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
  /** The record type the field points at, or null for a scalar. */
  target: string | null;
  list: boolean;
}

export function fieldShape(type: GraphQLOutputType): FieldShape {
  const named = getNamedType(type);
  const inner = isNonNullType(type) ? type.ofType : type;
  return {
    target: isObjectType(named) ? named.name : null,
    list: isListType(inner),
  };
}

/**
 * Every record the archive holds, with the lists that `@inverse` derives
 * already filled in, so a record's fields are plain data everywhere.
 */
export class Store {
  private readonly byType = new Map<string, Map<string, RawRecord>>();

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

  all(type: string): RawRecord[] {
    return [...(this.byType.get(type)?.values() ?? [])];
  }

  get(type: string, id: string): RawRecord | undefined {
    return this.byType.get(type)?.get(id);
  }

  getRef(ref: RecordRef): RawRecord | undefined {
    const { type, id } = parseRef(ref);
    return this.get(type, id);
  }

  types(): string[] {
    return [...this.byType.keys()];
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
