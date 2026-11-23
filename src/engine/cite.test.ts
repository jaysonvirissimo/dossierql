import { describe, expect, it } from "vitest";
import { loadContent } from "../../scripts/load-content.ts";
import { buildCatalog } from "../content/catalog.ts";
import type { Stage } from "../content/types.ts";
import { citationAt, factsAlong } from "./cite.ts";
import { act, startMission, type Env, type MissionState } from "./mission.ts";

const catalog = buildCatalog(loadContent().raw);

/** The response to a stage's reference solution, with the ledger it fills. */
function reference(missionId: string, stageId: string) {
  const mission = catalog.missions.find((m) => m.id === missionId)!;
  const env: Env = {
    mission,
    store: catalog.store,
    world: catalog.world,
    clearance: mission.clearance,
  };
  const stage = mission.stages[stageId] as Stage;
  let state: MissionState = act(env, startMission(env), {
    type: "begin",
  }).state;
  // Any stage can be read on its own: it borrows the opening stage's desk.
  state = {
    ...state,
    stageId,
    stages: {
      ...state.stages,
      [stageId]: state.stages[mission.startingStage]!,
    },
  };
  state = act(env, state, {
    type: "edit",
    editor: stage.referenceSolution as string,
  }).state;
  state = act(env, state, { type: "transmit" }).state;
  const record = state.transmissions[0]!;
  const at = (path: string, activeLead: string | null = null) =>
    citationAt(
      record,
      path.split("/").map((part) => (/^\d+$/.test(part) ? Number(part) : part)),
      stage,
      state.ledger,
      activeLead,
    );
  return { record, at };
}

describe("citationAt in the Lisbon opening", () => {
  const { record, at } = reference("vanishing-azulejos", "routes");
  const shipment = "city/departingShipments/0";

  it("carries the whole route when the deepest row is cited", () => {
    expect(at(`${shipment}/destination/country/borders`)).toEqual({
      leadId: "LIS-0417",
      factKeys: [
        "Shipment:LIS-0417.destination",
        "City:luanda.country",
        "Country:AO.borders",
      ],
    });
  });

  it("leaves out a fact above the row that no evidence set uses", () => {
    // The list of Lisbon's shipments is on the way to the manifest, and no
    // claim rests on it.
    expect(
      factsAlong(record, ["city", "departingShipments", 0, "manifest"]),
    ).toEqual(["City:lisbon.departingShipments", "Shipment:LIS-0417.manifest"]);
    expect(at(`${shipment}/manifest`)).toEqual({
      leadId: "LIS-0417",
      factKeys: ["Shipment:LIS-0417.manifest"],
    });
  });

  it("cites a row that no evidence set uses on its own", () => {
    expect(at("city/departingShipments")).toEqual({
      leadId: null,
      factKeys: ["City:lisbon.departingShipments"],
    });
  });

  it("keeps the chain unbroken down to a row beyond the evidence", () => {
    expect(at(`${shipment}/destination/country/name`)?.factKeys).toEqual([
      "Shipment:LIS-0417.destination",
      "City:luanda.country",
      "Country:AO.name",
    ]);
  });

  it("returns nothing for a position that holds no fact", () => {
    expect(at("city/departingShipments/0")).toBeNull();
    expect(at("city/nowhere")).toBeNull();
  });
});

describe("citationAt where one lead is listed under another record", () => {
  const { at } = reference("the-paymaster", "lusaka");
  const direct = "operative/knownAssociates/0";
  const second = `${direct}/knownAssociates/1`;

  it("carries the link from the record a lead was found under", () => {
    expect(at(`${direct}/lastKnownLocation/country/currency`)).toEqual({
      leadId: "OPAL_WREN",
      factKeys: [
        "Operative:GREY_PETREL.knownAssociates",
        "Operative:OPAL_WREN.lastKnownLocation",
        "City:zurich.country",
        "Country:CH.currency",
      ],
    });
  });

  it("does not carry a list that the lead is absent from", () => {
    // BRASS_PIPIT is reached through an associate. GREY_PETREL's own list
    // omits the codename, and citing a currency must not also cite that.
    expect(at(`${second}/lastKnownLocation/country/currency`)).toEqual({
      leadId: "BRASS_PIPIT",
      factKeys: [
        "Operative:BRASS_PIPIT.lastKnownLocation",
        "City:vaduz.country",
        "Country:LI.currency",
      ],
    });
  });

  it("sends a list to the open draft of a lead the list is evidence about", () => {
    const list = "operative/knownAssociates";
    expect(at(list, "OPAL_WREN")?.leadId).toBe("OPAL_WREN");
    // A complete list that omits a lead is evidence about that lead too.
    expect(at(list, "BRASS_PIPIT")?.leadId).toBe("BRASS_PIPIT");
    // With no draft open, the list is about several leads and settles none.
    expect(at(list)?.leadId).toBeNull();
  });

  it("keeps a row under one lead out of another lead's open draft", () => {
    expect(at(`${direct}/lastKnownLocation`, "IRON_FINCH")?.leadId).toBe(
      "OPAL_WREN",
    );
  });
});
