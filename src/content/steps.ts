import {
  isObjectType,
  isUnionType,
  Kind,
  TypeInfo,
  visit,
  visitWithTypeInfo,
  type DirectiveNode,
  type DocumentNode,
  type ExecutionResult,
  type FieldNode,
} from "graphql";
import { schemaFor } from "../graphql/schema.ts";
import { MAX_CLEARANCE } from "../graphql/sdl.ts";

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
  /**
   * For a step that shows only in a response, such as an error that blanks
   * a list: whether the responses to a stage's reference solution show it.
   * Still read from what the archive returned, never from the query's text.
   */
  observed?: (results: readonly ExecutionResult[]) => boolean;
}

/** Whether an argument of this name is passed to a field outside introspection. */
function hasArgument(document: DocumentNode, name: string): boolean {
  return hasField(
    document,
    (field) =>
      !field.name.value.startsWith("__") &&
      (field.arguments ?? []).some((a) => a.name.value === name),
  );
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

/** Whether any node of the given kind appears in the request. */
function hasNode(document: DocumentNode, kind: Kind): boolean {
  let found = false;
  visit(document, {
    enter(node) {
      if (node.kind === kind) found = true;
    },
  });
  return found;
}

/** Whether a directive that passes `test` is written anywhere in the request. */
function hasDirective(
  document: DocumentNode,
  test: (directive: DirectiveNode) => boolean,
): boolean {
  let found = false;
  visit(document, {
    Directive(node) {
      if (test(node)) found = true;
    },
  });
  return found;
}

/**
 * Whether a named fragment on one member of a union is spread directly inside
 * a field that returns the union.
 */
function spreadsUnionMember(document: DocumentNode): boolean {
  const schema = schemaFor(MAX_CLEARANCE);
  const conditions = new Map<string, string>();
  for (const definition of document.definitions) {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      conditions.set(
        definition.name.value,
        definition.typeCondition.name.value,
      );
    }
  }
  const info = new TypeInfo(schema);
  let found = false;
  visit(
    document,
    visitWithTypeInfo(info, {
      FragmentSpread(node) {
        const parent = info.getParentType();
        const condition = conditions.get(node.name.value);
        if (!condition || !isUnionType(parent)) return;
        const member = schema.getType(condition);
        if (isObjectType(member) && schema.isSubType(parent, member)) {
          found = true;
        }
      },
    }),
  );
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
  {
    id: "enum-value",
    clearance: 8,
    summary:
      "an enum value, written without quotes, as in entries(kind: VESSEL)",
    term: "enum",
    uses: (document) => hasNode(document, Kind.ENUM),
  },
  {
    id: "list-value",
    clearance: 8,
    summary: "a list value, as in entries(kinds: [VESSEL, COMPANY])",
    uses: (document) => hasNode(document, Kind.LIST),
  },
  {
    id: "union-fragment",
    clearance: 8,
    summary:
      "a named fragment for one member of the union, spread inside its selection",
    uses: spreadsUnionMember,
  },
  {
    id: "cursor",
    clearance: 9,
    summary:
      "cursors: pageInfo { hasNextPage endCursor }, then after: to start the next page",
    term: "cursor",
    uses: (document) =>
      hasField(document, (field) => field.name.value === "endCursor") ||
      hasArgument(document, "after"),
  },
  {
    id: "optional-variable",
    clearance: 9,
    summary:
      "a variable that may be left out, such as $after: String on the first page, and null as a value",
    uses: (document) => {
      let found = false;
      visit(document, {
        VariableDefinition(node) {
          if (node.type.kind !== Kind.NON_NULL_TYPE && !node.defaultValue) {
            found = true;
          }
        },
        NullValue() {
          found = true;
        },
      });
      return found;
    },
  },
  {
    id: "null-propagation",
    clearance: 9,
    summary:
      "how null travels upward: a classified entry in a list whose entries may not be null blanks the whole list",
    uses: () => false,
    observed: (results) =>
      results.some((result) =>
        (result.errors ?? []).some(
          (error) =>
            error.message.endsWith("is classified above your clearance.") &&
            typeof error.path?.[error.path.length - 1] === "number",
        ),
      ),
  },
  {
    id: "skip-directive",
    clearance: 10,
    summary: "@skip, which leaves a field out when its condition is true",
    uses: (document) =>
      hasDirective(document, (directive) => directive.name.value === "skip"),
  },
  {
    id: "directive-on-fragment",
    clearance: 10,
    summary:
      "a directive on a group of fields: an inline fragment with no type condition, or a fragment spread",
    uses: (document) => {
      let found = false;
      visit(document, {
        InlineFragment(node) {
          if (!node.typeCondition && (node.directives?.length ?? 0) > 0) {
            found = true;
          }
        },
        FragmentSpread(node) {
          if ((node.directives?.length ?? 0) > 0) found = true;
        },
      });
      return found;
    },
  },
  {
    id: "nested-fragment",
    clearance: 10,
    summary: "a fragment that spreads another fragment",
    uses: (document) =>
      document.definitions.some((definition) => {
        if (definition.kind !== Kind.FRAGMENT_DEFINITION) return false;
        let found = false;
        visit(definition, {
          FragmentSpread() {
            found = true;
          },
        });
        return found;
      }),
  },
  {
    id: "aliased-mutations",
    clearance: 11,
    summary:
      "several mutation fields in one request, which run in the order written, each under an alias",
    uses: (document) =>
      document.definitions.some(
        (definition) =>
          definition.kind === Kind.OPERATION_DEFINITION &&
          definition.operation === "mutation" &&
          definition.selectionSet.selections.filter(
            (s) => s.kind === Kind.FIELD && s.alias,
          ).length >= 2,
      ),
  },
  {
    id: "decimal-number",
    clearance: 11,
    summary: "a decimal number, as in an expense claim's amount: 412.5",
    term: "decimal number",
    uses: (document) => hasNode(document, Kind.FLOAT),
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
