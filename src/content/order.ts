import type { Mission } from "./types.ts";

/** Course order: by clearance, the teaching mission before the assessment. */
export function sortMissions(missions: readonly Mission[]): Mission[] {
  return [...missions].sort(
    (a, b) =>
      a.clearance - b.clearance ||
      (a.kind === b.kind ? a.order - b.order : a.kind === "teaching" ? -1 : 1),
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
