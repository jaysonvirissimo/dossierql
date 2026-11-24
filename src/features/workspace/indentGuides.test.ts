import { describe, expect, it } from "vitest";
import { guideColumns } from "./indentGuides.ts";

describe("indent guides (SDD 8.2)", () => {
  it("draw one guide for each block a line is inside", () => {
    expect(
      guideColumns(["query {", "  operative {", "    codename", "  }", "}"]),
    ).toEqual([0, 2, 4, 2, 0]);
  });

  it("count open blocks, not the columns a field is aligned to", () => {
    expect(
      guideColumns([
        "query {",
        "  coverNames { name",
        "               sightings { id",
      ]),
    ).toEqual([0, 2, 4]);
  });

  it("stop short of the text, and run on through a blank line", () => {
    expect(guideColumns(["query {", "a {", "", "  b"])).toEqual([0, 0, 4, 2]);
  });

  it("ignore braces in strings and comments", () => {
    expect(guideColumns(['query { a(s: "{") # {', "  b"])).toEqual([0, 2]);
  });
});
