# Novice walkthrough: the training range, 2026-11-22

Scope: the six drills after Milestone 5 task 5 (lists drill moved to Kenya,
two-links drill moved to Prague, new chain-of-three-links drill). The agent
read the Orientation first, then played every drill on a fresh save at
clearance 1. It passed each drill on its first transmission.

## Findings and what was done

1. **Drill 2 repeats the Orientation example** (Lisbon → country → name), so
   the drill can be passed by copying. _Fixed:_ the Orientation example is
   now a flat query, `country(name: "Chile") { name capital }`, so a player
   first opens a record in drill 2. The example has the same shape as drill
   1, but drill 1 tells the player which field to add, so nothing is lost.
2. **Drill 3 gives no way to tell a list field from a record field.**
   _Fixed:_ the payoff now says that a list comes back in square brackets in
   the raw response and that the documentation shows which fields hold a
   list.
3. **"Link" first appears in drill 4.** Drills 2 and 3 only said "open".
   _Fixed:_ drill 2's payoff now says that a field that holds a record is a
   link to that record.
4. Drill 4's "Starting from the city of Prague" was clear. No change.
5. **Drill 5: "the braces that belong to Spain"** made the reader wonder
   whether they had to write `country(name: "Spain")`. _Fixed:_ the task now
   says that the braces after `borders` hold the fields for each neighbour,
   here Spain, and that you write another `borders` inside them, under `name`.
6. **Drill 5: Morocco in Spain's borders** looked like an error to someone
   with school geography. _Fixed:_ the payoff mentions Ceuta and Melilla.
7. **Documentation: `name` fields read "A single value, not a record."**
   _Fixed:_ every field that holds a single value now has its own
   description in `src/graphql/sdl.ts`. The documentation panel adds "Holds
   a single value, so this field takes no braces." to those fields, to match
   the note on fields that hold a record.
8. The nudges and the clerk's notes were never shown, because every drill
   passed first time. Covered by `e2e/training.spec.ts`, not by this run.

Pattern-matching: the reader reported that drill 5 felt like one small step
beyond drill 4, "the same move, one level deeper", which is what SDD 3.14
asks of it.

## Caveats

- The reader is a model playing a novice. Brace nesting may feel more obvious
  to it than to a real beginner, and the editor's auto-closing braces helped.
- This run does not show how a confused player recovers, or how long the
  drills take. The first round of beginner sessions (SDD 10.1) is the test
  for that.
- The rewritten drill text, the new Orientation example and the new
  documentation descriptions (findings 1, 2, 3, 5, 6, 7) have not been
  through a second walkthrough.
