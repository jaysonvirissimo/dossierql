import { z } from "zod";
import { CONCEPTS, MECHANICS } from "./types.ts";

/** Strict shapes for authored content. Unknown keys are errors. */

const concept = z.enum(CONCEPTS);
const literal = z.union([z.string(), z.number(), z.boolean()]);
const text = z.string().trim().min(1);
const recordTerm = z.string().regex(/^[A-Za-z]+:\$?[\w-]+$/);

const factPattern = z
  .strictObject({
    entity: recordTerm,
    field: z.string().regex(/^\w+$/),
    equals: literal.optional(),
    includes: recordTerm.optional(),
    excludes: recordTerm.optional(),
  })
  .refine(
    (p) =>
      [p.equals, p.includes, p.excludes].filter((v) => v !== undefined)
        .length === 1,
    "A fact names exactly one of equals, includes, or excludes.",
  );

const claim = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  prompt: text,
  evidenceSets: z.array(z.strictObject({ facts: z.array(factPattern).min(1) })),
});

const stage = z.strictObject({
  location: z.string().regex(/^[A-Z]{2}$/),
  introduces: z.enum(MECHANICS).optional(),
  objective: text,
  briefing: text,
  clues: z
    .array(z.strictObject({ text, constraint: z.record(z.string(), literal) }))
    .min(1),
  scaffold: z.strictObject({
    level: z.enum(["guided", "partial", "none"]),
    starterQuery: z.string().optional(),
    starterVariables: z.string().optional(),
    carryOver: z.boolean().optional(),
  }),
  hints: z.strictObject({
    nudge: text,
    concept: text,
    schema: text,
    skeleton: text,
  }),
  solution: z
    .record(z.string(), z.string())
    .refine(
      (s) => s.type === "destination" || s.type === "deduction",
      "A solution's type is destination or deduction.",
    ),
  labels: z.record(z.string(), text).optional(),
  claims: z.array(claim).min(1),
  leadOutcomes: z
    .record(
      z.string(),
      z.strictObject({
        location: z
          .string()
          .regex(/^[A-Z]{2}$/)
          .optional(),
        refutation: z
          .strictObject({
            claim: z.string(),
            facts: z.array(factPattern).min(1),
          })
          .optional(),
        ruledOut: text.optional(),
        fieldCheck: text.optional(),
      }),
    )
    .optional(),
  resolved: text.optional(),
  referenceSolution: z.union([text, z.array(text)]),
  referenceVariables: z
    .union([
      z.record(z.string(), z.unknown()),
      z.array(z.record(z.string(), z.unknown())),
    ])
    .optional(),
  next: z.string().optional(),
});

export const missionSchema = z
  .strictObject({
    id: z.string().regex(/^[a-z][a-z0-9-]*$/),
    title: text,
    campaign: text,
    order: z.number().int().positive(),
    clearance: z.number().int().min(1).max(10),
    kind: z.enum(["teaching", "assessment"]),
    teaches: concept.nullable(),
    practises: z.array(concept),
    requires: z.array(concept),
    summary: text,
    motif: z.string().optional(),
    clock: z
      .strictObject({
        countdown: text.refine((t) => t.includes("{remaining}"), {
          message: "The countdown says where the time goes with {remaining}.",
        }),
        expired: text,
        onExpiry: z.enum(["continue", "end"]),
      })
      .optional(),
    startingStage: text,
    debrief: z.strictObject({
      onTime: text,
      afterDeadline: text.optional(),
      stampOnTime: text,
      stampLate: text.optional(),
      comparison: text,
      geography: text,
    }),
    stages: z.record(z.string(), stage),
  })
  .refine(
    (m) =>
      m.clock !== undefined ||
      (m.debrief.afterDeadline === undefined &&
        m.debrief.stampLate === undefined),
    "A mission with no clock has no deadline to finish after.",
  );

export const glossarySchema = z.array(
  z.strictObject({
    id: z.string(),
    term: text,
    definition: text,
    clearance: z.number().int().min(1),
    matches: z.array(z.string()).optional(),
  }),
);

export const conceptsSchema = z.array(
  z.strictObject({
    id: concept,
    title: text,
    clearance: z.number().int().min(1),
    summary: text,
    example: text,
    payoff: text,
  }),
);

export const drillsSchema = z.array(
  z.strictObject({
    id: z.string().regex(/^[a-z][a-z0-9-]*$/),
    title: text,
    task: text,
    starter: text,
    expects: z.array(factPattern).min(1),
    reference: text,
    nudge: text,
    payoff: text,
  }),
);

export const campaignsSchema = z.array(
  z.strictObject({ id: z.string(), title: text, summary: text }),
);

export const intelSchema = z.record(
  z.string(),
  z.record(z.string(), z.record(z.string(), z.unknown())),
);
