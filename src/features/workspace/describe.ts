import type { Stage } from "../../content/types.ts";
import { citationAt, pathKey, type CitedRow } from "../../engine/cite.ts";
import type { LedgerEntry, TransmissionRecord } from "../../engine/mission.ts";
import type { Fact } from "../../graphql/facts.ts";
import { parseRef } from "../../graphql/store.ts";
import { brief } from "./columns.ts";

export type Ledger = Readonly<Record<string, LedgerEntry>>;

const NAMING_FIELDS = [
  "name",
  "codename",
  "id",
  "code",
  "reference",
  "number",
  "label",
];

/** What a query returned to identify a record, if anything. */
function identifiedAs(ref: string, ledger: Ledger): string | null {
  for (const field of NAMING_FIELDS) {
    const value = ledger[`${ref}.${field}`]?.fact.value;
    if (value?.kind === "scalar" && typeof value.value === "string") {
      return value.value;
    }
  }
  const serial = ledger[`${ref}.serial`]?.fact.value;
  if (serial?.kind === "scalar" && typeof serial.value === "number") {
    return `entry ${String(serial.value)}`;
  }
  // A record with no name, such as a find, is known by what it is, as the
  // results know it.
  const description = ledger[`${ref}.description`]?.fact.value;
  if (description?.kind === "scalar" && typeof description.value === "string") {
    return brief(description.value);
  }
  return null;
}

/** camelCase to plain words: `lastKnownLocation` reads "last known location". */
export function words(field: string): string {
  return field.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}

/**
 * What to call a record, using only what the player's queries returned.
 * A record that no result has identified yet is numbered among the records
 * of its type that are not identified either, in the order the ledger met
 * them, as in "operative 1, not yet identified". The archive's own filing
 * key is never shown, because no query returned it.
 */
export function labelOf(ref: string, ledger: Ledger): string {
  const known = identifiedAs(ref, ledger);
  if (known !== null) return known;
  const { type } = parseRef(ref);
  const unknown: string[] = [];
  const note = (other: string | null | undefined) => {
    if (
      other &&
      !unknown.includes(other) &&
      parseRef(other).type === type &&
      identifiedAs(other, ledger) === null
    ) {
      unknown.push(other);
    }
  };
  for (const { fact } of Object.values(ledger)) {
    note(fact.entity);
    if (fact.value.kind === "ref") note(fact.value.ref);
    if (fact.value.kind === "list") fact.value.refs.forEach(note);
  }
  const index = unknown.indexOf(ref);
  return `${words(type)} ${String(index < 0 ? unknown.length + 1 : index + 1)}, not yet identified`;
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
  const label = labelOf(fact.entity, ledger);
  const type = typeWords(fact.entity);
  // A record not yet identified is labelled by its type already.
  const record = label.startsWith(`${type} `) ? label : `${type} ${label}`;
  return `${record} · ${words(fact.field)}: ${describeValue(fact, ledger)}`;
}

export { pathKey };

export interface Finding extends CitedRow {
  /** The facts the citation carries, such as "shipment → id". */
  label: string;
  /**
   * The row itself, by its fields from the record it sits in. Rows of the
   * same shape read the same, whatever facts each one carries.
   */
  row: string;
}

/** A row's fields from the record it sits in: after the last list index, or the top-level field. */
export function rowWords(path: readonly (string | number)[]): string {
  const last = path.reduce<number>(
    (at, part, index) => (typeof part === "number" ? index : at),
    0,
  );
  return path
    .slice(last + 1)
    .filter((part): part is string => typeof part === "string")
    .map(words)
    .join(" → ");
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
  return { ...cited, label: fields.join(" → "), row: rowWords(path) };
}

export function hours(n: number): string {
  return n === 1 ? "1 hour" : `${String(n)} hours`;
}
