import {
  bindingTypes,
  leadBinding,
  type FactPattern,
  type Stage,
} from "../content/types.ts";
import type { Fact } from "../graphql/facts.ts";
import { parseRef } from "../graphql/store.ts";
import { couldMatch, meets, type Bindings } from "./match.ts";

type Path = readonly (string | number)[];

export interface CitedRow {
  /** The facts a citation made from this row carries, outermost first. */
  factKeys: string[];
  /** The lead whose draft the citation enters, when the response shows one. */
  leadId: string | null;
}

export function pathKey(path: Path): string {
  return path.join("/");
}

/** Every fact pattern a stage's claims and refutations are written in. */
export function stagePatterns(stage: Stage): FactPattern[] {
  return [
    ...stage.claims.flatMap((c) => c.evidenceSets.flatMap((s) => s.facts)),
    ...Object.values(stage.leadOutcomes ?? {}).flatMap(
      (o) => o.refutation?.facts ?? [],
    ),
  ];
}

/**
 * The facts on the way down to one row of a response, outermost first and
 * ending with the row itself. Empty when the row records no fact.
 */
export function factsAlong(
  record: { facts: readonly { key: string; path: Path }[] },
  path: Path,
): string[] {
  const byPath = new Map(record.facts.map((f) => [pathKey(f.path), f.key]));
  const own = byPath.get(pathKey(path));
  if (!own) return [];
  const chain: string[] = [];
  for (let end = 2; end < path.length; end++) {
    // A list index is a position in a list, not a field of a record.
    if (typeof path[end - 1] !== "string") continue;
    const key = byPath.get(pathKey(path.slice(0, end)));
    if (key) chain.push(key);
  }
  chain.push(own);
  return chain;
}

/**
 * The citation behind one row of a response (SDD 3.2). It carries the row's
 * own fact and the facts on the path down to it. Start at the first fact a
 * claim can use for this lead, or at a refuting fact when no claim can use
 * the chain.
 *
 * `leadId` is the lead whose draft the citation enters. It is null when the
 * response does not settle that, and the caller then uses the open draft.
 * `activeLead` is the lead whose draft is open, if one is.
 */
export function citationAt(
  record: { facts: readonly { key: string; path: Path }[] },
  path: Path,
  stage: Stage,
  ledger: Readonly<Record<string, { fact: Fact }>>,
  activeLead: string | null = null,
): CitedRow | null {
  const chain = factsAlong(record, path);
  const own = chain[chain.length - 1];
  if (own === undefined) return null;

  const patterns = stagePatterns(stage);
  const lead = leadBinding(stage);
  const leadType = bindingTypes(stage)[lead];
  const ownFact = ledger[own]?.fact;
  // The patterns that say something about the lead itself.
  const marker = ":$" + lead;
  const aboutLead = patterns.filter((p) =>
    [p.entity, p.equals, p.includes, p.excludes].some(
      (term) => typeof term === "string" && term.endsWith(marker),
    ),
  );
  // A list that omits a record is evidence about that record only when the
  // player has that record's draft open. It omits every other record too.
  const bearsOn = (id: string, byAbsence = false) =>
    ownFact !== undefined &&
    aboutLead.some(
      (p) =>
        (byAbsence || p.excludes === undefined) &&
        meets(p, ownFact, { [lead]: id }),
    );

  // The innermost lead the row sits under in the response.
  let under: string | null = null;
  for (const key of chain) {
    const entity = ledger[key]?.fact.entity;
    if (entity && parseRef(entity).type === leadType) {
      under = parseRef(entity).id;
    }
  }
  const value = ownFact?.value;
  const refs =
    value?.kind === "ref" && value.ref
      ? [value.ref]
      : value?.kind === "list"
        ? value.refs
        : [];
  const pointsTo = refs
    .filter((ref) => parseRef(ref).type === leadType)
    .map((ref) => parseRef(ref).id);

  let leadId: string | null;
  if (activeLead !== null && bearsOn(activeLead, true)) {
    // Evidence about the lead whose draft is open goes to that draft,
    // wherever in the response the row is.
    leadId = activeLead;
  } else if (under !== null && bearsOn(under)) {
    leadId = under;
  } else {
    // A row whose value is a lead, such as a shipment's consignee, opens it.
    const about = pointsTo.filter((id) => bearsOn(id));
    if (about.length === 1) leadId = about[0] as string;
    else if (about.length > 1) leadId = null;
    else if (under !== null) leadId = under;
    else leadId = value?.kind === "ref" ? (pointsTo[0] ?? null) : null;
  }
  // Find the start of a chain that supports a claim for this lead.
  const forLead = leadId ?? activeLead;
  const bound: Bindings = forLead === null ? {} : { [lead]: forLead };
  const refutation =
    forLead === null ? undefined : stage.leadOutcomes?.[forLead]?.refutation;
  const evidence = stage.claims.flatMap((c) =>
    c.evidenceSets.flatMap((s) => s.facts),
  );
  const usable = (key: string) => {
    const fact = ledger[key]?.fact;
    return (
      fact !== undefined &&
      evidence.some((p) =>
        aboutLead.includes(p) && forLead !== null
          ? meets(p, fact, bound)
          : couldMatch(p, fact, bound),
      )
    );
  };
  let start = chain.findIndex(usable);
  if (start < 0 && refutation) {
    start = chain.findIndex((key) => {
      const fact = ledger[key]?.fact;
      return (
        fact !== undefined &&
        // A list's omission cannot start a chain from a nested row.
        refutation.facts.some(
          (p) => p.excludes === undefined && meets(p, fact, bound),
        )
      );
    });
  }
  const factKeys = start >= 0 ? chain.slice(start) : [own];
  return { factKeys, leadId };
}
