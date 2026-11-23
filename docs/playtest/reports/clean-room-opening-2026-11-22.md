# Clean-room solves of the changed cases, 22 November 2026

**Build:** commit `0c2e110` plus the fixes below · **Agent:** general-purpose,
told to use only the browser tools on one page, one fresh browser context per
case

Each run followed [clean-room-solve.md](../clean-room-solve.md). These are the
four cases that changed when the opening was re-laid to SDD 3.15:

- _The Vanishing Azulejos_, now four untimed stages;
- _The Borrowed Chronometer_, which brings in the clock;
- _The Guest Register_, which brings in ruling out;
- _The Quiet Consignee_, which brings in field checks.

## Preflight

Each save was seeded with the completions a player on the course path would
hold. The clearance in the header was checked before the page was handed over.

| Case                     | Seeded completions                             | Clearance |
| ------------------------ | ---------------------------------------------- | --------- |
| The Vanishing Azulejos   | none                                           | 1         |
| The Borrowed Chronometer | Azulejos                                       | 1         |
| The Guest Register       | Borrowed Chronometer                           | 2         |
| The Quiet Consignee      | Azulejos, Borrowed Chronometer, Guest Register | 2         |

## Result

| Case                     | Stamp       | Transmissions (reference) | Hours left | Mode          |
| ------------------------ | ----------- | ------------------------- | ---------- | ------------- |
| The Vanishing Azulejos   | HOLD ISSUED | 3 (3)                     | untimed    | independently |
| The Borrowed Chronometer | RECOVERED   | 1 (1)                     | 17 of 18   | independently |
| The Guest Register       | IDENTIFIED  | 3 (2)                     | 20 of 26   | independently |
| The Quiet Consignee      | HELD        | 1 (1)                     | 17 of 18   | independently |

No hint was taken and no solution was viewed. Every case can be solved from
what the screen shows.

The agents used outside knowledge in two places. They wrote a request on one
line. In the two cases with a blank editor, they wrote the outer braces of a
request from memory.

## Findings

| #   | Case                         | Finding                                                                                                                                                                                                                                                                                                                                                   | Outcome                                                                                                                                                                                                                                                                                                           |
| --- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Guest Register               | Ruling out SGT-027 accepted only `CoverName.operative` (H. Brandt is filed under COPPER_KITE). The reference solution and the skeleton hint never ask for it. The agent first cited the sighting's name with NIGHTJAR's complete list of cover names, the natural reading of the clue. The form said the facts did not connect. That cost a transmission. | Fixed. The refutation is now the sighting's name together with NIGHTJAR's complete cover-name list, which omits the name. The reference query is enough to rule out both wrong sightings. A new unit test checks this, and it fails on the old content. The dispatch now says the name is not in NIGHTJAR's file. |
| 2   | All                          | The accessibility snapshot marked every option of "Open a lead" as disabled.                                                                                                                                                                                                                                                                              | No change. The options are enabled in the page (checked in the DOM). The flag comes from how the snapshot tool reads a closed `<select>`. Choosing an option works in every run.                                                                                                                                  |
| 3   | All                          | After a lead was chosen, "Open a lead" went back to its placeholder.                                                                                                                                                                                                                                                                                      | Fixed. The list now shows the open lead. See the opening walkthrough, finding 3.                                                                                                                                                                                                                                  |
| 4   | Chronometer, Quiet Consignee | With a blank editor, nothing in the Documentation tab shows how a whole request begins.                                                                                                                                                                                                                                                                   | Fixed. The Documentation tab now opens with a paragraph saying every query starts at `Query`, with the example `query { city(name: "Lisbon") { name } }`.                                                                                                                                                         |
| 5   | Azulejos                     | The debrief's "The first query in Lisbon asked for one field" read as a description of the player's query. It also said the reference opens "both transfer orders" of each shipment, but only LIS-0417 has two.                                                                                                                                           | Fixed. It now says "The reference solution's first query…", and "the shipment's transfer orders".                                                                                                                                                                                                                 |
| 6   | Guest Register               | The debrief said the argument returns "one file and not sixteen". The concept card said the registry holds "dozens". The registry holds 18 operatives.                                                                                                                                                                                                    | Fixed. The debrief says "one file and not the whole registry", and the card says "many operatives".                                                                                                                                                                                                               |
| 7   | Guest Register               | The briefing warns of two cover names "a hurried clerk could read as Dr. Lund". An exact argument returns the right one at once, so the look-alike never appears.                                                                                                                                                                                         | Fixed. The debrief now says that the argument must match exactly, and identifies the look-alike, D. Lund, filed under TIN_FALCON (query run before writing).                                                                                                                                                      |
| 8   | Quiet Consignee              | The briefing introduces the field check, but one query supports both claims, so the agent never needed it.                                                                                                                                                                                                                                                | Logged, open. The case that introduces field checks can be solved without one. Fixing this means re-authoring the case so that one claim cannot be supported at first. That is a content decision for after the beginner round. See the clearance 2 walkthrough, finding 4.                                       |
| 9   | Azulejos                     | A row that is about no lead is labelled "into the draft for" whichever lead is open.                                                                                                                                                                                                                                                                      | Logged. That is where the citation goes. The legend says that each Cite button says which lead the citation is for.                                                                                                                                                                                               |
| 10  | Guest Register               | A claim waits on "Choose 'Country of the sighting' above first" even when the cited facts already show the country.                                                                                                                                                                                                                                       | Logged. The player states the conclusion, and the citations support it. Filling it in from the citations would make the choice for the player.                                                                                                                                                                    |
| 11  | Azulejos                     | The desk's next-case link after Azulejos named a case the agent had not seen on the desk.                                                                                                                                                                                                                                                                 | No change. The Borrowed Chronometer sat in the closed placement group until Azulejos was resolved, as SDD 9 describes. Locked cases now name the assessment that opens them.                                                                                                                                      |

## Caveats

- All four agents know GraphQL. These runs show that the screen holds what a
  solver needs. They do not show that a beginner will find it.
- No run sent a malformed request, took a hint, or submitted a wrong form, so
  the clerk's notes, the hint text and the rejection dispatches were not
  checked.
- Finding 1 was found by one agent. The fix has a unit test and a scoped
  novice re-run (below). No clean-room run has been repeated.
