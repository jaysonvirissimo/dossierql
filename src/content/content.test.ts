import { parse } from "graphql";
import { describe, expect, it } from "vitest";
import { loadContent } from "../../scripts/load-content.ts";
import type { RawContent } from "./catalog.ts";
import type { Mission } from "./types.ts";
import { stepById } from "./steps.ts";
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

  it("covers clearance 1 to 7 with a teaching mission and an assessment each", () => {
    const cases = raw.missions.filter((m) => m.kind !== "coda");
    expect(cases).toHaveLength(14);
  });

  it("ends the first campaign with one coda", () => {
    expect(
      raw.missions.filter((m) => m.kind === "coda").map((m) => m.id),
    ).toEqual(["the-receipt"]);
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
          (m) => (m.stages.manifests!.solution.shipment = "LIS-9999"),
        ),
      ),
    ).toContain("references");
  });

  it("a stage cannot be reached", () => {
    expect(
      codes(mutated(azulejos, (m) => delete m.stages.manifests!.next)),
    ).toContain("reachability");
  });

  it("the clues admit more than one solution", () => {
    expect(
      codes(
        mutated(azulejos, (m) => m.stages["travel-order"]!.clues.splice(0, 1)),
      ),
    ).toContain("clues");
  });

  it("the solution disagrees with the clues", () => {
    expect(
      codes(
        mutated(
          azulejos,
          (m) => (m.stages["travel-order"]!.solution.shipment = "LIS-0522"),
        ),
      ),
    ).toContain("clues");
  });

  it("one clue alone settles a stage whose wrong leads can be ruled out", () => {
    // One ceramic crate now lists roof tiles, so the manifest clue alone
    // picks the crate. The stage is given the refutations that make the
    // rule apply.
    const copy = mutated(azulejos, (m) => {
      m.stages["travel-order"]!.leadOutcomes = {
        "LIS-0486": {
          refutation: {
            claim: "manifest",
            facts: [
              {
                entity: "Shipment:$shipment",
                field: "manifest",
                equals: "Blue slate squares (14 cm)",
              },
            ],
          },
          ruledOut: "Slate.",
        },
        "LIS-0522": {
          refutation: {
            claim: "route",
            facts: [
              {
                entity: "Shipment:$shipment",
                field: "destination",
                equals: "City:praia",
              },
            ],
          },
          ruledOut: "An island.",
        },
      };
    });
    const island = copy.intel
      .map((file) => file.Shipment?.["LIS-0522"])
      .find((record) => record);
    island!.manifest = "Roof tiles";
    expect(validateContent(copy).map((issue) => issue.message)).toContain(
      "The clue alone identifies the lead, so no wrong lead is plausible.",
    );
  });

  it("a claim has a single evidence set", () => {
    expect(
      codes(
        mutated(azulejos, (m) =>
          m.stages.manifests!.claims[0]!.evidenceSets.pop(),
        ),
      ),
    ).toContain("evidence");
  });

  it("an evidence set contains another", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          const sets = m.stages.manifests!.claims[0]!.evidenceSets;
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
        mutated("guest-register", (m) => {
          m.stages.luanda!.leadOutcomes!["SGT-027"]!.refutation!.claim =
            "language";
        }),
      ),
    ).toContain("refutation");
  });

  it("a refutation cannot be cited in the draft of the lead it rules out", () => {
    // True in the data, but its Cite control enters SABLE_IBIS's draft.
    expect(
      codes(
        mutated("three-couriers", (m) => {
          m.stages.zanzibar!.leadOutcomes!.TIN_FALCON!.refutation!.facts.push({
            entity: "Operative:SABLE_IBIS",
            field: "codename",
            equals: "SABLE_IBIS",
          });
        }),
      ),
    ).toContain("citations");
  });

  it("the reference solution does not yield the evidence", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          m.stages.routes!.referenceSolution = `query { city(name: "Lisbon") { name } }`;
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

  describe("a coda", () => {
    const coda = "the-receipt";
    const issues = (change: (mission: Mission) => void) =>
      validateContent(mutated(coda, change))
        .filter((issue) => issue.path === coda && issue.code === "course")
        .map((issue) => issue.message);

    it("has a second stage", () => {
      expect(
        issues((m) => {
          m.stages.again = structuredClone(m.stages.lisbon!);
        }),
      ).toContain("A coda has exactly one stage.");
    });

    it("has a clock", () => {
      expect(
        issues((m) => {
          m.clock = {
            countdown: "The gallery opens in {remaining}",
            expired: "The gallery has opened",
            onExpiry: "end",
          };
        }),
      ).toContain("A coda has no clock.");
    });

    it("teaches a concept", () => {
      expect(
        issues((m) => {
          m.teaches = "variables";
        }),
      ).toContain("A coda teaches nothing new.");
    });

    it("comes before the last case of its campaign", () => {
      expect(
        issues((m) => {
          m.clearance = 4;
        }),
      ).toContain(
        "A coda comes last in its campaign, at the clearance of its last case.",
      );
    });
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
          const stage = m.stages.routes!;
          stage.scaffold.starterQuery = stage.referenceSolution as string;
        }),
      ),
    ).toContain("starter");
  });

  it("a schema pointer names a field that does not exist yet", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          m.stages.manifests!.hints.schema = "Look at Operative.coverNames.";
        }),
      ),
    ).toContain("hints");
  });

  it("mission text uses a term before its clearance", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          m.stages.manifests!.hints.nudge = "Try an alias for each shipment.";
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
          m.stages.manifests!.hints.nudge =
            "Open the destination the same way.";
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
          m.stages.manifests!.objective =
            "Find the `destination` of the crate.";
        }),
      ),
    ).toContain("markup");
  });

  it("a glossary link points at no entry", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          m.stages.manifests!.briefing = "Write a [query](glossary:no-such).";
        }),
      ),
    ).toContain("links");
  });

  it("a glossary link points at an entry the player cannot open yet", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          m.stages.manifests!.briefing = "See [this](glossary:partial-result).";
        }),
      ),
    ).toContain("links");
  });

  it("a stage uses a mechanic before the course introduces it", () => {
    const issues = validateContent(
      mutated(azulejos, (m) => {
        m.stages.luanda!.leadOutcomes = {
          "LUA-011": {
            refutation: {
              claim: "matching-order",
              facts: [
                {
                  entity: "TransferOrder:$order",
                  field: "consignee",
                  equals: "Company:LUA-LANTERN",
                },
              ],
            },
            ruledOut: "Made out to Lantern Export.",
          },
        };
      }),
    );
    expect(issues).toContainEqual({
      path: "vanishing-azulejos.stages.luanda",
      code: "pacing",
      message:
        "The stage uses ruling-out, which no stage up to this one introduces.",
    });
  });

  it("a case gains a clock before the clock is introduced", () => {
    const copy = mutated(azulejos, (m) => {
      m.clock = {
        countdown: "Buyer collects the crate in {remaining}",
        expired: "Buyer has collected the crate",
        onExpiry: "end",
      };
    });
    expect(codes(copy)).toContain("pacing");
  });

  it("a stage introduces a mechanic it does not use", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          m.stages.routes!.introduces = "field-check";
        }),
      ),
    ).toContain("pacing");
  });

  it("a mechanic is used and never introduced", () => {
    expect(
      codes(
        mutated("quiet-consignee", (m) => {
          delete m.stages.callao!.introduces;
        }),
      ),
    ).toContain("pacing");
  });

  it("a mission after the first introduces two mechanics", () => {
    const copy = mutated("guest-register", (m) => {
      m.stages.luanda!.leadOutcomes!["SGT-027"]!.fieldCheck = "Mombasa asks.";
      m.stages.zanzibar!.introduces = "field-check";
    });
    const callao = copy.missions.find((m) => m.id === "quiet-consignee")!;
    delete callao.stages.callao!.introduces;
    expect(validateContent(copy).map((issue) => issue.message)).toContain(
      "A mission after the first introduces at most one mechanic.",
    );
  });

  it("a mission with no clock has a deadline ending", () => {
    expect(
      codes(
        mutated(azulejos, (m) => {
          m.debrief.stampLate = "COLLECTED";
        }),
      ),
    ).toContain("structure");
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

  function kata(id: string, copy: RawContent) {
    const found = copy.katas.find((k) => k.id === id);
    if (!found) throw new Error(`No kata ${id}.`);
    return found;
  }

  it("a kata's reference returns the facts without the technique", () => {
    const copy = structuredClone(raw);
    kata("aliases", copy).reference = `query { countries { name capital } }`;
    expect(validateContent(copy)).toContainEqual({
      path: "katas.aliases.reference",
      code: "kata",
      message: "The reference does not use the kata's technique.",
    });
  });

  it("a case at a kata's level has a reference without the technique", () => {
    const copy = structuredClone(raw);
    const mission = copy.missions.find((m) => m.id === "bound-ledgers");
    const stage = mission?.stages.ports;
    if (!stage) throw new Error("No stage bound-ledgers.ports.");
    const fields = `arrivingShipments { id manifest inspection { finding } consignee { name director { codename organization { name } } } }`;
    stage.referenceSolution = ["Mombasa", "Dar es Salaam", "Maputo"].map(
      (city) => `query { city(name: "${city}") { ${fields} } }`,
    );
    expect(validateContent(copy)).toContainEqual({
      path: "bound-ledgers.stages",
      code: "kata",
      message:
        "No reference solution uses aliases, the technique of the level's kata.",
    });
  });

  it("a kata's starter already passes it", () => {
    const copy = structuredClone(raw);
    const variables = kata("variables", copy);
    variables.variables = variables.referenceVariables;
    expect(codes(copy)).toContain("kata");
  });

  it("a kata's clearance is not its concept's", () => {
    const copy = structuredClone(raw);
    kata("fragments", copy).clearance = 3;
    expect(codes(copy)).toContain("kata");
  });

  it("a kata uses a term before its clearance", () => {
    const copy = structuredClone(raw);
    kata("aliases", copy).payoff = "A fragment would help here.";
    expect(codes(copy)).toContain("terms");
  });
});

describe("validation of steps (SDD 3.7) fails the build when a step", () => {
  const cabinet = "sealed-cabinet";
  const steps = (content: RawContent) =>
    validateContent(content)
      .filter((issue) => issue.code === "steps")
      .map((issue) => issue.message);

  it("is not one the course lists", () => {
    expect(
      steps(mutated(cabinet, (m) => (m.stages.minute!.step = "nothing"))),
    ).toContain("There is no step nothing.");
  });

  it("is introduced in the first stage, beside the concept", () => {
    expect(
      steps(mutated(cabinet, (m) => (m.stages.cabinet!.step = "typename"))),
    ).toContain(
      "The first stage introduces the mission's concept, and no step.",
    );
  });

  it("is introduced by an assessment", () => {
    expect(
      steps(
        mutated("exchange-book", (m) => (m.stages.lusaka!.step = "typename")),
      ),
    ).toContain("Only a teaching mission introduces a step.");
  });

  it("is used before the stage that introduces it", () => {
    const issues = steps(
      mutated(cabinet, (m) => {
        m.stages.cabinet!.referenceSolution = [
          `query { cabinet { label dockets { __typename reference title shipment { id } } } }`,
        ];
      }),
    );
    expect(issues.join(" ")).toMatch(
      /uses the step typename, which no stage up to this one introduces/,
    );
  });

  it("is introduced and not used", () => {
    expect(
      steps(
        mutated(cabinet, (m) => {
          m.stages.held!.referenceSolution = [
            `query { cabinet { dockets { reference heldFor { codename } } } }`,
          ];
        }),
      ),
    ).toContain(
      "The stage introduces typename and its reference solution does not use it.",
    );
  });

  it("is never practised by a later mission", () => {
    expect(
      steps(
        mutated("exchange-book", (m) => {
          const operations = m.stages.lusaka!.referenceSolution as string[];
          m.stages.lusaka!.referenceSolution = operations.map((o) =>
            o.replace("__typename ", ""),
          );
        }),
      ),
    ).toContain("No later mission practises typename.");
  });

  it("belongs to another clearance", () => {
    expect(
      steps(
        mutated(
          "forwarding-address",
          (m) => (m.stages.istanbul!.step = "typename"),
        ),
      ).join(" "),
    ).toMatch(/belongs to clearance 6/);
  });
});

describe("the steps of clearance 7 are recognised from the parsed request", () => {
  const uses = (id: string, query: string) =>
    stepById(id)?.uses(parse(query)) ?? false;

  it("an inline fragment, only with a type condition", () => {
    expect(
      uses(
        "inline-fragment",
        `{ caseFile(reference: "CF-0417") { documents { ... on Telegram { text } } } }`,
      ),
    ).toBe(true);
    expect(uses("inline-fragment", `{ cities { ... { name } } }`)).toBe(false);
  });

  it("an argument on a field inside the query, and not on the first field", () => {
    expect(
      uses(
        "field-argument",
        `{ caseFile(reference: "CF-0417") { documents(city: "Lisbon") { reference } } }`,
      ),
    ).toBe(true);
    expect(
      uses("field-argument", `{ caseFile(reference: "CF-0417") { title } }`),
    ).toBe(false);
    expect(
      uses(
        "field-argument",
        `{ __type(name: "Docket") { fields(includeDeprecated: true) { name } } }`,
      ),
    ).toBe(false);
  });

  it("a true-or-false value", () => {
    expect(
      uses(
        "boolean-value",
        `{ caseFile(reference: "CF-0417") { documents(sealed: true) { reference } } }`,
      ),
    ).toBe(true);
    expect(uses("boolean-value", `{ cities { name } }`)).toBe(false);
  });
});
