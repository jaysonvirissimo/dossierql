import type { Kata } from "../content/types.ts";
import { transmit, type TransmissionResult } from "../graphql/execute.ts";
import type { Store } from "../graphql/store.ts";
import { matchSet } from "./match.ts";
import { parseVariables } from "./mission.ts";
import { hasStructure, parseRequest } from "./technique.ts";

/**
 * How one transmission did on a kata. `facts` means the response lacked the
 * expected facts; `structure` means it held them and the request did not use
 * the kata's technique.
 */
export type KataVerdict = "passed" | "facts" | "structure";

export type KataAttempt =
  | { kind: "refused-variables" }
  | { kind: "sent"; sent: TransmissionResult; verdict: KataVerdict };

/** Sends a request on a kata and judges it (SDD 3.11). */
export function attemptKata(
  store: Store,
  kata: Kata,
  operation: string,
  variablesText: string,
): KataAttempt {
  const variables = parseVariables(variablesText);
  if (!variables.ok) return { kind: "refused-variables" };
  const sent = transmit(store, {
    operation,
    variables: variables.value,
    clearance: kata.clearance,
  });
  const facts =
    sent.transmitted &&
    matchSet(
      kata.expects,
      sent.facts.map((occurrence) => occurrence.fact),
    ) !== null;
  if (!facts) return { kind: "sent", sent, verdict: "facts" };
  const doc = parseRequest(operation);
  const shaped = doc !== null && hasStructure(kata.concept, doc, kata.field);
  return { kind: "sent", sent, verdict: shaped ? "passed" : "structure" };
}
