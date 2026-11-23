import { describe, expect, it } from "vitest";
import { check } from "../graphql/execute.ts";
import { schemaFor } from "../graphql/schema.ts";
import { styleIssues } from "../content/style.ts";
import { annotate } from "./annotate.ts";

function notes(operation: string, clearance = 5): string[] {
  return check(operation, schemaFor(clearance)).map((error) =>
    annotate(
      {
        message: error.message,
        ...(error.locations?.[0] ? { line: error.locations[0].line } : {}),
      },
      clearance >= 3,
    ),
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
      "a closing brace too many",
      `{ cities { name } } }`,
      /adds a closing brace each time/,
    ],
    [
      "one field asked twice",
      `{ operative(codename: "A") { codename } operative(codename: "B") { codename } }`,
      /an alias in front of each one/,
    ],
    [
      "an unknown argument",
      `{ city(name: "x", title: "x") { name } }`,
      /arguments that Query\.city accepts/,
    ],
    ["a missing argument", `{ city { name } }`, /which record you want/],
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
    [
      "a fragment that spreads itself",
      `{ operative(codename: "GREY_PETREL") { ...Dossier } } fragment Dossier on Operative { codename knownAssociates { ...Dossier } }`,
      /open each level/,
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

  it("follows the wording rules of SDD 5.7", () => {
    for (const [, operation] of cases) {
      for (const note of notes(operation)) {
        expect(styleIssues(note)).toEqual([]);
      }
    }
  });

  it("falls back to a general note for anything else", () => {
    expect(annotate({ message: "Something unforeseen." }, false)).toMatch(
      FALLBACK,
    );
  });

  it("offers separate transmissions before aliases appear in the glossary", () => {
    const query = `{ company(name: "A") { name } company(name: "B") { name } }`;
    const [note] = notes(query, 2);
    expect(note).toContain('asking for "company" once per transmission');
    expect(note).not.toMatch(/alias|glossary/);
    expect(styleIssues(note!)).toEqual([]);
  });

  it("sends the player to introspection for a type the panel leaves out", () => {
    const [note] = notes(`{ cabinet { contents } }`, 6);
    expect(note).toContain("not in the documentation panel");
    expect(note).toContain("glossary entry for introspection");
    expect(styleIssues(note!)).toEqual([]);
    const [documented] = notes(`{ cities { population } }`, 6);
    expect(documented).toContain("The documentation panel lists");
  });

  it("points to an inline fragment for a field that only one kind has", () => {
    const [note] = notes(
      `{ caseFile(reference: "CF-0417") { documents { text } } }`,
      7,
    );
    expect(note).toContain('Not every kind of Document has "text"');
    expect(note).toContain("Telegram has it");
    expect(note).toContain("glossary entry for an inline fragment");
    expect(note).not.toMatch(/[{}]/);
    expect(styleIssues(note!)).toEqual([]);
  });

  it("explains an inline fragment that can never apply", () => {
    const [note] = notes(
      `{ caseFile(reference: "CF-0417") { documents { ... on Officer { name } } } }`,
      7,
    );
    expect(note).toContain(
      "a record of type Document is never of type Officer",
    );
    expect(note).not.toMatch(FALLBACK);
    expect(styleIssues(note!)).toEqual([]);
  });
  it("tells a player that a union lists no fields of its own", () => {
    const [note] = notes(
      `{ interceptLog(reference: "IL-0112") { entries { name } } }`,
      8,
    );
    expect(note).toContain("Intercept is a union");
    expect(note).toContain('Company and Vessel have "name"');
    expect(note).toContain("glossary entry for a union");
    expect(styleIssues(note!)).toEqual([]);
    const [none] = notes(
      `{ interceptLog(reference: "IL-0112") { entries { colour } } }`,
      8,
    );
    expect(none).toContain("no kind of record in Intercept");
    expect(styleIssues(none!)).toEqual([]);
  });

  it("explains an enum value in quotation marks, a list, and an unknown value", () => {
    const entries = (args: string) =>
      notes(
        `{ interceptLog(reference: "IL-0112") { entries${args} { __typename } } }`,
        8,
      );
    const [quoted] = entries(`(kind: "VESSEL")`);
    expect(quoted).toContain("removing the quotation marks");
    const [list] = entries(`(kind: [VESSEL, COMPANY])`);
    expect(list).toContain("you gave a list");
    const [unknown] = entries(`(kind: SHIP)`);
    expect(unknown).toContain(
      '"SHIP" is not one of the values of InterceptKind',
    );
    for (const note of [quoted, list, unknown]) {
      expect(styleIssues(note!)).toEqual([]);
    }
  });
});
