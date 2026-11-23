# Novice walkthrough of the re-laid opening, 22 November 2026

**Build:** commit `0c2e110` plus the fixes below · **Agent:** general-purpose,
told to use only the browser tools on one page

The run followed [novice-walkthrough.md](../novice-walkthrough.md) over the
Orientation, the six drills, _The Vanishing Azulejos_ (four untimed stages) and
_The Borrowed Chronometer_. This is the path of the first round of beginner
sessions (SDD 10.1). It is the first walkthrough since the opening was re-laid
to SDD 3.15. The agent was also asked to say, after each stage, what was new in
it.

## Preflight

Clearance 1, 0 of 10 cases resolved, a fresh browser context. The Borrowed
Chronometer was not visible at preflight. As a placement, it sat in the closed
"Skip ahead" group, which the agent did not open. It moved to Clearance 1 once
Azulejos was resolved.

## Result

| Case                     | Solved | Transmissions | Hints | Solution viewed | Hours left | Mode          |
| ------------------------ | ------ | ------------- | ----- | --------------- | ---------- | ------------- |
| Training range           | 6 of 6 | 6, free       | none  | no              | untimed    | Passed        |
| The Vanishing Azulejos   | yes    | 3             | 0     | no              | untimed    | independently |
| The Borrowed Chronometer | yes    | 1             | 0     | no              | 17 of 18   | independently |

No request was returned unread, so the clerk's notes were not seen.

## What was new, per stage

The agent named one new GraphQL step at most in every stage. In each case
stage it named the casework controls of the mechanic that the stage introduces
(SDD 3.15):

- Stage 1: Cite, the lead, the claim and the form.
- Stage 2: a nested citation that counts as several facts.
- Stage 3: the travel order, with no new query.
- Stage 4: a deduction about several records.
- Chronometer: the clock.

It also listed things that are controls of the page rather than mechanics:

- the case tabs;
- the Earlier and Later buttons;
- the `#` lines in the starter queries.

No stage asked for more than one new GraphQL step and one new mechanic.

## Findings

| #   | Where                          | Finding                                                                                                                                              | Outcome                                                                                                                                                                                                                                          |
| --- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Drill 1, editor                | Typing a query over several lines left two extra `}`. The editor had already closed each brace.                                                      | Logged. The agent types closing braces where a person would move past them. The beginner sessions will show whether people hit this. The prompts already warn agents.                                                                            |
| 2   | Drill 1, task                  | "Fields go one to a line, with no commas" read as a strict rule, yet a one-line query worked.                                                        | Fixed. The task now says to put a space or a new line between two fields and no comma, and that one field to a line is easiest to read.                                                                                                          |
| 3   | Deduction form, "Open a lead"  | After a lead was chosen, the list went back to "Choose a shipment", so the choice looked lost.                                                       | Fixed. The list now shows the open lead. A first fix, the placeholder "Choose another shipment", failed the re-run: "another" suggested that more than one lead had to be opened.                                                                |
| 4   | Azulejos stage 1, starter      | The `#` lines were never explained.                                                                                                                  | Fixed. The first starter of the first case now begins its note with "A line that starts with # is a note for you. The archive ignores it, so you can leave it in or delete it."                                                                  |
| 5   | Azulejos stage 3, travel order | The country list includes Namibia. For a moment the agent took "Country receiving the shipment" to be the truck's last stop.                         | Logged. The claim beneath the field, and the stage's briefing, both name the destination's country. Watch for this in the beginner sessions.                                                                                                     |
| 6   | Documentation                  | List fields such as `borders` said "Returns Country, which is a record", so a reader could miss that a list comes back.                              | Fixed. A list field now reads "Returns a list of Country records, so this field needs braces after it. The fields inside the braces come back once for each record in the list."                                                                 |
| 7   | Debrief, "Yours"               | The player's one-line queries were shown without the word `query` that the player had typed.                                                         | Fixed. The debrief's layout of a one-line request keeps `query` when the player typed it. Unit test in `src/engine/mission.test.ts`.                                                                                                             |
| 8   | Azulejos stage 4, findings     | Many rows have a Cite button, and some labels are long. Choosing the right one took careful reading.                                                 | Logged. The draft shows which citations count toward each claim (Milestone 5 task 2). The beginner sessions ask which facts support each claim.                                                                                                  |
| 9   | Azulejos stage 4               | `authorizedBy` and `authorizationLog.signedBy` give the same name, and nothing says why both exist.                                                  | Logged. The log is the second evidence set for the signer claim, and every claim needs two (SDD 3.2). No case in 1.0 makes the two disagree, so the field has no story role yet. That is a content question for later, not a fix to the opening. |
| 10  | Assignments desk               | Clearance 2 cases said "Pass the level 1 assessment" without saying which case that is, and the assessment was hidden in the closed placement group. | Fixed. A locked case now reads "Pass the level 1 assessment, The Borrowed Chronometer, to open this case." The placement group stays closed (SDD 9).                                                                                             |
| 11  | Azulejos briefing              | (Found while checking the run.) The briefing said the training range takes "about five minutes", while the desk says six.                            | Fixed. The briefing now says six.                                                                                                                                                                                                                |

## Pattern-matching

None reported. In stage 4 the agent counted closing braces by matching
earlier shapes. This is the deepest query of the opening.

## Re-run of the fixes

A second novice agent, on a fresh save, played drill 1 and _The Vanishing
Azulejos_. It was asked to report on each place that had changed. It solved
Azulejos in 5 transmissions (the reference sends 3), with no hints.

| Place                         | Verdict                                                                                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Drill 1 text                  | Clear.                                                                                                                                                                     |
| `#` note in the first starter | Clear.                                                                                                                                                                     |
| Documentation opening, fields | Clear, "the best part". Each field's line "told me exactly what to type".                                                                                                  |
| "Open a lead" list            | Still confusing with "Choose another shipment". Fixed again, as finding 3 says. The second fix was checked in the browser and by an end-to-end assertion, not by an agent. |
| Debrief comparison            | Partly clear. The player's queries and the reference's are not matched stage by stage.                                                                                     |

It reported these new points. All are logged:

- Stage 1's note asks for "the field that says what each shipment contains",
  and both `manifest` and `inspection` could fit. Both are accepted as
  evidence, so either choice works.
- In stage 4 the agent misplaced a brace and put `transferOrders` inside
  `intake`. It caught the mistake by reading the editor back. Nothing yet
  teaches that the position of a brace decides which record a field belongs
  to. The beginner sessions will show whether people need this.
- Stage 4's "For shipment" list includes the Lisbon shipments as well as the
  Luanda ones. The list holds every shipment the player has retrieved.
- The debrief stacks the player's queries apart from the reference's.
  Milestone 5 task 9 replaces the debrief's reading of the player's queries.

## Caveats

- The reader is a model playing a novice. It solved every stage on the first
  try. A real beginner will send more requests, and will make mistakes that
  bring up the clerk's notes. This run shows none of them.
- The hints, the Evidence, Dossiers, Map and Glossary tabs, and wrong
  submissions were not exercised.
- The run timed nothing. The first round of beginner sessions
  ([beginner-sessions.md](../beginner-sessions.md)) is the test of pacing.
