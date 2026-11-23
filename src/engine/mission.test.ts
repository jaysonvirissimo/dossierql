import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { loadContent } from "../../scripts/load-content.ts";
import { buildCatalog } from "../content/catalog.ts";
import type { Mission, Stage } from "../content/types.ts";
import { COSTS } from "./clock.ts";
import { reviewDraft } from "./draft.ts";
import {
  act,
  deskStages,
  fieldCheckCost,
  formatted,
  startMission,
  type Action,
  type Env,
  type MissionState,
} from "./mission.ts";

const catalog = buildCatalog(loadContent().raw);

function envFor(id: string): Env {
  const mission = catalog.missions.find((m) => m.id === id)!;
  return {
    mission,
    store: catalog.store,
    world: catalog.world,
    clearance: mission.clearance,
  };
}

/**
 * The engine is tested against a fixture that uses every mechanic in one
 * stage: a clock that continues after its deadline, two refutations, and
 * field checks. No case in the course has all of these at once (SDD 3.15).
 */
const fixture = parse(
  readFileSync(
    new URL("./fixtures/every-mechanic.yaml", import.meta.url),
    "utf8",
  ),
) as Mission;
const env: Env = { ...envFor("vanishing-azulejos"), mission: fixture };
const lisbon = env.mission.stages.lisbon as Stage;
const luanda = env.mission.stages.luanda as Stage;

function run(state: MissionState, ...actions: Action[]): MissionState {
  return actions.reduce((s, action) => act(env, s, action).state, state);
}

function begun(): MissionState {
  return run(startMission(env), { type: "begin" });
}

function afterReference(stage: Stage, from: MissionState): MissionState {
  return run(
    from,
    { type: "edit", editor: stage.referenceSolution as string },
    { type: "transmit" },
  );
}

const cite = (
  leadId: string,
  label: string,
  ...factKeys: string[]
): Action => ({
  type: "cite",
  leadId,
  label,
  factKeys,
});

const ROUTE_0417 = [
  "Shipment:LIS-0417.destination",
  "City:luanda.country",
  "Country:AO.borders",
];
const ROUTE_0522 = [
  "Shipment:LIS-0522.destination",
  "City:praia.country",
  "Country:CV.borders",
];

function lisbonSolved(): MissionState {
  return run(
    afterReference(lisbon, begun()),
    cite("LIS-0417", "cargo", "Shipment:LIS-0417.manifest"),
    cite("LIS-0417", "route", ...ROUTE_0417),
    { type: "name", leadId: "LIS-0417", binding: "country", value: "AO" },
  );
}

describe("transmissions and the clock", () => {
  it("charges one hour for an executed query and nothing for a rejected one", () => {
    const start = begun();
    const sent = afterReference(lisbon, start);
    expect(start.hoursLeft - sent.hoursLeft).toBe(COSTS.transmission);
    expect(sent.transmissions).toHaveLength(1);
    const bad = act(
      env,
      run(start, { type: "edit", editor: "query { city { nope } }" }),
      { type: "transmit" },
    );
    expect(bad.notice?.kind).toBe("rejected");
    expect(bad.state.hoursLeft).toBe(start.hoursLeft);
    expect(bad.state.transmissions).toHaveLength(0);
    expect(bad.state.rejected?.errors.length).toBeGreaterThan(0);
  });

  it("links every recorded fact back to its transmission and path", () => {
    const sent = afterReference(lisbon, begun());
    const entry = sent.ledger["Shipment:LIS-0417.manifest"];
    expect(entry?.fact.value).toEqual({
      kind: "scalar",
      value: "Blue ceramic squares (14 cm)",
    });
    expect(entry?.sources[0]?.transmission).toBe(1);
    expect(entry?.sources[0]?.path.at(-1)).toBe("manifest");
  });

  it("resolves an action that uses the last hour before the clock expires", () => {
    const state = { ...lisbonSolved(), hoursLeft: 4 };
    const out = act(env, state, { type: "proceed", leadId: "LIS-0417" });
    expect(out.state.stageId).toBe("luanda");
    expect(out.state.hoursLeft).toBe(0);
    expect(out.state.clock).toBe("continuing");
  });

  it("shows the shortfall when an action costs more than the time left", () => {
    const state = { ...lisbonSolved(), hoursLeft: 3 };
    const out = act(env, state, { type: "proceed", leadId: "LIS-0417" });
    expect(out.notice).toEqual({
      kind: "shortfall",
      action: "This journey",
      needed: 4,
      left: 3,
    });
    expect(out.state).toBe(state);
    const passed = act(env, state, { type: "let-deadline-pass" });
    expect(passed.state.clock).toBe("continuing");
  });
});

describe("citations and drafts", () => {
  it("attaches only retrieved facts in a grouped citation", () => {
    const state = run(
      afterReference(lisbon, begun()),
      cite("LIS-0417", "route", ...ROUTE_0417, "Shipment:LIS-0417.inspection"),
    );
    const draft = state.stages.lisbon!.drafts["LIS-0417"]!;
    expect(draft.citations[0]?.factKeys).toEqual(ROUTE_0417);
    const none = run(
      begun(),
      cite("LIS-0417", "cargo", "Shipment:LIS-0417.manifest"),
    );
    expect(none.stages.lisbon!.drafts["LIS-0417"]).toBeUndefined();
  });

  it("reviews a draft and rules out a lead without spending time", () => {
    const sent = afterReference(lisbon, begun());
    const cited = run(
      sent,
      cite("LIS-0486", "cargo", "Shipment:LIS-0486.manifest"),
    );
    const review = reviewDraft(
      lisbon,
      cited.stages.lisbon!.drafts["LIS-0486"]!,
      cited.ledger,
    );
    expect(review.claims.find((c) => c.id === "manifest")?.status).toBe(
      "refuted",
    );
    expect(review.canRuleOut).toBe(true);
    const out = act(env, cited, { type: "rule-out", leadId: "LIS-0486" });
    expect(out.state.hoursLeft).toBe(sent.hoursLeft);
    expect(out.state.stages.lisbon!.drafts["LIS-0486"]!.ruledOut).toBe(true);
    expect(out.notice).toMatchObject({ kind: "dispatch" });
    expect(out.state.stages.lisbon!.drafts["LIS-0486"]!.citations).toHaveLength(
      1,
    );
  });

  it("says when a claim's evidence is cited only in part", () => {
    const state = run(
      afterReference(lisbon, begun()),
      cite("LIS-0417", "destination", "Shipment:LIS-0417.destination"),
      { type: "name", leadId: "LIS-0417", binding: "country", value: "AO" },
    );
    const review = reviewDraft(
      lisbon,
      state.stages.lisbon!.drafts["LIS-0417"]!,
      state.ledger,
    );
    expect(review.claims.find((c) => c.id === "route")).toMatchObject({
      status: "open",
      counted: ["Shipment:LIS-0417.destination"],
      gap: "missing",
    });
    expect(review.claims.find((c) => c.id === "manifest")).toMatchObject({
      status: "open",
      counted: [],
      gap: "none",
    });
  });

  it("lists under a supported claim the cited facts that support it", () => {
    const draft = lisbonSolved().stages.lisbon!.drafts["LIS-0417"]!;
    const review = reviewDraft(lisbon, draft, lisbonSolved().ledger);
    expect(review.claims.find((c) => c.id === "route")).toMatchObject({
      status: "supported",
      counted: ROUTE_0417,
      gap: "none",
    });
    expect(review.claims.find((c) => c.id === "manifest")?.counted).toEqual([
      "Shipment:LIS-0417.manifest",
    ]);
  });

  it("tells cited facts that do not connect from a fact that is missing", () => {
    const review = (...keys: string[]) => {
      const state = run(
        afterReference(lisbon, begun()),
        cite("LIS-0417", "route", ...keys),
        { type: "name", leadId: "LIS-0417", binding: "country", value: "AO" },
      );
      return reviewDraft(
        lisbon,
        state.stages.lisbon!.drafts["LIS-0417"]!,
        state.ledger,
      ).claims.find((c) => c.id === "route");
    };
    // The shipment went to Luanda, and the country cited is Praia's.
    expect(review(ROUTE_0417[0]!, ROUTE_0522[1]!)).toMatchObject({
      status: "open",
      counted: [ROUTE_0417[0], ROUTE_0522[1]],
      gap: "disconnected",
    });
    expect(review(ROUTE_0417[0]!, ROUTE_0417[1]!)).toMatchObject({
      status: "open",
      gap: "missing",
    });
  });

  it("says when connected facts do not lead to the record chosen", () => {
    const state = run(
      afterReference(lisbon, begun()),
      cite("LIS-0417", "route", ...ROUTE_0417),
      { type: "name", leadId: "LIS-0417", binding: "country", value: "CV" },
    );
    const review = reviewDraft(
      lisbon,
      state.stages.lisbon!.drafts["LIS-0417"]!,
      state.ledger,
    );
    expect(review.claims.find((c) => c.id === "route")).toMatchObject({
      status: "open",
      counted: ROUTE_0417,
      gap: "mismatch",
    });
  });

  it("lists under a refuted claim the facts that contradict it", () => {
    const state = run(
      afterReference(lisbon, begun()),
      cite("LIS-0486", "cargo", "Shipment:LIS-0486.manifest"),
    );
    const review = reviewDraft(
      lisbon,
      state.stages.lisbon!.drafts["LIS-0486"]!,
      state.ledger,
    );
    expect(review.claims.find((c) => c.id === "manifest")).toMatchObject({
      status: "refuted",
      counted: ["Shipment:LIS-0486.manifest"],
    });
  });

  it("flags a citation that bears on no claim", () => {
    const state = run(
      afterReference(lisbon, begun()),
      cite("LIS-0417", "id", "Shipment:LIS-0417.id"),
    );
    const draft = state.stages.lisbon!.drafts["LIS-0417"]!;
    expect(reviewDraft(lisbon, draft, state.ledger).unrelated).toEqual([
      draft.citations[0]!.id,
    ]);
  });

  it("lets an absent border refute only when the whole list was retrieved", () => {
    const whole = run(
      afterReference(lisbon, begun()),
      cite("LIS-0522", "route", ...ROUTE_0522),
    );
    expect(
      reviewDraft(
        lisbon,
        whole.stages.lisbon!.drafts["LIS-0522"]!,
        whole.ledger,
      ).canRuleOut,
    ).toBe(true);
    const partial = structuredClone(whole);
    const borders = partial.ledger["Country:CV.borders"]!.fact.value;
    if (borders.kind === "list") borders.complete = false;
    expect(
      reviewDraft(
        lisbon,
        partial.stages.lisbon!.drafts["LIS-0522"]!,
        partial.ledger,
      ).canRuleOut,
    ).toBe(false);
  });

  it("keeps each lead's citations in its own draft", () => {
    const state = run(
      afterReference(lisbon, begun()),
      cite("LIS-0417", "cargo", "Shipment:LIS-0417.manifest"),
      cite("LIS-0522", "cargo", "Shipment:LIS-0522.manifest"),
      { type: "open-lead", leadId: "LIS-0417" },
    );
    const drafts = state.stages.lisbon!.drafts;
    expect(drafts["LIS-0417"]!.citations.map((c) => c.factKeys)).toEqual([
      ["Shipment:LIS-0417.manifest"],
    ]);
    expect(drafts["LIS-0522"]!.citations.map((c) => c.factKeys)).toEqual([
      ["Shipment:LIS-0522.manifest"],
    ]);
    expect(state.stages.lisbon!.activeLead).toBe("LIS-0417");
  });
});

describe("field checks and travel", () => {
  it("spends the quoted cost on a field check and leaves the stage open", () => {
    const state = run(
      afterReference(lisbon, begun()),
      cite("LIS-0522", "cargo", "Shipment:LIS-0522.manifest"),
    );
    const quoted = fieldCheckCost(env, state, "LIS-0522");
    const out = act(env, state, { type: "field-check", leadId: "LIS-0522" });
    expect(state.hoursLeft - out.state.hoursLeft).toBe(quoted);
    expect(out.state.stageId).toBe("lisbon");
    expect(out.state.ledger).toEqual(state.ledger);
    expect(out.notice).toMatchObject({
      kind: "dispatch",
      dispatch: { kind: "field-check", leadId: "LIS-0522" },
    });
    const again = act(env, out.state, {
      type: "field-check",
      leadId: "LIS-0522",
    });
    expect(again.notice?.kind).toBe("refused");
  });

  it("refuses a field check on a lead with a cited contradiction", () => {
    const state = run(
      afterReference(lisbon, begun()),
      cite("LIS-0522", "cargo", "Shipment:LIS-0522.manifest"),
      cite("LIS-0522", "route", ...ROUTE_0522),
    );
    expect(
      act(env, state, { type: "field-check", leadId: "LIS-0522" }).notice?.kind,
    ).toBe("refused");
  });

  it("refuses travel until every claim is supported and the destination is right", () => {
    const sent = afterReference(lisbon, begun());
    const half = run(
      sent,
      cite("LIS-0417", "cargo", "Shipment:LIS-0417.manifest"),
      {
        type: "name",
        leadId: "LIS-0417",
        binding: "country",
        value: "AO",
      },
    );
    const refused = act(env, half, { type: "proceed", leadId: "LIS-0417" });
    expect(refused.notice?.kind).toBe("refused");
    expect(refused.state.hoursLeft).toBe(half.hoursLeft);
    const wrong = run(lisbonSolved(), {
      type: "name",
      leadId: "LIS-0417",
      binding: "country",
      value: "ZA",
    });
    expect(
      act(env, wrong, { type: "proceed", leadId: "LIS-0417" }).notice?.kind,
    ).toBe("refused");
  });

  it("accepts either evidence route for a claim", () => {
    const state = run(
      afterReference(lisbon, begun()),
      {
        type: "edit",
        editor: `{ shipment(id: "LIS-0417") { inspection { finding } } country(code: "NA") { borders { name } } }`,
      },
      { type: "transmit" },
      cite(
        "LIS-0417",
        "inspection",
        "Shipment:LIS-0417.inspection",
        "Inspection:INS-LIS-0417.finding",
      ),
      cite(
        "LIS-0417",
        "route",
        "Shipment:LIS-0417.destination",
        "City:luanda.country",
        "Country:NA.borders",
      ),
      { type: "name", leadId: "LIS-0417", binding: "country", value: "AO" },
    );
    const review = reviewDraft(
      lisbon,
      state.stages.lisbon!.drafts["LIS-0417"]!,
      state.ledger,
    );
    expect(review.canProceed).toBe(true);
  });
});

function luandaSolved(from: MissionState): MissionState {
  return run(
    afterReference(luanda, from),
    cite(
      "LUA-012",
      "label",
      "Shipment:LIS-0417.intake",
      "IntakeRecord:INT-LUA-0417.consignee",
      "Shipment:LIS-0417.transferOrders",
      "TransferOrder:LUA-012.consignee",
    ),
    cite("LUA-012", "signer", "TransferOrder:LUA-012.authorizedBy"),
    { type: "name", leadId: "LUA-012", binding: "shipment", value: "LIS-0417" },
    {
      type: "name",
      leadId: "LUA-012",
      binding: "operative",
      value: "NIGHTJAR",
    },
  );
}

describe("finishing a case with two stages and a clock", () => {
  it("completes on time, independently", () => {
    const arrived = act(env, lisbonSolved(), {
      type: "proceed",
      leadId: "LIS-0417",
    });
    expect(arrived.state.stageId).toBe("luanda");
    expect(arrived.state.stages.luanda!.editor).toContain("Luanda");
    const out = act(env, luandaSolved(arrived.state), {
      type: "proceed",
      leadId: "LUA-012",
    });
    expect(out.state.status).toBe("complete");
    expect(out.state.outcome).toEqual({ mode: "independent", late: false });
    expect(out.events).toEqual([
      {
        type: "completed",
        missionId: "vanishing-azulejos",
        mode: "independent",
        late: false,
      },
    ]);
  });

  it("rejects the wrong signer", () => {
    const arrived = act(env, lisbonSolved(), {
      type: "proceed",
      leadId: "LIS-0417",
    });
    const wrong = run(luandaSolved(arrived.state), {
      type: "name",
      leadId: "LUA-012",
      binding: "operative",
      value: "COPPER_KITE",
    });
    const out = act(env, wrong, { type: "proceed", leadId: "LUA-012" });
    expect(out.notice?.kind).toBe("refused");
    expect(out.state.status).toBe("investigating");
  });

  it("continues untimed after the deadline with evidence, drafts and free help", () => {
    const before = run(
      afterReference(lisbon, begun()),
      cite("LIS-0486", "cargo", "Shipment:LIS-0486.manifest"),
      { type: "rule-out", leadId: "LIS-0486" },
    );
    const late = run(before, { type: "let-deadline-pass" });
    expect(late.clock).toBe("continuing");
    expect(late.ledger).toEqual(before.ledger);
    expect(late.stages.lisbon!.drafts).toEqual(before.stages.lisbon!.drafts);
    expect(late.dispatches.at(-1)?.text).toBe("Buyer has collected the crate");
    const hinted = run(late, { type: "hint" }, { type: "reveal" });
    expect(hinted.hoursLeft).toBe(0);
    expect(hinted.stages.lisbon!.solutionRevealed).toBe(true);
    const arrived = run(
      hinted,
      cite("LIS-0417", "cargo", "Shipment:LIS-0417.manifest"),
      cite("LIS-0417", "route", ...ROUTE_0417),
      { type: "name", leadId: "LIS-0417", binding: "country", value: "AO" },
      { type: "proceed", leadId: "LIS-0417" },
    );
    const out = act(env, luandaSolved(arrived), {
      type: "proceed",
      leadId: "LUA-012",
    });
    expect(out.state.outcome).toEqual({
      mode: "solution-revealed",
      late: true,
    });
  });
});

describe("help", () => {
  it("charges more for each step of the ladder and records the mode", () => {
    let state = begun();
    const spent: number[] = [];
    for (let step = 0; step < 4; step++) {
      const next = run(state, { type: "hint" });
      spent.push(state.hoursLeft - next.hoursLeft);
      state = next;
    }
    expect(spent).toEqual([...COSTS.hints]);
    expect(run(state, { type: "hint" }).hoursLeft).toBe(state.hoursLeft);
    expect(state.hintsTaken).toBe(4);
  });

  it("charges for the solution while the clock runs and reports it viewed", () => {
    const start = begun();
    const out = act(env, start, { type: "reveal" });
    expect(start.hoursLeft - out.state.hoursLeft).toBe(COSTS.solutionReveal);
    expect(out.events).toEqual([
      { type: "solution-viewed", missionId: "vanishing-azulejos" },
    ]);
  });

  it("ends a later mission at the deadline and still shows the solution free", () => {
    const later = envFor("borrowed-chronometer");
    const started = act(later, startMission(later), { type: "begin" }).state;
    const ended = act(later, started, { type: "let-deadline-pass" }).state;
    expect(ended.clock).toBe("ended");
    expect(act(later, ended, { type: "transmit" }).notice?.kind).toBe(
      "refused",
    );
    const shown = act(later, ended, { type: "reveal" });
    expect(shown.state.stages.genoa!.solutionRevealed).toBe(true);
    expect(shown.state.hoursLeft).toBe(0);
  });

  it("carries the editor into the next stage where a mission asks for it", () => {
    const vars = envFor("forwarding-address");
    const trieste = vars.mission.stages.trieste!;
    let state = act(vars, startMission(vars), { type: "begin" }).state;
    expect(state.stages.trieste!.variables).toContain("Trieste");
    const steps: Action[] = [
      { type: "edit", editor: trieste.referenceSolution as string },
      { type: "transmit" },
      cite("TRS-0611", "consignee", "Shipment:TRS-0611.consignee"),
      cite(
        "TRS-0611",
        "route",
        "Shipment:TRS-0611.destination",
        "City:istanbul.country",
        "Country:TR.continent",
      ),
      { type: "name", leadId: "TRS-0611", binding: "country", value: "TR" },
      { type: "proceed", leadId: "TRS-0611" },
    ];
    for (const step of steps) state = act(vars, state, step).state;
    expect(state.stageId).toBe("istanbul");
    expect(state.stages.istanbul!.editor).toBe(trieste.referenceSolution);
    expect(state.stages.istanbul!.variables).toContain("Trieste");
  });
});

describe("a case with no clock", () => {
  const untimed = envFor("vanishing-azulejos");
  const stages = untimed.mission.stages;
  const go = (state: MissionState, ...actions: Action[]): MissionState =>
    actions.reduce((s, action) => act(untimed, s, action).state, state);
  const open = (): MissionState => go(startMission(untimed), { type: "begin" });
  const send = (state: MissionState, stageId: string): MissionState =>
    go(
      state,
      { type: "edit", editor: stages[stageId]!.referenceSolution as string },
      { type: "transmit" },
    );

  it("prices nothing and cannot expire", () => {
    const start = open();
    expect(start.clock).toBe("none");
    expect(start.budget).toBe(0);
    const sent = send(start, "manifests");
    expect(sent.transmissions[0]?.cost).toBe(0);
    const helped = go(sent, { type: "hint" }, { type: "reveal" });
    expect(helped.hoursLeft).toBe(0);
    expect(helped.clock).toBe("none");
    expect(helped.stages.manifests!.hintStep).toBe(1);
    expect(helped.stages.manifests!.solutionRevealed).toBe(true);
    const passed = act(untimed, helped, { type: "let-deadline-pass" });
    expect(passed.state).toBe(helped);
  });

  it("moves to the next stage in the same country without a journey", () => {
    const cited = go(
      send(open(), "manifests"),
      cite("LIS-0486", "manifest", "Shipment:LIS-0486.manifest"),
    );
    const out = act(untimed, cited, { type: "proceed", leadId: "LIS-0486" });
    expect(out.state.stageId).toBe("routes");
    expect(out.notice).toMatchObject({
      kind: "dispatch",
      dispatch: { kind: "accepted", cost: 0 },
    });
    expect(deskStages(untimed.mission, "travel-order")).toEqual([
      "manifests",
      "routes",
      "travel-order",
    ]);
    expect(deskStages(untimed.mission, "luanda")).toEqual(["luanda"]);
  });

  it("completes the travel order from facts already in the ledger, on time", () => {
    let state = go(
      send(open(), "manifests"),
      cite("LIS-0486", "manifest", "Shipment:LIS-0486.manifest"),
      { type: "proceed", leadId: "LIS-0486" },
    );
    state = go(
      send(state, "routes"),
      cite("LIS-0522", "route", ...ROUTE_0522),
      { type: "proceed", leadId: "LIS-0522" },
    );
    expect(state.stageId).toBe("travel-order");
    const sentSoFar = state.transmissions.length;
    const travelled = act(
      untimed,
      go(
        state,
        cite("LIS-0417", "cargo", "Shipment:LIS-0417.manifest"),
        cite("LIS-0417", "route", ...ROUTE_0417),
        { type: "name", leadId: "LIS-0417", binding: "country", value: "AO" },
      ),
      { type: "proceed", leadId: "LIS-0417" },
    );
    expect(travelled.state.stageId).toBe("luanda");
    expect(travelled.state.transmissions).toHaveLength(sentSoFar);
    expect(travelled.notice).toMatchObject({
      dispatch: { kind: "travel", cost: 0 },
    });
    state = go(
      send(travelled.state, "luanda"),
      cite(
        "LUA-012",
        "label",
        "Shipment:LIS-0417.intake",
        "IntakeRecord:INT-LUA-0417.consignee",
        "Shipment:LIS-0417.transferOrders",
        "TransferOrder:LUA-012.consignee",
      ),
      cite("LUA-012", "signer", "TransferOrder:LUA-012.authorizedBy"),
      {
        type: "name",
        leadId: "LUA-012",
        binding: "shipment",
        value: "LIS-0417",
      },
      {
        type: "name",
        leadId: "LUA-012",
        binding: "operative",
        value: "NIGHTJAR",
      },
    );
    const out = act(untimed, state, { type: "proceed", leadId: "LUA-012" });
    expect(out.state.outcome).toEqual({ mode: "independent", late: false });
  });
});

describe("ruling out in The Guest Register", () => {
  const guest = envFor("guest-register");
  const play = (state: MissionState, ...actions: Action[]) =>
    actions.reduce((s, action) => act(guest, s, action).state, state);

  it("rules out both wrong sightings from the reference query alone", () => {
    const sent = play(
      startMission(guest),
      { type: "begin" },
      {
        type: "edit",
        editor: guest.mission.stages.luanda!.referenceSolution as string,
      },
      { type: "transmit" },
    );
    const out = play(
      sent,
      cite(
        "SGT-027",
        "name",
        "Sighting:SGT-027.nameGiven",
        "Operative:NIGHTJAR.coverNames",
      ),
      { type: "rule-out", leadId: "SGT-027" },
      cite(
        "SGT-034",
        "language",
        "Sighting:SGT-034.city",
        "City:maputo.country",
        "Country:MZ.languages",
      ),
      { type: "rule-out", leadId: "SGT-034" },
    );
    const drafts = out.stages.luanda!.drafts;
    expect(drafts["SGT-027"]?.ruledOut).toBe(true);
    expect(drafts["SGT-034"]?.ruledOut).toBe(true);
  });
});

describe("formatted", () => {
  it("lays a request over several lines and keeps the word query if typed", () => {
    expect(formatted('query { country(name: "Chile") { name } }')).toBe(
      'query {\n  country(name: "Chile") {\n    name\n  }\n}',
    );
    expect(formatted('{ country(name: "Chile") { name } }')).toBe(
      '{\n  country(name: "Chile") {\n    name\n  }\n}',
    );
  });
});
