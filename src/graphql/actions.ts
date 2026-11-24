import type { RawRecord } from "./store.ts";

/** The application form for a search warrant, as the archive reads it. */
export interface SearchApplication {
  premises: string;
  statement?: string | null;
  urgency: "ROUTINE" | "URGENT";
}

/** The application form for a warrant, as the archive reads it. */
export interface WarrantApplication {
  subject: { operative?: string | null; company?: string | null };
  statement?: string | null;
}

/**
 * The paperwork a mutation files (SDD 4.2). The archive's resolvers do not
 * change the game themselves: each mutation field calls one of these, and
 * the game engine decides what happens and returns the receipt. A method
 * throws a GraphQLError for a form the archive cannot take at all.
 */
export interface Actions {
  fileExpenseClaim(args: { journey: string; amount: number }): RawRecord;
  fileTravelOrder(args: { following: string; to: string }): RawRecord;
  requestSearchWarrant(args: { input: SearchApplication }): RawRecord;
  requestWarrant(args: { input: WarrantApplication }): RawRecord;
}

export type ActionName = keyof Actions;

const NAMES: ReadonlySet<string> = new Set<ActionName>([
  "fileExpenseClaim",
  "fileTravelOrder",
  "requestSearchWarrant",
  "requestWarrant",
]);

export function isActionName(name: string): name is ActionName {
  return NAMES.has(name);
}
