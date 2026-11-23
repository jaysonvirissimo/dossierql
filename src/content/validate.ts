import { isObjectType, Kind, parse, visit, type GraphQLSchema } from "graphql";
import {
  clearanceInForce,
  deriveStanding,
  lastCase,
} from "../engine/clearance.ts";
import { citationAt, factsAlong, type CitedRow } from "../engine/cite.ts";
import { computeBudget } from "../engine/clock.ts";
import { reviewDraft } from "../engine/draft.ts";
import { levelKata } from "../engine/debrief.ts";
import { attemptKata } from "../engine/kata.ts";
import { matchSet, type Bindings } from "../engine/match.ts";
import { parseRequest, showsTechnique } from "../engine/technique.ts";
import {
  act,
  fieldCheckCost,
  startMission,
  type Env,
  type MissionState,
} from "../engine/mission.ts";
import { check, transmit } from "../graphql/execute.ts";
import { factKey, type Fact } from "../graphql/facts.ts";
import { fieldClearance, fullSchema, schemaFor } from "../graphql/schema.ts";
import {
  fieldShape,
  parseRef,
  refOf,
  type RawRecord,
  type Store,
} from "../graphql/store.ts";
import { buildCatalog, type Catalog, type RawContent } from "./catalog.ts";
import {
  campaignsSchema,
  conceptsSchema,
  drillsSchema,
  katasSchema,
  glossarySchema,
  intelSchema,
  missionSchema,
} from "./schema.ts";
import { glossaryLinks, MARKUP, styleIssues } from "./style.ts";
import {
  bindingTypes,
  leadBinding,
  referenceOperations,
  solutionBindings,
  type Concept,
  type FactPattern,
  type Literal,
  type Mechanic,
  type Mission,
  type Stage,
} from "./types.ts";

export interface Issue {
  path: string;
  message: string;
  code: string;
}

type Report = (path: string, code: string, message: string) => void;

// ---------------------------------------------------------------- facts

/** Every fact the archive holds, as a complete retrieval would record it. */
export function allFacts(store: Store, schema: GraphQLSchema): Fact[] {
  const facts: Fact[] = [];
  for (const type of Object.values(schema.getTypeMap())) {
    if (!isObjectType(type) || type.name.startsWith("__")) continue;
    if (type === schema.getQueryType()) continue;
    for (const record of store.all(type.name)) {
      const entity = refOf(record.type, record.id);
      for (const field of Object.values(type.getFields())) {
        const shape = fieldShape(field.type);
        const raw = field.name === "id" ? record.id : record[field.name];
        const key = factKey(entity, field.name);
        if (shape.target === null) {
          facts.push({
            key,
            entity,
            field: field.name,
            value: { kind: "scalar", value: (raw ?? null) as string | null },
          });
        } else if (shape.list) {
          const target = shape.target;
          facts.push({
            key,
            entity,
            field: field.name,
            value: {
              kind: "list",
              refs: ((raw as string[] | undefined) ?? []).map((id) =>
                refOf(target, id),
              ),
              complete: true,
            },
          });
        } else {
          facts.push({
            key,
            entity,
            field: field.name,
            value: {
              kind: "ref",
              ref: typeof raw === "string" ? refOf(shape.target, raw) : null,
            },
          });
        }
      }
    }
  }
  return facts;
}

function resolveTerm(term: string, bindings: Bindings): string | null {
  const { type, id } = parseRef(term);
  if (!id.startsWith("$")) return term;
  const bound = bindings[id.slice(1)];
  return bound === undefined ? null : refOf(type, bound);
}

/** The fact keys a matched evidence set rests on. */
export function instantiate(
  patterns: readonly FactPattern[],
  bindings: Bindings,
): string[] {
  return patterns.flatMap((pattern) => {
    const entity = resolveTerm(pattern.entity, bindings);
    return entity ? [factKey(entity, pattern.field)] : [];
  });
}

// ---------------------------------------------------------- constraints

type Reached = string | number | boolean | null;

/** Everything a path of fields reaches from a record. Lists fan out. */
function reach(
  store: Store,
  schema: GraphQLSchema,
  start: string,
  path: readonly string[],
): Reached[] {
  let current: Reached[] = [start];
  let type: string | null = parseRef(start).type;
  for (const fieldName of path) {
    const objectType = type ? schema.getType(type) : undefined;
    if (!objectType || !isObjectType(objectType)) return [];
    const field = objectType.getFields()[fieldName];
    if (!field) throw new Error(`${String(type)} has no field ${fieldName}.`);
    const shape = fieldShape(field.type);
    const next: Reached[] = [];
    for (const ref of current) {
      if (typeof ref !== "string") continue;
      const record = store.getRef(ref);
      if (!record) continue;
      const raw = fieldName === "id" ? record.id : record[fieldName];
      const values = Array.isArray(raw) ? raw : [raw];
      for (const value of values) {
        if (value === undefined || value === null) continue;
        next.push(
          shape.target
            ? refOf(shape.target, value as string)
            : (value as Reached),
        );
      }
    }
    current = next;
    type = shape.target;
  }
  return current;
}

interface Side {
  binding: string | null;
  path: string[];
  literal: Literal | null;
}

function side(value: Literal): Side {
  if (typeof value === "string" && value.startsWith("$")) {
    const [head, ...path] = value.slice(1).split(".");
    return { binding: head ?? "", path, literal: null };
  }
  return { binding: null, path: [], literal: value };
}

interface Constraint {
  left: Side;
  right: Side;
  /** Written with `!` after the path: the path must not reach the value. */
  negated: boolean;
  clue: number;
}

function constraintsOf(stage: Stage): Constraint[] {
  return stage.clues.flatMap((clue, index) =>
    Object.entries(clue.constraint).map(([key, value]) => ({
      left: side(key.replace(/!$/, "")),
      right: side(value),
      negated: key.endsWith("!"),
      clue: index,
    })),
  );
}

function evaluate(
  store: Store,
  schema: GraphQLSchema,
  types: Record<string, string>,
  s: Side,
  bindings: Bindings,
): Reached[] | undefined {
  if (s.binding === null) return [s.literal];
  const id = bindings[s.binding];
  const type = types[s.binding];
  if (id === undefined || type === undefined) return undefined;
  return reach(store, schema, refOf(type, id), s.path);
}

/** Every assignment of records to bindings that meets the constraints. */
export function solve(
  store: Store,
  schema: GraphQLSchema,
  types: Record<string, string>,
  constraints: readonly Constraint[],
  limit = 20,
): Bindings[] {
  const names = [
    ...new Set(
      constraints.flatMap((c) =>
        [c.left.binding, c.right.binding].filter(
          (b): b is string => b !== null,
        ),
      ),
    ),
  ];
  const found: Bindings[] = [];
  const holds = (bindings: Bindings) =>
    constraints.every((c) => {
      const left = evaluate(store, schema, types, c.left, bindings);
      const right = evaluate(store, schema, types, c.right, bindings);
      if (left === undefined || right === undefined) return true;
      return left.some((value) => right.includes(value)) !== c.negated;
    });
  const assign = (index: number, bindings: Bindings) => {
    if (found.length >= limit) return;
    const name = names[index];
    if (name === undefined) {
      found.push(bindings);
      return;
    }
    const type = types[name];
    if (type === undefined) throw new Error(`Binding $${name} has no type.`);
    for (const record of store.all(type)) {
      const next = { ...bindings, [name]: record.id };
      if (holds(next)) assign(index + 1, next);
    }
  };
  assign(0, {});
  return found;
}

// ------------------------------------------------------------- concepts

/** The concepts an operation's text makes use of. */
export function conceptsUsed(operation: string): Set<Concept> {
  const used = new Set<Concept>();
  let depth = 0;
  visit(parse(operation), {
    SelectionSet: {
      enter() {
        depth++;
        if (depth >= 3) used.add("nested-selections");
      },
      leave() {
        depth--;
      },
    },
    Argument: () => void used.add("arguments"),
    Field: (node) => {
      if (node.alias) used.add("aliases");
    },
    FragmentSpread: () => void used.add("fragments"),
    VariableDefinition: () => void used.add("variables"),
  });
  return used;
}

// ---------------------------------------------------------------- text

/** One passage a player reads, and how the interface treats it. */
interface Passage {
  path: string;
  text: string;
  /** Whether inline Markdown is rendered, or shown as typed (SDD 5.7). */
  markdown: boolean;
}

/** The comment lines of a query the player is shown. */
function commentsOf(code: string | undefined): string {
  return (code ?? "")
    .split("\n")
    .flatMap((line) => /#\s?(.*)$/.exec(line)?.[1] ?? [])
    .join(" ");
}

function proseOf(mission: Mission): Passage[] {
  const plain = (path: string, text: string | undefined): Passage => ({
    path,
    text: text ?? "",
    markdown: false,
  });
  const rendered = (path: string, text: string | undefined): Passage => ({
    path,
    text: text ?? "",
    markdown: true,
  });
  const out = [
    plain("title", mission.title),
    plain("summary", mission.summary),
    plain("clock.countdown", mission.clock?.countdown),
    plain("clock.expired", mission.clock?.expired),
    rendered("debrief.onTime", mission.debrief.onTime),
    rendered("debrief.afterDeadline", mission.debrief.afterDeadline),
    rendered("debrief.comparison", mission.debrief.comparison),
    rendered("debrief.geography", mission.debrief.geography),
  ];
  for (const [id, stage] of Object.entries(mission.stages)) {
    const at = `stages.${id}`;
    out.push(
      plain(`${at}.objective`, stage.objective),
      rendered(`${at}.briefing`, stage.briefing),
      plain(`${at}.hints.nudge`, stage.hints.nudge),
      plain(`${at}.hints.concept`, stage.hints.concept),
      plain(`${at}.hints.schema`, stage.hints.schema),
      plain(`${at}.resolved`, stage.resolved),
      // A comment is read in the editor, where nothing is rendered, and a
      // backtick there is only a backtick.
      rendered(
        `${at}.scaffold.starterQuery`,
        commentsOf(stage.scaffold.starterQuery),
      ),
      ...stage.clues.map((clue, i) =>
        plain(`${at}.clues.${String(i)}`, clue.text),
      ),
      ...stage.claims.map((claim) =>
        plain(`${at}.claims.${claim.id}`, claim.prompt),
      ),
      ...Object.values(stage.labels ?? {}).map((label, i) =>
        plain(`${at}.labels.${String(i)}`, label),
      ),
      ...Object.entries(stage.leadOutcomes ?? {}).flatMap(([lead, o]) => [
        rendered(`${at}.leadOutcomes.${lead}.ruledOut`, o.ruledOut),
        rendered(`${at}.leadOutcomes.${lead}.fieldCheck`, o.fieldCheck),
      ]),
    );
  }
  return out;
}

function mentions(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\w.])${escaped}(?![\\w])`, "i").test(text);
}

/** GraphQL vocabulary that must be defined before mission text may use it. */
const VOCABULARY = [
  "query",
  "field",
  "selection",
  "nested selection",
  "schema",
  "type",
  "argument",
  "alias",
  "fragment",
  "variable",
  "operation",
];

// ------------------------------------------------------------ the checks

function checkStructure(raw: RawContent, report: Report): Mission[] {
  const sound: Mission[] = [];
  raw.missions.forEach((mission, index) => {
    const name =
      typeof (mission as { id?: unknown }).id === "string"
        ? mission.id
        : `missions[${String(index)}]`;
    const parsed = missionSchema.safeParse(mission);
    if (parsed.success) {
      sound.push(mission);
      return;
    }
    for (const issue of parsed.error.issues) {
      report(`${name}.${issue.path.join(".")}`, "structure", issue.message);
    }
  });
  const others: [
    string,
    { safeParse(v: unknown): { success: boolean } },
    unknown,
  ][] = [
    ["glossary", glossarySchema, raw.glossary],
    ["concepts", conceptsSchema, raw.concepts],
    ["campaigns", campaignsSchema, raw.campaigns],
    ...raw.intel.map(
      (file, i) =>
        [`intel[${String(i)}]`, intelSchema, file] as [
          string,
          typeof intelSchema,
          unknown,
        ],
    ),
  ];
  for (const [name, schema, value] of others) {
    if (!schema.safeParse(value).success) {
      report(name, "structure", "The file does not have the required shape.");
    }
  }
  return sound;
}

function checkWorld(raw: RawContent, report: Report): void {
  const byCode = new Map(raw.world.countries.map((c) => [c.code, c]));
  for (const country of raw.world.countries) {
    for (const other of country.borders) {
      const neighbour = byCode.get(other);
      if (!neighbour) {
        report(
          `world.${country.code}`,
          "world",
          `Borders unknown country ${other}.`,
        );
      } else if (!neighbour.borders.includes(country.code)) {
        report(
          `world.${country.code}`,
          "world",
          `Border with ${other} is recorded from one side only.`,
        );
      }
    }
  }
  for (const city of raw.world.cities) {
    if (!byCode.has(city.country)) {
      report(`world.cities.${city.id}`, "world", "The city has no country.");
    }
  }
}

function checkRecords(catalog: Catalog, report: Report): void {
  const schema = fullSchema();
  for (const typeName of catalog.store.types()) {
    const type = schema.getType(typeName);
    if (!type || !isObjectType(type)) {
      report(
        `records.${typeName}`,
        "references",
        "No such type in the schema.",
      );
      continue;
    }
    const fields = type.getFields();
    for (const record of catalog.store.all(typeName)) {
      const at = `records.${typeName}:${record.id}`;
      for (const [name, value] of Object.entries(record)) {
        if (name === "type" || name === "id") continue;
        if (name === "classified") {
          for (const field of Object.keys(value as object)) {
            if (!fields[field]) {
              report(at, "references", `Classifies unknown field ${field}.`);
            }
          }
          continue;
        }
        const field = fields[name];
        if (!field) {
          report(at, "references", `The schema has no field ${name}.`);
          continue;
        }
        const shape = fieldShape(field.type);
        if (shape.target === null) continue;
        const ids = Array.isArray(value) ? value : value == null ? [] : [value];
        for (const id of ids) {
          if (!catalog.store.get(shape.target, id as string)) {
            report(
              at,
              "references",
              `${name} refers to ${shape.target}:${String(id)}, which does not exist.`,
            );
          }
        }
      }
      for (const field of Object.values(fields)) {
        // A list a record does not mention is an empty list.
        const required =
          String(field.type).endsWith("!") && !fieldShape(field.type).list;
        const value = field.name === "id" ? record.id : record[field.name];
        if (required && (value === undefined || value === null)) {
          report(at, "references", `Required field ${field.name} is missing.`);
        }
      }
    }
  }
}

function patternTerms(pattern: FactPattern): string[] {
  return [pattern.entity, pattern.equals, pattern.includes, pattern.excludes]
    .filter((v): v is string => typeof v === "string")
    .filter((v) => /^[A-Za-z]+:[\w-]+$/.test(v));
}

function checkReferences(
  mission: Mission,
  catalog: Catalog,
  report: Report,
): void {
  const { store } = catalog;
  if (!catalog.campaigns.some((c) => c.id === mission.campaign)) {
    report(`${mission.id}.campaign`, "references", "No such campaign.");
  }
  if (!mission.stages[mission.startingStage]) {
    report(`${mission.id}.startingStage`, "references", "No such stage.");
  }
  for (const [id, stage] of Object.entries(mission.stages)) {
    const at = `${mission.id}.stages.${id}`;
    if (!store.get("Country", stage.location)) {
      report(`${at}.location`, "references", "No such country.");
    }
    if (stage.next !== undefined && !mission.stages[stage.next]) {
      report(`${at}.next`, "references", `No such stage: ${stage.next}.`);
    }
    const types = bindingTypes(stage);
    for (const [name, value] of solutionBindings(stage)) {
      const type = types[name];
      if (!type) {
        report(
          `${at}.solution.${name}`,
          "references",
          "No fact uses this binding.",
        );
      } else if (!store.get(type, value)) {
        report(`${at}.solution.${name}`, "references", `No ${type} ${value}.`);
      }
    }
    const patterns = [
      ...stage.claims.flatMap((c) => c.evidenceSets.flatMap((s) => s.facts)),
      ...Object.values(stage.leadOutcomes ?? {}).flatMap(
        (o) => o.refutation?.facts ?? [],
      ),
    ];
    for (const pattern of patterns) {
      for (const term of patternTerms(pattern)) {
        if (!store.getRef(term)) {
          report(`${at}.claims`, "references", `No record ${term}.`);
        }
      }
    }
    const leadType = types[leadBinding(stage)];
    for (const [lead, outcome] of Object.entries(stage.leadOutcomes ?? {})) {
      if (leadType && !store.get(leadType, lead)) {
        report(
          `${at}.leadOutcomes.${lead}`,
          "references",
          `No ${leadType} ${lead}.`,
        );
      }
      if (outcome.location && !store.get("Country", outcome.location)) {
        report(
          `${at}.leadOutcomes.${lead}.location`,
          "references",
          "No such country.",
        );
      }
      const claim = outcome.refutation?.claim;
      if (claim !== undefined && !stage.claims.some((c) => c.id === claim)) {
        report(
          `${at}.leadOutcomes.${lead}`,
          "references",
          `No claim ${claim}.`,
        );
      }
      if (outcome.refutation && !outcome.ruledOut) {
        report(
          `${at}.leadOutcomes.${lead}`,
          "structure",
          "A lead that can be ruled out needs a dispatch that says so.",
        );
      }
    }
  }
}

function checkReachability(mission: Mission, report: Report): void {
  const seen = new Set<string>();
  let id: string | undefined = mission.startingStage;
  let terminal = false;
  while (id !== undefined && !seen.has(id)) {
    seen.add(id);
    const stage: Stage | undefined = mission.stages[id];
    if (!stage) break;
    if (stage.next === undefined) {
      terminal = stage.solution.type === "deduction";
      if (!terminal) {
        report(
          `${mission.id}.stages.${id}`,
          "reachability",
          "A destination stage must lead to another stage.",
        );
      }
    }
    id = stage.next;
  }
  for (const stageId of Object.keys(mission.stages)) {
    if (!seen.has(stageId)) {
      report(
        `${mission.id}.stages.${stageId}`,
        "reachability",
        "The stage cannot be reached.",
      );
    }
  }
  if (!terminal) {
    report(mission.id, "reachability", "The mission has no terminal outcome.");
  }
}

function fieldsExist(
  patterns: readonly FactPattern[],
  clearance: number,
): string | null {
  for (const pattern of patterns) {
    const type = parseRef(pattern.entity).type;
    const level = fieldClearance(type, pattern.field);
    if (level === null) return `${type}.${pattern.field} does not exist`;
    if (level > clearance) {
      return `${type}.${pattern.field} needs clearance ${String(level)}`;
    }
  }
  return null;
}

function contains(
  outer: readonly FactPattern[],
  inner: readonly FactPattern[],
): boolean {
  const keys = new Set(outer.map((p) => JSON.stringify(p)));
  return inner.every((p) => keys.has(JSON.stringify(p)));
}

function checkStageEvidence(
  mission: Mission,
  stageId: string,
  catalog: Catalog,
  truth: readonly Fact[],
  report: Report,
): void {
  const stage = mission.stages[stageId] as Stage;
  const at = `${mission.id}.stages.${stageId}`;
  const schema = fullSchema();
  const types = bindingTypes(stage);
  const solution = Object.fromEntries(solutionBindings(stage));
  const lead = leadBinding(stage);
  const byKey = new Map(truth.map((f) => [f.key, f]));

  // Clues: exactly one assignment, and it is the authored solution.
  let constraints: Constraint[];
  let solutions: Bindings[];
  try {
    constraints = constraintsOf(stage);
    solutions = solve(catalog.store, schema, types, constraints);
  } catch (error) {
    report(`${at}.clues`, "clues", (error as Error).message);
    return;
  }
  if (solutions.length !== 1) {
    report(
      `${at}.clues`,
      "clues",
      `The clues admit ${solutions.length === 0 ? "no" : String(solutions.length) + (solutions.length >= 20 ? " or more" : "")} solutions; they must admit exactly one.`,
    );
  } else {
    for (const [name, value] of Object.entries(solutions[0] as Bindings)) {
      if (name in solution && solution[name] !== value) {
        report(
          `${at}.solution.${name}`,
          "clues",
          `The clues identify ${value}, but the solution names ${String(solution[name])}.`,
        );
      }
    }
  }
  // Each clue on its own must leave a wrong lead standing.
  const refutations = Object.values(stage.leadOutcomes ?? {}).filter(
    (o) => o.refutation,
  ).length;
  if (stage.clues.length > 1 && refutations >= 2) {
    stage.clues.forEach((_, index) => {
      const own = constraints.filter((c) => c.clue === index);
      const usesLead = own.some(
        (c) => c.left.binding === lead || c.right.binding === lead,
      );
      const fixesLead = own.some(
        (c) => c.left.binding === lead && c.left.path.length === 0,
      );
      if (!usesLead || fixesLead) return;
      const leads = new Set(
        solve(catalog.store, schema, types, own, 200).map((b) => b[lead]),
      );
      if (leads.size < 2) {
        report(
          `${at}.clues.${String(index)}`,
          "clues",
          "The clue alone identifies the lead, so no wrong lead is plausible.",
        );
      }
    });
  }
  // A part of the solution that no clue binds must follow from the evidence.
  const constrained = new Set(
    constraints.flatMap((c) => [c.left.binding, c.right.binding]),
  );
  for (const [name] of solutionBindings(stage)) {
    if (constrained.has(name)) continue;
    const type = types[name];
    if (!type) continue;
    for (const record of catalog.store.all(type)) {
      if (record.id === solution[name]) continue;
      const alternative = { ...solution, [name]: record.id };
      const holds = stage.claims.every((claim) =>
        claim.evidenceSets.some((set) =>
          matchSet(set.facts, truth, alternative),
        ),
      );
      if (holds) {
        report(
          `${at}.solution.${name}`,
          "clues",
          `The evidence would equally support ${record.id}.`,
        );
      }
    }
  }

  // Claims: two routes each, neither inside the other, all true and reachable.
  for (const claim of stage.claims) {
    const claimAt = `${at}.claims.${claim.id}`;
    if (claim.evidenceSets.length < 2) {
      report(claimAt, "evidence", "A claim needs at least two evidence sets.");
    }
    claim.evidenceSets.forEach((set, i) => {
      const setAt = `${claimAt}.evidenceSets.${String(i)}`;
      claim.evidenceSets.forEach((other, j) => {
        if (i !== j && contains(set.facts, other.facts)) {
          report(setAt, "evidence", `The set contains set ${String(j)}.`);
        }
      });
      const missing = fieldsExist(set.facts, mission.clearance);
      if (missing) {
        report(setAt, "evidence", `Not retrievable: ${missing}.`);
        return;
      }
      const bound = matchSet(set.facts, truth, solution);
      if (!bound) {
        report(
          setAt,
          "evidence",
          "The data does not bear the set out for the solution.",
        );
        return;
      }
      // The matcher takes the complete set, with extras, and nothing less.
      const minimal = instantiate(set.facts, bound)
        .map((key) => byKey.get(key))
        .filter((f): f is Fact => f !== undefined);
      const extra = truth.find((f) => !minimal.includes(f));
      if (
        !matchSet(set.facts, extra ? [...minimal, extra] : minimal, solution)
      ) {
        report(
          setAt,
          "evidence",
          "A complete set with an extra citation is rejected.",
        );
      }
      const unique = [...new Set(minimal)];
      for (const dropped of unique) {
        const rest = unique.filter((f) => f !== dropped);
        const stillSupported = claim.evidenceSets.some((s) =>
          matchSet(s.facts, rest, solution),
        );
        if (stillSupported) {
          report(
            setAt,
            "evidence",
            `The set is accepted without ${dropped.key}.`,
          );
        }
      }
      for (const other of Object.keys(stage.leadOutcomes ?? {})) {
        if (other === solution[lead]) continue;
        const wrong = { ...solution, [lead]: other };
        // A fact both leads share, such as a membership list, may serve both.
        const trueOfOther = claim.evidenceSets.some((s) =>
          matchSet(s.facts, truth, { [lead]: other }),
        );
        if (
          !trueOfOther &&
          claim.evidenceSets.some((s) => matchSet(s.facts, unique, wrong))
        ) {
          report(
            setAt,
            "evidence",
            `Facts about the solution support lead ${other}.`,
          );
        }
      }
    });
  }

  // Lead outcomes: refutations hold, field checks have somewhere to stand.
  for (const [leadId, outcome] of Object.entries(stage.leadOutcomes ?? {})) {
    const leadAt = `${at}.leadOutcomes.${leadId}`;
    const only: Bindings = { [lead]: leadId };
    const refutation = outcome.refutation;
    if (refutation) {
      if (leadId === solution[lead]) {
        report(
          leadAt,
          "refutation",
          "The solution's own lead cannot be refuted.",
        );
      }
      const missing = fieldsExist(refutation.facts, mission.clearance);
      if (missing) report(leadAt, "refutation", `Not retrievable: ${missing}.`);
      if (!matchSet(refutation.facts, truth, only)) {
        report(
          leadAt,
          "refutation",
          "The data does not bear the refutation out.",
        );
      }
      const claim = stage.claims.find((c) => c.id === refutation.claim);
      if (claim?.evidenceSets.some((s) => matchSet(s.facts, truth, only))) {
        report(
          leadAt,
          "refutation",
          `Claim ${refutation.claim} is true of this lead, so it is not refuted.`,
        );
      }
    }
    if (outcome.fieldCheck !== undefined) {
      const supported = stage.claims.filter((c) =>
        c.evidenceSets.some((s) => matchSet(s.facts, truth, only)),
      ).length;
      const wrong = leadId !== solution[lead];
      if (supported < 1 || stage.claims.length < 2) {
        report(
          leadAt,
          "field-check",
          "No claim can be supported for this lead.",
        );
      } else if (wrong && supported === stage.claims.length) {
        report(leadAt, "field-check", "Every claim holds for a wrong lead.");
      }
    }
  }
}

interface Control extends CitedRow {
  /** The fact of the row the control sits on. */
  own: string;
  /** Every fact on the way down to that row, whether or not it is carried. */
  along: string[];
}

/**
 * The Cite controls the interface offers: one on each row of each response
 * received so far, as they stand in one stage with one lead's draft open.
 */
function citeControls(
  state: MissionState,
  stage: Stage,
  openLead: string,
): Control[] {
  return state.transmissions.flatMap((record) =>
    record.facts.flatMap(({ key, path }) => {
      const cited = citationAt(record, path, stage, state.ledger, openLead);
      return cited
        ? [{ ...cited, own: key, along: factsAlong(record, path) }]
        : [];
    }),
  );
}

/**
 * Cites, for one lead, the first evidence set of each claim that the ledger
 * meets. Each fact is cited through a Cite control, as a player cites it.
 */
function citeSupported(
  env: Env,
  state: MissionState,
  stage: Stage,
  leadId: string,
  claimIds: readonly string[],
  named: Bindings,
): MissionState {
  const lead = leadBinding(stage);
  const facts = Object.values(state.ledger).map((e) => e.fact);
  const controls = citeControls(state, stage, String(leadId));
  let next = state;
  for (const claim of stage.claims) {
    if (!claimIds.includes(claim.id)) continue;
    for (const set of claim.evidenceSets) {
      const bound = matchSet(set.facts, facts, { ...named, [lead]: leadId });
      if (!bound) continue;
      for (const key of new Set(instantiate(set.facts, bound))) {
        const control = controls.find(
          (c) => c.own === key && (c.leadId === null || c.leadId === leadId),
        );
        if (!control) continue;
        next = act(env, next, {
          type: "cite",
          leadId,
          label: claim.id,
          factKeys: control.factKeys,
        }).state;
      }
      break;
    }
  }
  return next;
}

/**
 * Citations (SDD 5.5): each evidence set the reference solution retrieves can
 * be put together from Cite controls, in the draft of the lead it is about.
 */
function checkCitations(
  at: string,
  stage: Stage,
  state: MissionState,
  report: Report,
): void {
  const solution = Object.fromEntries(solutionBindings(stage));
  const leadId = solution[leadBinding(stage)];
  const facts = Object.values(state.ledger).map((e) => e.fact);
  const controls = citeControls(state, stage, String(leadId));
  for (const claim of stage.claims) {
    claim.evidenceSets.forEach((set, index) => {
      const bound = matchSet(set.facts, facts, solution);
      if (!bound) return;
      const setAt = `${at}.claims.${claim.id}.evidenceSets.${String(index)}`;
      const needed = new Set(instantiate(set.facts, bound));
      for (const key of needed) {
        const on = controls.filter((c) => c.own === key);
        if (!on.some((c) => c.leadId === null || c.leadId === leadId)) {
          report(
            setAt,
            "citations",
            `No Cite control puts ${key} in the draft for ${String(leadId)}.`,
          );
        }
        for (const control of on) {
          const dropped = control.along.find(
            (k) => needed.has(k) && !control.factKeys.includes(k),
          );
          if (dropped) {
            report(
              setAt,
              "citations",
              `Citing ${key} leaves out ${dropped}, which is on the way to it.`,
            );
            break;
          }
        }
      }
    });
  }
}

/** Plays the mission from its reference solution, as SDD section 10 asks. */
function checkSolvable(
  mission: Mission,
  catalog: Catalog,
  report: Report,
): void {
  const env: Env = {
    mission,
    store: catalog.store,
    world: catalog.world,
    clearance: mission.clearance,
  };
  let state = act(env, startMission(env), { type: "begin" }).state;
  const budget = computeBudget(mission, catalog.world);
  const truth = allFacts(catalog.store, fullSchema());
  let guard = 0;

  while (state.status !== "complete" && guard++ < 20) {
    const stageId = state.stageId;
    const stage = mission.stages[stageId] as Stage;
    const at = `${mission.id}.stages.${stageId}`;
    const solution = Object.fromEntries(solutionBindings(stage));
    const lead = leadBinding(stage);
    const leadId = solution[lead] as string;

    // The starter query, unchanged, must not already make the case.
    const starter = stage.scaffold.starterQuery;
    if (starter !== undefined && !stage.scaffold.carryOver) {
      const sent = transmit(catalog.store, {
        operation: starter,
        clearance: mission.clearance,
      });
      const facts = sent.facts.map((f) => f.fact);
      const made = stage.claims.every((claim) =>
        claim.evidenceSets.some((s) => matchSet(s.facts, facts, solution)),
      );
      if (made) {
        report(
          `${at}.scaffold`,
          "starter",
          "The starter query already yields the evidence.",
        );
      }
    }

    for (const { operation, variables } of referenceOperations(stage)) {
      state = act(env, state, {
        type: "edit",
        editor: operation,
        variables: variables ? JSON.stringify(variables) : "",
      }).state;
      const before = state.transmissions.length;
      const sent = act(env, state, { type: "transmit" });
      state = sent.state;
      const record = state.transmissions[before];
      if (!record) {
        const why =
          state.rejected?.errors[0]?.message ?? "it was not transmitted";
        report(
          `${at}.referenceSolution`,
          "solvability",
          `The reference solution fails: ${why}`,
        );
        return;
      }
      if (record.errors.length > 0) {
        report(
          `${at}.referenceSolution`,
          "solvability",
          `The reference solution returns an error: ${String(record.errors[0]?.message)}`,
        );
      }
    }

    checkCitations(at, stage, state, report);

    // Field checks: reachable, charged as quoted, and the stage stays open.
    for (const [checked, outcome] of Object.entries(stage.leadOutcomes ?? {})) {
      if (outcome.fieldCheck === undefined) continue;
      const only: Bindings = { [lead]: checked };
      const supportable = stage.claims.find((claim) =>
        claim.evidenceSets.some((s) =>
          matchSet(
            s.facts,
            Object.values(state.ledger).map((e) => e.fact),
            only,
          ),
        ),
      );
      const leadAt = `${at}.leadOutcomes.${checked}`;
      if (!supportable) {
        report(
          leadAt,
          "field-check",
          "The reference solution retrieves nothing that supports a claim for this lead.",
        );
        continue;
      }
      // Name the draft's other records as the data has them for this lead.
      const set = supportable.evidenceSets.find((s) =>
        matchSet(s.facts, truth, only),
      );
      const bound = (set && matchSet(set.facts, truth, only)) ?? only;
      let trial = state;
      for (const [name] of solutionBindings(stage)) {
        const value = bound[name];
        if (name !== lead && value !== undefined) {
          trial = act(env, trial, {
            type: "name",
            leadId: checked,
            binding: name,
            value,
          }).state;
        }
      }
      trial = citeSupported(
        env,
        trial,
        stage,
        checked,
        [supportable.id],
        bound,
      );
      const quoted = fieldCheckCost(env, trial, checked);
      const result = act(env, trial, { type: "field-check", leadId: checked });
      const draft = result.state.stages[stageId]?.drafts[checked];
      if (result.notice?.kind !== "dispatch") {
        report(
          leadAt,
          "field-check",
          "The field check cannot be reached with one supported and one unverified claim.",
        );
      } else if (
        trial.hoursLeft - result.state.hoursLeft !== quoted ||
        result.state.stageId !== stageId ||
        result.state.status === "complete" ||
        draft?.ruledOut
      ) {
        report(
          leadAt,
          "field-check",
          "The field check must charge the quoted cost and leave the stage and lead open.",
        );
      }
    }

    for (const [name, value] of solutionBindings(stage)) {
      if (name !== lead) {
        state = act(env, state, {
          type: "name",
          leadId,
          binding: name,
          value,
        }).state;
      }
    }
    state = citeSupported(
      env,
      state,
      stage,
      leadId,
      stage.claims.map((c) => c.id),
      solution,
    );
    const draft = state.stages[stageId]?.drafts[leadId];
    const review = draft && reviewDraft(stage, draft, state.ledger);
    const open = review?.claims.filter((c) => c.status !== "supported") ?? [];
    if (!review || open.length > 0) {
      report(
        `${at}.referenceSolution`,
        "solvability",
        `The reference solution does not yield evidence for: ${open.map((c) => c.id).join(", ") || "any claim"}.`,
      );
      return;
    }
    const moved = act(env, state, { type: "proceed", leadId });
    if (moved.notice?.kind !== "dispatch") {
      report(
        at,
        "solvability",
        "The stage cannot be completed from its reference solution.",
      );
      return;
    }
    state = moved.state;
  }
  if (state.status !== "complete") {
    report(mission.id, "solvability", "The mission cannot be completed.");
    return;
  }
  const spent = state.budget - state.hoursLeft;
  if (!mission.clock) {
    if (state.budget !== 0 || spent !== 0) {
      report(
        mission.id,
        "solvability",
        "A mission with no clock spends no time.",
      );
    }
  } else if (
    state.budget !== budget.total ||
    spent !== budget.travel + budget.transmissions
  ) {
    report(
      mission.id,
      "solvability",
      "The budget does not follow the reference solution.",
    );
  }
  if (state.outcome?.late) {
    report(
      mission.id,
      "solvability",
      "The reference solution misses the deadline.",
    );
  }
}

function checkCurriculum(
  mission: Mission,
  catalog: Catalog,
  report: Report,
): void {
  const taughtAt = new Map(catalog.concepts.map((c) => [c.id, c.clearance]));
  for (const concept of [...mission.requires, ...mission.practises]) {
    const level = taughtAt.get(concept);
    if (level === undefined || level > mission.clearance) {
      report(
        `${mission.id}.requires`,
        "curriculum",
        `${concept} is taught above clearance ${String(mission.clearance)}.`,
      );
    }
  }
  const used = new Set<Concept>();
  for (const stage of Object.values(mission.stages)) {
    for (const { operation } of referenceOperations(stage)) {
      try {
        conceptsUsed(operation).forEach((c) => used.add(c));
      } catch {
        // Reported by the solvability check.
      }
    }
  }
  if (mission.teaches) {
    if (taughtAt.get(mission.teaches) !== mission.clearance) {
      report(
        `${mission.id}.teaches`,
        "curriculum",
        "The concept belongs to another clearance level.",
      );
    }
    if (!used.has(mission.teaches)) {
      report(
        `${mission.id}.teaches`,
        "curriculum",
        `The reference solution does not use ${mission.teaches}.`,
      );
    }
  }
  const declared = new Set([
    mission.teaches,
    ...mission.practises,
    ...mission.requires,
  ]);
  for (const concept of ["aliases", "fragments", "variables"] as const) {
    if (used.has(concept) && !declared.has(concept)) {
      report(
        `${mission.id}.requires`,
        "curriculum",
        `The reference solution uses ${concept}, which the mission does not declare.`,
      );
    }
  }
  for (const concept of mission.practises) {
    if (!used.has(concept)) {
      report(
        `${mission.id}.practises`,
        "curriculum",
        `The reference solution does not practise ${concept}.`,
      );
    }
  }
}

/** A mission's stages in the order a player meets them. */
function stageChain(mission: Mission): [string, Stage][] {
  const chain: [string, Stage][] = [];
  let id: string | undefined = mission.startingStage;
  while (id && !chain.some(([seen]) => seen === id)) {
    const stage: Stage | undefined = mission.stages[id];
    if (!stage) break;
    chain.push([id, stage]);
    id = stage.next;
  }
  return chain;
}

/** The casework mechanics a stage uses, read from what it authors. */
export function mechanicsUsed(mission: Mission, stage: Stage): Mechanic[] {
  const outcomes = Object.values(stage.leadOutcomes ?? {});
  const used: Mechanic[] = ["citing"];
  if (stage.solution.type === "destination") used.push("travel-order");
  else if (solutionBindings(stage).length > 1) used.push("deduction");
  if (mission.clock) used.push("clock");
  if (outcomes.some((o) => o.refutation)) used.push("ruling-out");
  if (outcomes.some((o) => o.fieldCheck !== undefined)) {
    used.push("field-check");
  }
  return used;
}

/** Pacing (SDD 3.15): a mechanic is introduced once, before it is used. */
function checkPacing(catalog: Catalog, report: Report): void {
  const introduced = new Set<Mechanic>();
  const reported = new Set<Mechanic>();
  catalog.missions.forEach((mission, index) => {
    let here = 0;
    for (const [id, stage] of stageChain(mission)) {
      const at = `${mission.id}.stages.${id}`;
      const used = mechanicsUsed(mission, stage);
      const declared = stage.introduces;
      if (declared) {
        here++;
        if (!used.includes(declared)) {
          report(
            `${at}.introduces`,
            "pacing",
            `The stage introduces ${declared} and does not use it.`,
          );
        }
        if (introduced.has(declared)) {
          report(
            `${at}.introduces`,
            "pacing",
            `An earlier stage already introduces ${declared}.`,
          );
        }
        introduced.add(declared);
      }
      for (const mechanic of used) {
        if (!introduced.has(mechanic) && !reported.has(mechanic)) {
          report(
            at,
            "pacing",
            `The stage uses ${mechanic}, which no stage up to this one introduces.`,
          );
          // Reported once, where the mechanic first appears.
          reported.add(mechanic);
        }
      }
    }
    if (index > 0 && here > 1) {
      report(
        mission.id,
        "pacing",
        "A mission after the first introduces at most one mechanic.",
      );
    }
  });
}

/**
 * A coda is one untimed stage that ends its campaign (SDD 5.4). It teaches
 * nothing, introduces no mechanic, and comes after every case of the
 * campaign, at the clearance of the last one.
 */
function checkCodas(missions: readonly Mission[], report: Report): void {
  for (const mission of missions) {
    if (mission.kind !== "coda") continue;
    const stages = Object.values(mission.stages);
    if (stages.length !== 1) {
      report(mission.id, "course", "A coda has exactly one stage.");
    }
    if (mission.clock) {
      report(mission.id, "course", "A coda has no clock.");
    }
    if (mission.teaches !== null) {
      report(mission.id, "course", "A coda teaches nothing new.");
    }
    if (stages.some((stage) => stage.introduces)) {
      report(mission.id, "course", "A coda introduces no mechanic.");
    }
    const campaign = missions.filter((m) => m.campaign === mission.campaign);
    if (campaign.filter((m) => m.kind === "coda").length > 1) {
      report(mission.id, "course", "A campaign has at most one coda.");
    }
    const last = lastCase(mission.campaign, missions);
    if (!last) {
      report(mission.id, "course", "A coda follows at least one case.");
    } else if (
      campaign.at(-1) !== mission ||
      last.clearance !== mission.clearance
    ) {
      report(
        mission.id,
        "course",
        "A coda comes last in its campaign, at the clearance of its last case.",
      );
    }
  }
}

function checkCourseShape(catalog: Catalog, report: Report): void {
  const { missions } = catalog;
  const ids = new Set<string>();
  for (const mission of missions) {
    if (ids.has(mission.id))
      report(mission.id, "course", "Duplicate mission id.");
    ids.add(mission.id);
    if (mission.kind === "assessment") {
      if (mission.teaches !== null) {
        report(mission.id, "course", "An assessment teaches nothing new.");
      }
      const first = mission.stages[mission.startingStage];
      if (
        first &&
        (first.scaffold.level !== "none" || first.scaffold.starterQuery)
      ) {
        report(
          mission.id,
          "course",
          "An assessment starts with a blank editor.",
        );
      }
    } else if (mission.kind === "teaching" && mission.teaches === null) {
      report(mission.id, "course", "A teaching mission teaches one concept.");
    }
  }
  checkCodas(missions, report);
  const top = Math.max(0, ...missions.map((m) => m.clearance));
  for (let level = 1; level <= top; level++) {
    // A coda follows its level and is not one of its cases.
    const here = missions.filter(
      (m) => m.clearance === level && m.kind !== "coda",
    );
    const teaching = here.filter((m) => m.kind === "teaching");
    const assessments = here.filter((m) => m.kind === "assessment");
    if (teaching.length !== 1) {
      report(
        `clearance ${String(level)}`,
        "course",
        "A level has exactly one teaching mission.",
      );
    }
    if (
      assessments.length !== 1 ||
      here[here.length - 1]?.kind !== "assessment"
    ) {
      report(
        `clearance ${String(level)}`,
        "course",
        "A level ends with one assessment mission.",
      );
    }
  }
  missions.forEach((mission, index) => {
    const concept = mission.teaches;
    if (!concept) return;
    const later = missions.slice(index + 1);
    if (!later.some((m) => m.practises.includes(concept))) {
      report(mission.id, "course", `No later mission practises ${concept}.`);
    }
    if (missions.some((m) => m !== mission && m.teaches === concept)) {
      report(mission.id, "course", `${concept} is taught twice.`);
    }
  });
  for (const card of catalog.concepts) {
    const teacher = missions.find((m) => m.teaches === card.id);
    if (missions.length > 0 && card.clearance <= top && !teacher) {
      report(
        `concepts.${card.id}`,
        "course",
        "No mission teaches the concept.",
      );
    }
    if (check(card.example, schemaFor(card.clearance)).length > 0) {
      report(
        `concepts.${card.id}`,
        "course",
        "The card's example is not a valid query at its clearance.",
      );
    }
  }
  // A player who follows the course can always be promoted.
  let events: Parameters<typeof deriveStanding>[1] = [];
  for (const mission of missions) {
    const standing = deriveStanding(missions, events);
    // A coda follows its campaign's last case, which promotes past it.
    if (
      mission.kind !== "coda" &&
      clearanceInForce(mission, standing) !== mission.clearance
    ) {
      report(
        mission.id,
        "course",
        "The course order does not reach this mission's clearance.",
      );
    }
    events = [
      ...events,
      {
        type: "completed",
        missionId: mission.id,
        mode: "independent",
        late: false,
      },
    ];
  }
}

function checkHintsAndText(
  mission: Mission,
  catalog: Catalog,
  report: Report,
): void {
  const schema = schemaFor(mission.clearance);
  for (const [id, stage] of Object.entries(mission.stages)) {
    const at = `${mission.id}.stages.${id}`;
    const pointers = [...stage.hints.schema.matchAll(/\b([A-Z]\w+)\.(\w+)\b/g)];
    if (pointers.length === 0) {
      report(
        `${at}.hints.schema`,
        "hints",
        "The schema pointer names no Type.field.",
      );
    }
    for (const [, typeName, fieldName] of pointers) {
      const type = schema.getType(typeName as string);
      if (
        !type ||
        !isObjectType(type) ||
        !type.getFields()[fieldName as string]
      ) {
        report(
          `${at}.hints.schema`,
          "hints",
          `${String(typeName)}.${String(fieldName)} does not exist at clearance ${String(mission.clearance)}.`,
        );
      }
    }
    // Quoted names in the queries a player is shown must exist.
    const shown = [stage.scaffold.starterQuery ?? "", stage.hints.skeleton];
    for (const code of shown) {
      for (const [, quoted] of code
        .replace(/"[^"]+"\s*:/g, "")
        .matchAll(/"([^"]+)"/g)) {
        const known = catalog.store
          .types()
          .some((type) =>
            catalog.store
              .all(type)
              .some((r: RawRecord) =>
                [r.id, r.name, r.codename].includes(quoted as string),
              ),
          );
        if (!known) {
          report(
            `${at}.scaffold`,
            "text",
            `"${String(quoted)}" names nothing in the data.`,
          );
        }
      }
    }
  }
  const ids = new Set(
    catalog.store.types().flatMap((t) => catalog.store.all(t).map((r) => r.id)),
  );
  for (const { path, text } of proseOf(mission)) {
    const at = `${mission.id}.${path}`;
    // Identifiers and codenames quoted in prose must exist in the data.
    for (const [token] of text.matchAll(
      /\b[A-Z]{3}-\d{3,4}\b|\b[A-Z]{2,}(?:_[A-Z]+)+\b|\b[A-Z]{6,}\b/g,
    )) {
      if (!ids.has(token)) {
        report(at, "text", `${token} does not exist in the data.`);
      }
    }
  }
  for (const passage of proseOf(mission)) {
    checkPassage(
      { ...passage, path: `${mission.id}.${passage.path}` },
      mission.clearance,
      catalog,
      report,
    );
  }
}

/**
 * The wording rules of SDD 5.7 that a pattern can decide, and the terms and
 * glossary links a passage may use at the clearance it is read at.
 */
function checkPassage(
  { path, text, markdown }: Passage,
  clearance: number,
  catalog: Catalog,
  report: Report,
): void {
  for (const entry of catalog.glossary) {
    if (entry.clearance <= clearance) continue;
    for (const term of [entry.term, ...(entry.matches ?? [])]) {
      if (mentions(text, term)) {
        report(
          path,
          "terms",
          `"${term}" is introduced at clearance ${String(entry.clearance)}.`,
        );
      }
    }
  }
  for (const message of styleIssues(text)) report(path, "style", message);
  if (!markdown) {
    const markup = MARKUP.exec(text);
    if (markup) {
      report(
        path,
        "markup",
        `${markup[0]} would be shown as typed: this field is plain text.`,
      );
    }
    return;
  }
  for (const id of glossaryLinks(text)) {
    const entry = catalog.glossary.find((e) => e.id === id);
    if (!entry) {
      report(path, "links", `There is no glossary entry "${id}".`);
    } else if (entry.clearance > clearance) {
      report(
        path,
        "links",
        `The glossary entry "${id}" opens at clearance ${String(entry.clearance)}.`,
      );
    }
  }
}

/**
 * Text outside the missions: drills, concept cards, the glossary and the
 * campaigns. Drills and campaigns are read by a player at clearance 1, and
 * a card or a definition at the clearance that reveals it.
 */
function checkReferenceText(catalog: Catalog, report: Report): void {
  const check = (
    path: string,
    text: string,
    clearance: number,
    markdown: boolean,
  ): void => {
    checkPassage({ path, text, markdown }, clearance, catalog, report);
  };
  for (const drill of catalog.drills) {
    const at = `drills.${drill.id}`;
    check(`${at}.title`, drill.title, 1, false);
    check(`${at}.task`, drill.task, 1, true);
    check(`${at}.nudge`, drill.nudge, 1, true);
    check(`${at}.payoff`, drill.payoff, 1, true);
    check(`${at}.starter`, commentsOf(drill.starter), 1, true);
  }
  for (const kata of catalog.katas) {
    const at = `katas.${kata.id}`;
    check(`${at}.title`, kata.title, kata.clearance, false);
    check(`${at}.task`, kata.task, kata.clearance, true);
    check(`${at}.nudge`, kata.nudge, kata.clearance, true);
    check(`${at}.structureNudge`, kata.structureNudge, kata.clearance, true);
    check(`${at}.payoff`, kata.payoff, kata.clearance, true);
    check(`${at}.debrief.unused`, kata.debrief.unused, kata.clearance, true);
    check(
      `${at}.debrief.placement`,
      kata.debrief.placement,
      kata.clearance,
      true,
    );
    check(`${at}.starter`, commentsOf(kata.starter), kata.clearance, true);
  }
  for (const card of catalog.concepts) {
    const at = `concepts.${card.id}`;
    check(`${at}.title`, card.title, card.clearance, false);
    check(`${at}.summary`, card.summary, card.clearance, true);
    check(`${at}.payoff`, card.payoff, card.clearance, false);
  }
  for (const entry of catalog.glossary) {
    check(
      `glossary.${entry.id}.definition`,
      entry.definition,
      entry.clearance,
      true,
    );
  }
  for (const campaign of catalog.campaigns) {
    const at = `campaigns.${campaign.id}`;
    check(`${at}.title`, campaign.title, 1, false);
    check(`${at}.summary`, campaign.summary, 1, false);
  }
}

function checkGlossary(catalog: Catalog, report: Report): void {
  for (const word of VOCABULARY) {
    const defined = catalog.glossary.some(
      (e) => e.term === word || e.matches?.includes(word),
    );
    if (!defined)
      report(`glossary.${word}`, "terms", "The term has no glossary entry.");
  }
}

/**
 * A drill is sound when its reference passes it and its starter does not.
 * Drills are played at clearance 1, before any case.
 */
function checkDrills(catalog: Catalog, report: Report): void {
  const parsed = drillsSchema.safeParse(catalog.drills);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      report(`drills.${issue.path.join(".")}`, "structure", issue.message);
    }
    return;
  }
  const seen = new Set<string>();
  for (const drill of catalog.drills) {
    const at = `drills.${drill.id}`;
    if (seen.has(drill.id)) report(at, "structure", "The id is used twice.");
    seen.add(drill.id);
    const passes = (operation: string): boolean | "refused" => {
      const sent = transmit(catalog.store, { operation, clearance: 1 });
      if (!sent.transmitted || sent.result.errors?.length) return "refused";
      return (
        matchSet(
          drill.expects,
          sent.facts.map((occurrence) => occurrence.fact),
        ) !== null
      );
    };
    const reference = passes(drill.reference);
    if (reference === "refused") {
      report(
        `${at}.reference`,
        "drill",
        "The reference does not transmit cleanly at clearance 1.",
      );
    } else if (!reference) {
      report(
        `${at}.reference`,
        "drill",
        "The reference does not return the expected facts.",
      );
    }
    if (passes(drill.starter) === true) {
      report(`${at}.starter`, "drill", "The starter already passes the drill.");
    }
  }
}

/**
 * A kata is sound when its reference passes it, structure included, and its
 * starter does not. Its clearance is the clearance of its concept's card.
 */
function checkKatas(catalog: Catalog, report: Report): void {
  const parsed = katasSchema.safeParse(catalog.katas);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      report(`katas.${issue.path.join(".")}`, "structure", issue.message);
    }
    return;
  }
  const seen = new Set<string>();
  for (const kata of catalog.katas) {
    const at = `katas.${kata.id}`;
    if (seen.has(kata.id)) report(at, "structure", "The id is used twice.");
    seen.add(kata.id);
    const card = catalog.concepts.find((c) => c.id === kata.concept);
    if (card?.clearance !== kata.clearance) {
      report(
        `${at}.clearance`,
        "kata",
        `The clearance is not that of the ${kata.concept} card.`,
      );
    }
    if (kata.concept === "fragments" && !kata.field) {
      report(`${at}.field`, "kata", "A fragments kata needs a field.");
    }
    const reference = attemptKata(
      catalog.store,
      kata,
      kata.reference,
      kata.referenceVariables ?? "",
    );
    if (
      reference.kind === "refused-variables" ||
      !reference.sent.transmitted ||
      reference.sent.result.errors?.length
    ) {
      report(
        `${at}.reference`,
        "kata",
        "The reference does not transmit cleanly at the kata's clearance.",
      );
    } else if (reference.verdict === "facts") {
      report(
        `${at}.reference`,
        "kata",
        "The reference does not return the expected facts.",
      );
    } else if (reference.verdict === "structure") {
      report(
        `${at}.reference`,
        "kata",
        "The reference does not use the kata's technique.",
      );
    }
    const starter = attemptKata(
      catalog.store,
      kata,
      kata.starter,
      kata.variables ?? "",
    );
    if (starter.kind === "sent" && starter.verdict === "passed") {
      report(`${at}.starter`, "kata", "The starter already passes the kata.");
    }
  }
  // The debrief of a case at a kata's level reads the player's technique
  // (SDD 3.10), so the case's own reference must show it.
  for (const mission of catalog.missions) {
    const kata = levelKata(mission, catalog);
    if (!kata) continue;
    const shows = Object.values(mission.stages).some((stage) =>
      referenceOperations(stage).some(({ operation }) => {
        const doc = parseRequest(operation);
        return doc !== null && showsTechnique(kata.concept, doc);
      }),
    );
    if (!shows) {
      report(
        `${mission.id}.stages`,
        "kata",
        `No reference solution uses ${kata.concept}, the technique of the level's kata.`,
      );
    }
  }
}

/** Runs every check of SDD 5.5. Each finding is an error. */
export function validateContent(raw: RawContent): Issue[] {
  const issues: Issue[] = [];
  const report: Report = (path, code, message) => {
    issues.push({ path, code, message });
  };
  const sound = checkStructure(raw, report);
  checkWorld(raw, report);
  let catalog: Catalog;
  try {
    catalog = buildCatalog({ ...raw, missions: sound });
  } catch (error) {
    report("content", "structure", (error as Error).message);
    return issues;
  }
  checkRecords(catalog, report);
  checkGlossary(catalog, report);
  const truth = allFacts(catalog.store, fullSchema());
  for (const mission of catalog.missions) {
    const before = issues.length;
    checkReferences(mission, catalog, report);
    checkReachability(mission, report);
    if (issues.length > before) continue;
    for (const stageId of Object.keys(mission.stages)) {
      checkStageEvidence(mission, stageId, catalog, truth, report);
    }
    checkCurriculum(mission, catalog, report);
    checkHintsAndText(mission, catalog, report);
    if (issues.length === before) checkSolvable(mission, catalog, report);
  }
  checkCourseShape(catalog, report);
  checkPacing(catalog, report);
  checkDrills(catalog, report);
  checkKatas(catalog, report);
  checkReferenceText(catalog, report);
  return issues;
}

export { Kind };
