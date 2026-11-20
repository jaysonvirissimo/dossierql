import type { RecordRef, Scalar } from "./store.ts";

export type FactValue =
  | { kind: "scalar"; value: Scalar }
  | { kind: "ref"; ref: RecordRef | null }
  /** `complete` is true only when the whole collection came back. */
  | { kind: "list"; refs: RecordRef[]; complete: boolean };

/**
 * One field value of one record. The key names the record and the field, so
 * the same fact is recognised in any response, under any alias.
 */
export interface Fact {
  key: string;
  entity: RecordRef;
  field: string;
  value: FactValue;
}

/** Where a fact appeared in one response. */
export interface FactOccurrence {
  fact: Fact;
  path: (string | number)[];
}

export function factKey(entity: RecordRef, field: string): string {
  return `${entity}.${field}`;
}

/**
 * Combines two sightings of the same fact. A list seen in parts keeps every
 * member seen, and is complete once any one response held all of it.
 */
export function mergeFact(known: Fact | undefined, seen: Fact): Fact {
  if (!known) return seen;
  if (known.value.kind === "list" && seen.value.kind === "list") {
    if (seen.value.complete) return seen;
    if (known.value.complete) return known;
    const refs = [...new Set([...known.value.refs, ...seen.value.refs])];
    return { ...seen, value: { kind: "list", refs, complete: false } };
  }
  return seen;
}
