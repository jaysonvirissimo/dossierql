# Three Couriers, after the early pursuit, 24 November 2026

**Build:** Milestone 17, part two (uncommitted, on `7e65a3a`) · **Agents:** two
fresh osp-site-tester runs, each on its own isolated browser page · **Seed:**
`quiet-consignee`, clearance 3

The runs were a clean-room solve and a novice walkthrough with the
[decision check](../decision-check.md#decision-check-three-couriers).

## Result

| Run                | Solved | Transmissions                                    | Hints | Solution viewed | Hours left | Mode        |
| ------------------ | ------ | ------------------------------------------------ | ----- | --------------- | ---------- | ----------- |
| Clean-room solve   | Yes    | 3                                                | 0     | No              | 20 of 26   | independent |
| Novice walkthrough | Yes    | 4 (one the P. Okello lookup) and 1 returned free | 0     | No              | 19 of 26   | independent |

## The choice of city

The walkthrough agent chose Zambia for two facts in the Results panel:

- Zambia's currency has the code ZMW, the code on the bureau's receipt;
- Tanzania is in Zambia's list of borders.

It dropped Lilongwe because Malawi's code came back MWK, "even though Malawi
borders Tanzania and the watcher said they paid in kwacha". It dropped Moroni
because the Comoros came back with no borders. The case board repeated the
facts, and the map did not change the choice. The kwacha kept two leads in
contention until a retrieved fact separated them, as SDD 5.6 asks.

## The lookup from a blank editor

`query { coverName(name: "P. Okello") { name operative { codename } } }`,
typed once, worked the first time, and found SABLE_IBIS.

## Findings

1. **The currency chain stopped one fact short.** _Fixed._ The claim and the
   refutation rested on the currency record, so the chain ended at "currency:
   Zambian kwacha" and never showed the code ZMW that the clue turns on. Both
   now rest on the currency's `code`.
2. **The Travel button quoted a price before any country was chosen.**
   _Fixed as a rule for every case._ With the country box blank, the button
   was priced to the next stage's country, which is the answer. A player who
   compared it with the lead cards could tell which lead was true. The
   button now shows no price until the form gives a country (SDD 3.5), and
   the e2e test checks it.
3. **"Rule it out on its own form" read as another form.** _Fixed as a rule._
   The hold now says "Choose it in the “Sighting” box and press Rule out",
   using the lead box's own label.
4. **The second stage's starter comment was vague.** _Fixed._ It now says
   that the form asks about the country's borders and its currency's code.
5. **The briefing promised to catch up with the courier, and the case never
   does.** _Fixed._ The briefing now says to follow the courier, who is
   carrying the payment. The courier staying at large is the design of SDD
   3.4. The walkthrough found the one leg a chase, "softened by the M note".
6. **The briefing said "see alias in the Glossary", and the link opens the
   Tradecraft manual.** _Fixed in this briefing._ It now says "read the entry
   for alias". _Logged:_ the walkthrough landed at the top of the manual,
   not at the entry. That is how every glossary link behaves, and it needs a
   change to the manual route of its own.
7. **The clerk quotes the engine's sentence above its own note for a field
   asked twice.** _Logged._ The note was clear and the walkthrough learned
   from it, so the order is left as it is.
8. **Options in the form's boxes are exposed as disabled to the
   accessibility tree, yet can be chosen.** _Logged._ Both agents reported
   it. It needs a check with a screen reader before any change.
9. **The map was cropped in the narrow panel.** _Logged._ The map is not the
   subject of this milestone.
10. **The deductions in stages 1 and 3 accept the form with rivals open, and
    the travel order does not.** _No change._ Only a stage that lists its
    `leads` waits for the others to be ruled out (SDD 3.5), and only the
    travel stage lists them.

## Caveats

- Two AI agents, one in a persona. Both knew GraphQL and set it aside.
- Hints, wrong submissions, field checks, and the deadline were not
  exercised. The field check and the query beside it are covered by the e2e
  test of _The Bound Ledgers_, not by these runs.
