# Novice walkthrough: The Guest Register, after Milestone 15 (2026-11-24)

Milestone 15 asks for a novice walkthrough of one case with a destination
stage (SDD 11). This run used _The Guest Register_: its first stage ends in a
journey from Luanda to Zanzibar City, and it runs a clock, so it shows the
new arrival scene, the clock's count and the dispatch's slide.

## Setup

- Build served by `e2e/serve-subpath.ts`, in a fresh isolated browser
  context. The save was seeded with a pass of `borrowed-chronometer`, and the
  header showed Clearance 2 before the page was handed over.
- Prompt: `novice-walkthrough.md`, unchanged. Prior play: _The Vanishing
  Azulejos_ and _The Borrowed Chronometer_.
- After the report, one follow-up question, answered from memory without
  operating the page: where did you land, what was the place like, and did
  anything move or get in the way?

## Result

| Case               | Solved | Transmissions | Hints | Solution viewed | Hours left | Mode                         |
| ------------------ | ------ | ------------- | ----- | --------------- | ---------- | ---------------------------- |
| The Guest Register | Yes    | 2             | 0     | No              | 21 of 26   | independently, with no hints |

**The success criterion is met.** From memory, the runner gave the arrival
almost word for word: the ferry into the harbour past wooden sailing boats,
the old town in white stone with carved wooden doors, and the register with a
pot of tea. It also noted that the location in the header changed from Angola
to Tanzania. It reported that nothing that moved got in the way of reading or
typing.

## Findings

1. **Fixed: the clock's count reached assistive technology.** The runner's
   accessibility tree showed a second, older figure beside the hours left
   ("25" with "26"). CSS generated content is in the accessibility tree, and
   Chrome ignored empty alt text on it. The count is now drawn on a child
   element marked `aria-hidden`, and the status reads only the true figure
   while the count plays (checked in Chrome's accessibility tree).
2. **Not reproduced: every option reported as disabled.** In the same tree,
   only the placeholder option ("No shipment retrieved yet") is disabled; the
   tool marks every option `disableable`. Logged, no change.
3. **Fixed afterwards: closing braces pile up at the end.** Typing a query
   in pieces left `sightings` inside `coverNames`: the runner never typed
   the brace that closes `coverNames`, and the one the editor had added was
   further down, so the query was valid and drew no note. The editor now
   draws a faint guide for each block a line is inside, and the line under
   the terminal says that the editor adds each closing brace and how to
   step past it.
4. **Logged: the look-alike to Dr. Lund never appears.** The stage 2 briefing
   warns of two cover names a hurried clerk could misread, but an exact
   argument returns only the right one, so the Rule out button has nothing to
   work on. Pre-existing content in a case outside this milestone; for the
   next revision of _The Guest Register_.
5. **Logged: the starter supplies the argument's shape.** Stage 1's starter
   holds `operative(codename: "")`, so the player fills a blank. Stage 2 has
   the blank editor, and the runner wrote an argument there from the
   Documentation. Working as designed (SDD 5.6, "Say what to change").
6. **Logged: two root fields first appear in the debrief.** The runner met
   the reference solution's pair of root fields only in the debrief, which
   explains it clearly. No change.
7. **Logged: "Not yet opened on this city" reads as noise.** Pre-existing
   wording in the findings; for the next review of the Results panel.

## Caveats

- An agent read the page through text captures and still screenshots. It did
  not watch the animations play, so this run does not show whether they
  distract a player. `e2e/motion.spec.ts` checks that typing works while they
  play and that none plays when motion is reduced.
- The runner did not open the Map tab, so it did not see the route drawn.
  `e2e/azulejos.spec.ts` checks that the route is drawn and listed as text.
- One case and one persona, played by a model that already knows GraphQL.
