# Clean-room solve: The Vanishing Azulejos

**Date:** 2026-11-20 · **Build:** commit `8eee5cd` · **Agent:** browser-only, no repository access

## Preflight

Clearance 1. The case was not marked completed or in progress.

## Outcome

Solved, stamp HOLD ISSUED. Two transmissions, 21 of 27 hours left, recorded
as completed independently. No hint taken, and the Hints tab never opened.

## How it was solved

Every field name came from the starter queries and the Documentation tab.
The agent sent one nested query per stage. In Lisbon it added the customs
inspection to the starter and cited the inspection finding and the border
chain. In Luanda it asked for the intake record, both transfer orders and
the authorization log, and cited the order's consignee, the intake
consignee and the signer.

Outside knowledge used: only that a query may be written on one line.

## Findings

| #   | Finding                                                                                            | Action                                                                                                                                     |
| --- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Cite buttons had ambiguous labels: two "Cite name" per shipment, two "Cite id" per order.          | Fixed. A button's label now names the whole chain it attaches, such as "Cite destination → country → name".                                |
| 2   | The label's "for LIS-0417" meant the record before a draft opened and the target draft afterwards. | Fixed. The label now reads "into the draft for …".                                                                                         |
| 3   | The cite status line from Lisbon was still showing after the first Luanda transmission.            | Fixed. The status is cleared with each new response.                                                                                       |
| 4   | The debrief's explanation covered only the Lisbon stage.                                           | Fixed. The comparison text now covers Luanda.                                                                                              |
| 5   | Several types had no description in the Documentation tab.                                         | Fixed. Every type has one.                                                                                                                 |
| 6   | The "Open a lead" options were reported as disabled in the accessibility snapshot.                 | Logged. The browser tests select from this control by keyboard and it works. It appears to be how the snapshot tool reports a closed list. |
| 7   | It is not shown which citation satisfied which claim.                                              | Logged. Saying which fact a claim still needs would give away the evidence route. The claim does say when a name must be chosen first.     |
| 8   | The "For shipment" list in Luanda offers shipments from the Lisbon stage.                          | Logged. The list holds every shipment the player has retrieved, which is the rule everywhere else.                                         |
| 9   | A row for a nested record repeats the record's name on the row beneath.                            | Logged. Minor; the row above is the link and the row beneath is the field.                                                                 |

## Caveats

- The agent already knew GraphQL. The run shows that the on-screen material
  is sufficient, not that a beginner would find the nesting syntax.
- Not exercised: error notes, field checks, ruling out, wrong submissions,
  the deadline, hints, the map, dossiers and the evidence ledger.
- The agent asked for more than the reference solution in both stages, so
  the run does not show the leanest route.
