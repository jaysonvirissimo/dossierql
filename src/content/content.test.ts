import { describe, expect, it } from "vitest";
import { loadContent } from "../../scripts/load-content.ts";
import type { RawContent } from "./catalog.ts";
import type { Mission } from "./types.ts";
import { validateContent } from "./validate.ts";

const { raw } = loadContent();

/** The content with one mission changed, to prove a check can fail. */
function mutated(id: string, change: (mission: Mission) => void): RawContent {
  const copy = structuredClone(raw);
  const mission = copy.missions.find((m) => m.id === id);
  if (!mission) throw new Error(`No mission ${id}.`);
  change(mission);
  return copy;
}

function codes(content: RawContent): string[] {
  return [...new Set(validateContent(content).map((issue) => issue.code))];
}

describe("the authored course", () => {
  it("passes every validation check", () => {
    expect(validateContent(raw)).toEqual([]);
  });

  it("covers clearance 1 to 5 with a teaching mission and an assessment each", () => {
    expect(raw.missions).toHaveLength(10);
  });
});

describe("validation fails the build when", () => {
  const azulejos = "vanishing-azulejos";

  it("a mission has an unknown key", () => {
    expect(
      codes(mutated(azulejos, (m) => Object.assign(m, { surprise: true }))),
    ).toContain("structure");
  });

  it("a border is recorded from one side only", () => {
    const copy = structuredClone(raw);
    const angola = copy.world.countries.find((c) => c.code === "AO");
    angola!.borders = angola!.borders.filter((b) => b !== "NA");
    expect(codes(copy)).toContain("world");
  });

  it("a stage refers to a record that does not exist", () => {
    expect(
      codes(
        mutated(
          azulejos,
          (m) => (m.stages.lisbon!.solution.shipment = "LIS-9999"),
        ),
      ),
    ).toContain("references");
  });

  it("a stage cannot be reached", () => {
    expect(
      codes(mutated(azulejos, (m) => delete m.stages.lisbon!.next)),
    ).toContain("reachability");
  });

  it("the clues admit more than one solution", () => {
    expect(
      codes(mutated(azulejos, (m) => m.stages.lisbon!.clues.splice(0, 1))),
    ).toContain("clues");
  });

  it("the solution disagrees with the clues", () => {
    expect(
      codes(
        mutated(
          azulejos,
          (m) => (m.stages.lisbon!.solution.shipment = "LIS-0522"),
        ),
      ),
    ).toContain("clues");
  });

  it("one clue alone settles the opening", () => {
    const copy = structuredClone(raw);
    const slate = copy.intel
      .map((file) => file.Shipment?.["LIS-0522"])
      .find((record) => record);
    slate!.manifest = "Roof tiles";
    expect(codes(copy)).toContain("clues");
  });

  it("a claim has a single evidence set", () => {
    expect(
      codes(
        mutated(azulejos, (m) =>
          m.stages.lisbon!.claims[0]!.evidenceSets.pop(),
        ),
      ),
    ).toContain("evidence");
  });

  it("an evidence set contains another", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          const sets = m.stages.lisbon!.claims[0]!.evidenceSets;
          sets[1]!.facts.push(...sets[0]!.facts);
        }),
      ),
    ).toContain("evidence");
  });

  it("an evidence set needs a field above the mission's clearance", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          m.stages.luanda!.claims[1]!.evidenceSets[1]!.facts = [
            {
              entity: "Operative:$operative",
              field: "directorships",
              includes: "Company:LUA-PARALLAX",
            },
          ];
        }),
      ),
    ).toContain("evidence");
  });

  it("a refutation does not refute", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          m.stages.lisbon!.leadOutcomes!["LIS-0486"]!.refutation!.claim =
            "route";
        }),
      ),
    ).toContain("refutation");
  });

  it("the reference solution does not yield the evidence", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          m.stages.lisbon!.referenceSolution = `query { city(name: "Lisbon") { name } }`;
        }),
      ),
    ).toEqual(expect.arrayContaining(["solvability"]));
  });

  it("the reference solution does not use the concept taught", () => {
    expect(
      codes(mutated("three-couriers", (m) => (m.teaches = "fragments"))),
    ).toContain("curriculum");
  });

  it("a mission requires a concept taught later", () => {
    expect(
      codes(mutated(azulejos, (m) => m.requires.push("aliases"))),
    ).toContain("curriculum");
  });

  it("a clearance level has no assessment", () => {
    const copy = structuredClone(raw);
    copy.missions = copy.missions.filter((m) => m.id !== "bound-ledgers");
    expect(codes(copy)).toContain("course");
  });

  it("an assessment opens with a starter query", () => {
    expect(
      codes(
        mutated("borrowed-chronometer", (m) => {
          m.stages.genoa!.scaffold.starterQuery = "query { cities { name } }";
        }),
      ),
    ).toContain("course");
  });

  it("the starter query already solves the stage", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          const stage = m.stages.lisbon!;
          stage.scaffold.starterQuery = stage.referenceSolution as string;
        }),
      ),
    ).toContain("starter");
  });

  it("a schema pointer names a field that does not exist yet", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          m.stages.lisbon!.hints.schema = "Look at Operative.coverNames.";
        }),
      ),
    ).toContain("hints");
  });

  it("mission text uses a term before its clearance", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          m.stages.lisbon!.hints.nudge = "Try an alias for each shipment.";
        }),
      ),
    ).toContain("terms");
  });

  it("mission text names a record that does not exist", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          m.stages.luanda!.briefing = "Ask about shipment LIS-0999.";
        }),
      ),
    ).toContain("text");
  });

  it("mission text points back without saying at what", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          m.stages.lisbon!.hints.nudge = "Open the destination the same way.";
        }),
      ),
    ).toContain("style");
  });

  it("a drill uses name as a verb", () => {
    const copy = structuredClone(raw);
    copy.drills[0]!.task = "Name each country that borders Portugal.";
    expect(codes(copy)).toContain("style");
  });

  it("a drill uses a term the player has not met", () => {
    const copy = structuredClone(raw);
    copy.drills[0]!.nudge = "Give the field an argument.";
    expect(codes(copy)).toContain("terms");
  });

  it("a glossary definition uses a term from a higher clearance", () => {
    const copy = structuredClone(raw);
    copy.glossary.find((e) => e.id === "field")!.definition =
      "One piece of a record. A fragment can hold several.";
    expect(codes(copy)).toContain("terms");
  });

  it("a plain-text field holds Markdown", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          m.stages.lisbon!.objective = "Find the `destination` of the crate.";
        }),
      ),
    ).toContain("markup");
  });

  it("a glossary link points at no entry", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          m.stages.lisbon!.briefing = "Write a [query](glossary:no-such).";
        }),
      ),
    ).toContain("links");
  });

  it("a glossary link points at an entry the player cannot open yet", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          m.stages.lisbon!.briefing = "See [this](glossary:partial-result).";
        }),
      ),
    ).toContain("links");
  });

  it("a drill's reference does not return the expected facts", () => {
    const copy = structuredClone(raw);
    copy.drills[0]!.reference = copy.drills[0]!.starter;
    expect(codes(copy)).toContain("drill");
  });

  it("a drill's starter already passes it", () => {
    const copy = structuredClone(raw);
    copy.drills[0]!.starter = copy.drills[0]!.reference;
    expect(codes(copy)).toContain("drill");
  });

  it("a drill has an unknown key", () => {
    const copy = structuredClone(raw);
    Object.assign(copy.drills[0]!, { surprise: true });
    expect(codes(copy)).toContain("structure");
  });
});
