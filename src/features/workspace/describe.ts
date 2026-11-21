import {
  bindingTypes,
  leadBinding,
  solutionBindings,
  type Stage,
} from "../../content/types.ts";
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

export function pathKey(path: readonly (string | number)[]): string {
  return path.join("/");
}

export interface Finding {
  /** The facts a citation made from this row would carry. */
  factKeys: string[];
  label: string;
  /** The lead the row sits under, when the response shows one. */
  leadId: string | null;
}

/**
 * The connected chain of facts behind one row of a response: from the
 * outermost record the stage's conclusion is about, down to the row itself.
 */
export function findingAt(
  record: TransmissionRecord,
  path: readonly (string | number)[],
  stage: Stage,
  ledger: Ledger,
): Finding | null {
  const byPath = new Map(record.facts.map((f) => [pathKey(f.path), f.key]));
  const chain: string[] = [];
  for (let end = 2; end <= path.length; end++) {
    if (typeof path[end - 1] !== "string") continue;
    const key = byPath.get(pathKey(path.slice(0, end)));
    if (key) chain.push(key);
  }
  const own = byPath.get(pathKey(path));
  if (!own) return null;
  if (chain[chain.length - 1] !== own) chain.push(own);

  const types = bindingTypes(stage);
  const concluded = new Set(
    solutionBindings(stage).map(([name]) => types[name]),
  );
  const typeOf = (key: string) => {
    const entity = ledger[key]?.fact.entity;
    return entity ? parseRef(entity).type : "";
  };
  const start = chain.findIndex((key) => concluded.has(typeOf(key)));
  const factKeys = start >= 0 ? chain.slice(start) : [own];

  const leadType = types[leadBinding(stage)];
  let leadId: string | null = null;
  for (const key of chain) {
    const entity = ledger[key]?.fact.entity;
    if (entity && parseRef(entity).type === leadType) {
      leadId = parseRef(entity).id;
    }
  }
  // A row that names a lead, such as a shipment's consignee, opens that lead.
  const value = ledger[own]?.fact.value;
  if (
    leadId === null &&
    value?.kind === "ref" &&
    value.ref &&
    parseRef(value.ref).type === leadType
  ) {
    leadId = parseRef(value.ref).id;
  }
  const fields = factKeys.map((key) => words(ledger[key]?.fact.field ?? ""));
  return { factKeys, label: fields.join(" → "), leadId };
}

export function hours(n: number): string {
  return n === 1 ? "1 hour" : `${String(n)} hours`;
}
