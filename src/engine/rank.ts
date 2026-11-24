/**
 * The title that goes with each clearance (SDD 3.8). A title is read from
 * the clearance and never stored (SDD 7.4).
 */
export const RANK_TITLES = [
  "Probationary Clerk",
  "Junior Clerk",
  "Clerk",
  "Senior Clerk",
  "Assistant Analyst",
  "Analyst",
  "Senior Analyst",
  "Case Officer",
  "Senior Case Officer",
  "Principal Officer",
  "Deputy Head of Section",
  "Head of Section",
  "Controller",
] as const;

export type RankTitle = (typeof RANK_TITLES)[number];

/** The title held at a clearance, from 1 to the last row of the table. */
export function rankTitle(clearance: number): RankTitle {
  const index = Math.min(
    Math.max(Math.trunc(clearance), 1),
    RANK_TITLES.length,
  );
  return RANK_TITLES[index - 1] as RankTitle;
}
