# Novice walkthrough: The Vanishing Azulejos, forms the archive checks

Date: 2026-11-23. The run used the prompt in `../novice-walkthrough.md`, on a
local build of the change that replaces Cite with forms the archive checks
(SDD Milestone 12). It was one simulated run, with no prior play.

## Outcome

| Case                   | Solved           | Transmissions    | Hints | Solution viewed | Mode        |
| ---------------------- | ---------------- | ---------------- | ----- | --------------- | ----------- |
| The Vanishing Azulejos | Yes, HOLD ISSUED | 5 (reference: 3) | 0     | No              | independent |

The archive returned the form twice.

- **Stage 2, after a query that reached only the destination city.** The
  form came back with "Your responses connect LIS-0522 to Praia. They hold
  no fact that completes this claim." The reader extended the query and
  passed.
- **Stage 3, Travel with a blank country box.** The form was refused as
  incomplete.

The reader said the returned form showed how far the evidence reached
without saying whether the choice was right or which field to ask for. They
called the accepted evidence chain, with its "Source: transmission N"
buttons, "the clearest moment in the case".

## Findings

1. **The stage 2 starter comment pointed at one step short of the claim.**
   It said only to add the field for where each shipment is going.
   **Fixed:** the comment now says that the claim is about the destination's
   country and that country's borders.
2. **A blank-box refusal did not say which box.** **Fixed:** the refusal now
   gives the box's label, as in "Choose a record for “Country receiving the
   shipment”."
3. **The returned form could name the missing kind of fact**, such as "no
   fact links Praia to a country". **Logged, not changed.** Naming the missing
   link gives away the evidence route, which SDD 3.2 reserves for the hints
   at their price. The reader found `City.country` in the Documentation tab
   in about a minute.
4. **The evidence chain credits the first transmission that returned a fact.**
   **Logged, not changed.** That is the intended "original response". It did
   not confuse the reader.
5. **The debrief mentioned the word `mutation` at clearance 1.** This was
   there before this change. **Fixed:** the sentence now appears only from
   the clearance at which the glossary introduces "mutation".
6. **The clue preamble ("Each clue is a fact about the shipment you are to
   identify") reads oddly above clues about all three shipments.** This was
   there before this change. **Logged** for a separate change, because the
   preamble is shared by every case.
7. **The Documentation intro is dense, and the "Not yet opened" lines are
   unexplained in Side by side.** These were there before this change.
   **Logged** for a separate change.
8. **The two signature fields on a transfer order looked like a trust
   puzzle.** **Logged.** Both fields support the claim by design (two
   evidence routes, SDD 5.6). A case in which the two disagree would be a
   use for citing by hand.
9. **The editor scaffold replaces the query between stages.** This was
   there before this change. **Logged:** earlier responses stay under
   "Earlier".

## Caveats

- One simulated reader, at AI reading speed.
- No hints were taken, and the run tried no wrong choice in stages 1 and 4.
- The case has no clock, so this run says nothing about returned forms in a
  timed case.
