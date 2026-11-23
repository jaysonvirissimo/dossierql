import { describe, expect, it } from "vitest";
import type { Mission } from "../content/types.ts";
import {
  availability,
  clearanceInForce,
  deriveStanding,
  isPlacement,
  nextCase,
  type ProgressEvent,
} from "./clearance.ts";

function mission(
  id: string,
  clearance: number,
  kind: Mission["kind"],
  teaches: Mission["teaches"] = null,
): Mission {
  return { id, clearance, kind, teaches } as Mission;
}
const missions = [
  mission("t1", 1, "teaching", "nested-selections"),
  mission("a1", 1, "assessment"),
  mission("t2", 2, "teaching", "arguments"),
  mission("a2", 2, "assessment"),
  mission("t3", 3, "teaching", "aliases"),
];
const done = (
  missionId: string,
  mode: "independent" | "hinted" | "solution-revealed" = "independent",
): ProgressEvent => ({ type: "completed", missionId, mode, late: false });
const viewed = (missionId: string): ProgressEvent => ({
  type: "solution-viewed",
  missionId,
});

describe("deriveStanding", () => {
  it("starts a new player at clearance 1", () => {
    const s = deriveStanding(missions, []);
    expect(s.clearance).toBe(1);
    expect(availability(missions[2]!, s)).toBe("locked");
    expect(availability(missions[3]!, s)).toBe("available");
  });

  it("promotes on an assessment passed in any mode after the teaching mission", () => {
    const s = deriveStanding(missions, [
      done("t1"),
      viewed("a1"),
      done("a1", "solution-revealed"),
    ]);
    expect(s.clearance).toBe(2);
    expect(s.completions.a1).toMatchObject({ passed: true, placement: false });
    expect(s.cards).toEqual(["nested-selections"]);
  });

  it("passes a placement without the solution reveal and grants skipped levels", () => {
    const s = deriveStanding(missions, [done("a2", "hinted")]);
    expect(s.clearance).toBe(3);
    expect(s.completions.a2).toMatchObject({ passed: true, placement: true });
    expect(s.cards).toEqual(["nested-selections", "arguments"]);
    expect(availability(missions[4]!, s)).toBe("available");
  });

  it("does not pass a placement completed with the solution reveal", () => {
    const s = deriveStanding(missions, [
      viewed("a2"),
      done("a2", "solution-revealed"),
    ]);
    expect(s.clearance).toBe(1);
    expect(s.completions.a2).toMatchObject({ passed: false, placement: true });
  });

  it("does not pass a placement after a reveal in an earlier attempt", () => {
    const s = deriveStanding(missions, [viewed("a2"), done("a2")]);
    expect(s.clearance).toBe(1);
    expect(s.cards).toEqual([]);
  });

  it("never lowers clearance", () => {
    const s = deriveStanding(missions, [done("a2"), done("a1")]);
    expect(s.clearance).toBe(3);
  });

  it("uses the higher clearance during an early assessment", () => {
    const s = deriveStanding(missions, []);
    expect(clearanceInForce(missions[3]!, s)).toBe(2);
    expect(isPlacement(missions[3]!, missions, s)).toBe(true);
    expect(isPlacement(missions[1]!, missions, s)).toBe(true);
    const after = deriveStanding(missions, [done("t1")]);
    expect(isPlacement(missions[1]!, missions, after)).toBe(false);
  });

  it("records a passed drill without rank or a concept card", () => {
    const s = deriveStanding(missions, [
      { type: "drill-passed", drillId: "one-field" },
      { type: "drill-passed", drillId: "one-field" },
    ]);
    expect(s.drills).toEqual(["one-field"]);
    expect(s.clearance).toBe(1);
    expect(s.cards).toEqual([]);
    expect(s.completions).toEqual({});
  });
});

describe("nextCase", () => {
  const next = (events: ProgressEvent[]) =>
    nextCase(missions, deriveStanding(missions, events))?.id;

  it("points a new player at the first teaching case", () => {
    expect(next([])).toBe("t1");
  });

  it("points at the assessment once its teaching case is done", () => {
    expect(next([done("t1")])).toBe("a1");
  });

  it("moves to the next level after a promotion", () => {
    expect(next([done("t1"), done("a1")])).toBe("t2");
  });

  it("points a player promoted by placement at their new level", () => {
    expect(next([done("a2")])).toBe("t3");
  });

  it("falls back to an earlier case when the new level is finished", () => {
    expect(next([done("a2"), done("t3")])).toBe("t1");
  });

  it("points nowhere when every case is complete", () => {
    expect(
      next([done("t1"), done("a1"), done("t2"), done("a2"), done("t3")]),
    ).toBeUndefined();
  });
});
