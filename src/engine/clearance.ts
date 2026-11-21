import type { Concept, Mission } from "../content/types.ts";

export type CompletionMode = "independent" | "hinted" | "solution-revealed";

/** What happened, in order. Rank is never stored, only derived (SDD 7.4). */
export type ProgressEvent =
  | { type: "solution-viewed"; missionId: string }
  | {
      type: "completed";
      missionId: string;
      mode: CompletionMode;
      late: boolean;
    };

export interface Completion {
  mode: CompletionMode;
  late: boolean;
  /** For an assessment: whether this completion passed it. */
  passed: boolean;
  placement: boolean;
}

export interface Standing {
  clearance: number;
  /** The most recent completion of each mission. */
  completions: Record<string, Completion>;
  cards: Concept[];
  solutionsViewed: string[];
}

/**
 * Replays the record of what happened under the rules of SDD 3.8. An
 * assessment is passed in any mode by a player who holds its clearance and
 * has completed its level's teaching mission. Any other attempt is a
 * placement, passed only by a player who has never viewed its solution.
 */
export function deriveStanding(
  missions: readonly Mission[],
  events: readonly ProgressEvent[],
): Standing {
  const byId = new Map(missions.map((m) => [m.id, m]));
  let clearance = 1;
  const completions: Record<string, Completion> = {};
  const cards = new Set<Concept>();
  const viewed = new Set<string>();
  const taught = new Set<number>();

  for (const event of events) {
    const mission = byId.get(event.missionId);
    if (!mission) continue;
    if (event.type === "solution-viewed") {
      viewed.add(mission.id);
      continue;
    }
    if (mission.kind === "teaching") {
      if (clearance < mission.clearance) continue;
      taught.add(mission.clearance);
      if (mission.teaches) cards.add(mission.teaches);
      completions[mission.id] = {
        mode: event.mode,
        late: event.late,
        passed: true,
        placement: false,
      };
      continue;
    }
    const placement = !(
      clearance >= mission.clearance && taught.has(mission.clearance)
    );
    const passed = placement ? !viewed.has(mission.id) : true;
    completions[mission.id] = {
      mode: event.mode,
      late: event.late,
      passed,
      placement,
    };
    if (!passed) continue;
    if (placement) {
      // A pass by placement grants this level and every level it skips.
      for (const other of missions) {
        if (
          other.kind === "teaching" &&
          other.teaches &&
          other.clearance <= mission.clearance
        ) {
          cards.add(other.teaches);
        }
      }
    }
    clearance = Math.max(clearance, mission.clearance + 1);
  }
  return {
    clearance,
    completions,
    cards: [...cards],
    solutionsViewed: [...viewed],
  };
}

/** Whether attempting this mission now would be a placement. */
export function isPlacement(
  mission: Mission,
  missions: readonly Mission[],
  standing: Standing,
): boolean {
  if (mission.kind !== "assessment") return false;
  const teaching = missions.find(
    (m) => m.kind === "teaching" && m.clearance === mission.clearance,
  );
  const taught = teaching ? teaching.id in standing.completions : true;
  return !(standing.clearance >= mission.clearance && taught);
}

export type Availability = "available" | "locked";

/** Assessments are always open; teaching missions wait for their clearance. */
export function availability(
  mission: Mission,
  standing: Standing,
): Availability {
  if (mission.kind === "assessment") return "available";
  return standing.clearance >= mission.clearance ? "available" : "locked";
}

/** The clearance whose schema the terminal uses during a mission. */
export function clearanceInForce(mission: Mission, standing: Standing): number {
  return Math.max(mission.clearance, standing.clearance);
}
