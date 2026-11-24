import {
  referenceOperations,
  referenceWatching,
  type Mission,
  type World,
} from "../content/types.ts";

/**
 * Every provisional cost and factor of SDD 3.3, in one place. Playtesting
 * tunes these numbers and never the budget of an individual mission.
 */
export const COSTS = {
  transmission: 1,
  /** One entry per step of the hint ladder. */
  hints: [1, 2, 4, 8],
  /** More than all the hints together. */
  solutionReveal: 16,
  /** A warrant that is submitted and rejected (SDD 3.4). */
  rejectedWarrant: 3,
  /** Travel hours for a journey up to each distance in kilometres. */
  travel: [
    { upToKm: 1500, hours: 2 },
    { upToKm: 4000, hours: 3 },
    { upToKm: 8000, hours: 4 },
    { upToKm: Infinity, hours: 6 },
  ],
} as const;

export const FACTORS = {
  earlyTeaching: 4,
  lateAssessment: 2,
  other: 2.5,
} as const;

export const HINT_LADDER_COST = COSTS.hints.reduce((a, b) => a + b, 0);

export function factorFor(mission: Mission): number {
  if (mission.kind === "teaching" && mission.clearance <= 2) {
    return FACTORS.earlyTeaching;
  }
  if (mission.kind === "assessment" && mission.clearance >= 3) {
    return FACTORS.lateAssessment;
  }
  return FACTORS.other;
}

function radians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function distanceKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const dLat = radians(b.lat - a.lat);
  const dLon = radians(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.lat)) *
      Math.cos(radians(b.lat)) *
      Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Hours to travel between two countries, capital to capital. */
export function travelHours(world: World, from: string, to: string): number {
  const a = world.countries.find((c) => c.code === from);
  const b = world.countries.find((c) => c.code === to);
  if (!a || !b) throw new Error(`No such journey: ${from} to ${to}.`);
  const km = distanceKm(
    { lat: a.capitalLat, lon: a.capitalLon },
    { lat: b.capitalLat, lon: b.capitalLon },
  );
  const band = COSTS.travel.find((t) => km <= t.upToKm);
  return (band ?? COSTS.travel[COSTS.travel.length - 1]!).hours;
}

export interface Budget {
  travel: number;
  /** Hours spent keeping watch, counted once as travel is (SDD 3.3). */
  watching: number;
  transmissions: number;
  factor: number;
  hintLadder: number;
  total: number;
}

/**
 * A mission's budget follows its reference solution through every stage:
 * travel and keeping watch once, transmissions times the factor, and one
 * hint ladder (SDD 3.3).
 */
export function computeBudget(mission: Mission, world: World): Budget {
  let travel = 0;
  let watching = 0;
  let transmissions = 0;
  for (const stage of Object.values(mission.stages)) {
    transmissions += referenceOperations(stage).length * COSTS.transmission;
    watching += referenceWatching(stage);
    const next = stage.next ? mission.stages[stage.next] : undefined;
    if (next && next.location !== stage.location) {
      travel += travelHours(world, stage.location, next.location);
    }
  }
  const factor = factorFor(mission);
  return {
    travel,
    watching,
    transmissions,
    factor,
    hintLadder: HINT_LADDER_COST,
    total: Math.ceil(
      travel + watching + transmissions * factor + HINT_LADDER_COST,
    ),
  };
}
