# Novice walkthrough of the remaining cases, on the finished build

**Date:** 2026-11-20 · **Agents:** two, browser-only, fresh saves

These runs cover the five cases the first re-run did not, after the fixes
from every earlier report.

| Case                            | Solved | Charged transmissions (reference) | Returned free | Hints |
| ------------------------------- | ------ | --------------------------------- | ------------- | ----- |
| The Quiet Consignee (placement) | Yes    | 1 (1)                             | 0             | 0     |
| Three Couriers                  | Yes    | 2 (2)                             | 1, on purpose | 0     |
| Bound Ledgers                   | Yes    | 1 (1)                             | 0             | 0     |
| The Forwarding Address          | Yes    | 2 (2)                             | 0             | 0     |
| The Registrar's Return          | Yes    | 2 (2)                             | 0             | 0     |

## What held up

- In Three Couriers the persona asked for the same field three times, as the
  starter's comment invites. The clerk returned it free, and the note with
  the glossary entry was enough to write the aliases first time.
- In The Registrar's Return the persona wrote a variable declaration into a
  blank editor unaided, with names of its own, from the glossary entry and
  the previous case's starter.
- Arriving at a second stage: the results panel was clean and said earlier
  responses are kept, the tools showed the new briefing, and the lead list
  was empty until the first transmission.

## Findings

| Finding                                                                                                                      | Action                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| The most natural first click, Cite on the row naming the company, was the only one refused for want of an open lead.         | Fixed. A row that names a lead opens that lead's draft.                                                         |
| The "open a lead first" notice stayed after a lead was opened.                                                               | Fixed.                                                                                                          |
| The draft's introduction used three new words in one sentence.                                                               | Fixed. It is four numbered steps.                                                                               |
| Pin was unexplained.                                                                                                         | Fixed. The line above the findings says what it does.                                                           |
| A blank editor gave no pointer to the documentation.                                                                         | Fixed. A line above a blank editor names the Documentation tab.                                                 |
| "1 claim(s) are not yet supported".                                                                                          | Fixed.                                                                                                          |
| The clerk's note on a repeated field did not name the glossary entry.                                                        | Fixed. It names the entry for an alias.                                                                         |
| The debrief laid out the player's queries one field to a line while the reference was compact, and dropped the word `query`. | Fixed in part. Only a request typed on one line is laid out, and the debrief says the leading word is optional. |
| The variables starter did not explain the declaration.                                                                       | Fixed. Its comment points to the first line and the glossary entry, which now says where the type comes from.   |
| The Registrar's Return debrief text disagreed with the reference shown.                                                      | Fixed.                                                                                                          |
| Reference variables were printed without spaces.                                                                             | Fixed.                                                                                                          |
| The variables concept card left out the JSON.                                                                                | Fixed.                                                                                                          |
| Assessments below the player's clearance still read "Placement: attempt it to skip ahead".                                   | Fixed. They read as optional.                                                                                   |
| The final debrief had no pointer to what to do next.                                                                         | Fixed. It says unplayed cases remain open.                                                                      |
| `Company.director` had no description.                                                                                       | Fixed.                                                                                                          |
| The documentation's sections were collapsed again after travel.                                                              | Fixed.                                                                                                          |
| A returned request is not mentioned in the debrief.                                                                          | Logged. Returned requests are not recorded; only transmissions are.                                             |
| The "Country last seen in" list offers every country the results contained.                                                  | Logged. The list is everything retrieved, which is the rule for every such list.                                |
| With a draft open, rows about other records offer to cite into it.                                                           | Logged. A stray citation is flagged as bearing on no claim.                                                     |
| The dispatch after travel appears in the draft panel and in the Case tab.                                                    | Logged. One is the notice, the other the record.                                                                |
| `name` and `id` are described only as "A plain value."                                                                       | Logged.                                                                                                         |
| A red mark appeared briefly under the first character while typing.                                                          | Logged. Seen twice, never with a message. The editor checks the text as it is typed.                            |

## Caveats

- No walkthrough has been run after this last batch of fixes. The automated
  tests pass on it, and the changed screens were checked by hand.
- No persona took a hint in any run, so the hint text has not been read by a
  walkthrough.
- Both personas found these cases easy. That may be the agents and not the
  cases. It is a question for sessions with people.
