import { describe, expect, it } from "vitest";
import { braceBalance } from "./braces.ts";

describe("braceBalance", () => {
  it("counts open braces against closed ones", () => {
    expect(braceBalance("query { city { name } }")).toBe(0);
    expect(braceBalance("query { city { name }")).toBe(1);
    expect(braceBalance("query { city { name } } }")).toBe(-1);
  });

  it("ignores braces inside strings and comments", () => {
    expect(braceBalance('query { city(name: "{") { name } }')).toBe(0);
    expect(braceBalance("query { # } } }\n city { name } }")).toBe(0);
    expect(braceBalance('{ a(b: "say \\"}\\"") }')).toBe(0);
  });
});
