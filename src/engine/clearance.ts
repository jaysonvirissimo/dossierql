import type { Concept, MissionSummary } from "../content/types.ts";

/**
 * The highest clearance (SDD 3.8). Passing its assessment completes the
 * course and promotes no further. It matches MAX_CLEARANCE in the schema,
 * which this module does not import, to keep the schema out of the first
 * screen.
 */
export const LAST_CLEARANCE = 13;

export type CompletionMode = "independent" | "hinted" | "solution-revealed";

/** What happened, in order. Rank is never stored, only derived (SDD 7.4). */
export type ProgressEvent =
  | { type: "solution-viewed"; missionId: string }
  /** A training drill was passed. It earns no rank and no card. */
  | { type: "drill-passed"; drillId: string }
  /** A kata was passed. It earns no rank and no card (SDD 3.11). */
  | { type: "kata-passed"; kataId: string }
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
  /** Training drills passed, by id. */
  drills: string[];
  /** Katas passed, by id. */
  katas: string[];
}

/**
 * Replays the record of what happened under the rules of SDD 3.8. An
 * assessment is passed in any mode by a player who holds its clearance and
 * has completed its level's teaching mission. Any other attempt is a
 * placement, passed only by a player who has never viewed its solution.
 */
export function deriveStanding(
  missions: readonly MissionSummary[],
  events: readonly ProgressEvent[],
): Standing {
  const byId = new Map(missions.map((m) => [m.id, m]));
  let clearance = 1;
  const completions: Record<string, Completion> = {};
  const cards = new Set<Concept>();
  const viewed = new Set<string>();
  const taught = new Set<number>();
  const drills = new Set<string>();
  const katas = new Set<string>();

  for (const event of events) {
    if (event.type === "drill-passed") {
      drills.add(event.drillId);
      continue;
    }
    if (event.type === "kata-passed") {
      katas.add(event.kataId);
      continue;
    }
    const mission = byId.get(event.missionId);
    if (!mission) continue;
    if (event.type === "solution-viewed") {
      viewed.add(mission.id);
      continue;
    }
    if (mission.kind === "coda") {
      // A coda grants no clearance and no card (SDD 5.4).
      completions[mission.id] = {
        mode: event.mode,
        late: event.late,
        passed: true,
        placement: false,
      };
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
    clearance = Math.max(
      clearance,
      Math.min(mission.clearance + 1, LAST_CLEARANCE),
    );
  }
  return {
    clearance,
    completions,
    cards: [...cards],
    solutionsViewed: [...viewed],
    drills: [...drills],
    katas: [...katas],
  };
}

/** Whether attempting this mission now would be a placement. */
export function isPlacement(
  mission: MissionSummary,
  missions: readonly MissionSummary[],
  standing: Standing,
): boolean {
  if (mission.kind !== "assessment") return false;
  const teaching = missions.find(
    (m) => m.kind === "teaching" && m.clearance === mission.clearance,
  );
  const taught = teaching ? teaching.id in standing.completions : true;
  return !(standing.clearance >= mission.clearance && taught);
}

export type Availability = "available" | "locked" | "hidden";

/** The last case of a campaign in course order, leaving out its coda. */
export function lastCase(
  campaign: string,
  missions: readonly MissionSummary[],
): MissionSummary | undefined {
  return missions
    .filter((m) => m.campaign === campaign && m.kind !== "coda")
    .at(-1);
}

/**
 * Assessments are always open; teaching missions wait for their clearance.
 * A coda is hidden until the last case of its campaign is resolved.
 */
export function availability(
  mission: MissionSummary,
  missions: readonly MissionSummary[],
  standing: Standing,
): Availability {
  if (mission.kind === "coda") {
    const last = lastCase(mission.campaign, missions);
    return last && standing.completions[last.id] ? "available" : "hidden";
  }
  if (mission.kind === "assessment") return "available";
  return standing.clearance >= mission.clearance ? "available" : "locked";
}

/** The clearance whose schema the terminal uses during a mission. */
export function clearanceInForce(
  mission: MissionSummary,
  standing: Standing,
): number {
  return Math.max(mission.clearance, standing.clearance);
}

/**
 * The case the assignments desk puts first: the next case in the story
 * (SDD 9). It is the first case in course order that the player has not
 * completed, can open, and would not attempt as a placement. A case at or
 * above the player's clearance comes before an earlier one, so a player
 * promoted by placement is pointed at their new level and not back at the
 * first case.
 */
export function nextCase(
  missions: readonly MissionSummary[],
  standing: Standing,
): MissionSummary | undefined {
  const open = missions.filter(
    (m) =>
      !standing.completions[m.id] &&
      availability(m, missions, standing) === "available" &&
      !isPlacement(m, missions, standing),
  );
  return (
    open.find((m) => m.kind === "coda" || m.clearance >= standing.clearance) ??
    open[0]
  );
}
