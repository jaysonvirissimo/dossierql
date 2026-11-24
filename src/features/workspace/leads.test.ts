import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { loadContent } from "../../../scripts/load-content.ts";
import { buildCatalog } from "../../content/catalog.ts";
import type { Mission, Stage } from "../../content/types.ts";
import {
  act,
  fieldCheckCost,
  startMission,
  type Env,
  type MissionState,
} from "../../engine/mission.ts";
import { stageLeads } from "./leads.ts";

const catalog = buildCatalog(loadContent().raw);

/**
 * No case in the course lists its leads and offers field checks in the same
 * stage, so the board's prices are tested on the engine's fixture, with the
 * Lisbon shipments listed as leads.
 */
const fixture = parse(
  readFileSync(
    new URL("../../engine/fixtures/every-mechanic.yaml", import.meta.url),
    "utf8",
  ),
) as Mission;
const lisbon = fixture.stages.lisbon as Stage;
lisbon.leads = {
  "LIS-0486": { label: "The Cape Town crate" },
  "LIS-0522": { label: "The Praia crate" },
  "LIS-0417": { label: "The Luanda crate" },
};
const azulejos = catalog.missions.find((m) => m.id === "vanishing-azulejos")!;
const env: Env = {
  mission: fixture,
  store: catalog.store,
  world: catalog.world,
  clearance: azulejos.clearance,
};

function begun(): MissionState {
  return act(env, startMission(env), { type: "begin" }).state;
}

function marked(
  state: MissionState,
  leadId: string,
  mark: "ruledOut" | "fieldChecked",
): MissionState {
  const at = state.stages[state.stageId]!;
  return {
    ...state,
    stages: {
      ...state.stages,
      [state.stageId]: {
        ...at,
        drafts: {
          ...at.drafts,
          [leadId]: {
            leadId,
            bindings: {},
            citations: [],
            ruledOut: false,
            fieldChecked: false,
            ...at.drafts[leadId],
            [mark]: true,
          },
        },
      },
    },
  };
}

describe("the case board's prices (SDD 3.5)", () => {
  it("quotes the field check that the returned form would offer", () => {
    const state = begun();
    for (const lead of stageLeads(env, state, lisbon)) {
      expect(lead.fieldCheckHours).toBe(fieldCheckCost(env, state, lead.id));
      expect(lead.fieldCheckHours).toBeGreaterThan(0);
    }
  });

  it("drops the price once the lead is checked or ruled out", () => {
    let state = begun();
    state = marked(state, "LIS-0486", "ruledOut");
    state = marked(state, "LIS-0522", "fieldChecked");
    const byId = Object.fromEntries(
      stageLeads(env, state, lisbon).map((lead) => [lead.id, lead]),
    );
    expect(byId["LIS-0486"]?.fieldCheckHours).toBeUndefined();
    expect(byId["LIS-0522"]?.fieldCheckHours).toBeUndefined();
    expect(byId["LIS-0417"]?.fieldCheckHours).toBe(
      fieldCheckCost(env, state, "LIS-0417"),
    );
  });
});
