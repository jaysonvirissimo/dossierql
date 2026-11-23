import { describe, expect, it } from "vitest";
import {
  argumentsFromVariables,
  declaresVariables,
  hasStructure,
  parseRequest,
  repeatsWithAliases,
  sharedFragmentSelects,
} from "./technique.ts";

function doc(text: string) {
  const parsed = parseRequest(text);
  if (!parsed) throw new Error(`does not parse: ${text}`);
  return parsed;
}

describe("repeatsWithAliases", () => {
  it("finds two lookups of one field under aliases", () => {
    expect(
      repeatsWithAliases(
        doc(
          `{ a: country(name: "Chile") { capital } b: country(name: "Peru") { capital } }`,
        ),
      ),
    ).toBe(true);
    expect(
      repeatsWithAliases(
        doc(
          `{ country(name: "Chile") { capital } b: country(name: "Peru") { capital } }`,
        ),
      ),
    ).toBe(true);
  });

  it("finds them inside a nested selection", () => {
    expect(
      repeatsWithAliases(
        doc(
          `{ city(name: "Lisbon") { a: country { name } b: country { capital } } }`,
        ),
      ),
    ).toBe(true);
  });

  it("does not count a list, one alias, or a comment", () => {
    expect(repeatsWithAliases(doc(`{ countries { name capital } }`))).toBe(
      false,
    );
    expect(
      repeatsWithAliases(doc(`{ chile: country(name: "Chile") { capital } }`)),
    ).toBe(false);
    expect(
      repeatsWithAliases(
        doc(`{
          # a: country(name: "Peru")
          country(name: "a: country(") { capital }
        }`),
      ),
    ).toBe(false);
  });
});

const SHARED = `{
  a: country(name: "Argentina") { ...Profile }
  b: country(name: "Uruguay") { ...Profile }
}
fragment Profile on Country { name currency { name } }`;

describe("sharedFragmentSelects", () => {
  it("finds a field in a fragment spread twice", () => {
    expect(sharedFragmentSelects(doc(SHARED), "currency")).toBe(true);
    expect(sharedFragmentSelects(doc(SHARED), "name")).toBe(true);
  });

  it("does not count the field written beside the spreads", () => {
    expect(
      sharedFragmentSelects(
        doc(`{
          a: country(name: "Argentina") { ...Profile currency { name } }
          b: country(name: "Uruguay") { ...Profile currency { name } }
        }
        fragment Profile on Country { name }`),
        "currency",
      ),
    ).toBe(false);
  });

  it("does not count a fragment spread once, or a string", () => {
    expect(
      sharedFragmentSelects(
        doc(`{ a: country(name: "Argentina") { ...Profile } }
        fragment Profile on Country { currency { name } }`),
        "currency",
      ),
    ).toBe(false);
    expect(
      sharedFragmentSelects(
        doc(`{ country(name: "fragment P on Country { currency }") { name } }`),
        "currency",
      ),
    ).toBe(false);
  });
});

describe("argumentsFromVariables", () => {
  it("finds an argument taken from a declared variable", () => {
    expect(
      argumentsFromVariables(
        doc(`query Where($city: String!) { city(name: $city) { name } }`),
      ),
    ).toBe(true);
  });

  it("does not count a typed value, or a variable in a string", () => {
    expect(
      argumentsFromVariables(
        doc(`query Where($city: String!) { city(name: "Busan") { name } }`),
      ),
    ).toBe(false);
    expect(
      argumentsFromVariables(doc(`{ city(name: "$city") { name } }`)),
    ).toBe(false);
  });
});

describe("declaresVariables", () => {
  it("reads the operation, not a string", () => {
    expect(
      declaresVariables(`query W($c: String!) { city(name: $c) { name } }`),
    ).toBe(true);
    expect(declaresVariables(`{ city(name: "$c") { name } }`)).toBe(false);
    expect(declaresVariables(`{ city(`)).toBe(false);
  });
});

describe("hasStructure", () => {
  it("asks a fragments kata which field must be shared", () => {
    expect(hasStructure("fragments", doc(SHARED))).toBe(false);
    expect(hasStructure("fragments", doc(SHARED), "currency")).toBe(true);
  });

  it("does not parse a request that is not GraphQL", () => {
    expect(parseRequest("{ country(")).toBeNull();
  });
});
