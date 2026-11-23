import { visit, type DocumentNode, type FieldNode } from "graphql";

/**
 * A step (SDD 3.7) is a part of GraphQL smaller than a concept. It is
 * introduced alone, in one stage of a teaching mission, and practised later.
 * Each step is recognised from the parsed request, never from its text.
 */
export interface Step {
  id: string;
  /** The clearance whose teaching mission introduces the step. */
  clearance: number;
  /** What the stage introduces, as the coverage table in SDD 3.7 puts it. */
  summary: string;
  /** A glossary term that mission text may use only from the step's clearance. */
  term?: string;
  uses: (document: DocumentNode) => boolean;
}

const INTROSPECTION = new Set(["__schema", "__type"]);

/** Whether a field passes `test`, if asked anywhere, or only inside introspection. */
function hasField(
  document: DocumentNode,
  test: (field: FieldNode) => boolean,
  insideIntrospection = false,
): boolean {
  let found = false;
  let depth = 0;
  visit(document, {
    Field: {
      enter(node) {
        if (INTROSPECTION.has(node.name.value)) depth++;
        if ((!insideIntrospection || depth > 0) && test(node)) found = true;
      },
      leave(node) {
        if (INTROSPECTION.has(node.name.value)) depth--;
      },
    },
  });
  return found;
}

export const STEPS: readonly Step[] = [
  {
    id: "type-lookup",
    clearance: 6,
    summary:
      "__type(name:), with the fields of one type and their descriptions",
    uses: (document) =>
      hasField(
        document,
        (field) =>
          field.name.value === "__type" && (field.arguments?.length ?? 0) > 0,
      ),
  },
  {
    id: "type-kinds",
    clearance: 6,
    summary:
      "a type's kind, ofType through lists and !, and scalars, including a custom scalar",
    term: "scalar",
    uses: (document) =>
      hasField(
        document,
        (field) => field.name.value === "ofType" || field.name.value === "kind",
        true,
      ),
  },
  {
    id: "typename",
    clearance: 6,
    summary: "__typename, on records the archive hands over without a label",
    uses: (document) =>
      hasField(document, (field) => field.name.value === "__typename"),
  },
  {
    id: "inline-fragment",
    clearance: 7,
    summary:
      "an inline fragment, as in ... on Telegram { text }, for the fields of one kind",
    term: "inline fragment",
    uses: (document) => {
      let found = false;
      visit(document, {
        InlineFragment(node) {
          if (node.typeCondition) found = true;
        },
      });
      return found;
    },
  },
  {
    id: "field-argument",
    clearance: 7,
    summary:
      'an argument on a field inside the query, as in documents(city: "Valparaíso")',
    uses: (document) => {
      let found = false;
      let depth = 0;
      visit(document, {
        Field: {
          enter(node) {
            if (INTROSPECTION.has(node.name.value)) depth += 100;
            if (depth > 0 && depth < 100 && (node.arguments?.length ?? 0) > 0) {
              found = true;
            }
            depth++;
          },
          leave(node) {
            depth--;
            if (INTROSPECTION.has(node.name.value)) depth -= 100;
          },
        },
      });
      return found;
    },
  },
  {
    id: "boolean-value",
    clearance: 7,
    summary: "a true-or-false value, as in documents(sealed: true)",
    uses: (document) => {
      let found = false;
      visit(document, {
        BooleanValue() {
          found = true;
        },
      });
      return found;
    },
  },
];

export function stepById(id: string): Step | undefined {
  return STEPS.find((step) => step.id === id);
}

/** Whether a parsed request uses introspection at all. */
export function usesIntrospection(document: DocumentNode): boolean {
  return hasField(
    document,
    (field) =>
      INTROSPECTION.has(field.name.value) || field.name.value === "__typename",
  );
}
