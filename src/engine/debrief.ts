import { Kind, parse } from "graphql";
import type {
  ConceptCard,
  Kata,
  Mission,
  MissionSummary,
} from "../content/types.ts";
import type { MissionState, TransmissionRecord } from "./mission.ts";
import { parseRequest, showsTechnique } from "./technique.ts";

/**
 * The transmissions that supplied a fact some accepted form rested on, in
 * the order they were sent (SDD 3.10).
 */
export function evidenceTransmissions(
  state: MissionState,
): TransmissionRecord[] {
  const numbers = new Set<number>();
  for (const dispatch of state.dispatches) {
    if (!["accepted", "travel", "resolved"].includes(dispatch.kind)) continue;
    for (const { facts } of dispatch.evidence ?? []) {
      for (const key of facts) {
        for (const source of state.ledger[key]?.sources ?? []) {
          numbers.add(source.transmission);
        }
      }
    }
  }
  return state.transmissions.filter((t) => numbers.has(t.n));
}

export interface ChainFact {
  key: string;
  /** The transmission that first returned the fact. */
  transmission: number | null;
}

export interface ChainStep {
  stageId: string;
  /** Each claim the form rested on, with the facts that established it. */
  claims: { claim: string; facts: ChainFact[] }[];
  /** The leads the player struck off at the stage, in the order struck. */
  ruledOut: string[];
}

/**
 * How the player cracked the case, stage by stage, for the debrief (SDD
 * 3.10): the facts each accepted form rested on, and the transmission that
 * first returned each fact.
 */
export function deductionChain(state: MissionState): ChainStep[] {
  const steps: ChainStep[] = [];
  const at = (stageId: string): ChainStep => {
    let step = steps.find((s) => s.stageId === stageId);
    if (!step) {
      step = { stageId, claims: [], ruledOut: [] };
      steps.push(step);
    }
    return step;
  };
  for (const dispatch of state.dispatches) {
    if (dispatch.kind === "ruled-out" && dispatch.leadId) {
      at(dispatch.stageId).ruledOut.push(dispatch.leadId);
      continue;
    }
    if (!["accepted", "travel", "resolved"].includes(dispatch.kind)) continue;
    const step = at(dispatch.stageId);
    for (const { claim, facts } of dispatch.evidence ?? []) {
      if (facts.length === 0) continue;
      step.claims.push({
        claim,
        facts: facts.map((key) => ({
          key,
          transmission: state.ledger[key]?.sources[0]?.transmission ?? null,
        })),
      });
    }
  }
  return steps.filter((s) => s.claims.length > 0 || s.ruledOut.length > 0);
}

/**
 * The concept of the mission's level: the one a teaching case teaches, or
 * for an assessment the concept card of its clearance.
 */
export function levelConcept(
  mission: MissionSummary,
  concepts: readonly ConceptCard[],
): ConceptCard["id"] | null {
  if (mission.teaches) return mission.teaches;
  if (mission.kind !== "assessment") return null;
  return concepts.find((c) => c.clearance === mission.clearance)?.id ?? null;
}

/** The kata of the mission's level, if the level has one. */
export function levelKata(
  mission: MissionSummary,
  course: { concepts: readonly ConceptCard[]; katas: readonly Kata[] },
): Kata | null {
  const concept = levelConcept(mission, course.concepts);
  return course.katas.find((k) => k.concept === concept) ?? null;
}

export interface TechniqueReading {
  kata: Kata;
  /** Some transmission that supplied evidence shows the technique. */
  used: boolean;
}

/**
 * What the debrief says about technique: null when the level has no kata
 * or no accepted form rested on a fact from a transmission. It never changes the outcome.
 */
export function readTechnique(
  mission: Mission,
  state: MissionState,
  course: { concepts: readonly ConceptCard[]; katas: readonly Kata[] },
): TechniqueReading | null {
  const kata = levelKata(mission, course);
  if (!kata) return null;
  const cited = evidenceTransmissions(state);
  if (cited.length === 0) return null;
  const used = cited.some((t) => {
    const doc = parseRequest(t.operation);
    return doc !== null && showsTechnique(kata.concept, doc);
  });
  return { kata, used };
}

/** A request as the debrief shows it, without lines that hold only spaces. */
export function tidyRequest(text: string): string {
  return text
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n")
    .trim();
}

/**
 * A player's transmission as the debrief shows it: as typed when it spans
 * several lines, laid out when it was typed on one, and in either case
 * without the blank lines the editor's closing braces can leave.
 */
export function shownOperation(t: TransmissionRecord): string {
  return tidyRequest(
    t.operation.trim().includes("\n")
      ? t.operation
      : (t.formatted ?? t.operation),
  );
}

/**
 * The fields a request asks for directly inside its outer braces, in the
 * operation that is transmitted. A request that does not parse has none.
 */
export function topFields(operation: string, operationName?: string): string[] {
  let document;
  try {
    document = parse(operation);
  } catch {
    return [];
  }
  const chosen = document.definitions.find(
    (d) =>
      d.kind === Kind.OPERATION_DEFINITION &&
      (operationName === undefined || d.name?.value === operationName),
  );
  if (!chosen || chosen.kind !== Kind.OPERATION_DEFINITION) return [];
  return [
    ...new Set(
      chosen.selectionSet.selections.flatMap((s) =>
        s.kind === Kind.FIELD && s.name.value !== "__typename"
          ? [s.name.value]
          : [],
      ),
    ),
  ];
}
