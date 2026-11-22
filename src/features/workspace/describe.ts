import type { Stage } from "../../content/types.ts";
import { citationAt, pathKey, type CitedRow } from "../../engine/cite.ts";
import type { LedgerEntry, TransmissionRecord } from "../../engine/mission.ts";
import type { Fact } from "../../graphql/facts.ts";
import { parseRef } from "../../graphql/store.ts";

export type Ledger = Readonly<Record<string, LedgerEntry>>;

const NAMING_FIELDS = ["name", "codename", "id", "code"];

/** camelCase to plain words: `lastKnownLocation` reads "last known location". */
export function words(field: string): string {
  return field.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}

/**
 * What to call a record, using only what the player's queries returned.
 * A record never named in a result is shown by its filing number.
 */
export function labelOf(ref: string, ledger: Ledger): string {
  for (const field of NAMING_FIELDS) {
    const value = ledger[`${ref}.${field}`]?.fact.value;
    if (value?.kind === "scalar" && typeof value.value === "string") {
      return value.value;
    }
  }
  return parseRef(ref).id;
}

export function typeWords(ref: string): string {
  return words(parseRef(ref).type);
}

export function describeValue(fact: Fact, ledger: Ledger): string {
  const value = fact.value;
  if (value.kind === "scalar") {
    return value.value === null ? "none on file" : String(value.value);
  }
  if (value.kind === "ref") {
    return value.ref === null ? "none on file" : labelOf(value.ref, ledger);
  }
  if (value.refs.length === 0) {
    return value.complete ? "none (complete list)" : "none in this part";
  }
  const names = value.refs.map((ref) => labelOf(ref, ledger)).join(", ");
  return value.complete
    ? `${names} (complete list)`
    : `${names} (partial list)`;
}

export function describeFact(fact: Fact, ledger: Ledger): string {
  return `${typeWords(fact.entity)} ${labelOf(fact.entity, ledger)} · ${words(fact.field)}: ${describeValue(fact, ledger)}`;
}

export { pathKey };

export interface Finding extends CitedRow {
  label: string;
}

/** The citation behind one row of a response, with the words to show for it. */
export function findingAt(
  record: TransmissionRecord,
  path: readonly (string | number)[],
  stage: Stage,
  ledger: Ledger,
  activeLead: string | null = null,
): Finding | null {
  const cited = citationAt(record, path, stage, ledger, activeLead);
  if (!cited) return null;
  const fields = cited.factKeys.map((key) =>
    words(ledger[key]?.fact.field ?? ""),
  );
  return { ...cited, label: fields.join(" → ") };
}

export function hours(n: number): string {
  return n === 1 ? "1 hour" : `${String(n)} hours`;
}
