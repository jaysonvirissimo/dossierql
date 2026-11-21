/** The shapes mission files are parsed into (SDD 5.4). */

export const CONCEPTS = [
  "nested-selections",
  "arguments",
  "aliases",
  "fragments",
  "variables",
] as const;
export type Concept = (typeof CONCEPTS)[number];

export type Literal = string | number | boolean;

/**
 * One fact an evidence set needs. `entity` and record values are written
 * `Type:identifier`; an identifier beginning with `$` is a binding.
 */
export interface FactPattern {
  entity: string;
  field: string;
  equals?: Literal;
  includes?: string;
  /** Satisfied only by a complete list that lacks the record. */
  excludes?: string;
}

export interface EvidenceSet {
  facts: FactPattern[];
}

export interface Claim {
  id: string;
  prompt: string;
  evidenceSets: EvidenceSet[];
}

export interface Clue {
  text: string;
  /** Path of schema fields from a binding, mapped to what it must reach. */
  constraint: Record<string, Literal>;
}

export interface LeadOutcome {
  /** Country the lead points at, which prices a field check. */
  location?: string;
  refutation?: { claim: string; facts: FactPattern[] };
  ruledOut?: string;
  fieldCheck?: string;
}

export type ScaffoldLevel = "guided" | "partial" | "none";

export interface Hints {
  nudge: string;
  concept: string;
  schema: string;
  skeleton: string;
}

export interface Solution {
  type: "destination" | "deduction";
  [binding: string]: string;
}

export interface Stage {
  /** Country code of where the stage takes place. */
  location: string;
  objective: string;
  briefing: string;
  clues: Clue[];
  scaffold: {
    level: ScaffoldLevel;
    starterQuery?: string;
    starterVariables?: string;
    /** Keep the editor as the player left it in the previous stage. */
    carryOver?: boolean;
  };
  hints: Hints;
  solution: Solution;
  /** What each solution binding is called on the draft form. */
  labels?: Record<string, string>;
  claims: Claim[];
  leadOutcomes?: Record<string, LeadOutcome>;
  /** Dispatch read when the stage is resolved. */
  resolved?: string;
  referenceSolution: string | string[];
  referenceVariables?: Record<string, unknown> | Record<string, unknown>[];
  next?: string;
}

export interface Mission {
  id: string;
  title: string;
  campaign: string;
  /** Where the mission sits in its campaign. */
  order: number;
  clearance: number;
  kind: "teaching" | "assessment";
  teaches: Concept | null;
  practises: Concept[];
  requires: Concept[];
  summary: string;
  motif?: string;
  clock: {
    countdown: string;
    expired: string;
    onExpiry: "continue" | "end";
  };
  startingStage: string;
  debrief: {
    onTime: string;
    afterDeadline?: string;
    stampOnTime: string;
    stampLate?: string;
    /** What the reference solution shows about the concept. */
    comparison: string;
    geography: string;
  };
  stages: Record<string, Stage>;
}

export interface GlossaryEntry {
  id: string;
  term: string;
  definition: string;
  /** Clearance at which mission text may first use the term. */
  clearance: number;
  /** Other spellings that count as this term in mission text. */
  matches?: string[];
}

export interface ConceptCard {
  id: Concept;
  title: string;
  clearance: number;
  summary: string;
  example: string;
  payoff: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export interface Country {
  code: string;
  name: string;
  capital: string;
  capitalLat: number;
  capitalLon: number;
  continent: string;
  borders: string[];
  languages: string[];
  currency: { code: string; name: string } | null;
}

export interface World {
  snapshot: { source: string; version: string; supplements?: string[] };
  continents: string[];
  countries: Country[];
  cities: City[];
}

export function referenceOperations(stage: Stage): {
  operation: string;
  variables: Record<string, unknown> | undefined;
}[] {
  const operations = Array.isArray(stage.referenceSolution)
    ? stage.referenceSolution
    : [stage.referenceSolution];
  const variables = stage.referenceVariables;
  return operations.map((operation, index) => ({
    operation,
    variables: Array.isArray(variables) ? variables[index] : variables,
  }));
}

/** The solution's bindings, in authored order, without its `type`. */
export function solutionBindings(stage: Stage): [string, string][] {
  return Object.entries(stage.solution).filter(([key]) => key !== "type");
}

export function leadBinding(stage: Stage): string {
  const first = solutionBindings(stage)[0];
  if (!first) throw new Error("A stage's solution names at least one record.");
  return first[0];
}

function patternsOf(stage: Stage): FactPattern[] {
  return [
    ...stage.claims.flatMap((c) => c.evidenceSets.flatMap((s) => s.facts)),
    ...Object.values(stage.leadOutcomes ?? {}).flatMap(
      (o) => o.refutation?.facts ?? [],
    ),
  ];
}

/** The record type each binding stands for, read from the fact patterns. */
export function bindingTypes(stage: Stage): Record<string, string> {
  const types: Record<string, string> = {};
  const note = (value: unknown) => {
    if (typeof value !== "string") return;
    const match = /^([A-Za-z]+):\$(\w+)$/.exec(value);
    if (match?.[1] && match[2]) types[match[2]] = match[1];
  };
  for (const pattern of patternsOf(stage)) {
    note(pattern.entity);
    note(pattern.equals);
    note(pattern.includes);
    note(pattern.excludes);
  }
  return types;
}

export interface Campaign {
  id: string;
  title: string;
  summary: string;
}
