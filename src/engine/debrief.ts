import type { ConceptCard, Kata, Mission } from "../content/types.ts";
import type { MissionState, TransmissionRecord } from "./mission.ts";
import { parseRequest, showsTechnique } from "./technique.ts";

/**
 * The transmissions that supplied a fact the player cited, in any draft of
 * any stage, in the order they were sent (SDD 3.10).
 */
export function citedTransmissions(state: MissionState): TransmissionRecord[] {
  const numbers = new Set<number>();
  for (const stage of Object.values(state.stages)) {
    for (const draft of Object.values(stage.drafts)) {
      for (const citation of draft.citations) {
        for (const key of citation.factKeys) {
          for (const source of state.ledger[key]?.sources ?? []) {
            numbers.add(source.transmission);
          }
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
  mission: Mission,
  concepts: readonly ConceptCard[],
): ConceptCard["id"] | null {
  if (mission.teaches) return mission.teaches;
  if (mission.kind !== "assessment") return null;
  return concepts.find((c) => c.clearance === mission.clearance)?.id ?? null;
}

/** The kata of the mission's level, if the level has one. */
export function levelKata(
  mission: Mission,
  course: { concepts: readonly ConceptCard[]; katas: readonly Kata[] },
): Kata | null {
  const concept = levelConcept(mission, course.concepts);
  return course.katas.find((k) => k.concept === concept) ?? null;
}

export interface TechniqueReading {
  kata: Kata;
  /** Some transmission that supplied a cited fact shows the technique. */
  used: boolean;
}

/**
 * What the debrief says about technique: null when the level has no kata
 * or no cited fact came from a transmission. It never changes the outcome.
 */
export function readTechnique(
  mission: Mission,
  state: MissionState,
  course: { concepts: readonly ConceptCard[]; katas: readonly Kata[] },
): TechniqueReading | null {
  const kata = levelKata(mission, course);
  if (!kata) return null;
  const cited = citedTransmissions(state);
  if (cited.length === 0) return null;
  const used = cited.some((t) => {
    const doc = parseRequest(t.operation);
    return doc !== null && showsTechnique(kata.concept, doc);
  });
  return { kata, used };
}
