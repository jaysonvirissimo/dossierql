# Clean-room solve of The Quiet Consignee, 22 November 2026

**Build:** commit `ee220ad` with the re-authored case below · **Agent:**
general-purpose, told to use only the browser tools on one page, in a fresh
browser context

The run followed [clean-room-solve.md](../clean-room-solve.md). _The Quiet
Consignee_ introduces field checks (SDD 3.15). The earlier runs found that its
one query supported both claims at once, so no field check was ever offered
([clean-room-opening-2026-11-22.md](clean-room-opening-2026-11-22.md), finding
8).

The case was re-authored before this run:

- VAL-0733's shipping papers name the sender and leave the consignee blank.
- The depot in Callao wrote an intake record and an unloading receipt when the
  cases came ashore. Both give Meridian Freight.
- The briefing gives both company names.
- A player who looks up a company by its name can support who directs it, and
  cannot yet show that it is to receive the cases. The form then offers a field
  check, and the check's dispatch points to the intake record.

## Preflight

Azulejos, the Borrowed Chronometer and the Guest Register were seeded as
completed. The header showed Clearance 2, and the case was marked "Next in the
story".

## Result

| Case                | Stamp | Transmissions (reference) | Hours left | Mode          |
| ------------------- | ----- | ------------------------- | ---------- | ------------- |
| The Quiet Consignee | HELD  | 2 (1)                     | 16 of 18   | independently |

No hint was taken and no solution was viewed.

The agent found `intake` and `unloadingReceipt` without a field check. It found
them in the documentation and in the shipment's "Not yet opened" list. It
cited the intake record's consignee and that consignee's director. A player who
knows GraphQL can still solve the case without the new mechanic, as SDD 3.5
allows.

The agent used outside knowledge in one place: it put several fields side by
side in one query, nested several levels deep.

## Findings

| #   | Where          | Finding                                                                                                             | Outcome                                                                                                                               |
| --- | -------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Results        | `transferOrders` reads as a likely place for the receiver, and VAL-0733 has none.                                   | No change. It is a fair dead end. The field check, the hints and the "Not yet opened" list each lead to `intake`.                     |
| 2   | Briefing       | The field-check paragraph describes a state of the form before the player has seen one.                             | Fixed. See the novice report, finding 2.                                                                                              |
| 3   | Findings, Cite | Rows that are about no company say "into the draft for Meridian Freight".                                           | Logged. This is the same as the opening report's finding 9.                                                                           |
| 4   | "Open a lead"  | The accessibility snapshot marks every option as disabled.                                                          | No change. The snapshot tool reads a closed `<select>` this way, and the options are enabled in the page (opening report, finding 2). |
| 5   | Debrief        | (Found while checking the run.) The line above the comparison read "The reference solution sends 1.", with no noun. | Fixed. It now reads "sends 1 transmission".                                                                                           |

## Caveats

- The agent knows GraphQL. The run shows that the case can be solved from the
  screen. It does not show that a beginner will think to look at the intake
  record. The novice walkthrough tests that.
- No field check, wrong submission or hint was tried in this run.
