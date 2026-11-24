import { GraphQLError } from "graphql";
import { describe, expect, it } from "vitest";
import { loadContent } from "../../scripts/load-content.ts";
import { buildCatalog } from "../content/catalog.ts";
import { check, transmit } from "../graphql/execute.ts";
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

describe("annotate at clearance 9", () => {
  const { store } = buildCatalog(loadContent().raw);
  const sent = (operation: string, variables?: Record<string, unknown>) =>
    transmit(store, { operation, variables, clearance: 9 }).result.errors?.map(
      (error) =>
        annotate(
          {
            message: error.message,
            ...(error.path ? { path: [...error.path] } : {}),
          },
          true,
        ),
    ) ?? [];
  const book = (args: string) =>
    `{ watchBook(reference: "WB-0112") { entries${args} { nodes { note } pageInfo { endCursor } } } }`;

  const cases: [string, string[], RegExp][] = [
    ["a request over the weight limit", sent(book("")), /page size you give/],
    [
      "a classified entry that blanks a page",
      sent(book(`(first: 5, after: "COR-0200")`)),
      /whole list.*starting the next page after it, with COR-0202 as the cursor/,
    ],
    [
      "a cursor the book does not hold",
      sent(book(`(first: 5, after: "COR-9999")`)),
      /reference of the entry/,
    ],
    ["a page size below zero", sent(book(`(first: -2)`)), /zero or more/],
    [
      "null for a required argument",
      notes(`{ watchBook(reference: null) { title } }`, 9),
      /may not be null/,
    ],
    [
      "null for a required variable",
      sent(`query B($r: ID!) { watchBook(reference: $r) { title } }`, {
        r: null,
      }),
      /variables panel/,
    ],
  ];

  for (const [name, found, expected] of cases) {
    it(`explains ${name}`, () => {
      expect(found).toHaveLength(1);
      expect(found[0]).toMatch(expected);
      expect(found[0]).not.toMatch(FALLBACK);
      expect(styleIssues(found[0] ?? "")).toEqual([]);
    });
  }
});

describe("annotate at clearance 10", () => {
  const { store } = buildCatalog(loadContent().raw);
  const sent = (operation: string, variables?: Record<string, unknown>) =>
    transmit(store, { operation, variables, clearance: 10 }).result.errors?.map(
      (error) => annotate({ message: error.message }, true),
    ) ?? [];
  const sheet = (directive: string, declared = "($detail: Boolean!)") =>
    `query D${declared} { paperFile(reference: "DAY-0112") { papers(first: 1) { nodes { reference minuteSheet ${directive} { remark } } } } }`;

  const cases: [string, string[], RegExp][] = [
    [
      "an unknown directive",
      sent(sheet("@inclde(if: $detail)"), { detail: true }),
      /checking the spelling of the word after the @/,
    ],
    [
      "a directive in the wrong place",
      sent(
        `query D($detail: Boolean!) @include(if: $detail) { paperFile(reference: "DAY-0112") { title } }`,
        { detail: true },
      ),
      /after a field, after a fragment spread/,
    ],
    [
      "a directive written twice",
      sent(sheet("@skip(if: $detail) @skip(if: $detail)"), { detail: true }),
      /written twice in the same place/,
    ],
    [
      "a variable that may be left out where a value may not be",
      sent(sheet("@include(if: $detail)", "($detail: Boolean)"), {
        detail: true,
      }),
      /declares "\$detail" as Boolean, without the !.*Boolean!/,
    ],
    [
      "a required variable left out",
      sent(sheet("@include(if: $detail)"), {}),
      /may not be left out\. You type its value in the variables panel/,
    ],
    [
      "true written in quotation marks",
      sent(sheet(`@include(if: "true")`, "")),
      /true or false, written without quotation marks/,
    ],
    [
      "true typed in quotation marks in the variables panel",
      sent(sheet("@include(if: $detail)"), { detail: "true" }),
      /not true or false/,
    ],
  ];

  for (const [name, found, expected] of cases) {
    it(`explains ${name}`, () => {
      expect(found).toHaveLength(1);
      expect(found[0]).toMatch(expected);
      expect(found[0]).not.toMatch(FALLBACK);
      expect(found[0]).not.toMatch(/[{}]/);
      expect(styleIssues(found[0] ?? "")).toEqual([]);
    });
  }

  it("explains a directive with no value for if, beside the unused variable", () => {
    const found = sent(sheet("@include"), { detail: true });
    expect(found.some((n) => /needs a value for "if"/.test(n))).toBe(true);
    const wrong = sent(sheet("@include(when: $detail)"), { detail: true });
    expect(
      wrong.some((n) => /only argument that "@include" takes/.test(n)),
    ).toBe(true);
  });
});

describe("annotate at clearance 11", () => {
  const { store } = buildCatalog(loadContent().raw);
  const actions = {
    fileExpenseClaim: () => {
      throw new GraphQLError(
        'No journey book holds a journey "JRN-9999". A journey is given by the reference written beside it.',
      );
    },
    fileTravelOrder: () => {
      throw new Error("not used");
    },
    requestSearchWarrant: () => {
      throw new Error("not used");
    },
    requestWarrant: () => {
      throw new Error("not used");
    },
  };
  const sent = (operation: string, withActions = true) =>
    transmit(store, {
      operation,
      clearance: 11,
      ...(withActions ? { actions } : {}),
    }).result.errors?.map((error) =>
      annotate({ message: error.message }, true),
    ) ?? [];

  const cases: [string, string[], RegExp][] = [
    [
      "a mutation field asked for in a query",
      sent(`{ fileExpenseClaim(journey: "JRN-0402", amount: 24) { status } }`),
      /starts with the word mutation instead of query/,
    ],
    [
      "a number in quotation marks",
      sent(
        `mutation { fileExpenseClaim(journey: "JRN-0405", amount: "412.5") { status } }`,
      ),
      /removing the quotation marks/,
    ],
    [
      "a journey the books do not hold",
      sent(
        `mutation { fileExpenseClaim(journey: "JRN-9999", amount: 1) { status } }`,
      ),
      /found no journey with the reference "JRN-9999"/,
    ],
    [
      "paperwork outside a case",
      sent(
        `mutation { fileExpenseClaim(journey: "JRN-0402", amount: 24) { status } }`,
        false,
      ),
      /Mutations are filed during a case/,
    ],
  ];
  for (const [name, found, expected] of cases) {
    it(`explains ${name}`, () => {
      expect(found).toHaveLength(1);
      expect(found[0]).toMatch(expected);
      expect(found[0]).not.toMatch(FALLBACK);
      expect(found[0]).not.toMatch(/[{}]/);
      expect(styleIssues(found[0] ?? "")).toEqual([]);
    });
  }
});

describe("annotate at clearance 12", () => {
  const at12 = (operation: string, blockStrings = true): string[] =>
    check(operation, schemaFor(12)).map((error) =>
      annotate(
        {
          message: error.message,
          ...(error.locations?.[0] ? { line: error.locations[0].line } : {}),
        },
        true,
        blockStrings,
      ),
    );
  const cases: [string, string[], RegExp][] = [
    [
      "a @oneOf form with both boxes filled",
      at12(
        `mutation { requestWarrant(input: { subject: { operative: "GILT_MAGPIE", company: "Adriatic Line" } }) { approved } }`,
      ),
      /exactly one of its boxes/,
    ],
    [
      "a form without a box it must have",
      at12(
        `mutation { requestWarrant(input: { statement: "x" }) { approved } }`,
      ),
      /box "subject" that must be filled/,
    ],
    [
      "a box the form does not have",
      at12(
        `mutation { requestSearchWarrant(input: { premises: "PRM-1201", room: 4 }) { granted } }`,
      ),
      /no box called "room"/,
    ],
    [
      "a form given as text",
      at12(`mutation { requestSearchWarrant(input: "PRM-1201") { granted } }`),
      /written in braces/,
    ],
    [
      "a quotation mark that ends a string early",
      at12(
        `mutation { requestSearchWarrant(input: { premises: "PRM-1211", statement: "He said "Keep" it" }) { granted } }`,
      ),
      /block string/,
    ],
    [
      "an application filed as a query",
      at12(
        `{ requestWarrant(input: { subject: { operative: "GILT_MAGPIE" } }) { approved } }`,
      ),
      /field of Mutation/,
    ],
  ];
  for (const [name, found, expected] of cases) {
    it(`explains ${name}`, () => {
      expect(found).toHaveLength(1);
      expect(found[0]).toMatch(expected);
      expect(found[0]).not.toMatch(FALLBACK);
      expect(found[0]).not.toMatch(/[{}]/);
      expect(styleIssues(found[0] ?? "")).toEqual([]);
    });
  }

  it("names a block string only from the clearance that introduces it", () => {
    const [note] = at12(
      `mutation { requestSearchWarrant(input: { premises: "PRM-1211", statement: "He said "Keep" it" }) { granted } }`,
      false,
    );
    expect(note).toMatch(/backslash/);
    expect(note).not.toMatch(/block string/);
  });
});
