# Three Couriers chase prototype: novice walkthrough and decision check

This run tests the Milestone 18 prototype in _Three Couriers_:

- Rule out from the case board.
- The quarry left unnamed in the Dossiers tab during stage 1.
- Choosing a lead from the map.
- The Lilongwe field check, drawn as a visit.
- The closing scene.

It answers whether the player can say why they chose a city, what they
risked, and what made them want to follow the courier.

## Session

One agent played the [novice walkthrough](../novice-walkthrough.md) with the
_Three Couriers_ part of the [decision check](../decision-check.md), with the
two field-check questions added for this run. It played the local build in
Chromium, from a save seeded with `quiet-consignee` at clearance 3. It
operated the page only.

| Case             | Solved |     Transmissions | Hints | Solution viewed | Hours left |
| ---------------- | ------ | ----------------: | ----: | --------------- | ---------: |
| _Three Couriers_ | Yes    | 4 (3 + P. Okello) |     0 | No              |   19 of 26 |

Every query worked the first time. The lookup of P. Okello from a blank
editor worked the first time, and found SABLE_IBIS.

## The decision

The player chose Lusaka for stated reasons, and each reason came from a
response:

- **Lusaka.** The border clue and the code ZMW, both from the second
  transmission.
- **Moroni dropped.** The Comoros border no one, and the watcher's note says
  the traveller came off a ferry.
- **Lilongwe dropped.** The kwacha with the code MWK. The player named this
  decoy as the moment they remembered best.

The player ruled out both wrong sightings from their cards on the case board.
The map confirmed the choice and did not change it. The player saw the field
check on the Lilongwe card, at 2 hours beside 1 hour for a query, and did not
order one. Their query had already settled Lilongwe, and nothing said what a
check would show.

The player felt the case as a chase for one step. It stopped feeling like one
at the arrival in Lusaka, where the courier drops out of the story. With 24
hours left and a cheap query that settled the question, they never felt
pressure.

## Findings

1. **Ruling out from the board moved the form to the ruled-out lead.**
   _Fixed._ Ruling out or checking a lead from the board now leaves the form
   on the lead the player has open (`withDraft` in `src/engine/mission.ts`,
   tested in `src/engine/mission.test.ts`).
2. **The card did not say what a field check does.** _Fixed._ The card now
   says that a field check sends someone to the place to report on the lead
   while the player stays at the desk.
3. **"its known associates" could mean the file or the courier.** _Fixed_
   in the stage 1 clue.
4. **The Travel button shows no price until the country is chosen.**
   _Logged._ This is deliberate. The price of the expected journey would give
   the answer away (SDD 3.5). The cards and the map show each lead's journey.
5. **The glossary shows terms above the player's clearance.** _Logged._ The
   manual opens at the linked entry (commit `5635400`). The glossary is
   reference material and is available from the start (SDD 3.10).
6. **"One line of GREY_PETREL's file, the handler, is classified" made the
   player wonder whether to ask for it.** _Logged._ It is a hook for the
   clearance 12 cases, and the archive refuses the field at no cost.
7. **The desk showed one case resolved, although the persona had played
   four.** _Not a finding._ The seed is a placement pass, as the README says.

## What the prototype shows

- Removing the paperwork worked. The board's Rule out and the unnamed
  quarry drew no complaint. The player called the pace quick and said
  "nothing felt like a chore".
- The field check did not become a decision. A player who asks for borders
  and currency together settles Lilongwe with one transmission and never
  needs the visit. The visit is reachable only by a player who asks for
  less. Making it a real choice would need a clue that a query cannot settle
  cheaply, or a deadline tight enough that 2 hours against 1 matters. Both
  belong with the branching investigations listed after 1.0, and with the
  clock tuning that waits for sessions with people (SDD 3.3).
- The chase ends at the first arrival. The proposed extra stop with a trace
  of the quarry at each stop (SDD Milestone 18, proposed) answers this, and
  should be prototyped next.

## Caveats

- One agent played one case. It knows GraphQL, although it played a persona
  who does not.
- It did not order the field check, so this run does not show how the visit
  reads. `e2e/pursuit.spec.ts` checks that the visit is drawn and that the
  player stays in Tanzania.
- It made no syntax errors, and so did not test how the game handles
  mistakes.
