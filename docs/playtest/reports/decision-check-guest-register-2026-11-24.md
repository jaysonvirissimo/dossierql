# Decision check of The Guest Register, 24 November 2026

**Build:** commit `80e4141` (SDD Milestone 17, phase 1), production build
served under `/dossierql/` · **Agent:** osp-site-tester, browser tools on
one page only

The run followed [novice-walkthrough.md](../novice-walkthrough.md) over _The
Guest Register_, with [decision-check.md](../decision-check.md) appended.
The save was seeded with `borrowed-chronometer` in a fresh browser context.

## Preflight

Clearance 2. The Borrowed Chronometer showed "Completed independently" and
the desk showed 1 of 26 cases resolved. The Guest Register was marked "Next
in the story". The agent skipped the Orientation.

## Result

| Case               | Solved | Transmissions                             | Hints | Solution viewed | Hours left | Mode        |
| ------------------ | ------ | ----------------------------------------- | ----- | --------------- | ---------- | ----------- |
| The Guest Register | Yes    | 3 (one was the required H. Brandt lookup) | 0     | No              | 20 of 26   | independent |

- Luanda took one transmission, two rule-outs and the travel order.
- Zanzibar City took two transmissions: a `coverName` lookup of Dr. Lund and
  the H. Brandt lookup. The deduction was then accepted.

## The Milestone 17 test

**Choice of city: passed.** Before the travel order, the agent wrote down
why it chose Zanzibar City:

- M. Calloway is on NIGHTJAR's complete list of cover names.
- Swahili is spoken in Tanzania.

It also gave the fact that dropped each of the other two cities:

- Mombasa's guest gave H. Brandt, which is not on the list.
- Mozambique's languages do not include Swahili.

The agent used the case board while choosing and said it grouped the
Findings by city. It opened the map only after it had decided, so the map
did not change the decision.

**Lookup from a blank editor: passed, but it is weakened.** The agent wrote
`coverName(name: "H. Brandt") { name operative { codename } }` from a
blank editor, and it worked on the first transmission. Two things in the
case had already given part of it away:

- The Mombasa rule-out dispatch says "The registry files it under
  COPPER_KITE", so the agent knew the answer before it sent the query.
- Both starter queries already contain the argument
  (`operative(codename: "")` and `coverName(name: "")`). The player fills in
  the quotes but never writes the parentheses until this exercise.

## Findings

Each finding was fixed as a rule for every case, not only for this one.

1. **The two Lunds did not stay in contention.** _Fixed._
   - **Engine.** At a stage that lists its `leads`, the travel order,
     deduction or warrant is accepted only once every other listed lead is
     ruled out (`openRivals`, `formHold` in `src/engine/mission.ts`).
   - **Validator.** Every lead but the solution's needs a refutation, and
     the reference solution must rule out each one.
   - **Content.** The Zanzibar reference solution now also looks up
     D. Lund's sightings, and the briefing and hints tell the player to
     rule out the other name.
2. **The Mombasa rule-out dispatch gave away who owns H. Brandt.** _Fixed._
   - **Validator.** A `ruledOut` text may mention only the lead, what its
     refutation retrieves, and records that the stage or an earlier stage
     has introduced.
   - **Content.** The check caught two dispatches, both in this case: the
     Mombasa dispatch (COPPER_KITE) and the D. Lund dispatch (TIN_FALCON).
     Both were reworded. The other cases the first scan suspected mention
     records their briefing or summary had already introduced.
3. **The starter queries supplied the argument.** _Fixed._
   - **Validator.** Past a guided stage, the starter query must leave at
     least one use of the taught construct for the player: the reference
     solution has to write it more times than the starter does. A stage
     that introduces a step can leave the step to the player instead.
   - **Content.** Only the Zanzibar starter wrote every use. It now opens
     with `coverName` and a comment that says what the argument is.
   - The other partial starters show one use and ask for another, such as
     a second alias or an `after` cursor, and they pass.
4. **The Travel button looked ready before the country was chosen.**
   _Fixed._
   - **Component.** Both form components keep the button inactive while
     a box is blank or another lead is in contention. A line under the
     button says what is missing.
   - The engine gives the same text if the form is sent anyway.
5. **Findings flattened a nested record.** _Fixed._
   - **Component.** A field that holds another record now shows the kind
     of record beside its heading. Its fields form a group, labelled for
     example "name given, a cover name".
6. **"Not yet opened" was not defined.** _Fixed._ The line now reads
   "Fields of this sighting that hold another record, which your query did
   not ask for: …".
7. **The deduction boxes offer every retrieved record.** _No change._ By
   design.

## Caveats

- One AI agent played a persona. It reads faster and more carefully than
  a beginner, and it solved the case with no wrong answer.
- Hints, the wrong-deduction feedback and the error notes were not exercised.
- The map's effect on the decision is unmeasured. This agent had decided
  before it opened the map, and a player who opens the map first may behave
  differently.
- Finding 1 means this run does not yet test whether keeping two candidates
  in contention changes how a player plays.
