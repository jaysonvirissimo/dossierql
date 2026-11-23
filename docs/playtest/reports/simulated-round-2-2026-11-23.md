# Simulated beginner sessions · Round 2 · 2026-11-23

[P1 · Front-end developer](simulated-round-2-p1-2026-11-23.md) · [P2 · Data analyst](simulated-round-2-p2-2026-11-23.md) · [P3 · Non-programmer](simulated-round-2-p3-2026-11-23.md) · [P4 · Hurried player](simulated-round-2-p4-2026-11-23.md)

All four began at clearance 2 with the two opening cases marked complete. All completed the three cases and passed the alias kata independently. They used no hints or solution reveals. Each ordered one two-hour field check.

| Stage                           |           P1 |  P2 |  P3 |           P4 | Outcome and hours left                    |
| ------------------------------- | -----------: | --: | --: | -----------: | ----------------------------------------- |
| Guest Register 1 · Luanda       |            1 |   1 |   1 |            1 | Travel (3 hours), 22 of 26 left for each. |
| Guest Register 2 · Zanzibar     |            1 |   1 |   1 |            1 | IDENTIFIED, 21 of 26 left for each.       |
| Quiet Consignee                 | 3 + 1 unread |   3 |   3 | 2 + 1 unread | HELD. P1–P3 had 13 of 18 left, P4 had 14. |
| Three Couriers 1 · Zanzibar     |            1 |   1 |   1 |            1 | Travel (3 hours), 19 of 23 left for each. |
| Three Couriers 2 · Lusaka       |            1 |   1 |   1 |            1 | PAYMENT STOPPED, 18 of 23 left for each.  |
| Two lookups in one transmission |            1 |   1 |   1 |            1 | Kata passed, untimed.                     |

## Overload

| Stage            | New GraphQL step                                                                           | New casework mechanic | Other repeated load                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Guest Register 1 | Arguments in parentheses                                                                   | Ruling out            | Deep lookup chain, exact field names, type notation, complete language and cover-name lists, a travel selection.  |
| Guest Register 2 | None                                                                                       | None                  | A new lookup field, exact punctuation, the unseen look-alike name, and a different choice box.                    |
| Quiet Consignee  | None required. P1, P2, and P4 tried sibling root lookups after the Guest Register debrief. | Field check           | Blank editor, null consignee versus empty lists, new archive sources, and the repeated-field error for P1 and P4. |
| Three Couriers 1 | Aliases                                                                                    | None                  | Long repeated blocks, the manual link, and comparing records across named results.                                |
| Three Couriers 2 | None                                                                                       | None                  | New record type and different relationship to a familiar organization.                                            |
| Kata             | None                                                                                       | None                  | New lookup values and raw JSON.                                                                                   |

No stage exceeded either SDD 3.15 limit for two or more personas. The optional sibling-root approach in Quiet Consignee created a load finding when two personas hit a technique scheduled for the following case. The broken organization citation was a separate control problem.

## Findings, leaks, and disposition

| Finding                                                                                                                                                                                                                                             | Disposition                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| In Three Couriers, the organization-name Cite button on TIN_FALCON omitted the relationship needed for the refutation. Citing the parent row worked.                                                                                                | **Fixed.** When no supporting fact starts the chain, the citation can start at a fact that contradicts a claim for that lead. A regression test reproduces the alternate active draft. The existing test for an omitted record in an ancestor list still passes. SDD 3.2 records the behavior.                              |
| In Quiet Consignee, P1 and P4 repeated the company lookup after the preceding debrief showed sibling root fields. The clerk told them to use a glossary entry that was still locked. P2 anticipated the conflict and spent a separate transmission. | **Fixed.** Before the alias entry opens, the clerk explains the duplicated response name and suggests separate transmissions. At higher clearance the alias advice stays available. SDD 3.9 records the rule. The two returned requests cost zero hours.                                                                    |
| P1–P4 paused when consignee came back empty. Some also took a company's empty shipments list to mean the wrong lead or no receiving record. One wanted the field check price compared with the direct search before choosing it.                    | **Logged.** Both the empty papers and the separate intake record are the reason the mechanic exists. The updated briefing explains which draft statuses qualify. All four could describe the field check and use its dispatch to fill the gap. A direct lookup can be cheaper for a player who already knows where to look. |
| The alias link opens the in-game Tradecraft manual and requires going Back to the terminal.                                                                                                                                                         | **Logged.** The link opens the relevant entry and keeps the case state. Observe whether people prefer the manual or in-terminal Glossary before changing the shared link system.                                                                                                                                            |
| The Guest Register exact lookup never showed the look-alike name. Some personas skipped formal rule-out where the other lead was already clear, and one did not see an authored rule-out control later.                                             | **Logged.** Ruling out is optional. It appears when the player cites a complete refutation. An exact lookup can find the correct cover name with no wrong result. The debrief explains the look-alike.                                                                                                                      |
| P1 and P2 inferred some documentation field names from the pattern. A player relying on outside knowledge anticipated the duplicate-name conflict. Other syntax was traced to the samples, notes, starter queries, or debrief.                      | **Logged as teaching evidence.** Find exact fields in Documentation and use the revised error note if a guess conflicts. Observe whether people can recover without model knowledge.                                                                                                                                        |
| The debrief count omitted unread requests. The kata supplied a country-specific alias example and only showed raw JSON.                                                                                                                             | **Logged.** The debrief measures charged transmissions, and these reports count unread attempts separately. The kata demonstrated use on new records with a worked example. A fresh case without the example is needed to test human recall.                                                                                |

## Incomplete claims and the clock

All four could explain why their preferred company still lacked the receiving fact and why the field check helped. Keep the draft's general feedback about linked facts and incomplete evidence. Naming the missing record before the dispatch would reveal the case's evidence route. The Receipt observations about an office relationship appearing in multiple open claims merit a person watching what the player thinks that feedback means.

The field check cost two hours. The cases ended with the hours recorded above. The simulations did not tune the clock.

## Fresh reader of the clerk note

The [focused walkthrough](novice-walkthrough-quiet-consignee-2026-11-23.md) reproduced the duplicate lookup at clearance 2 without opening the solution. The reader explained the duplicate response name, followed the advice to send one lookup per transmission, and got a result with **17 of 18 hours** left. They noticed the raw GraphQL error still mentions aliases. **Logged.** SDD 3.9 keeps the original error visible alongside the clerk's clearance-appropriate explanation.

## Audit

The baseline profiles were fresh and restricted to the local preview. All audited browser actions stayed within the rendered interface. The manual links stayed on the game origin. Several mistyped tool names were rejected by the host before a browser action. Some interviews used a screenshot or accessibility readback that already showed the next stage. Their sequence is logged in the persona reports.

---

## Rerun with both fixes

All four replay personas completed all three cases independently and passed the kata on their first transmission. Each used one two-hour field check. No runner took a hint or exposed a solution.

| Case                | P1 hours left | P2 hours left | P3 hours left | P4 hours left |
| ------------------- | ------------: | ------------: | ------------: | ------------: |
| The Guest Register  |      21 of 26 |      21 of 26 |      21 of 26 |      20 of 26 |
| The Quiet Consignee |      13 of 18 |      13 of 18 |      13 of 18 |      13 of 18 |
| Three Couriers      |      18 of 23 |      18 of 23 |      18 of 23 |      18 of 23 |

- **Citation regression verified.** P1 cited the organization-name row itself. The claim showed Contradicted and the runner ruled the courier out. P1 also sent a conflicting repeated lookup at clearance 3 and recovered from the existing alias advice.
- **Field-check path preserved.** The merge gate caught that a broader version could pull in the shipper refutation when someone cited the director. The final rule keeps the supporting citation focused on the director. A second regression test and content validation verify that the provisional field check remains available.
- **Clearance-2 note verified.** P2 and P4 repeated the same company lookup and used the clerk's advice to split the requests. The raw error's alias term remained unfamiliar to P4 but did not block recovery.
- **Replay friction logged.** The hurried persona lost time on editor actions, saw a previous successful response below an unread request, and described copying query shapes. The previous results are still valid evidence. Human observation is needed to see whether players distinguish the returned request from the prior result and can explain the shapes they reused. P2 wanted to write the repeated alias fields once. The next clearance teaches fragments. P2 also wondered why list evidence can contradict a lead before a country is chosen. An authored refutation can follow the sighting directly and does not depend on the player's conclusion.
- **Audit.** No replay accessed source, network data, storage, hidden attributes, or an external page. Host-rejected calls and stale indices were bridge friction. Interviews that opened a screenshot or the next stage to verify progression are identified in the persona records.

---

## Focused checks on the final build

### Director citation in The Quiet Consignee

I stopped where you asked. I didn't order the field check, submit, or open Hints.

1. **Query:** In The Quiet Consignee, the Documentation showed the fields I needed: `shipper` and `director`. My one query was `query { shipment(id: "VAL-0733") { shipper { name director { codename } } } }`. It cost 1 hour, leaving 17 of 18.
   - Sender: Meridian Forwarding
   - Its director: UMBER_SKUA
2. **Citation:** I cited only the codename row (director → codename). The game put it in a new draft for Meridian Forwarding and counted it as 2 facts, because citing a nested row also includes the rows above it.
3. **Director:** I chose UMBER_SKUA in the Director box.

**Results:**

- **Receiving claim ("This company is to receive VAL-0733"):** shows **Needs evidence**. The director claim now shows Supported.
- **Field check:** **Yes, it's offered.** The form shows **"Order a field check (3 hours)"** next to Submit deduction. Below them is the line: "1 claim is not yet supported… A field check sends a dispatch about the missing evidence. Your citations stay in the draft."

The draft labels the sender, Meridian Forwarding, as "Receiving company", and nothing warns that it's the sender. The game offers the field check even though this company is the one customs said not to name.

**Logged.** The draft follows the cited facts. The uncited sender relationship can contradict the receiving claim once the player cites it. Until then the field check is an available dead end, as authored.

### Organization-name citation in Three Couriers

TIN_FALCON is the courier whose organization contradicts the briefing. The citation on its organization name row counted as 2 facts, and the form marked the claim Contradicted and offered Rule out. I stopped there.

**What I did:** I used the starter's operative query with aliases (`a`, `b`, `c`) to fetch all three couriers and their organization names in one transmission. That cost 1 hour, leaving 22 of 23. I used no hints.

- SABLE_IBIS: The Parallax Circle
- GREY_PETREL: The Parallax Circle
- TIN_FALCON: **Baltic Exchange Bureau**. The briefing says the courier is a Parallax Circle member, so this is the contradiction.

**The Cite:** I pressed "Cite organization → name, into the draft for TIN_FALCON" on the inner name row. The button changed to "Cited for TIN_FALCON" and was disabled. A draft for TIN_FALCON opened by itself and was selected under "Open a lead."

**What the citation carried:**

- The draft lists it as "organization → name, **2 facts**", meaning the name row plus the organization row it sits under. That matches the page's note that a nested citation includes the rows above it.
- The contradiction shown was "operative TIN_FALCON · organization: Baltic Exchange Bureau."

**Claim status:**

- "The courier is a member of the Parallax Circle" shows **Contradicted**.
- "Last seen in a country that borders Tanzania" shows Needs evidence, because no country has been retrieved yet.

**Rule out:** Yes, the form shows a "Rule out this lead (free)" button. I didn't press it, and I didn't press Travel (3 hours).

**One thing that may confuse players:** Below the claims, the form says "2 claims are not yet supported." One of those two is actually contradicted, not just unsupported, so the message doesn't match the Contradicted label above it.

**Logged.** The draft summary counts each claim that lacks support, including contradicted claims. The per-claim states identify which one the player can rule out.

---

## Earlier sessions preserved from Git

## Simulated beginner sessions · Round 2 · 2026-11-23

[Front-end developer](simulated-round-2-p1-2026-11-23.md) · [Data analyst](simulated-round-2-p2-2026-11-23.md) · [Operations analyst](simulated-round-2-p3-2026-11-23.md)

All three profiles started on the revised opening build at clearance 2 with two resolved cases and The Guest Register untouched. All three completed the assigned path, passed the kata on the first send, and used no hints or solution reveals. Transmit attempts below include requests the clerk returned unread.

| Task                               | P1 attempts | P2 attempts | P3 attempts | Result in all three sessions                     |
| ---------------------------------- | ----------: | ----------: | ----------: | ------------------------------------------------ |
| The Guest Register · Luanda        |           1 |           1 |           1 | Travel to Tanzania approved, 22 of 26 hours left |
| The Guest Register · Zanzibar City |           1 |           1 |           1 | **IDENTIFIED**, 21 hours left                    |
| The Quiet Consignee · Callao       |           3 |           3 |           3 | **HELD**, 13 of 18 hours left, clearance 3       |
| Three Couriers · Tanzania          |           2 |           1 |           2 | Travel to Zambia approved, 19 of 23 hours left   |
| Three Couriers · Zambia            |           1 |           1 |           1 | **PAYMENT STOPPED**, 18 hours left               |
| Two lookups in one transmission    |           1 |           1 |           1 | **Passed**, untimed                              |

### Findings

| Finding                                                                                                                                                                                                                                                                               | Disposition                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All three followed a long chain through six Documentation entries to build the first Guest Register request. They suggested links from a return type to its entry.                                                                                                                    | Logged. Each found the needed fields and succeeded on the first send. Cross-links would change navigation and focus across the training and case panels. The accessibility text and these three successful searches give limited evidence for the cost of rescanning on screen. |
| The Guest Register's partial name claim said it needed more connected facts after a given-name citation. Players needed the complete cover-name list to test the claim.                                                                                                               | Fixed in the briefing. It now introduces the given name and complete cover-name list as the two facts to cite. The draft still asks for evidence without naming a source the player has yet to find.                                                                            |
| The given-name and city fields repeated text at different levels. In Zanzibar City two players expected to need an extra given-name citation.                                                                                                                                         | Logged. The supported claim already lists the facts it used, and the citation disclosure carries the full chain. Extra citations do not prevent completion. Test a preview with a person before adding another layer to each Cite control.                                      |
| A cited country or operative still had to be recorded in the answer box. Players paused when the answer was already visible in Results.                                                                                                                                               | Logged. The form distinguishes Needs a choice and shows a choice shortcut when the cited facts establish an answer. Preserve the player's responsibility to enter a conclusion. The misleading field-check offer in that state was fixed separately.                            |
| Freight's shipping-paper consignee was empty and its company file lacked receiving evidence. The draft identified the unsupported claim but left the next source open until the field check.                                                                                          | Fixed the next action. The Quiet Consignee briefing explains that the player must cite who directs the company and choose the Director. The draft tells players what the field-check dispatch is for. The missing source itself stays in the dispatch and hint ladder.          |
| P1 and P2 wanted Findings to spell out that the blank consignee came from the shipping papers.                                                                                                                                                                                        | Logged. The briefing explicitly warns that those papers give the sender and leave the consignee blank. Shipment documentation identifies the source on the field itself. The fact that a different record can supply the value was the point of the field-check exercise.       |
| In Three Couriers, two players tried repeating the same lookup under the same response key. Both requests came back unread, cost zero, and the clerk's note led both players to the Glossary and a successful correction. P2 found the Glossary first and wanted the path signposted. | Fixed. The briefing links directly to the alias entry and describes the relationship between field names and response keys. The clerk still explains a conflicting request when one occurs.                                                                                     |
| Three Couriers offered a paid field check after a citation already established Zambia and only the country choice remained. P2 and P3 noticed it.                                                                                                                                     | Fixed. The draft offers a field check only when at least one claim still needs evidence and another claim is supported. A player with complete evidence can make the remaining choice without being offered a paid action.                                                      |
| All three used aliases on country lookups in the kata. Each had to read the new lookup field, place names and desired field from the exercise. The kata supplies a country-specific example.                                                                                          | Logged as assisted-by-example transfer. The task successfully measures application to unfamiliar records with a reminder. It cannot test recall without a prompt, so the conclusions are limited to what was observed.                                                          |

### Overload

Two or more personas described multiple new things in both Guest Register stages, Quiet Consignee, and both Three Couriers stages. The first Guest Register stage combined a quoted record argument, deep schema navigation, and formal refutation. Its second stage combined an exact-string lookup, a different starting record, and a new answer relationship. Quiet Consignee added a blank-editor assessment and the paid field check while the source of the receiver changed. Three Couriers paired aliases with comparative evidence over operatives and then companies. The kata applied an existing technique to new inputs without adding a casework mechanic.

The briefing changes address the points at which players had to infer a citation pair or route to the Glossary. Every persona completed every stage and could explain the controls used, so the paths and stage boundaries stay as played. A fresh reader checked those briefing directions without the case answers. Their reading clarified which director fact to cite, which complete list to use, and how the response describes repeated keys.

### Plausible leads and transfer

Players used a fact that fit and a fact that conflicted to explain their rule-outs. Mombasa fit the language clue but the guest gave a name absent from NIGHTJAR's list. Maputo fit the cover-name clue but its complete language list lacked Swahili. Meridian Forwarding asked after the cases, and the shipping papers gave its role as the sender. SABLE_IBIS and TIN_FALCON each met one of the courier tests. Copperbelt's director belonged to the Circle but its country did not list Portuguese. Beira was registered in a country that listed Portuguese, and its director belonged to a different organization. Individual reports include what each agent actually cited.

Each persona carried the alias, colon placement, and distinct result keys from the courier work to the kata without reopening the case. The task and starter supplied `country`, the lookup values, and `capital`. Chile returned Santiago and Peru returned Lima under separate keys in all three first attempts.

### Draft and clock decisions

The draft now gives a more actionable next step when a genuine evidence gap qualifies for a field check. The Guest Register briefing names the two facts for the first comparison, and the Quiet Consignee dispatch still teaches where to find the missing receiver. Keep that kind of source detail in the case briefing, dispatch or hints so a generic draft inspection does not reveal a solution route.

Keep the one-hour transmission price, free unread requests and rule-outs, quoted travel and field-check prices, and current budget factors. Round 1's players deliberately combined the Chronometer clues and finished with 17 of 18 hours. In Round 2, the same price rewarded combining lookups, the two alias errors cost no time, and every player chose the two-hour check when it could identify an unknown source. The visible budget influenced actions even though each player finished with substantial room. None climbed the paid hint ladder or approached expiry, so a tighter budget has no support from these sessions. The field-check correction protects a player from spending time when they only have to record an answer.

### Syntax and isolation audit

Each run used a fresh agent context and its own browser context, with only the specified round-two starting completions. The bridge limited browsing to the game origin and exposed rendered text, screenshots, visible editor readback and controls. The action logs showed no visits to project files or external pages and no inspection of page internals. The agent that anticipated a repeated-key conflict in Quiet Consignee recorded it as a possible prior-knowledge leak. It did not use aliases before the visible Glossary example. No repeated field is required in Quiet Consignee, so the alias lesson remains at clearance 3. The new signpost helps players reach it before the first required use. No other unsupported syntax was reported.

These simulations measure transmissions and whether a visible basis exists for a decision. The seeded start does not measure whether a human would retain the opening lessons in round two. Accessibility output and whole-editor insertion cannot measure visual discovery, autocomplete, manual typing or real reading time.

### Review

A later review corrected two points in this summary.

- **Overload.** This summary counted every new thing a persona listed. SDD
  section 3.15 limits a stage to one new GraphQL step and one new casework
  mechanic. Each flagged stage meets that limit when its items are sorted
  that way:
  - **The Guest Register, stage 1:** arguments, and ruling out.
  - **The Guest Register, stage 2:** no new step, and no new mechanic.
  - **The Quiet Consignee:** the field check, and no new step.
  - **Three Couriers, stage 1:** aliases, and no mechanic.
  - **Three Couriers, stage 2:** neither.

  The deep chain through the documentation, the blank editor, and the
  change of record type are notes on load.

- **The clock.** "Keep the current budget factors" is withdrawn as a
  decision. These sessions cannot tune the clock, because the agent
  already knows GraphQL (SDD section 3.3). The costs and factors stay as
  they are, and stay provisional.
