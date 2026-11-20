import { isObjectType, type GraphQLObjectType } from "graphql";
import { describe, expect, it } from "vitest";
import { fullSchema } from "../graphql/schema.ts";
import { styleIssues } from "./style.ts";

describe("the wording check", () => {
  it.each([
    "It is opened the same way.",
    "Ask for the capital as before.",
    "Name each country that borders Portugal.",
    "The fields you name come back.",
    "A query names the fields you want.",
    "The director is the person to name.",
    "A named selection, written once.",
    "A field that returns an object needs braces.",
  ])("objects to: %s", (text) => {
    expect(styleIssues(text)).not.toEqual([]);
  });

  it.each([
    "Find the name of each country that borders Portugal.",
    "Ask for its `name` and its capital.",
    "Name in the register",
    "The kwanza is named after a river.",
    "The cover names on file are listed first.",
    "You type the value as a JSON object in the variables panel.",
    "Write `fragment Name on Type` after the query.",
  ])("accepts: %s", (text) => {
    expect(styleIssues(text)).toEqual([]);
  });
});

describe("the schema's descriptions", () => {
  it("follow the wording rules of SDD 5.7", () => {
    const described = Object.values(fullSchema().getTypeMap())
      .filter((type) => isObjectType(type) && !type.name.startsWith("__"))
      .flatMap((type) => [
        type,
        ...Object.values((type as GraphQLObjectType).getFields()),
      ]);
    expect(described.length).toBeGreaterThan(50);
    for (const { name, description } of described) {
      expect([name, styleIssues(description ?? "")]).toEqual([name, []]);
    }
  });
});
