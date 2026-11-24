import { leadBinding, type Stage } from "../content/types.ts";
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
    ...Object.values(stage.leadOutcomes ?? {}).flatMap((outcome) =>
      outcome.refutation ? [outcome.refutation.facts] : [],
    ),
  ];
  const keys = new Set<string>();
  for (const patterns of sets) {
    for (const fact of reach(patterns, facts, bindings).facts) {
      keys.add(fact.key);
    }
  }
  return [...keys];
}
