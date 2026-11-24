import { describe, expect, it } from "vitest";
import { RANK_TITLES, rankTitle } from "./rank.ts";

describe("rankTitle", () => {
  it("reads the title from the clearance", () => {
    expect(rankTitle(1)).toBe("Probationary Clerk");
    expect(rankTitle(5)).toBe("Assistant Analyst");
    expect(rankTitle(12)).toBe("Head of Section");
    expect(rankTitle(13)).toBe("Controller");
  });

  it("has one title for each of the thirteen clearances", () => {
    expect(RANK_TITLES).toHaveLength(13);
    expect(new Set(RANK_TITLES).size).toBe(13);
  });

  it("stays inside the table", () => {
    expect(rankTitle(0)).toBe("Probationary Clerk");
    expect(rankTitle(14)).toBe("Controller");
  });
});
