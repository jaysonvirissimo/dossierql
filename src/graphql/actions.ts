import type { RawRecord } from "./store.ts";

/**
 * The paperwork a mutation files (SDD 4.2). The archive's resolvers do not
 * change the game themselves: each mutation field calls one of these, and
 * the game engine decides what happens and returns the receipt. A method
 * throws a GraphQLError for a form the archive cannot take at all.
 */
export interface Actions {
  fileExpenseClaim(args: { journey: string; amount: number }): RawRecord;
  fileTravelOrder(args: { following: string; to: string }): RawRecord;
}

export type ActionName = keyof Actions;

export function isActionName(name: string): name is ActionName {
  return name === "fileExpenseClaim" || name === "fileTravelOrder";
}
