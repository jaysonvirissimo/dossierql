import { describe, expect, it } from "vitest";
import { sortMissions } from "./order.ts";
import type { Mission } from "./types.ts";

const m = (
  id: string,
  clearance: number,
  kind: Mission["kind"],
  order: number,
) => ({ id, clearance, kind, order }) as Mission;

describe("sortMissions", () => {
  it("puts a coda after the assessment of its level, whatever the file order", () => {
    const course = [
      m("coda", 2, "coda", 5),
      m("a2", 2, "assessment", 4),
      m("t2", 2, "teaching", 3),
      m("a1", 1, "assessment", 2),
      m("t1", 1, "teaching", 1),
    ];
    expect(sortMissions(course).map((x) => x.id)).toEqual([
      "t1",
      "a1",
      "t2",
      "a2",
      "coda",
    ]);
    expect(sortMissions([...course].reverse()).map((x) => x.id)).toEqual([
      "t1",
      "a1",
      "t2",
      "a2",
      "coda",
    ]);
  });
});
