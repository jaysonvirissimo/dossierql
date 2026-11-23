import {
  Kind,
  parse,
  visit,
  type DocumentNode,
  type FragmentDefinitionNode,
  type SelectionSetNode,
} from "graphql";
import type { Concept } from "../content/types.ts";

/**
 * Structure checks on a parsed request (SDD 3.11). Each reads the syntax
 * tree, never the typed text, so that a comment or a string cannot count as
 * use of a technique.
 */

/** The parsed request, or null when the text does not parse. */
export function parseRequest(text: string): DocumentNode | null {
  try {
    return parse(text);
  } catch {
    return null;
  }
}

/**
 * Whether some selection asks for one field more than once under different
 * response keys. GraphQL allows that only with aliases, so it is the shape of
 * two lookups combined into one request.
 */
export function repeatsWithAliases(doc: DocumentNode): boolean {
  let found = false;
  visit(doc, {
    SelectionSet(node: SelectionSetNode) {
      const keys = new Map<string, Set<string>>();
      for (const selection of node.selections) {
        if (selection.kind !== Kind.FIELD) continue;
        const name = selection.name.value;
        const key = selection.alias?.value ?? name;
        const seen = keys.get(name) ?? new Set<string>();
        seen.add(key);
        keys.set(name, seen);
        if (seen.size > 1) found = true;
      }
    },
  });
  return found;
}

function selects(set: SelectionSetNode, field: string): boolean {
  let found = false;
  visit(set, {
    Field(node) {
      if (node.name.value === field) found = true;
    },
  });
  return found;
}

/**
 * Whether a fragment that asks for the field is spread in two or more
 * places, so that the field is written once and appears in each of them.
 */
export function sharedFragmentSelects(
  doc: DocumentNode,
  field: string,
): boolean {
  const spreads = new Map<string, number>();
  visit(doc, {
    FragmentSpread(node) {
      const name = node.name.value;
      spreads.set(name, (spreads.get(name) ?? 0) + 1);
    },
  });
  return doc.definitions.some(
    (definition): definition is FragmentDefinitionNode =>
      definition.kind === Kind.FRAGMENT_DEFINITION &&
      (spreads.get(definition.name.value) ?? 0) >= 2 &&
      selects(definition.selectionSet, field),
  );
}

/**
 * Whether the request declares a variable and takes every argument from a
 * variable, so that a different record is looked up by changing only the
 * JSON input.
 */
export function argumentsFromVariables(doc: DocumentNode): boolean {
  let declared = false;
  let literal = false;
  let argued = false;
  visit(doc, {
    VariableDefinition() {
      declared = true;
    },
    Argument(node) {
      argued = true;
      if (node.value.kind !== Kind.VARIABLE) literal = true;
    },
  });
  return declared && argued && !literal;
}

export type KataConcept = Extract<
  Concept,
  "aliases" | "fragments" | "variables"
>;

export const KATA_CONCEPTS: readonly KataConcept[] = [
  "aliases",
  "fragments",
  "variables",
];

/** Whether the request has the structure a kata of the concept asks for. */
export function hasStructure(
  concept: KataConcept,
  doc: DocumentNode,
  field?: string,
): boolean {
  switch (concept) {
    case "aliases":
      return repeatsWithAliases(doc);
    case "fragments":
      return field !== undefined && sharedFragmentSelects(doc, field);
    case "variables":
      return argumentsFromVariables(doc);
  }
}

/** Whether the request declares a variable, and so reads the panel. */
export function declaresVariables(text: string): boolean {
  const doc = parseRequest(text);
  return (
    doc?.definitions.some(
      (definition) =>
        definition.kind === Kind.OPERATION_DEFINITION &&
        (definition.variableDefinitions?.length ?? 0) > 0,
    ) ?? false
  );
}
