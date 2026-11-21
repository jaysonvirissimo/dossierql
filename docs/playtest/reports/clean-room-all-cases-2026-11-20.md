# Clean-room solves: all ten cases

**Date:** 2026-11-20 · **Build:** commit `8eee5cd` and its follow-up · **Agents:** five, browser-only, no repository access

Each agent could only operate one browser page. Saves above clearance 1 were
seeded with one passed assessment and the clearance was checked before the
page was handed over. No agent took a hint or viewed a solution.

## Results

| Case                                 | Solved | Transmissions (reference) | Hours left | Mode recorded              |
| ------------------------------------ | ------ | ------------------------- | ---------- | -------------------------- |
| The Vanishing Azulejos               | Yes    | 2 (2)                     | 21 of 27   | Independent                |
| The Borrowed Chronometer (placement) | Yes    | 1 (1)                     | 17 of 18   | Independent, promoted to 2 |
| The Guest Register                   | Yes    | 3 (2)                     | 20 of 26   | Independent                |
| The Quiet Consignee                  | Yes    | 1 (1)                     | 17 of 18   | Independent, promoted to 3 |
| Three Couriers                       | Yes    | 2 (2)                     | 18 of 23   | Independent                |
| Bound Ledgers                        | Yes    | 1 (1)                     | 16 of 17   | Independent, promoted to 4 |
| The Paymaster                        | Yes    | 2 (2)                     | 18 of 24   | Independent                |
| Lantern Export                       | Yes    | 1 (1)                     | 16 of 17   | Independent, promoted to 5 |
| The Forwarding Address               | Yes    | 2 (2)                     | 18 of 23   | Independent                |
| The Registrar's Return               | Yes    | 2 (2)                     | 17 of 22   | Independent, promoted to 6 |

Every case can be solved from what the game shows. Field names came from
the Documentation tab and the starter queries in every run. No on-screen text
was found to disagree with what the archive returned. Ruling out a wrong lead
was tried in five cases and worked each time, at no cost.

## Outside knowledge the agents had to use

| Where                                              | What                                                                                                          | Action                                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| The Paymaster                                      | How to define a fragment. The glossary showed only the spread, and the concept card is earned after the case. | Fixed. The glossary entry gives the form `fragment Name on Type { fields }`, and the starter comment points to it. |
| The Borrowed Chronometer, attempted as a placement | Query syntax, since the editor is blank.                                                                      | Logged. A placement is for players who already know GraphQL. The Orientation shows a complete query.               |
| The Registrar's Return                             | That "pounds sterling" in the clue is the "British pound" in the data.                                        | Fixed. The clue, claim and debrief say British pound.                                                              |

## Findings

| #   | Finding                                                                                                                                                                            | Action                                                                                                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The Guest Register, Zanzibar: a sighting reached through the cover name, with its city, did not support "A guest in Zanzibar City gave this name". It cost an agent an extra hour. | Fixed. That route is now a third evidence set for the claim.                                                                                              |
| 2   | A claim with some of its evidence cited looked the same as one with none.                                                                                                          | Fixed. An open claim now says when part of its evidence is cited and something is still missing.                                                          |
| 3   | For `Expected "on", found "{"` the clerk suggested counting braces.                                                                                                                | Fixed. The note says a fragment names the type it is written for. A bare word at the start of a request has its own note too.                             |
| 4   | The same error was printed once per offending field.                                                                                                                               | Fixed. Identical errors are shown once.                                                                                                                   |
| 5   | Cite buttons and the cite status used internal identifiers such as `MZ-KAFUE`.                                                                                                     | Fixed. They use the record's name as the results show it.                                                                                                 |
| 6   | After travel, the lead list still offered leads from the previous stage.                                                                                                           | Fixed. Leads come from the current stage's transmissions.                                                                                                 |
| 7   | After travel, the cite status from the previous stage was still showing.                                                                                                           | Fixed.                                                                                                                                                    |
| 8   | "Choose a operative".                                                                                                                                                              | Fixed.                                                                                                                                                    |
| 9   | The Documentation tab closed its sections whenever another tab was opened.                                                                                                         | Fixed. It stays as the player left it.                                                                                                                    |
| 10  | A row for a nested record with no name showed its own field name as the value.                                                                                                     | Fixed. It reads "on file".                                                                                                                                |
| 11  | The final debrief announced clearance 6 with nothing above it.                                                                                                                     | Fixed. It adds that no cases are filed above this level yet.                                                                                              |
| 12  | The Registrar's Return debrief said only the variable changes, but a player following the clues also adds a field in Southampton.                                                  | Fixed.                                                                                                                                                    |
| 13  | "Open a lead" options are reported as disabled in the accessibility snapshot.                                                                                                      | Logged. Reported by every agent, never observed to block one. The browser tests select from the control by keyboard. Worth checking with a screen reader. |
| 14  | Cite and Pin sit side by side, and three agents pressed Pin by mistake.                                                                                                            | Logged. A stray pin is harmless and can be undone. Revisit if people do the same.                                                                         |
| 15  | A citation's "3 facts" count is unexplained.                                                                                                                                       | Fixed in part. The results now say that citing a row attaches the chain that leads to it.                                                                 |
| 16  | A shipment with no inspection still offers "Cite inspection".                                                                                                                      | Logged. An absent record is a fact that can matter.                                                                                                       |
| 17  | Sending an identical request twice costs an hour without warning.                                                                                                                  | Logged. A transmission costs an hour by rule.                                                                                                             |
| 18  | Submit is enabled while claims are open.                                                                                                                                           | Logged. Pressing it returns the form with the reason, free.                                                                                               |
| 19  | A small red mark appeared under the first character of a valid query.                                                                                                              | Logged. Not reproduced. Likely the editor's check running on the empty editor a moment before.                                                            |

## Caveats

- Every agent already knew GraphQL. These runs show the on-screen material is
  sufficient. They do not show that a beginner finds it.
- Queries were typed on one line. Multi-line entry by hand was not exercised.
- Not exercised by these runs: hints, the solution reveal, field checks,
  wrong submissions, the deadline, restart, the map, dossiers and the ledger.
  The automated browser tests cover those.
- Agents read the page through accessibility snapshots, so layout and visual
  emphasis were not reviewed.
