import {
  leadBinding,
  type Mission,
  type Stage,
  type World,
} from "../content/types.ts";
import { transmit } from "../graphql/execute.ts";
import { mergeFact, type Fact } from "../graphql/facts.ts";
import type { Store } from "../graphql/store.ts";
import type { CompletionMode, ProgressEvent } from "./clearance.ts";
import { computeBudget, COSTS, travelHours } from "./clock.ts";
import { emptyDraft, reviewDraft, type Draft } from "./draft.ts";

export interface Env {
  mission: Mission;
  store: Store;
  world: World;
  /** The clearance in force (SDD 3.8). */
  clearance: number;
}

export interface SourceLink {
  transmission: number;
  path: (string | number)[];
}

export interface LedgerEntry {
  fact: Fact;
  sources: SourceLink[];
}

export interface ResultError {
  message: string;
  path?: (string | number)[];
  line?: number;
  column?: number;
}

export interface TransmissionRecord {
  n: number;
  stageId: string;
  operation: string;
  variables: string;
  data: unknown;
  errors: ResultError[];
  facts: { key: string; path: (string | number)[] }[];
  cost: number;
}

export interface Dispatch {
  n: number;
  stageId: string;
  kind: "ruled-out" | "field-check" | "travel" | "deadline" | "resolved";
  leadId?: string;
  text: string;
  cost: number;
}

export interface StageState {
  editor: string;
  variables: string;
  /** Steps of the hint ladder taken, 0 to 4. */
  hintStep: number;
  solutionRevealed: boolean;
  activeLead: string | null;
  drafts: Record<string, Draft>;
}

/**
 * `active` counts down. `continuing` is the first mission's untimed
 * continuation. `ended` is an attempt the deadline closed.
 */
export type ClockState = "active" | "continuing" | "ended";

export interface MissionState {
  missionId: string;
  status: "briefing" | "investigating" | "complete";
  stageId: string;
  budget: number;
  hoursLeft: number;
  clock: ClockState;
  ledger: Record<string, LedgerEntry>;
  pins: string[];
  transmissions: TransmissionRecord[];
  /** The last request the clerk returned unprocessed. */
  rejected: { operation: string; errors: ResultError[] } | null;
  stages: Record<string, StageState>;
  dispatches: Dispatch[];
  hintsTaken: number;
  solutionViewed: boolean;
  counter: number;
  outcome: { mode: CompletionMode; late: boolean } | null;
}

export type Action =
  | { type: "begin" }
  | { type: "edit"; editor?: string; variables?: string }
  | { type: "transmit" }
  | { type: "pin"; key: string }
  | { type: "unpin"; key: string }
  | { type: "open-lead"; leadId: string }
  | { type: "name"; leadId: string; binding: string; value: string }
  | { type: "cite"; leadId: string; label: string; factKeys: string[] }
  | { type: "uncite"; leadId: string; citationId: string }
  | { type: "rule-out"; leadId: string }
  | { type: "field-check"; leadId: string }
  | { type: "proceed"; leadId: string }
  | { type: "hint" }
  | { type: "reveal" }
  | { type: "let-deadline-pass" };

export type Notice =
  | { kind: "shortfall"; action: string; needed: number; left: number }
  | { kind: "refused"; text: string }
  | { kind: "rejected" }
  | { kind: "dispatch"; dispatch: Dispatch }
  | { kind: "expired" };

export interface Outcome {
  state: MissionState;
  notice?: Notice;
  events: ProgressEvent[];
}

function openStage(stage: Stage, previous?: StageState): StageState {
  const carry = stage.scaffold.carryOver && previous;
  return {
    editor: carry ? previous.editor : (stage.scaffold.starterQuery ?? ""),
    variables: carry
      ? previous.variables
      : (stage.scaffold.starterVariables ?? ""),
    hintStep: 0,
    solutionRevealed: false,
    activeLead: null,
    drafts: {},
  };
}

export function startMission(env: Env): MissionState {
  const { mission } = env;
  const stage = stageOf(mission, mission.startingStage);
  const budget = computeBudget(mission, env.world).total;
  return {
    missionId: mission.id,
    status: "briefing",
    stageId: mission.startingStage,
    budget,
    hoursLeft: budget,
    clock: "active",
    ledger: {},
    pins: [],
    transmissions: [],
    rejected: null,
    stages: { [mission.startingStage]: openStage(stage) },
    dispatches: [],
    hintsTaken: 0,
    solutionViewed: false,
    counter: 0,
    outcome: null,
  };
}

export function stageOf(mission: Mission, id: string): Stage {
  const stage = mission.stages[id];
  if (!stage) throw new Error(`Mission ${mission.id} has no stage ${id}.`);
  return stage;
}

function current(state: MissionState): StageState {
  return state.stages[state.stageId] as StageState;
}

function withStage(
  state: MissionState,
  change: (stage: StageState) => StageState,
): MissionState {
  return {
    ...state,
    stages: { ...state.stages, [state.stageId]: change(current(state)) },
  };
}

function draftOf(stage: StageState, leadId: string): Draft {
  return stage.drafts[leadId] ?? emptyDraft(leadId);
}

function withDraft(
  state: MissionState,
  leadId: string,
  change: (draft: Draft) => Draft,
): MissionState {
  return withStage(state, (stage) => ({
    ...stage,
    activeLead: leadId,
    drafts: { ...stage.drafts, [leadId]: change(draftOf(stage, leadId)) },
  }));
}

export function completionMode(state: MissionState): CompletionMode {
  if (state.solutionViewed) return "solution-revealed";
  return state.hintsTaken > 0 ? "hinted" : "independent";
}

/** What the next step of help would cost right now. */
export function hintCost(state: MissionState): number {
  if (state.clock !== "active") return 0;
  return COSTS.hints[current(state).hintStep] ?? 0;
}

export function revealCost(state: MissionState): number {
  return state.clock === "active" ? COSTS.solutionReveal : 0;
}

export function proceedCost(env: Env, state: MissionState): number {
  const stage = stageOf(env.mission, state.stageId);
  const next = stage.next ? env.mission.stages[stage.next] : undefined;
  if (!next || next.location === stage.location) return 0;
  return travelHours(env.world, stage.location, next.location);
}

export function fieldCheckCost(
  env: Env,
  state: MissionState,
  leadId: string,
): number {
  const stage = stageOf(env.mission, state.stageId);
  const to = stage.leadOutcomes?.[leadId]?.location;
  if (!to || to === stage.location) return COSTS.travel[0].hours;
  return travelHours(env.world, stage.location, to);
}

function expire(env: Env, state: MissionState): MissionState {
  const n = state.counter + 1;
  const continuing = env.mission.clock.onExpiry === "continue";
  return {
    ...state,
    counter: n,
    hoursLeft: 0,
    clock: continuing ? "continuing" : "ended",
    dispatches: [
      ...state.dispatches,
      {
        n,
        stageId: state.stageId,
        kind: "deadline",
        text: env.mission.clock.expired,
        cost: 0,
      },
    ],
  };
}

/**
 * Charges a paid action. An action that uses the last hour still resolves;
 * one that costs more than the time left is refused, and the player may
 * instead let the deadline pass.
 */
function charge(
  env: Env,
  state: MissionState,
  cost: number,
  action: string,
  resolve: (state: MissionState) => Outcome,
): Outcome {
  if (state.clock !== "active" || cost === 0) return resolve(state);
  if (cost > state.hoursLeft) {
    return {
      state,
      notice: {
        kind: "shortfall",
        action,
        needed: cost,
        left: state.hoursLeft,
      },
      events: [],
    };
  }
  const outcome = resolve({ ...state, hoursLeft: state.hoursLeft - cost });
  if (outcome.state.hoursLeft === 0 && outcome.state.status !== "complete") {
    return { ...outcome, state: expire(env, outcome.state) };
  }
  return outcome;
}

function refuse(state: MissionState, text: string): Outcome {
  return { state, notice: { kind: "refused", text }, events: [] };
}

function parseVariables(
  text: string,
): { ok: true; value: Record<string, unknown> | undefined } | { ok: false } {
  if (text.trim() === "") return { ok: true, value: undefined };
  try {
    const value: unknown = JSON.parse(text);
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false };
    }
    return { ok: true, value: value as Record<string, unknown> };
  } catch {
    return { ok: false };
  }
}

function doTransmit(env: Env, state: MissionState): Outcome {
  const stage = current(state);
  const variables = parseVariables(stage.variables);
  if (!variables.ok) {
    return refuse(
      state,
      "The variables are not a JSON object, so nothing was sent.",
    );
  }
  const sent = transmit(env.store, {
    operation: stage.editor,
    variables: variables.value,
    clearance: env.clearance,
  });
  const errors: ResultError[] = (sent.result.errors ?? []).map((error) => ({
    message: error.message,
    ...(error.path ? { path: [...error.path] } : {}),
    ...(error.locations?.[0]
      ? { line: error.locations[0].line, column: error.locations[0].column }
      : {}),
  }));
  if (!sent.transmitted) {
    // Returned by the clerk before transmission, at no cost (SDD 3.3).
    return {
      state: { ...state, rejected: { operation: stage.editor, errors } },
      notice: { kind: "rejected" },
      events: [],
    };
  }
  return charge(env, state, COSTS.transmission, "This transmission", (paid) => {
    const n = paid.transmissions.length + 1;
    const ledger = { ...paid.ledger };
    for (const { fact, path } of sent.facts) {
      const known = ledger[fact.key];
      ledger[fact.key] = {
        fact: mergeFact(known?.fact, fact),
        sources: [...(known?.sources ?? []), { transmission: n, path }],
      };
    }
    const record: TransmissionRecord = {
      n,
      stageId: paid.stageId,
      operation: stage.editor,
      variables: stage.variables,
      data: sent.result.data ?? null,
      errors,
      facts: sent.facts.map(({ fact, path }) => ({ key: fact.key, path })),
      cost: paid.clock === "active" ? COSTS.transmission : 0,
    };
    return {
      state: {
        ...paid,
        ledger,
        rejected: null,
        transmissions: [...paid.transmissions, record],
      },
      events: [],
    };
  });
}

function addDispatch(
  state: MissionState,
  dispatch: Omit<Dispatch, "n" | "stageId">,
): { state: MissionState; dispatch: Dispatch } {
  const n = state.counter + 1;
  const full: Dispatch = { ...dispatch, n, stageId: state.stageId };
  return {
    state: { ...state, counter: n, dispatches: [...state.dispatches, full] },
    dispatch: full,
  };
}

function doProceed(env: Env, state: MissionState, leadId: string): Outcome {
  const stage = stageOf(env.mission, state.stageId);
  const draft = draftOf(current(state), leadId);
  const review = reviewDraft(stage, draft, state.ledger);
  const order =
    stage.solution.type === "destination" ? "travel order" : "deduction";
  if (draft.ruledOut) return refuse(state, "This lead is ruled out.");
  if (review.unnamed.length > 0) {
    return refuse(
      state,
      `The ${order} is incomplete: a choice on the form is still blank.`,
    );
  }
  if (!review.allSupported) {
    return refuse(
      state,
      `The ${order} is returned: a claim still needs evidence.`,
    );
  }
  if (!review.correct) {
    return refuse(
      state,
      `The ${order} is returned: the citations do not bear out what it names.`,
    );
  }
  const cost = proceedCost(env, state);
  const label = stage.solution.type === "destination" ? "This journey" : "This";
  return charge(env, state, cost, label, (paid) => {
    const text =
      stage.resolved ??
      (stage.next ? "Travel order approved." : "Deduction accepted.");
    const next = stage.next;
    const added = addDispatch(paid, {
      kind: next ? "travel" : "resolved",
      leadId,
      text,
      cost: paid.clock === "active" ? cost : 0,
    });
    if (next) {
      return {
        state: {
          ...added.state,
          stageId: next,
          stages: {
            ...added.state.stages,
            [next]: openStage(stageOf(env.mission, next), current(paid)),
          },
        },
        notice: { kind: "dispatch", dispatch: added.dispatch },
        events: [],
      };
    }
    const outcome = {
      mode: completionMode(paid),
      late: paid.clock !== "active",
    };
    return {
      state: { ...added.state, status: "complete", outcome },
      notice: { kind: "dispatch", dispatch: added.dispatch },
      events: [{ type: "completed", missionId: env.mission.id, ...outcome }],
    };
  });
}

/** Applies one player action. Every rule of the investigation lives here. */
export function act(env: Env, state: MissionState, action: Action): Outcome {
  const none = (next: MissionState): Outcome => ({ state: next, events: [] });
  const stage = stageOf(env.mission, state.stageId);

  if (action.type === "edit") {
    return none(
      withStage(state, (s) => ({
        ...s,
        editor: action.editor ?? s.editor,
        variables: action.variables ?? s.variables,
      })),
    );
  }
  if (action.type === "begin") {
    return none(
      state.status === "briefing"
        ? { ...state, status: "investigating" }
        : state,
    );
  }
  if (action.type === "reveal") {
    if (current(state).solutionRevealed) return none(state);
    return charge(env, state, revealCost(state), "The solution", (paid) => ({
      state: withStage({ ...paid, solutionViewed: true }, (s) => ({
        ...s,
        solutionRevealed: true,
      })),
      events: [{ type: "solution-viewed", missionId: env.mission.id }],
    }));
  }
  if (state.status === "complete") return none(state);
  if (state.clock === "ended") {
    return refuse(state, "The deadline has passed and this attempt is closed.");
  }

  switch (action.type) {
    case "transmit":
      return doTransmit(env, state);
    case "pin":
      return none(
        state.pins.includes(action.key) || !state.ledger[action.key]
          ? state
          : { ...state, pins: [...state.pins, action.key] },
      );
    case "unpin":
      return none({
        ...state,
        pins: state.pins.filter((key) => key !== action.key),
      });
    case "open-lead":
      return none(withDraft(state, action.leadId, (d) => d));
    case "name":
      return none(
        withDraft(state, action.leadId, (d) => ({
          ...d,
          bindings: { ...d.bindings, [action.binding]: action.value },
        })),
      );
    case "cite": {
      // Only facts the player has retrieved can be cited.
      const keys = [...new Set(action.factKeys)].filter(
        (key) => state.ledger[key],
      );
      if (keys.length === 0) return none(state);
      const id = `c${String(state.counter + 1)}`;
      return none(
        withDraft(
          { ...state, counter: state.counter + 1 },
          action.leadId,
          (d) =>
            d.citations.some((c) => c.factKeys.join("|") === keys.join("|"))
              ? d
              : {
                  ...d,
                  citations: [
                    ...d.citations,
                    { id, label: action.label, factKeys: keys },
                  ],
                },
        ),
      );
    }
    case "uncite":
      return none(
        withDraft(state, action.leadId, (d) => ({
          ...d,
          citations: d.citations.filter((c) => c.id !== action.citationId),
        })),
      );
    case "rule-out": {
      const draft = draftOf(current(state), action.leadId);
      const review = reviewDraft(stage, draft, state.ledger);
      if (!review.canRuleOut) {
        return refuse(
          state,
          "Ruling out a lead takes a cited fact that contradicts one of its claims.",
        );
      }
      const marked = withDraft(state, action.leadId, (d) => ({
        ...d,
        ruledOut: true,
      }));
      const added = addDispatch(marked, {
        kind: "ruled-out",
        leadId: action.leadId,
        text:
          stage.leadOutcomes?.[action.leadId]?.ruledOut ??
          "The lead is struck from the list.",
        cost: 0,
      });
      return {
        state: added.state,
        notice: { kind: "dispatch", dispatch: added.dispatch },
        events: [],
      };
    }
    case "field-check": {
      const draft = draftOf(current(state), action.leadId);
      const review = reviewDraft(stage, draft, state.ledger);
      const text = stage.leadOutcomes?.[action.leadId]?.fieldCheck;
      if (!review.canFieldCheck || text === undefined) {
        return refuse(
          state,
          "A field check needs one supported claim, one still unverified, and no cited contradiction.",
        );
      }
      const cost = fieldCheckCost(env, state, action.leadId);
      return charge(env, state, cost, "This field check", (paid) => {
        const marked = withDraft(paid, action.leadId, (d) => ({
          ...d,
          fieldChecked: true,
        }));
        const added = addDispatch(marked, {
          kind: "field-check",
          leadId: action.leadId,
          text,
          cost: paid.clock === "active" ? cost : 0,
        });
        return {
          state: added.state,
          notice: { kind: "dispatch", dispatch: added.dispatch },
          events: [],
        };
      });
    }
    case "proceed":
      return doProceed(env, state, action.leadId);
    case "hint": {
      const step = current(state).hintStep;
      if (step >= COSTS.hints.length) return none(state);
      return charge(env, state, hintCost(state), "This hint", (paid) => ({
        state: withStage({ ...paid, hintsTaken: paid.hintsTaken + 1 }, (s) => ({
          ...s,
          hintStep: step + 1,
        })),
        events: [],
      }));
    }
    case "let-deadline-pass":
      if (state.clock !== "active") return none(state);
      return {
        state: expire(env, state),
        notice: { kind: "expired" },
        events: [],
      };
  }
}

/** The records of one type that the player's queries have turned up. */
export function knownRecords(state: MissionState, type: string): string[] {
  const seen = new Set<string>();
  const prefix = `${type}:`;
  const note = (ref: string | null) => {
    if (ref?.startsWith(prefix)) seen.add(ref.slice(prefix.length));
  };
  for (const { fact } of Object.values(state.ledger)) {
    note(fact.entity);
    if (fact.value.kind === "ref") note(fact.value.ref);
    if (fact.value.kind === "list") fact.value.refs.forEach(note);
  }
  return [...seen].sort();
}

export { leadBinding };
