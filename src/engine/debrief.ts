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
