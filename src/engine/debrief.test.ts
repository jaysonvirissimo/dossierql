import { describe, expect, it } from "vitest";
import type { ConceptCard, Kata, Mission } from "../content/types.ts";
import {
  deductionChain,
  evidenceTransmissions,
  levelConcept,
  readTechnique,
} from "./debrief.ts";
import type { MissionState } from "./mission.ts";

const concepts = [
  { id: "arguments", clearance: 2 },
  { id: "aliases", clearance: 3 },
] as ConceptCard[];
const katas = [{ id: "aliases", concept: "aliases", clearance: 3 }] as Kata[];
const course = { concepts, katas };

const teaching = {
  id: "t3",
  clearance: 3,
  kind: "teaching",
  teaches: "aliases",
} as Mission;
const assessment = {
  id: "a3",
  clearance: 3,
  kind: "assessment",
  teaches: null,
} as Mission;
const levelTwo = {
  id: "a2",
  clearance: 2,
  kind: "assessment",
  teaches: null,
} as Mission;

const ALIASED = `{ a: operative(codename: "X") { codename } b: operative(codename: "Y") { codename } }`;
const SINGLE = `{ operative(codename: "X") { codename } }`;
const COMMENTED = `{
  # a: operative(codename: "X") b: operative(codename: "Y")
  operative(codename: "X") { codename }
}`;

/**
 * A state whose transmissions each supplied one fact; `cited` lists those an
 * accepted form rested on.
 */
function state(operations: string[], cited: number[]): MissionState {
  const ledger = Object.fromEntries(
    operations.map((_, i) => [
      `fact${String(i + 1)}`,
      { sources: [{ transmission: i + 1, path: [] }] },
    ]),
  );
  return {
    transmissions: operations.map((operation, i) => ({ n: i + 1, operation })),
    ledger,
    dispatches: [
      {
        n: 1,
        stageId: "s",
        kind: "resolved",
        text: "",
        cost: 0,
        evidence: [{ claim: "c", facts: cited.map((n) => `fact${String(n)}`) }],
      },
    ],
  } as unknown as MissionState;
}

describe("evidenceTransmissions", () => {
  it("keeps only the transmissions that supplied accepted evidence", () => {
    const s = state([ALIASED, SINGLE, SINGLE], [2, 3]);
    expect(evidenceTransmissions(s).map((t) => t.n)).toEqual([2, 3]);
  });
});

describe("deductionChain", () => {
  it("links each accepted fact to the transmission that first returned it", () => {
    const s = state([SINGLE, SINGLE, SINGLE], [3, 1]);
    const struck = {
      ...s,
      dispatches: [
        {
          n: 0,
          stageId: "s",
          kind: "ruled-out",
          leadId: "L2",
          text: "",
          cost: 0,
        },
        ...s.dispatches,
      ],
    } as MissionState;
    expect(deductionChain(struck)).toEqual([
      {
        stageId: "s",
        ruledOut: ["L2"],
        claims: [
          {
            claim: "c",
            facts: [
              { key: "fact3", transmission: 3 },
              { key: "fact1", transmission: 1 },
            ],
          },
        ],
      },
    ]);
  });

  it("leaves out a stage with nothing accepted and nothing struck", () => {
    expect(deductionChain(state([SINGLE], []))).toEqual([]);
  });
});

describe("levelConcept", () => {
  it("reads an assessment's concept from its clearance", () => {
    expect(levelConcept(teaching, concepts)).toBe("aliases");
    expect(levelConcept(assessment, concepts)).toBe("aliases");
    expect(levelConcept(levelTwo, concepts)).toBe("arguments");
    const coda = { ...assessment, kind: "coda" } as Mission;
    expect(levelConcept(coda, concepts)).toBeNull();
  });
});

describe("readTechnique", () => {
  it("counts an evidence transmission that uses aliases", () => {
    expect(readTechnique(teaching, state([ALIASED], [1]), course)).toEqual({
      kata: katas[0],
      used: true,
    });
  });

  it("does not count a transmission with no evidence, or a comment", () => {
    expect(
      readTechnique(assessment, state([ALIASED, SINGLE], [2]), course)?.used,
    ).toBe(false);
    expect(
      readTechnique(assessment, state([COMMENTED], [1]), course)?.used,
    ).toBe(false);
  });

  it("says nothing for a level with no kata, or with nothing cited", () => {
    expect(readTechnique(levelTwo, state([SINGLE], [1]), course)).toBeNull();
    expect(readTechnique(teaching, state([ALIASED], []), course)).toBeNull();
  });
});
