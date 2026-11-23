# Novice walkthrough of clearance 2, 22 November 2026

**Build:** commit `0c2e110` with the Guest Register refutation fix (clean-room
report, finding 1) · **Agent:** general-purpose, told to use only the browser
tools on one page

The run followed [novice-walkthrough.md](../novice-walkthrough.md) over _The
Guest Register_ and _The Quiet Consignee_. These cases bring in ruling out and
the field check (SDD 3.15). The agent was also asked to say what was new in
each stage.

## Preflight

Clearance 2. Azulejos and the Borrowed Chronometer were seeded as completed,
so the desk showed 2 of 10 cases resolved. The Guest Register was marked "Next
in the story". The Quiet Consignee was in the closed placement group, because
the Guest Register was not yet resolved. The agent reached it from the Guest
Register's debrief.

## Result

| Case                | Solved | Transmissions (reference) | Hints | Solution viewed | Hours left | Mode          |
| ------------------- | ------ | ------------------------- | ----- | --------------- | ---------- | ------------- |
| The Guest Register  | yes    | 2 (2)                     | 0     | no              | 21 of 26   | independently |
| The Quiet Consignee | yes    | 1 (1)                     | 0     | no              | 17 of 18   | independently |

The agent ruled out SGT-034 and did not try SGT-027. The scoped re-run below
tests ruling out SGT-027 after the fix.

## Findings

| #   | Where                            | Finding                                                                                                                                           | Outcome                                                                                                                                                                                                                                                                                              |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Guest Register, stage 1, starter | The starter already holds `operative(codename: "")`, so the player only types a codename. The player never builds the argument.                   | Logged. This is the guided scaffold level of a teaching case (SDD 3.9). The level 2 assessment then asks for the argument with a blank editor, and the agent wrote `shipment(id: "VAL-0733")` there from the documentation.                                                                          |
| 2   | Guest Register, stage 2          | The look-alike cover name the briefing promises never appears.                                                                                    | Fixed. The debrief now identifies D. Lund and says the argument must match exactly. Clean-room report, finding 7.                                                                                                                                                                                    |
| 3   | Guest Register, debrief          | The reference puts `coverName(...)` and `city(...)` side by side in one query, which the case never showed.                                       | Logged. The debrief says so plainly: "the reference solution asks for two things directly inside the outer braces of one query". The player's own query does not need it.                                                                                                                            |
| 4   | Quiet Consignee, briefing        | The briefing explains the field check at length, and the case never needs one: one query supports both claims.                                    | Logged, open. The clean-room run found the same thing (finding 8). The case that introduces a mechanic should make the player want to use it. This needs the case re-authored so that one claim cannot be supported at first. Decide after the beginner round, which plays only the first two cases. |
| 5   | Both, "Open a lead"              | The list went back to its placeholder after a lead was chosen.                                                                                    | Fixed. The list now shows the open lead.                                                                                                                                                                                                                                                             |
| 6   | Documentation                    | `Sighting.city`, `City.country`, `Country.languages`, `Shipment.destination` and other fields that hold a record had no description of their own. | Fixed. Every field in the schema now has a description. Each record field also says whether it returns one record or a list.                                                                                                                                                                         |
| 7   | Quiet Consignee                  | "The company that is to receive the goods", in the description of `consignee`, tells the player which company to choose.                          | Logged. The case tests writing the argument and the nesting with a blank editor, not reading a trap. The sender, Meridian Forwarding, is a plausible lead for a player who does not read the documentation.                                                                                          |
| 8   | Quiet Consignee, argument        | The documentation shows quotes for text, and the player copied them for an `ID` without being told to.                                            | Fixed after the re-runs. The Documentation tab now says that an `ID` is written in double quotes, like text.                                                                                                                                                                                         |

## Re-run of the Guest Register

A second novice agent played _The Guest Register_ after the refutation fix. It
was told to rule out both wrong sightings before sending the travel order. It
solved the case in 2 transmissions, with 21 of 26 hours left and no hints.

- **SGT-027:** the agent cited the sighting's name, H. Brandt. The form said
  the claim needed more facts that connect. The agent then cited NIGHTJAR's
  complete list of cover names. The claim showed as contradicted, and the
  agent ruled the lead out at no cost.
- **SGT-034:** the agent cited the chain from the city to the country's
  languages. The claim showed as contradicted, and the agent ruled the lead
  out at no cost.
- **The debrief:** the agent found the comparison clear, including the
  look-alike D. Lund.

It reported these new points. All are logged:

- "Choose 'Country of the sighting' above first" reads as if it applied to
  ruling out, and it does not. A contradiction needs no country.
- When a citation is part of the evidence but not enough, the form does not
  say which fact is missing. SDD 3.2 and section 11 keep that prompt until
  after 1.0, unless the beginner sessions show that the draft needs it.
- The lists of fields that are "Not yet opened" on a record read as warnings.
- The debrief does not say why the reference proves the sighting in Zanzibar
  City from the city, when the player proved it from the cover name. Both
  ways are accepted.

## Pattern-matching

None reported. The `shipment(id: "VAL-0733")` argument was partly copied from
the shape of `operative(codename: "NIGHTJAR")`.

## Caveats

- The reader is a model playing a novice, and it read the documentation before
  every query. It found both cases easy.
- No malformed request, hint, or wrong submission was tried.
- Ruling out SGT-027 was not tried in this run. It was tried in the scoped
  re-run.
