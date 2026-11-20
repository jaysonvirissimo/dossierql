# Novice walkthrough after the wording pass, 22 November 2026

The run followed [novice-walkthrough.md](../novice-walkthrough.md) over the
training range and The Vanishing Azulejos. It was made after every
player-visible text was rewritten to SDD section 5.7, to find the sentences a
beginner still had to read twice.

## How the run differed from the prompt

- The agent was told to take all four hints in Luanda before writing a query,
  and to quote each one. Earlier reports note that no walkthrough had read
  the hint text.
- The agent was told to make two mistakes on purpose, so that two of the
  clerk's notes appeared.
- The agent was a general-purpose agent instructed to use only the browser
  tools on one page. It was not technically prevented from reading the
  repository. Its report shows no sign that it did.

## Preflight

Clearance 1, 0 of 10 cases resolved, a fresh browser context.

## Result

| Case                   | Solved  | Transmissions | Hints  | Solution viewed | Hours left | Mode       |
| ---------------------- | ------- | ------------- | ------ | --------------- | ---------- | ---------- |
| Training range         | 5 of 5  | 7, free       | none   | none            | untimed    | Passed     |
| The Vanishing Azulejos | on time | 2             | 4 of 4 | no              | 6 of 27    | with hints |

## Findings

Each finding is fixed, or logged with the reason it stands.

| #   | Where                           | Finding                                                                                                               | Outcome                                                                                                                                               |
| --- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Orientation, every starter      | Nothing says what `city(name: "Lisbon")` and its parentheses do. The player copied them without understanding.        | Fixed. Orientation and drill 1 now say that the part in parentheses says which record is wanted. The documentation guide reads one such entry aloud.  |
| 2   | Drill 1, task                   | "A query: a list of the fields you want from a record" did not match a form with two pairs of braces and parentheses. | Fixed. The task now reads the starter query from the outside in and says what each part is.                                                           |
| 3   | Drill 2, error                  | The archive's error uses "type", "selection" and "subfields" before they are taught, and sits above the clerk's note. | Logged. SDD 3.9 requires the original error unaltered with the note beneath it. The clerk's note was followed in one reading.                         |
| 4   | Clerk's note, empty braces      | "A comment does not count as a field" when the player had written no comment and did not know what one was.           | Fixed. The note now says that a line starting with `#` is a comment.                                                                                  |
| 5   | Error, empty braces             | "has an empty selection" uses an undefined word.                                                                      | Fixed. This error is the game's own. It now reads `The braces after "country" are empty.`                                                             |
| 6   | Drill 3                         | Portugal has one neighbour, so "once for each record in the list" is not visible in the result.                       | Logged. Changing the country changes the drill's data, expectations and payoff. Worth doing when the drills are next revised.                         |
| 7   | Drill 4, title                  | The title says "links" and the task never did.                                                                        | Fixed. The task opens by saying that a field that holds a record is a link.                                                                           |
| 8   | Documentation guide             | The `!` rules, "identifiers" and `ID` took two readings.                                                              | Fixed. The guide glosses `ID`, reads `city(name: String!): City` in words, and says that a `!` is never typed.                                        |
| 9   | Documentation entries           | "A plain value." says nothing about the field.                                                                        | Partly fixed: the default is now "A single value, not a record." Logged: a description for every undescribed field is new writing, outside this pass. |
| 10  | Lisbon briefing                 | "Azulejos" is not explained.                                                                                          | Fixed.                                                                                                                                                |
| 11  | Lisbon briefing                 | "Customs would appreciate a narrower list." A narrower list of what?                                                  | Fixed.                                                                                                                                                |
| 12  | Draft, "Open a lead"            | The dropdown returns to its prompt after a choice.                                                                    | Logged. An interface change, not wording.                                                                                                             |
| 13  | Results legend, citation counts | "The links that lead to that row are cited with it" took two readings, and "3 facts" was unexplained.                 | Fixed. The legend now says that one citation can count as several facts.                                                                              |
| 14  | Lisbon, first claim             | The manifest alone supported the claim although two shipments share it.                                               | Logged. By design: the second claim separates them.                                                                                                   |
| 15  | Luanda briefing                 | "Consignee" and "replacement label" are not explained.                                                                | Fixed in the briefing. A glossary entry was not added: the glossary holds GraphQL and game terms.                                                     |
| 16  | Luanda starter comment          | The comment is a question where Lisbon's was an instruction.                                                          | Logged. Intended: the second stage gives less help (SDD 3.9).                                                                                         |
| 17  | Hint 3                          | `City.arrivingShipments` notation is never taught.                                                                    | Fixed. The hint's label now reads "lists the fields to look at, each written as Type.field".                                                          |
| 18  | Draft, partial evidence         | The message does not say which fact is missing.                                                                       | Logged. The draft review knows that an evidence set is incomplete, not which fact a player would call missing. The message was reworded in this pass. |
| 19  | Luanda, "For shipment"          | The player must choose the shipment again, from a list that includes ruled-out crates.                                | Logged. A design question for the draft form.                                                                                                         |
| 20  | Glossary, citation              | "Draft" and "lead" are undefined.                                                                                     | Fixed for "draft": the entry now says "a travel order or a deduction form". "Lead" is logged.                                                         |
| 21  | Debrief                         | The player's queries are shown without `query` and the reference with it, and the explanation comes after both.       | Logged. A layout change.                                                                                                                              |
| 22  | Debrief                         | Nothing says that a teaching case does not raise clearance.                                                           | Logged.                                                                                                                                               |
| 23  | Hints, cost                     | Hint 3 adds little to hint 2 at twice the price, and hint 4 is nearly the solution.                                   | Logged. Hint content and pricing are design (SDD 3.9), not wording.                                                                                   |

## Hints and clerk's notes

The agent could follow hints 1, 2 and 4 in one reading, and called hint 2
"the best-written hint". Hint 3 needed the notation explained (finding 17).
The note for a record without braces "told me what to do, completely, in one
reading". The note for empty braces was followed but less precisely (findings
4 and 5).

## Where understanding gave way

The agent understood braces from drill 2 onward. It never understood the
head of the query, `query { city(name: "…") { … } }`, and copied it every
time (findings 1 and 2).

## Rerun

A second agent, in a fresh browser context, read the Orientation, played the
five drills and the Lisbon stage, and read the Luanda briefing. It took no
hints and viewed no solution. Every drill passed on the first real attempt,
and Lisbon was solved in one transmission.

The fixes it confirmed, by quoting the sentence that taught each point:

- What the part in parentheses does (findings 1 and 2).
- What a link is (finding 7).
- What azulejos and a consignee are (findings 10 and 15).
- Why a citation can count as three facts (finding 13).
- The empty-braces error and note "told this person what to do" (findings 4
  and 5).
- It could read the `city` entry in the documentation after the guide
  (finding 8).

It reported that understanding did not give way before the stopping point.
The first run had lost the head of the query at drill 1.

New findings from the rerun:

| #   | Where                    | Finding                                                                                               | Outcome                                                                                            |
| --- | ------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| R1  | Orientation              | "Mistakes are free" beside "a query costs one hour": does a wrong query cost?                         | Fixed. It now says which requests cost nothing and which cost their hour.                          |
| R2  | Drill 1                  | Nothing says how fields are separated. A JSON reader expects commas.                                  | Fixed.                                                                                             |
| R3  | Drill 4                  | A link "holds a record", yet the second link, `borders`, holds a list.                                | Fixed.                                                                                             |
| R4  | Documentation guide      | The guide's `[Country]` appears nowhere, and `[City!]!` has two marks the `!` sentence did not cover. | Fixed. The example is `[Country!]!`, and the guide says where a `!` can be ignored.                |
| R5  | Results legend           | The number beside a citation is not labelled as a count.                                              | Fixed.                                                                                             |
| R6  | Documentation, `country` | `country(name: String, code: ID)` does not say to give one or the other.                              | Logged. A schema description to add with finding 9.                                                |
| R7  | Lisbon briefing          | "Declared as samples" matches nothing in the data, and "put a hold" matches no control.               | Logged. Story text. Worth a look when the case is next revised.                                    |
| R8  | Draft form               | "Lead" is not explained, and the reason for choosing the destination country is not given.            | Logged, with findings 12 and 20.                                                                   |
| R9  | Results                  | "Not yet opened on this city" reads like an error at first, and repeated values each have a Cite.     | Logged. Interface.                                                                                 |
| R10 | Luanda                   | The objective uses "consignee" before the briefing explains it. "Operative" is not introduced.        | Logged. The briefing is read first on the briefing page. "Operative" needs a line in the briefing. |
| R11 | Clerk's note             | The `#` sentence appears before the player has seen a comment.                                        | Logged. It is the only place a comment is explained, and the case's starter queries rely on it.    |
| R12 | Editor                   | Closing brackets are added automatically, and typing one's own doubles them.                          | Logged. Editor behaviour.                                                                          |

The fixes for R1 to R5 were made after the rerun and have not had a third
reading. `npm run check` and the browser tests pass with them.

## Caveats

- One run by a model playing the persona. It cannot fully forget GraphQL, so
  a real beginner will stumble more.
- Hints were taken by instruction, so the run does not show whether Luanda
  can be solved unaided.
- Only two clerk's notes were seen, both in training.
- Clearance 2 to 5 were not played. Their text was rewritten to the same
  rules and has not had a cold reading.
- The page was read mostly through the accessibility tree, so layout
  problems are under-reported.
