import {
  buildASTSchema,
  Kind,
  parse,
  visit,
  type ConstDirectiveNode,
  type DocumentNode,
  type GraphQLSchema,
  type TypeNode,
} from "graphql";
import { MAX_CLEARANCE, SDL } from "./sdl.ts";

function clearanceOf(
  directives: readonly ConstDirectiveNode[] | undefined,
): number {
  const directive = directives?.find((d) => d.name.value === "clearance");
  const value = directive?.arguments?.[0]?.value;
  return value?.kind === Kind.INT ? Number(value.value) : 1;
}

function namedType(type: TypeNode): string {
  return type.kind === Kind.NAMED_TYPE ? type.name.value : namedType(type.type);
}

const INTERNAL = new Set(["clearance", "inverse", "undocumented"]);

/**
 * The schema document for one clearance level. Types and fields above the
 * level are removed from the definition itself, so validation, the
 * documentation, and introspection all agree on what exists.
 */
export function schemaDocumentFor(
  level: number,
  keepDirectives = false,
): DocumentNode {
  const full = parse(SDL);
  const hidden = new Set<string>();
  for (const definition of full.definitions) {
    if (
      (definition.kind === Kind.OBJECT_TYPE_DEFINITION ||
        definition.kind === Kind.SCALAR_TYPE_DEFINITION) &&
      clearanceOf(definition.directives) > level
    ) {
      hidden.add(definition.name.value);
    }
  }
  return visit(full, {
    DirectiveDefinition: (node) =>
      !keepDirectives && INTERNAL.has(node.name.value) ? null : undefined,
    ObjectTypeDefinition: (node) =>
      hidden.has(node.name.value) ? null : undefined,
    ScalarTypeDefinition: (node) =>
      hidden.has(node.name.value) ? null : undefined,
    FieldDefinition: (node) =>
      clearanceOf(node.directives) > level || hidden.has(namedType(node.type))
        ? null
        : undefined,
    Directive: (node) =>
      !keepDirectives && INTERNAL.has(node.name.value) ? null : undefined,
  });
}

const cache = new Map<number, GraphQLSchema>();

/** The schema a player at this clearance sees. */
export function schemaFor(level: number): GraphQLSchema {
  const clamped = Math.max(1, Math.min(MAX_CLEARANCE, Math.floor(level)));
  let schema = cache.get(clamped);
  if (!schema) {
    schema = buildASTSchema(schemaDocumentFor(clamped));
    cache.set(clamped, schema);
  }
  return schema;
}

let full: GraphQLSchema | undefined;

/** Everything, with the internal directives kept, for building the store. */
export function fullSchema(): GraphQLSchema {
  full ??= buildASTSchema(schemaDocumentFor(MAX_CLEARANCE, true));
  return full;
}

/** The lowest clearance at which `Type.field` exists, or null if it never does. */
export function fieldClearance(type: string, field: string): number | null {
  for (let level = 1; level <= MAX_CLEARANCE; level++) {
    const candidate = schemaFor(level).getType(type);
    if (
      candidate &&
      "getFields" in candidate &&
      field in candidate.getFields()
    ) {
      return level;
    }
  }
  return null;
}

let undocumented: Set<string> | undefined;

/**
 * Whether the documentation panel leaves out a type, or one of its fields
 * when a field is given (SDD 4). Only introspection describes what the panel
 * leaves out.
 */
export function isUndocumented(type: string, field?: string): boolean {
  if (!undocumented) {
    const found = new Set<string>();
    const marked = (directives: readonly ConstDirectiveNode[] | undefined) =>
      directives?.some((d) => d.name.value === "undocumented") === true;
    for (const definition of parse(SDL).definitions) {
      if (
        definition.kind !== Kind.OBJECT_TYPE_DEFINITION &&
        definition.kind !== Kind.SCALAR_TYPE_DEFINITION
      ) {
        continue;
      }
      const name = definition.name.value;
      if (marked(definition.directives)) found.add(name);
      if (definition.kind === Kind.OBJECT_TYPE_DEFINITION) {
        for (const f of definition.fields ?? []) {
          if (marked(f.directives)) found.add(`${name}.${f.name.value}`);
        }
      }
    }
    undocumented = found;
  }
  return undocumented.has(field === undefined ? type : `${type}.${field}`);
}
