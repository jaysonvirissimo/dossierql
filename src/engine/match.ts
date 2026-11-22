import type { FactPattern } from "../content/types.ts";
import type { Fact } from "../graphql/facts.ts";
import { parseRef } from "../graphql/store.ts";

export type Bindings = Readonly<Record<string, string>>;

interface Term {
  type: string;
  /** A fixed identifier, or the name of a binding. */
  id: string | null;
  binding: string | null;
}

function term(text: string): Term {
  const { type, id } = parseRef(text);
  return id.startsWith("$")
    ? { type, id: null, binding: id.slice(1) }
    : { type, id, binding: null };
}

function isRecordTerm(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z]+:\S+$/.test(value);
}

/** Binds a term to a record, or reports that it cannot be. */
function unify(t: Term, ref: string, bindings: Bindings): Bindings | null {
  const { type, id } = parseRef(ref);
  if (type !== t.type) return null;
  if (t.id !== null) return t.id === id ? bindings : null;
  const name = t.binding as string;
  const bound = bindings[name];
  if (bound !== undefined) return bound === id ? bindings : null;
  return { ...bindings, [name]: id };
}

/** Every way one fact can satisfy one pattern under the bindings so far. */
function matchFact(
  pattern: FactPattern,
  fact: Fact,
  bindings: Bindings,
): Bindings[] {
  if (fact.field !== pattern.field) return [];
  const bound = unify(term(pattern.entity), fact.entity, bindings);
  if (!bound) return [];
  const value = fact.value;

  if (pattern.equals !== undefined) {
    if (value.kind === "scalar") {
      return value.value === pattern.equals ? [bound] : [];
    }
    if (value.kind !== "ref" || value.ref === null) return [];
    if (!isRecordTerm(pattern.equals)) return [];
    const next = unify(term(pattern.equals), value.ref, bound);
    return next ? [next] : [];
  }
  if (pattern.includes !== undefined) {
    if (value.kind !== "list") return [];
    const wanted = term(pattern.includes);
    return value.refs
      .map((ref) => unify(wanted, ref, bound))
      .filter((b): b is Bindings => b !== null);
  }
  if (pattern.excludes !== undefined) {
    // An absent entry proves nothing unless the whole list was retrieved.
    if (value.kind !== "list" || !value.complete) return [];
    const wanted = term(pattern.excludes);
    const present = value.refs.some((ref) => unify(wanted, ref, bound));
    return present ? [] : [bound];
  }
  return [bound];
}

export interface Filled {
  bindings: Bindings;
  /** The fact that met each pattern, in the order of the patterns. */
  facts: Fact[];
}

/**
 * Finds bindings under which every pattern is met by one of the facts, and
 * reports which facts met them. A binding stands for the same record wherever
 * it appears, so the facts must form a connected chain. Facts beyond those
 * needed are ignored.
 */
export function fillSet(
  patterns: readonly FactPattern[],
  facts: readonly Fact[],
  bindings: Bindings = {},
): Filled | null {
  const [first, ...rest] = patterns;
  if (!first) return { bindings, facts: [] };
  for (const fact of facts) {
    for (const next of matchFact(first, fact, bindings)) {
      const done = fillSet(rest, facts, next);
      if (done)
        return { bindings: done.bindings, facts: [fact, ...done.facts] };
    }
  }
  return null;
}

/** The bindings under which the facts meet every pattern, if any do. */
export function matchSet(
  patterns: readonly FactPattern[],
  facts: readonly Fact[],
  bindings: Bindings = {},
): Bindings | null {
  return fillSet(patterns, facts, bindings)?.bindings ?? null;
}

/** Whether one fact meets one pattern, taken apart from the other patterns. */
export function meets(
  pattern: FactPattern,
  fact: Fact,
  bindings: Bindings,
): boolean {
  return matchFact(pattern, fact, bindings).length > 0;
}

/**
 * The largest number of the patterns that the facts can meet together, with
 * each binding standing for one record throughout. When this is less than the
 * number of patterns met one at a time, some of the facts do not connect.
 */
export function mostTogether(
  patterns: readonly FactPattern[],
  facts: readonly Fact[],
  bindings: Bindings = {},
): number {
  const [first, ...rest] = patterns;
  if (!first) return 0;
  let best = mostTogether(rest, facts, bindings);
  for (const fact of facts) {
    for (const next of matchFact(first, fact, bindings)) {
      best = Math.max(best, 1 + mostTogether(rest, facts, next));
    }
  }
  return best;
}

/**
 * Whether a fact could take part in a pattern at all, given the bindings
 * already fixed. Used to tell a player that a citation is beside the point.
 */
export function couldMatch(
  pattern: FactPattern,
  fact: Fact,
  bindings: Bindings,
): boolean {
  if (fact.field !== pattern.field) return false;
  return unify(term(pattern.entity), fact.entity, bindings) !== null;
}
