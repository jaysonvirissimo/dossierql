# Novice walkthrough of The Quiet Consignee, 22 November 2026

**Build:** commit `ee220ad` with the re-authored case (see the
[clean-room report](clean-room-quiet-consignee-2026-11-22.md)) · **Agent:**
general-purpose, told to use only the browser tools on one page

The run followed [novice-walkthrough.md](../novice-walkthrough.md) over _The
Quiet Consignee_, the case that introduces field checks. The persona had
played the first three cases. The agent was also asked to say, for each button
on the form, what it expected the button to do and what it did.

## Preflight

Azulejos, the Borrowed Chronometer and the Guest Register were seeded as
completed. The header showed Clearance 2, and the desk showed 3 of 10 cases
resolved.

## Result

| Case                | Solved | Transmissions (reference) | Field checks | Hints | Solution viewed | Hours left | Mode          |
| ------------------- | ------ | ------------------------- | ------------ | ----- | --------------- | ---------- | ------------- |
| The Quiet Consignee | yes    | 3 (1)                     | 1, 2 hours   | 0     | no              | 13 of 18   | independently |

The field check came up as intended:

1. The first query asked for the shipment. The consignee came back empty and
   the shipper was Meridian Forwarding.
2. The second query asked for `company(name: "Meridian Freight")`. The agent
   opened the company as a lead and cited its director.
3. One claim was supported and one was not, and the form offered "Order a field
   check (2 hours)". The agent ordered it.
4. The dispatch said that the depot's intake record names the receiver. The
   third query asked for the intake record, and the agent cited its consignee
   and submitted.

The agent's account: "the dispatch named the intake record, and the next query
turned up Meridian Freight exactly where it said." Each button did what the
agent expected it to do before it pressed it.

## Findings

| #   | Where                | Finding                                                                                                                                 | Outcome                                                                                                                                                                                                        |
| --- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | "Open a lead"        | The accessibility snapshot marks the options as disabled.                                                                               | No change. This comes from the snapshot tool (clean-room report, finding 4).                                                                                                                                   |
| 2   | Briefing             | The field-check paragraph was one long hypothetical, and it did not say why a player would want a check.                                | Fixed. The paragraph now starts from the situation the player will be in: you find who directs a company before you find a record that shows it is to receive the cases. It names the button and what it does. |
| 3   | Form, dispatch       | The dispatch leaves the form after the next transmission. It is kept in the Case tab, and nothing says so.                              | Logged. The Case tab's list of dispatches is the record. Watch for this in the beginner sessions.                                                                                                              |
| 4   | Case tab, Dispatches | The heading read "Field check · PE-MERIDIAN-FRT", a record id the player never sees anywhere else.                                      | Fixed. A dispatch's heading gives the lead's name as the findings show it: "Field check · Meridian Freight · 2 hours". A shipment, which has no name, still shows its id.                                      |
| 5   | Debrief              | The comparison said the reference opens the shipper, and did not say why.                                                               | Fixed. It now says that the shipper and its director show which company sent the cases and which operative is not the one to identify.                                                                         |
| 6   | Debrief              | The comparison said "A field check … would have pointed to the same intake record", which read wrongly to a player who had ordered one. | Fixed. It now reads "points to the same intake record, for two hours", which is true whether or not the player ordered one. The debrief does not yet read what the player did (Milestone 5 task 9).            |
| 7   | Documentation        | Nothing before the field check says that the intake record names the receiver.                                                          | No change. That is the gap the field check fills. The clean-room agent found the record by reading the documentation.                                                                                          |

## Re-run of the fixes

A second novice agent played the case on a fresh save. It solved the case the
same way, with one field check, 3 transmissions and 13 of 18 hours left. It was
asked about each place that had changed.

| Place                      | Verdict                                                                                                                                                                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Briefing, field-check text | Clear, and play matched it step by step. The terminal's note "The form is blank" used "form" for the editor, while the briefing uses it for the deduction. Fixed: the note now says "The editor is blank".                                                                           |
| Dispatch and its heading   | Clear: "Field check · Meridian Freight · 2 hours". The dispatch names the record to look at without giving the answer.                                                                                                                                                               |
| Debrief comparison         | Partly clear. "`consignee` comes back as `null`" did not say whose query it meant, and the findings show "nothing returned", not `null`. Fixed: the debrief now says that a query asking for the shipment's consignee gets nothing back, and that the reference does not ask for it. |

It reported these points as well. All are logged:

- A claim waits on "Choose 'Director' above first" after its row is cited. The
  prompt says what to do.
- The debrief describes the reference and not which of the player's queries
  could have been left out. Milestone 5 task 9 replaces the debrief's reading
  of the player's queries.

## Pattern-matching

None reported. The agent chose which row to cite by picking the deepest one,
because the form says that a nested citation carries the rows above it.

## Caveats

- The reader is a model playing a novice, and it read the documentation before
  its first query. A beginner may need more transmissions to reach the
  company's director.
- The field check on Meridian Forwarding, ruling out the sender, wrong
  submissions and hints were not tried.
- The last two debrief fixes and the terminal note were checked in the build
  and the tests, not by another agent run.
