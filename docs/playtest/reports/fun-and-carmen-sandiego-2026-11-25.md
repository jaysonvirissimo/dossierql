# DossierQL fun and Carmen Sandiego playtest

The chase worked best when a clue gave me a reason to go somewhere and the
arrival showed what the quarry had done just before I got there. The
Valletta search in _The Handler’s Road_ was the strongest example. The
weakest moments came when I already knew what to do and still had to clear
each decoy through a form or find a record again in a dropdown.

## Sessions

I played the local Chromium build at `db08d80`, at a 1280 × 900 viewport. I
completed the first Training Range drill and the opening case from a fresh
save. For each later case I used a fresh profile and seeded one assessment
pass to reach the needed clearance. I entered queries and operated the
visible controls. I deliberately tried some weak leads, incomplete evidence,
and alternative approaches. No case used hints.

| Case                     | Outcome              | Transmissions in debrief | Hours left |
| ------------------------ | -------------------- | -----------------------: | ---------: |
| _The Vanishing Azulejos_ | Hold issued          |                        4 |    Untimed |
| _The Guest Register_     | Operative identified |                        4 |   19 of 26 |
| _Three Couriers_         | Payment stopped      |                        3 |   20 of 26 |
| _The Handler’s Road_     | Quarry detained      |                        9 |   29 of 45 |

The results describe four sampled cases and one drill. I already knew
GraphQL and used placement saves, so the sessions give neither a beginner
timing benchmark nor a measure of how the full campaign builds momentum. I
did not evaluate audio, mobile play, or deadline expiry.

## What worked

- **Both clues did real work.** In Lisbon, the manifest ruled out slate,
  then the Namibian border clue separated two otherwise identical ceramic
  shipments. Side by side made the comparison easy. Praia’s harbourmaster
  joking about the truck that could drive from an island made the geography
  stick. In _Three Couriers_, both Zambia and Malawi use a kwacha, so the
  currency code settled a plausible false lead.
- **Arrivals changed the investigation.** The replacement label in Luanda
  led to a new suspect. In Lusaka the courier had just left the bank, and in
  Tangier the porter remembered exactly what the quarry said. Both scenes
  gave the missed encounter a specific place, person, and next action.
- **Syntax had a consequence in the story.** In Tangier, quoting the porter
  accurately supported the search. In Valletta, the routine search found a
  cleaned room, while an urgent search of the watched premises recovered a
  ticket to Trieste. The ticket made a GraphQL input choice feel like a
  decision about the chase.

## Where the fun dropped

1. **The dossier gives away the courier.** Open Dossiers in _Three
   Couriers_ before transmitting anything. It labels GREY_PETREL “THE
   QUARRY” while the objective still asks which of three couriers took the
   payment. The organization and acquaintance clues make a good two-part
   deduction. Show an unconfirmed set of candidates until the player
   establishes which one is the quarry.
2. **Required eliminations sometimes turn deductions into errands.** In
   _The Guest Register_, the Zanzibar hotel’s note explicitly identified
   Dr. Lund as the dinner guest. I still had to look up D. Lund separately
   and select Rule out before filing the deduction. In _Three Couriers_, I
   could see why Lilongwe and Moroni failed in one comparison, then had to
   select and rule out both through the form before I could travel. Let
   players record exclusions from the comparison or lead card. Once a case
   has taught refutation, consider requiring it only when the story makes
   clearing every lead matter.
3. **Results and forms use different handles for the same clue.** The
   Lisbon boarding-house search in _The Handler’s Road_ showed a vivid find
   with Moroccan dirhams under “FIND Entry 1.” The travel form called it
   “find 1, not yet identified.” The Tangier destination list had 26
   countries after the Spanish-language decoy and prior finds were included.
   Carry the descriptive find label into the form and group destinations
   tied to the current lead above the other retrieved countries. The archive
   can still demand the same evidence.
4. **The next clue competes with the previous paperwork.** After the
   Zanzibar and Tangier arrivals, the new briefing, earlier dispatches,
   proof chains, results and current form all shared the workspace. In
   _The Guest Register_, the prose filled the visible Case pane before I
   reached the clues and lead cards. Put the current dispatch and the
   player’s next choice together near the top, with the older dispatches
   and full proof available on demand. On the first new save, make it easy
   to open the tile theft immediately and take the terminal drill when the
   case creates a reason to use it.
5. **The clock is readable but rarely forced a choice in these runs.** In
   _Three Couriers_, travel stayed disabled until the alternate sightings
   were ruled out. In _The Handler’s Road_, a Spain travel order based on
   the decoy newspaper came back with an evidence explanation while I stayed
   in Tangier. These safeguards made room to learn, but they gave me little
   reason to weigh a risky lead against another archive request. The
   remaining hours describe my runs and are weak evidence for changing
   budgets.

## What would make it feel more like Carmen Sandiego

The 1985 game combined a theft, geographic clues, a clock, wrong turns that
sent the detective back, and a suspect warrant at the final destination.
Players could use an almanac to reason about the next stop. [The Strong
National Museum of Play’s account of the original game](https://www.museumofplay.org/games/where-in-the-world-is-carmen-sandiego/).

- **Make the map part of the decision.** The _Three Couriers_ map already
  shows Lusaka, Lilongwe, Moroni, and their prices before a transmission.
  Let a pin open its lead, show the player’s evidence and suggested travel
  cost together, and fill the travel draft. Keep the decision to depart in
  the player’s hands. In the opening case, the map listed every returned
  border country alongside shipment destinations, so show those two roles
  distinctly. Offer a small almanac for facts such as shared borders,
  language, and currency. Let players use it to form a theory and use
  GraphQL to establish the evidence for a formal order.
- **Prototype one playable wrong turn.** Try it in an early travel case
  after the guided opening. Offer a short, priced visit to a plausible
  alternate city, with a local witness or physical clue and a clear route
  back. For example, the Lilongwe witness could show why the kwacha receipt
  was convincing and what distinguishes it from the courier’s. Evaluate
  whether players actually weigh the visit against another transmission.
- **Let the route and the suspect develop together.** Give an earlier case
  one extra hop and reveal cover names or habits across its stops. Show
  which clues apply to the next city and which narrow the dossier. Let
  physical clues carry local details, as the dirhams, Maltese newspaper and
  Trieste ticket already do. The campaign has a recurring network and the
  letter signed M. Use those recurring traces to give individual pursuits
  a payoff and make the next assignment worth opening.
- **Give the warrant its own beat.** The Trieste arrest gets a satisfying
  scene and a strong hook in the debrief, but the successful transmission
  goes straight to that page. Give the arrest and recovered evidence a
  short moment of their own before comparing queries. An arrival can do
  the same with one sight, one witness, and the indication that the quarry
  just left. The existing paper-and-terminal presentation can carry both.

First fix the dossier spoiler and shorten the path from comparing evidence
to acting on it. Then test the map and one recoverable detour in a single
early pursuit. The playtest question is whether the player can explain why
they picked a city, what they were risking, and what made them want to
follow the trail.
