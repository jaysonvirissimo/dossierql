import {
  bindingTypes,
  leadBinding,
  solutionBindings,
  type FactPattern,
  type Stage,
} from "../content/types.ts";
import type { Fact } from "../graphql/facts.ts";
import { couldMatch, matchSet, type Bindings } from "./match.ts";

export interface Citation {
  id: string;
  label: string;
  factKeys: string[];
}

export interface Draft {
  leadId: string;
  /** The player's conclusion: one record per solution binding. */
  bindings: Record<string, string>;
  citations: Citation[];
  ruledOut: boolean;
  fieldChecked: boolean;
}

export type ClaimStatus = "supported" | "open" | "refuted";

export interface ClaimReview {
  id: string;
  prompt: string;
  status: ClaimStatus;
  /** Solution bindings the claim needs that the draft has not named. */
  unnamed: string[];
  /** Some cited fact bears on the claim, though no evidence set is complete. */
  partial: boolean;
}

export interface DraftReview {
  claims: ClaimReview[];
  /** Citation ids whose facts bear on no claim for this lead. */
  unrelated: string[];
  /** Solution bindings the player has still to name. */
  unnamed: string[];
  allSupported: boolean;
  refuted: boolean;
  /** The draft names every record of the stage's solution correctly. */
  correct: boolean;
  canRuleOut: boolean;
  canFieldCheck: boolean;
  canProceed: boolean;
}

function bindingsIn(patterns: readonly FactPattern[]): Set<string> {
  const found = new Set<string>();
  for (const pattern of patterns) {
    for (const value of [
      pattern.entity,
      pattern.equals,
      pattern.includes,
      pattern.excludes,
    ]) {
      const match = typeof value === "string" && /:\$(\w+)$/.exec(value);
      if (match && match[1]) found.add(match[1]);
    }
  }
  return found;
}

export function citedFacts(
  draft: Draft,
  ledger: Readonly<Record<string, { fact: Fact }>>,
): Fact[] {
  const keys = new Set(draft.citations.flatMap((c) => c.factKeys));
  return [...keys]
    .map((key) => ledger[key]?.fact)
    .filter((f): f is Fact => f !== undefined);
}

/**
 * Reads a draft against its stage: which claims the citations support, which
 * are refuted, and what the player may do next. Reviewing costs nothing.
 */
export function reviewDraft(
  stage: Stage,
  draft: Draft,
  ledger: Readonly<Record<string, { fact: Fact }>>,
): DraftReview {
  const facts = citedFacts(draft, ledger);
  const lead = leadBinding(stage);
  const named = solutionBindings(stage).map(([name]) => name);
  const fixed: Record<string, string> = { [lead]: draft.leadId };
  for (const name of named) {
    const value = draft.bindings[name];
    if (name !== lead && value) fixed[name] = value;
  }
  const outcome = stage.leadOutcomes?.[draft.leadId];
  const refutation = outcome?.refutation;
  // A refutation speaks about the lead alone; its other records are free.
  const leadOnly: Bindings = { [lead]: draft.leadId };
  const refutedClaim =
    refutation && matchSet(refutation.facts, facts, leadOnly)
      ? refutation.claim
      : null;

  const claims: ClaimReview[] = stage.claims.map((claim) => {
    if (claim.id === refutedClaim) {
      return {
        id: claim.id,
        prompt: claim.prompt,
        status: "refuted",
        unnamed: [],
        partial: false,
      };
    }
    let unnamed: string[] = [];
    let supported = false;
    for (const set of claim.evidenceSets) {
      const missing = [...bindingsIn(set.facts)].filter(
        (name) => named.includes(name) && fixed[name] === undefined,
      );
      if (missing.length > 0) {
        unnamed = [...new Set([...unnamed, ...missing])];
        continue;
      }
      if (matchSet(set.facts, facts, fixed)) {
        supported = true;
        break;
      }
    }
    return {
      id: claim.id,
      prompt: claim.prompt,
      status: supported ? "supported" : "open",
      unnamed: supported ? [] : unnamed,
      partial:
        !supported &&
        claim.evidenceSets.some((set) =>
          set.facts.some((pattern) =>
            facts.some((fact) => couldMatch(pattern, fact, leadOnly)),
          ),
        ),
    };
  });

  const patterns = [
    ...stage.claims.flatMap((c) => c.evidenceSets.flatMap((s) => s.facts)),
    ...(refutation?.facts ?? []),
  ];
  const unrelated = draft.citations
    .filter((citation) => {
      const own = facts.filter((f) => citation.factKeys.includes(f.key));
      return !own.some((f) => patterns.some((p) => couldMatch(p, f, leadOnly)));
    })
    .map((c) => c.id);

  const unnamed = named.filter((name) => fixed[name] === undefined);
  const allSupported = claims.every((c) => c.status === "supported");
  const refuted = refutedClaim !== null;
  const correct = solutionBindings(stage).every(
    ([name, id]) => fixed[name] === id,
  );
  const supportedCount = claims.filter((c) => c.status === "supported").length;
  return {
    claims,
    unrelated,
    unnamed,
    allSupported,
    refuted,
    correct,
    canRuleOut: refuted && !draft.ruledOut,
    canFieldCheck:
      outcome?.fieldCheck !== undefined &&
      !draft.fieldChecked &&
      !draft.ruledOut &&
      !refuted &&
      supportedCount >= 1 &&
      supportedCount < claims.length,
    canProceed: allSupported && correct && !draft.ruledOut,
  };
}

export function emptyDraft(leadId: string): Draft {
  return {
    leadId,
    bindings: {},
    citations: [],
    ruledOut: false,
    fieldChecked: false,
  };
}

export { bindingTypes };
