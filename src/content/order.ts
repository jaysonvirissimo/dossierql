import type { Mission } from "./types.ts";

const KIND_RANK: Record<Mission["kind"], number> = {
  teaching: 0,
  assessment: 1,
  coda: 2,
};

/**
 * Course order: by clearance, the teaching mission before the assessment,
 * and a campaign's coda after the assessment of its level.
 */
export function sortMissions(missions: readonly Mission[]): Mission[] {
  return [...missions].sort(
    (a, b) =>
      a.clearance - b.clearance ||
      KIND_RANK[a.kind] - KIND_RANK[b.kind] ||
      a.order - b.order,
  );
}

/** A short stable fingerprint of a mission, stored with saves (SDD 7.4). */
export function contentVersion(mission: Mission): string {
  const text = JSON.stringify(mission);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}
