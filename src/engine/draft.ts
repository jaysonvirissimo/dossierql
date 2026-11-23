import {
  bindingTypes,
  leadBinding,
  solutionBindings,
  type FactPattern,
  type Stage,
} from "../content/types.ts";
import type { Fact } from "../graphql/facts.ts";
import {
  couldMatch,
  fillSet,
  meets,
  mostTogether,
  type Bindings,
} from "./match.ts";

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

/**
 * Why an open claim with counted facts is not yet supported (SDD 3.2).
 * `disconnected`: the facts are about records that do not lead to each other.
 * `mismatch`: the facts connect, but not to a record chosen in the draft.
 * `missing`: the facts connect and at least one more is needed.
 */
export type ClaimGap = "none" | "disconnected" | "mismatch" | "missing";

export interface ClaimReview {
  id: string;
  prompt: string;
  status: ClaimStatus;
  /** Solution bindings the claim needs that the draft has not named. */
  unnamed: string[];
  /**
   * Keys of the cited facts that count toward the claim. For a supported
   * claim these are the facts of the complete set, and for a refuted claim
   * the facts that contradict it.
   */
  counted: string[];
  /** What stands between the counted facts and a complete evidence set. */
  gap: ClaimGap;
  /**
   * For a claim that waits on a choice: the records that the cited facts
   * already show for the boxes left blank, by binding. Empty when they show
   * none.
   */
  shows: Record<string, string>;
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

function keysOf(facts: readonly Fact[]): string[] {
  return [...new Set(facts.map((fact) => fact.key))];
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
  const refuting = refutation && fillSet(refutation.facts, facts, leadOnly);
  const refutedClaim = refutation && refuting ? refutation.claim : null;

  const claims: ClaimReview[] = stage.claims.map((claim) => {
    if (claim.id === refutedClaim) {
      return {
        id: claim.id,
        prompt: claim.prompt,
        status: "refuted",
        unnamed: [],
        counted: keysOf(refuting?.facts ?? []),
        gap: "none",
        shows: {},
      };
    }
    let unnamed: string[] = [];
    let shows: Record<string, string> = {};
    for (const set of claim.evidenceSets) {
      const missing = [...bindingsIn(set.facts)].filter(
        (name) => named.includes(name) && fixed[name] === undefined,
      );
      if (missing.length > 0) {
        unnamed = [...new Set([...unnamed, ...missing])];
        // The cited facts may complete the set with the blank boxes left
        // free. The claim then waits only on the player's choice (SDD 3.2).
        const free =
          Object.keys(shows).length === 0 && fillSet(set.facts, facts, fixed);
        if (free) {
          shows = Object.fromEntries(
            missing.flatMap((name) => {
              const value = free.bindings[name];
              return value === undefined ? [] : [[name, value]];
            }),
          );
        }
        continue;
      }
      const filled = fillSet(set.facts, facts, fixed);
      if (filled) {
        return {
          id: claim.id,
          prompt: claim.prompt,
          status: "supported",
          unnamed: [],
          counted: keysOf(filled.facts),
          gap: "none",
          shows: {},
        };
      }
    }
    const counted = facts.filter((fact) =>
      claim.evidenceSets.some((set) =>
        set.facts.some((pattern) => meets(pattern, fact, leadOnly)),
      ),
    );
    let gap: ClaimGap = counted.length > 0 ? "missing" : "none";
    for (const set of claim.evidenceSets) {
      if (gap === "none" || gap === "disconnected") break;
      const apart = set.facts.filter((pattern) =>
        counted.some((fact) => meets(pattern, fact, leadOnly)),
      ).length;
      const together = mostTogether(set.facts, counted, leadOnly);
      if (apart > together) gap = "disconnected";
      else if (together > mostTogether(set.facts, counted, fixed)) {
        gap = "mismatch";
      }
    }
    return {
      id: claim.id,
      prompt: claim.prompt,
      status: "open",
      unnamed,
      counted: keysOf(counted),
      gap,
      shows,
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
