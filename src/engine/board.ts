import { leadBinding, refutationSets, type Stage } from "../content/types.ts";
import type { Fact } from "../graphql/facts.ts";
import { reach } from "./match.ts";

/**
 * The facts in the ledger that bear on one lead, for the case board (SDD
 * 3.5). Each is a fact that connects to the lead along one of the stage's
 * evidence sets or refutations, so the board shows what the player has
 * retrieved about the lead and leaves the judging to the form.
 */
export function leadFacts(
  stage: Stage,
  ledger: Readonly<Record<string, { fact: Fact }>>,
  leadId: string,
): string[] {
  const facts = Object.values(ledger).map((entry) => entry.fact);
  if (facts.length === 0) return [];
  const bindings = { [leadBinding(stage)]: leadId };
  const sets = [
    ...stage.claims.flatMap((claim) => claim.evidenceSets.map((s) => s.facts)),
    ...Object.values(stage.leadOutcomes ?? {}).flatMap(refutationSets),
  ];
  const keys = new Set<string>();
  for (const patterns of sets) {
    for (const fact of reach(patterns, facts, bindings).facts) {
      keys.add(fact.key);
    }
  }
  return [...keys];
}

/** How many steps from the lead a record may be and still count as linked. */
const LINK_STEPS = 2;

/**
 * The records the player's responses link to one record, by following what
 * its facts point to, up to two steps away: a find's language and that
 * language's countries, or a sighting's city and that city's country. A form
 * lists these first in a box, so that the countries a lead points to are not
 * lost among every country a mission has returned (SDD 8.2). The links come
 * from the player's own responses and say nothing about which record fits a
 * claim.
 */
export function linkedRecords(
  ledger: Readonly<Record<string, { fact: Fact }>>,
  from: string,
): Set<string> {
  const next = new Map<string, string[]>();
  for (const { fact } of Object.values(ledger)) {
    const targets =
      fact.value.kind === "ref"
        ? fact.value.ref === null
          ? []
          : [fact.value.ref]
        : fact.value.kind === "list"
          ? fact.value.refs
          : [];
    if (targets.length === 0) continue;
    next.set(fact.entity, [...(next.get(fact.entity) ?? []), ...targets]);
  }
  const linked = new Set<string>();
  let frontier = [from];
  for (let step = 0; step < LINK_STEPS; step += 1) {
    frontier = frontier
      .flatMap((ref) => next.get(ref) ?? [])
      .filter((ref) => ref !== from && !linked.has(ref));
    frontier.forEach((ref) => linked.add(ref));
  }
  return linked;
}
