import { describe, expect, it } from "vitest";
import { check } from "../graphql/execute.ts";
import { schemaFor } from "../graphql/schema.ts";
import { annotate } from "./annotate.ts";

function notes(operation: string, clearance = 5): string[] {
  return check(operation, schemaFor(clearance)).map((error) =>
    annotate({
      message: error.message,
      ...(error.locations?.[0] ? { line: error.locations[0].line } : {}),
    }),
  );
}

const FALLBACK = /archive's own note/;

describe("annotate", () => {
  const cases: [string, string, RegExp][] = [
    [
      "an empty selection",
      `{ city(name: "Lisbon") { # nothing\n } }`,
      /braces/,
    ],
    ["an unknown field", `{ cities { population } }`, /documentation panel/],
    [
      "a record without a selection",
      `{ cities { country } }`,
      /which of that record's fields/,
    ],
    ["a value with a selection", `{ cities { name { x } } }`, /single value/],
    [
      "one field asked twice",
      `{ operative(codename: "A") { codename } operative(codename: "B") { codename } }`,
      /name of its own/,
    ],
    [
      "an unknown argument",
      `{ city(name: "x", title: "x") { name } }`,
      /arguments it accepts/,
    ],
    ["a missing argument", `{ city { name } }`, /which record is wanted/],
    ["an undeclared variable", `{ city(name: $c) { name } }`, /never declared/],
    [
      "an unknown fragment",
      `{ cities { ...Port } }`,
      /no fragment of that name/,
    ],
    [
      "an unused fragment",
      `{ cities { name } } fragment Port on City { name }`,
      /never spread/,
    ],
    [
      "a fragment with no type",
      `{ cities { ...Port } } fragment Port { name }`,
      /which type of record/,
    ],
    ["an unclosed brace", `{ cities { name }`, /braces and parentheses/],
    ["a mutation", `mutation { x }`, /read from|documentation panel/],
  ];

  it.each(cases)("explains %s", (_name, operation, expected) => {
    const [first] = notes(operation);
    expect(first).toMatch(expected);
    expect(first).not.toMatch(FALLBACK);
  });

  it("never contains text to type", () => {
    for (const [, operation] of cases) {
      for (const note of notes(operation)) {
        expect(note).not.toMatch(/[{}]/);
      }
    }
  });

  it("falls back to a general note for anything else", () => {
    expect(annotate({ message: "Something unforeseen." })).toMatch(FALLBACK);
  });
});
