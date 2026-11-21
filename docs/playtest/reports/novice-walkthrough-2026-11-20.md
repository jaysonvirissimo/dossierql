# Novice walkthrough: seven cases

**Date:** 2026-11-20 · **Build:** commit `8eee5cd` and its follow-up · **Agents:** two, browser-only

Persona: knows JSON, has called an API once or twice, has never written
GraphQL (SDD 1.2). The first agent played the four cases of clearance 1 and 2
from a clean save. The second played the teaching cases of clearance 3 to 5
as someone who had finished the first two levels.

## Results

| Case                     | Solved | Transmissions (reference)                    | Hints | Solution viewed |
| ------------------------ | ------ | -------------------------------------------- | ----- | --------------- |
| The Vanishing Azulejos   | Yes    | 3 (2)                                        | 0     | No              |
| The Borrowed Chronometer | Yes    | 1 (1)                                        | 0     | No              |
| The Guest Register       | Yes    | 3 (2)                                        | 0     | No              |
| The Quiet Consignee      | Yes    | 1 (1)                                        | 0     | No              |
| Three Couriers           | Yes    | 2 (2)                                        | 0     | No              |
| The Paymaster            | Yes    | 2 (2)                                        | 0     | No              |
| The Forwarding Address   | Yes    | 2 (2), plus one sent twice by a tooling slip | 0     | No              |

## What worked

- The clerk's note on a record selected without braces. The first agent
  called it the moment braces made sense, and the best teaching in four cases.
- The rejected request in Three Couriers: the same field asked twice, a free
  return, a reason, and a fix. Aliases were the one new idea the game forced.
- "Bears on no claim for this lead" read as honest and useful.
- Costs were always clear before committing.
- Changing one word in the variables panel in Istanbul and getting a new city.

## Points of confusion

| #   | Where                    | Finding                                                                                                                   | Action                                                                                                                                                                                                                                                                         |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Azulejos, starter        | The starter runs as it stands, costs an hour and cannot settle the case.                                                  | Fixed. Its comment now says the request is not finished and to add to it before transmitting.                                                                                                                                                                                  |
| 2   | Results                  | A shallow result showed only the list of shipments. The manifests asked for were visible only in the raw response.        | Fixed. This was a bug in how short lists were condensed.                                                                                                                                                                                                                       |
| 3   | Documentation            | `!` and `[ ]` are never explained.                                                                                        | Fixed. The tab opens with a short legend.                                                                                                                                                                                                                                      |
| 4   | Documentation            | Only some record fields said they need a selection.                                                                       | Fixed. Every field that returns a record says so.                                                                                                                                                                                                                              |
| 5   | Quiet Consignee          | Whether an identifier goes in quotes.                                                                                     | Fixed. The legend and the glossary entry for an argument say text and identifiers go in double quotes.                                                                                                                                                                         |
| 6   | Results                  | A record appears on its own row and again as the name beneath, with a Cite on each.                                       | Fixed in part. A line above the findings says each row is a fact and that citing attaches its chain.                                                                                                                                                                           |
| 7   | Draft                    | "3 facts" on a citation is unexplained.                                                                                   | Covered by the same line.                                                                                                                                                                                                                                                      |
| 8   | Guest Register           | A claim stayed "Needs evidence" with half its evidence cited and no reason given.                                         | Fixed. See the clean-room report, finding 2.                                                                                                                                                                                                                                   |
| 9   | Guest Register, Zanzibar | The claims were visible only after opening a lead, so the player paid for a query before learning a second claim existed. | Fixed. The draft lists the stage's claims before any lead is open, and the starter comment asks both questions.                                                                                                                                                                |
| 10  | Guest Register, debrief  | The reference asks for two things at the top of one query, which nothing had shown.                                       | Fixed. The debrief and the glossary entry for a query say so.                                                                                                                                                                                                                  |
| 11  | Guest Register, Zanzibar | The second look-alike name never came up, because the starter had the right name typed in.                                | Fixed. The starter leaves the name blank, as the first stage does for the codename.                                                                                                                                                                                            |
| 12  | Lead list                | Leads from the previous stage were offered.                                                                               | Fixed.                                                                                                                                                                                                                                                                         |
| 13  | Cite controls            | Internal identifiers were shown.                                                                                          | Fixed.                                                                                                                                                                                                                                                                         |
| 14  | Documentation            | Sections closed when leaving the tab.                                                                                     | Fixed.                                                                                                                                                                                                                                                                         |
| 15  | All cases                | Ruling out and field checks never came up.                                                                                | Logged. Both are optional by design: a player who reads the results correctly does not need them.                                                                                                                                                                              |
| 16  | Three Couriers           | The glossary entry for an alias had no example.                                                                           | Fixed. Every syntax entry in the glossary now shows its form.                                                                                                                                                                                                                  |
| 17  | The Paymaster            | Copying the fields three times solved the stage and nothing reacted. The word "fragment" appeared nowhere on the screen.  | Fixed. The starter comment names a fragment and points to the glossary. The debrief says, when a teaching case was solved without its concept, what the concept would have changed. A solved case stays solved: the game accepts any query that yields the evidence (SDD 3.7). |
| 18  | The Paymaster            | Fragment syntax could not be found in the case.                                                                           | Fixed. See the clean-room report.                                                                                                                                                                                                                                              |
| 19  | The Paymaster            | Why `on Operative` is required.                                                                                           | Fixed. The glossary says the type is the kind of record the fields belong to.                                                                                                                                                                                                  |
| 20  | Forwarding Address       | `($city: String!)` arrives written and unexplained.                                                                       | Fixed in part. The starter comment says `$city` is filled from the variables panel, and the glossary shows the declaration. The level's assessment starts blank and asks for it unaided.                                                                                       |
| 21  | Forwarding Address       | Editing the city in the query would have cost the same as editing the variable.                                           | Logged. True of two cities. A longer route would show the difference better, and is a candidate for a later case.                                                                                                                                                              |
| 22  | Stage change             | Easy to miss that the stage changed.                                                                                      | Fixed in part. The tools return to the Case tab, with the new briefing and clues, when a stage opens.                                                                                                                                                                          |

## Pattern-matching

The first agent reported that it began at the first blank editor: it solved
both assessments by substituting into the previous query, in one transmission
each, and judged them too easy to be called assessments. The second reported
copying `fragment … on Operative` and `($city: String!)` without knowing why
they are written that way.

Logged for the sessions with people (SDD 10.1), not changed now: whether each
assessment should differ more from its teaching case. The clearance 1 and 2
assessments change the relationship followed and the starting record. Whether
that is enough is a question for real beginners.

## Caveats

- An agent in persona is not a beginner. Both guessed field names and syntax
  correctly on the first try far more often than a person would.
- Neither took a hint, so the hint text is untested by walkthrough.
- The second agent's save had the fragments card already earned, through the
  placement used to reach clearance 5. It found the syntax there.
- These runs were made before the fixes above. The walkthrough is run again
  after them: see the follow-up report.
