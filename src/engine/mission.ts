import { Kind, parse, print, type GraphQLError } from "graphql";
import {
  leadBinding,
  type Mission,
  type Stage,
  type World,
} from "../content/types.ts";
import { deliver, transmit } from "../graphql/execute.ts";
import { mergeFact, type Fact } from "../graphql/facts.ts";
import type { RawRecord, Store } from "../graphql/store.ts";
import type { CompletionMode, ProgressEvent } from "./clearance.ts";
import { computeBudget, COSTS, travelHours } from "./clock.ts";
import {
  emptyDraft,
  fromLedger,
  reviewDraft,
  type ClaimStatus,
  type Draft,
  type DraftReview,
} from "./draft.ts";
import { paperwork } from "./paperwork.ts";

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

/**
 * A request laid out over several lines for the debrief. The printer drops
 * the word `query` from a request that has no name, so it is put back when
 * the player typed it.
 */
export function formatted(operation: string): string {
  const doc = parse(operation);
  const printed = print(doc);
  const typed = doc.definitions.some(
    (d) =>
      d.kind === Kind.OPERATION_DEFINITION &&
      d.loc?.startToken.value === "query",
  );
  return typed && printed.startsWith("{") ? `query ${printed}` : printed;
}

export interface TransmissionRecord {
  n: number;
  stageId: string;
  operation: string;
  /** The operation laid out one field to a line, for the debrief. */
  formatted?: string;
  variables: string;
  data: unknown;
  errors: ResultError[];
  facts: { key: string; path: (string | number)[] }[];
  cost: number;
  /** The request's weight, stated from clearance 6 (SDD 3.3). */
  weight?: number;
  /** The operation transmitted, where the document held several (SDD 6.1). */
  operationName?: string;
  /**
   * The standing watch this response belongs to: the response that opened
   * it, or, with `event`, an event the watch delivered (SDD 6.1).
   */
  watch?: { n: number; event?: string };
}

/** A standing watch: a subscription kept open during a case (SDD 6.1). */
export interface Watch {
  /** The watch's number, from 1, in the order the watches were opened. */
  n: number;
  /** The transmission that opened it. */
  opened: number;
  stageId: string;
  operation: string;
  variables: string;
  operationName?: string;
  /** The subscription's field and arguments, as in `harbourWatch(port: "Lisbon")`. */
  label: string;
  stream: string;
  events: { id: string; type: string; due: number }[];
  /** The hour of the case at which it was opened. */
  openedAt: number;
  delivered: string[];
  closed: boolean;
}

export interface Dispatch {
  n: number;
  stageId: string;
  /** `accepted` closes a stage whose next stage is in the same country. */
  kind:
    | "ruled-out"
    | "field-check"
    | "accepted"
    | "travel"
    | "deadline"
    | "resolved";
  leadId?: string;
  text: string;
  cost: number;
  /**
   * The facts the form rested on, claim by claim: for an accepted form the
   * evidence of each claim, and for a lead ruled out the facts that
   * contradict a claim (SDD 3.2).
   */
  evidence?: { claim: string; facts: string[] }[];
}

/** One claim of a form the archive returned, as it stood when returned. */
export interface ReturnedClaim {
  id: string;
  prompt: string;
  status: ClaimStatus;
  /** The facts that support or contradict it, or that reach toward it. */
  facts: string[];
  /** Records the facts connect to the form's records, by binding. */
  reached: Record<string, string>;
  /** Records the facts show for a box, where the form gives another. */
  shows: Record<string, string>;
}

/** A form the archive returned because a claim is not established. */
export interface Returned {
  leadId: string;
  order: "travel order" | "deduction" | "warrant";
  claims: ReturnedClaim[];
  /** The hours a rejected warrant took from the clock (SDD 3.4). */
  cost?: number;
  /** The lead can take a field check now (SDD 3.5). */
  canFieldCheck: boolean;
}

/** What the archive has yet to establish, for a receipt. */
export function returnedReasons(returned: Returned): string[] {
  return returned.claims
    .filter((c) => c.status !== "supported")
    .map((c) =>
      c.status === "refuted"
        ? `Your responses contradict this claim: ${c.prompt}`
        : `The archive has yet to establish this claim: ${c.prompt}`,
    );
}

export interface StageState {
  editor: string;
  variables: string;
  /** Steps of the hint ladder taken, 0 to 4. */
  hintStep: number;
  solutionRevealed: boolean;
  activeLead: string | null;
  drafts: Record<string, Draft>;
  /** The operation chosen to transmit, where the editor holds several. */
  operationName?: string;
}

/**
 * `none` is a mission with no clock, where nothing is priced. `active`
 * counts down. `continuing` is an untimed continuation after a deadline.
 * `ended` is an attempt the deadline closed.
 */
export type ClockState = "none" | "active" | "continuing" | "ended";

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
  /**
   * The receipts for the paperwork the player filed (SDD 4.2). They join the
   * archive for the rest of the mission. Absent from saves made before
   * clearance 11.
   */
  filed?: RawRecord[];
  /**
   * The hours the case has run, which only go up (SDD 3.3). Absent from
   * saves made before clearance 13, and then 0.
   */
  hour?: number;
  /** The standing watches opened in this attempt. */
  watches?: Watch[];
  /** The hour at which each stream was first posted in this attempt. */
  posted?: Record<string, number>;
}

export type Action =
  | { type: "begin" }
  | {
      type: "edit";
      editor?: string;
      variables?: string;
      operationName?: string;
    }
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
  | { type: "let-deadline-pass" }
  | { type: "keep-watch" }
  | { type: "close-watch"; watch: number };

export type Notice =
  | { kind: "shortfall"; action: string; needed: number; left: number }
  | { kind: "refused"; text: string }
  | { kind: "rejected" }
  | { kind: "returned"; returned: Returned }
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
  const budget = mission.clock ? computeBudget(mission, env.world).total : 0;
  return {
    missionId: mission.id,
    status: "briefing",
    stageId: mission.startingStage,
    budget,
    hoursLeft: budget,
    clock: mission.clock ? "active" : "none",
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

/**
 * The stages that share the current desk: the current stage and the stages
 * straight before it in the same country. Their responses stay on screen
 * together, because nobody has travelled.
 */
export function deskStages(mission: Mission, stageId: string): string[] {
  const chain: string[] = [];
  let id: string | undefined = mission.startingStage;
  while (id && mission.stages[id] && !chain.includes(id)) {
    chain.push(id);
    id = mission.stages[id]?.next;
  }
  const at = chain.indexOf(stageId);
  if (at < 0) return [stageId];
  const location = stageOf(mission, stageId).location;
  let from = at;
  while (from > 0 && mission.stages[chain[from - 1]!]?.location === location) {
    from--;
  }
  return chain.slice(from, at + 1);
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
  // Ruling out or checking a lead from the case board leaves the form on
  // the lead the player has open, so it is not opened on the form (SDD 3.5).
  open = true,
): MissionState {
  return withStage(state, (stage) => ({
    ...stage,
    ...(open ? { activeLead: leadId } : {}),
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

/** What a warrant costs if it is submitted and rejected (SDD 3.4). */
export function warrantRejectionCost(state: MissionState): number {
  return state.clock === "active" ? COSTS.rejectedWarrant : 0;
}

export function proceedCost(env: Env, state: MissionState): number {
  const stage = stageOf(env.mission, state.stageId);
  const next = stage.next ? env.mission.stages[stage.next] : undefined;
  if (!next || next.location === stage.location) return 0;
  return travelHours(env.world, stage.location, next.location);
}

/**
 * The country a lead points at: the one its lead outcome gives, or else the
 * country of the city the stage lists for it.
 */
export function leadCountry(
  env: Env,
  stage: Stage,
  leadId: string,
): string | undefined {
  const given = stage.leadOutcomes?.[leadId]?.location;
  if (given) return given;
  const city = stage.leads?.[leadId]?.city;
  return city
    ? env.world.cities.find((c) => c.id === city)?.country
    : undefined;
}

export type LeadStatus = "open" | "ruled-out" | "field-checked";

/** Where a lead stands at the current stage, read from the player's forms. */
export function leadStatus(state: MissionState, leadId: string): LeadStatus {
  const draft = current(state).drafts[leadId];
  if (draft?.ruledOut) return "ruled-out";
  if (draft?.fieldChecked) return "field-checked";
  return "open";
}

/** What a stage's form is called on screen and in the clerk's notes. */
export function orderWord(
  stage: Stage,
): "travel order" | "deduction" | "warrant" {
  return stage.solution.type === "destination"
    ? "travel order"
    : stage.solution.type === "warrant"
      ? "warrant"
      : "deduction";
}

/**
 * The other leads the stage lists that are not yet ruled out (SDD 3.5). At a
 * stage that lists its leads, a form is accepted only once every lead but
 * the chosen one is ruled out, so the player has to examine each of them.
 */
export function openRivals(
  stage: Stage,
  state: MissionState,
  leadId: string,
): string[] {
  return Object.entries(stage.leads ?? {})
    .filter(([id]) => id !== leadId && leadStatus(state, id) !== "ruled-out")
    .map(([, lead]) => lead.label);
}

function listed(items: string[], last: string): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${last} ${items.at(-1) ?? ""}`;
}

/**
 * Why a form cannot be sent yet, before any claim is judged: a blank box,
 * or another lead still in contention. Null when nothing holds it back. The
 * form shows this under its button, and the archive gives the same text if
 * the form is sent anyway.
 */
export function formHold(
  stage: Stage,
  state: MissionState,
  leadId: string,
  unnamed: string[],
): string | null {
  const order = orderWord(stage);
  if (unnamed.length > 0) {
    const boxes = listed(
      unnamed.map((name) => `“${stage.labels?.[name] ?? name}”`),
      "and",
    );
    return `A choice on the form is still blank. Choose a record for ${boxes} before you send the ${order}.`;
  }
  const rivals = openRivals(stage, state, leadId);
  if (rivals.length > 0) {
    const verb = rivals.length === 1 ? "is" : "are";
    const them = rivals.length === 1 ? "it" : "each of them";
    return `${listed(rivals, "and")} ${verb} still in contention. Rule ${them} out on the case board before you send the ${order}.`;
  }
  return null;
}

export function fieldCheckCost(
  env: Env,
  state: MissionState,
  leadId: string,
): number {
  const stage = stageOf(env.mission, state.stageId);
  const to = leadCountry(env, stage, leadId);
  if (!to || to === stage.location) return COSTS.travel[0].hours;
  return travelHours(env.world, stage.location, to);
}

function expire(env: Env, state: MissionState): MissionState {
  const clock = env.mission.clock;
  if (!clock) return state;
  const n = state.counter + 1;
  const continuing = clock.onExpiry === "continue";
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
        text: clock.expired,
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
  const outcome = resolve({
    ...state,
    hoursLeft: state.hoursLeft - cost,
    hour: (state.hour ?? 0) + cost,
  });
  if (
    outcome.state.hoursLeft === 0 &&
    outcome.state.status !== "complete" &&
    outcome.state.clock === "active"
  ) {
    return { ...outcome, state: expire(env, outcome.state) };
  }
  return outcome;
}

/** What the clerk says when the variables panel is not a JSON object. */
export const VARIABLES_REFUSED =
  "The variables panel does not hold a JSON object, so nothing was sent. A JSON object is written in braces.";

function refuse(state: MissionState, text: string): Outcome {
  return { state, notice: { kind: "refused", text }, events: [] };
}

/** The variables panel, read as a JSON object; empty means none. */
export function parseVariables(
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

/** The archive's errors, reduced to what the interface shows. */
export function resultErrors(
  errors: readonly GraphQLError[] | undefined,
): ResultError[] {
  return (errors ?? []).map((error) => ({
    message: error.message,
    ...(error.path ? { path: [...error.path] } : {}),
    ...(error.locations?.[0]
      ? { line: error.locations[0].line, column: error.locations[0].column }
      : {}),
  }));
}

function doTransmit(env: Env, state: MissionState): Outcome {
  const stage = current(state);
  const variables = parseVariables(stage.variables);
  if (!variables.ok) {
    return refuse(state, VARIABLES_REFUSED);
  }
  // A request the clerk returns costs nothing, so the request is checked
  // before the hour is charged. Paperwork is filed after it is charged, so
  // that a journey a mutation files is charged after the transmission.
  return charge(env, state, COSTS.transmission, "This transmission", (paid) => {
    const desk = paperwork<MissionState>({
      store: env.store,
      state: paid,
      stage: (s) => stageOf(env.mission, s.stageId),
      filed: (s) => s.filed ?? [],
      file: (s, record) => ({ ...s, filed: [...(s.filed ?? []), record] }),
      choose: (s, leadId, binding, value) =>
        withDraft(s, leadId, (d) => ({
          ...d,
          bindings: { ...d.bindings, [binding]: value },
        })),
      leads: (s) => Object.keys(current(s).drafts),
      proceed: (s, leadId) => {
        const before = s.dispatches.length;
        const outcome = proceed(env, s, leadId);
        const added = outcome.state.dispatches.slice(before);
        const journey = added.find((d) => d.kind !== "deadline");
        const notice = outcome.notice;
        const reasons =
          notice?.kind === "refused"
            ? [notice.text]
            : notice?.kind === "returned"
              ? returnedReasons(notice.returned)
              : notice?.kind === "shortfall"
                ? [
                    `${notice.action} would take ${String(notice.needed)} hours, and ${String(notice.left)} are left.`,
                  ]
                : [];
        return {
          state: outcome.state,
          approved: journey !== undefined,
          reasons,
          hours: s.hoursLeft - outcome.state.hoursLeft,
          events: outcome.events,
        };
      },
    });
    const operationName = chosenOperation(stage);
    const sent = transmit(env.store.with(paid.filed ?? []), {
      operation: stage.editor,
      variables: variables.value,
      clearance: env.clearance,
      actions: desk.actions,
      operationName,
      watching: true,
    });
    const errors = resultErrors(sent.result.errors);
    if (!sent.transmitted) {
      // Returned by the clerk before transmission, at no cost (SDD 3.3).
      return {
        state: { ...state, rejected: { operation: stage.editor, errors } },
        notice: { kind: "rejected" },
        events: [],
      };
    }
    const filed = desk.result();
    const after = filed.state;
    const n = after.transmissions.length + 1;
    const ledger = { ...after.ledger };
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
      formatted: formatted(stage.editor),
      variables: stage.variables,
      data: sent.result.data ?? null,
      errors,
      facts: sent.facts.map(({ fact, path }) => ({ key: fact.key, path })),
      cost: paid.clock === "active" ? COSTS.transmission : 0,
      ...(typeof sent.result.extensions?.weight === "number"
        ? { weight: sent.result.extensions.weight }
        : {}),
      ...(operationName !== undefined ? { operationName } : {}),
    };
    const watches = after.watches ?? [];
    const posted = { ...(after.posted ?? {}) };
    let opened: Watch | undefined;
    if (sent.watch) {
      const hour = after.hour ?? 0;
      posted[sent.watch.stream] ??= hour;
      opened = {
        n: watches.length + 1,
        opened: n,
        stageId: paid.stageId,
        operation: stage.editor,
        variables: stage.variables,
        ...(operationName !== undefined ? { operationName } : {}),
        label: sent.watch.label,
        stream: sent.watch.stream,
        events: sent.watch.events,
        openedAt: hour,
        delivered: [],
        closed: false,
      };
      record.watch = { n: opened.n };
    }
    const last = filed.travelled ? after.dispatches.at(-1) : undefined;
    return {
      state: {
        ...after,
        ledger,
        rejected: null,
        transmissions: [...after.transmissions, record],
        ...(opened ? { watches: [...watches, opened], posted } : {}),
      },
      ...(last
        ? { notice: { kind: "dispatch" as const, dispatch: last } }
        : {}),
      events: filed.events,
    };
  });
}

function returnedOf(
  draft: Draft,
  review: DraftReview,
  order: Returned["order"],
): Returned {
  return {
    leadId: draft.leadId,
    order,
    claims: review.claims.map((c) => ({
      id: c.id,
      prompt: c.prompt,
      status: c.status,
      facts: c.counted,
      reached: c.reached,
      shows: c.shows,
    })),
    canFieldCheck: review.canFieldCheck,
  };
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

/**
 * Files a travel order or a deduction for a lead. The travel control and a
 * mutation's travel order both call this (SDD 6).
 */
export function proceed(
  env: Env,
  state: MissionState,
  leadId: string,
): Outcome {
  const stage = stageOf(env.mission, state.stageId);
  const draft = draftOf(current(state), leadId);
  const review = reviewDraft(stage, draft, state.ledger);
  const order = orderWord(stage);
  if (draft.ruledOut) return refuse(state, "This lead is ruled out.");
  // A warrant that is submitted and rejected costs hours (SDD 3.4). One
  // with a blank box is refused before it is submitted, at no cost.
  const rejected = (outcome: Outcome): Outcome =>
    order !== "warrant"
      ? outcome
      : charge(
          env,
          state,
          warrantRejectionCost(state),
          "This warrant",
          (paid) => {
            const cost = state.hoursLeft - paid.hoursLeft;
            const notice =
              outcome.notice?.kind === "returned"
                ? {
                    ...outcome.notice,
                    returned: { ...outcome.notice.returned, cost },
                  }
                : outcome.notice?.kind === "refused" && cost > 0
                  ? {
                      ...outcome.notice,
                      text: `${outcome.notice.text} The rejection took ${String(cost)} hours.`,
                    }
                  : outcome.notice;
            return { ...outcome, state: paid, ...(notice ? { notice } : {}) };
          },
        );
  const hold = formHold(stage, state, leadId, review.unnamed);
  if (hold) return refuse(state, `The ${order} is not sent. ${hold}`);
  if (!review.allSupported && fromLedger(stage)) {
    return rejected({
      state,
      notice: { kind: "returned", returned: returnedOf(draft, review, order) },
      events: [],
    });
  }
  if (!review.allSupported) {
    return rejected(
      refuse(
        state,
        `The ${order} is returned to you: a claim still needs evidence.`,
      ),
    );
  }
  if (!review.correct) {
    return rejected(
      refuse(
        state,
        fromLedger(stage)
          ? `The ${order} is returned to you: your responses do not prove its claims for the choices on the form.`
          : `The ${order} is returned to you: the facts you cited do not prove its claims for the choices on the form.`,
      ),
    );
  }
  const cost = proceedCost(env, state);
  const label = stage.solution.type === "destination" ? "This journey" : "This";
  return charge(env, state, cost, label, (paid) => {
    const next = stage.next;
    const journey =
      next !== undefined &&
      stageOf(env.mission, next).location !== stage.location;
    const text =
      stage.resolved ??
      (stage.solution.type === "destination"
        ? "Travel order approved."
        : stage.solution.type === "warrant"
          ? "Warrant approved."
          : "Deduction accepted.");
    const added = addDispatch(paid, {
      kind: journey ? "travel" : next ? "accepted" : "resolved",
      leadId,
      text,
      cost: paid.clock === "active" ? cost : 0,
      evidence: review.claims.map((c) => ({ claim: c.id, facts: c.counted })),
    });
    if (next) {
      return {
        state: {
          ...added.state,
          rejected: null,
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
      late: paid.clock === "continuing",
    };
    return {
      state: { ...added.state, status: "complete", outcome },
      notice: { kind: "dispatch", dispatch: added.dispatch },
      events: [{ type: "completed", missionId: env.mission.id, ...outcome }],
    };
  });
}

/**
 * The operation the stage transmits: the one chosen, where the editor holds
 * several, and otherwise none, so that a stale choice never matters.
 */
function chosenOperation(stage: StageState): string | undefined {
  return operationCount(stage.editor) > 1 ? stage.operationName : undefined;
}

/** How many operations a request holds; 0 when it does not parse. */
export function operationCount(text: string): number {
  return operationNames(text).length;
}

/** The names of a request's operations, in order, with null for one unnamed. */
export function operationNames(text: string): (string | null)[] {
  try {
    return parse(text)
      .definitions.filter((d) => d.kind === Kind.OPERATION_DEFINITION)
      .map((d) => d.name?.value ?? null);
  } catch {
    return [];
  }
}

/** The hour of the case at which an event of a watch comes due. */
function dueAt(state: MissionState, watch: Watch, due: number): number {
  return (state.posted?.[watch.stream] ?? watch.openedAt) + due;
}

/** The events a watch has yet to deliver, at the hours they come due. */
function pending(
  state: MissionState,
  watch: Watch,
): { id: string; type: string; at: number }[] {
  if (watch.closed) return [];
  return watch.events
    .filter((e) => !watch.delivered.includes(e.id))
    .map((e) => ({ id: e.id, type: e.type, at: dueAt(state, watch, e.due) }))
    .filter((e) => e.at > watch.openedAt);
}

/**
 * The hours until the next event that an open watch has coming, and the
 * watch, or null when no open watch has another event (SDD 3.3).
 */
export function nextWatchEvent(
  state: MissionState,
): { hours: number; watch: number } | null {
  const hour = state.hour ?? 0;
  let next: { hours: number; watch: number } | null = null;
  for (const watch of state.watches ?? []) {
    for (const event of pending(state, watch)) {
      const hours = Math.max(0, event.at - hour);
      if (!next || hours < next.hours) next = { hours, watch: watch.n };
    }
  }
  return next;
}

/** The watches that are open. */
export function openWatches(state: MissionState): Watch[] {
  return (state.watches ?? []).filter((w) => !w.closed);
}

/**
 * Delivers every event whose hour has passed to the watch that is open for
 * it, each as a response of its own that costs nothing (SDD 6.1).
 */
function deliverDue(env: Env, outcome: Outcome): Outcome {
  let state = outcome.state;
  if (state.clock === "ended" || state.status === "complete") return outcome;
  const hour = state.hour ?? 0;
  const due = (state.watches ?? [])
    .flatMap((watch) =>
      pending(state, watch)
        .filter((e) => e.at <= hour)
        .map((e) => ({ watch, ...e })),
    )
    .sort((a, b) => a.at - b.at || a.watch.n - b.watch.n);
  if (due.length === 0) return outcome;
  const store = env.store.with(state.filed ?? []);
  for (const { watch, id, type } of due) {
    const event = store.get(type, id);
    const variables = parseVariables(watch.variables);
    const sent = event
      ? deliver(
          store,
          {
            operation: watch.operation,
            variables: variables.ok ? variables.value : undefined,
            clearance: env.clearance,
            operationName: watch.operationName,
          },
          event,
        )
      : undefined;
    const watches = (state.watches ?? []).map((w) =>
      w.n === watch.n ? { ...w, delivered: [...w.delivered, id] } : w,
    );
    if (!sent?.transmitted) {
      state = { ...state, watches };
      continue;
    }
    const n = state.transmissions.length + 1;
    const ledger = { ...state.ledger };
    for (const { fact, path } of sent.facts) {
      const known = ledger[fact.key];
      ledger[fact.key] = {
        fact: mergeFact(known?.fact, fact),
        sources: [...(known?.sources ?? []), { transmission: n, path }],
      };
    }
    const record: TransmissionRecord = {
      n,
      stageId: state.stageId,
      operation: watch.operation,
      formatted: formatted(watch.operation),
      variables: watch.variables,
      data: sent.result.data ?? null,
      errors: resultErrors(sent.result.errors),
      facts: sent.facts.map(({ fact, path }) => ({ key: fact.key, path })),
      cost: 0,
      ...(watch.operationName !== undefined
        ? { operationName: watch.operationName }
        : {}),
      watch: { n: watch.n, event: id },
    };
    state = {
      ...state,
      watches,
      ledger,
      transmissions: [...state.transmissions, record],
    };
  }
  return { ...outcome, state };
}

/** Applies one player action. Every rule of the investigation lives here. */
export function act(env: Env, state: MissionState, action: Action): Outcome {
  return deliverDue(env, rule(env, state, action));
}

function rule(env: Env, state: MissionState, action: Action): Outcome {
  const none = (next: MissionState): Outcome => ({ state: next, events: [] });
  const stage = stageOf(env.mission, state.stageId);

  if (action.type === "edit") {
    return none(
      withStage(state, (s) => ({
        ...s,
        editor: action.editor ?? s.editor,
        variables: action.variables ?? s.variables,
        ...(action.operationName !== undefined
          ? { operationName: action.operationName }
          : {}),
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
    case "open-lead": {
      // On a form the archive checks, the player changes the lead in a box
      // like any other, and the other boxes keep what they hold.
      const now = current(state);
      const from = now.activeLead ? now.drafts[now.activeLead] : undefined;
      const lead = leadBinding(stage);
      const carried = Object.fromEntries(
        Object.entries(from?.bindings ?? {}).filter(([name]) => name !== lead),
      );
      return none(
        withDraft(state, action.leadId, (d) =>
          fromLedger(stage) &&
          Object.keys(d.bindings).length === 0 &&
          d.citations.length === 0
            ? { ...d, bindings: carried }
            : d,
        ),
      );
    }
    case "name":
      return none(
        withDraft(state, action.leadId, (d) => ({
          ...d,
          bindings: { ...d.bindings, [action.binding]: action.value },
        })),
      );
    case "cite": {
      // Where the archive checks the form, nothing is cited by hand.
      if (fromLedger(stage)) return none(state);
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
          fromLedger(stage)
            ? "Your responses do not yet contradict a claim about this lead, so it cannot be ruled out."
            : "To rule out a lead, you must first cite a fact that contradicts one of the claims about that lead.",
        );
      }
      const marked = withDraft(
        state,
        action.leadId,
        (d) => ({ ...d, ruledOut: true }),
        false,
      );
      const added = addDispatch(marked, {
        kind: "ruled-out",
        leadId: action.leadId,
        text:
          stage.leadOutcomes?.[action.leadId]?.ruledOut ??
          "The lead is struck from the list.",
        cost: 0,
        evidence: review.claims
          .filter((c) => c.status === "refuted")
          .map((c) => ({ claim: c.id, facts: c.counted })),
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
          fromLedger(stage)
            ? "A field check is available when your responses prove one claim about this lead, leave another unproved, and contradict none."
            : "A field check is available when the lead has one supported claim and one claim that still needs evidence, and you have cited no fact that contradicts a claim.",
        );
      }
      const cost = fieldCheckCost(env, state, action.leadId);
      return charge(env, state, cost, "This field check", (paid) => {
        const marked = withDraft(
          paid,
          action.leadId,
          (d) => ({ ...d, fieldChecked: true }),
          false,
        );
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
      return proceed(env, state, action.leadId);
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
    case "keep-watch": {
      const next = nextWatchEvent(state);
      if (!next) {
        return refuse(
          state,
          "No standing watch that you keep open has another event coming.",
        );
      }
      const cost = next.hours;
      if (state.clock !== "active") {
        return none({ ...state, hour: (state.hour ?? 0) + cost });
      }
      return charge(env, state, cost, "Keeping watch", (paid) => none(paid));
    }
    case "close-watch":
      return none({
        ...state,
        watches: (state.watches ?? []).map((w) =>
          w.n === action.watch ? { ...w, closed: true } : w,
        ),
      });
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
