# Simulated beginner sessions · Round 1 · 2026-11-23

[P1 · Front-end developer](simulated-round-1-p1-2026-11-23.md) · [P2 · Data analyst](simulated-round-1-p2-2026-11-23.md) · [P3 · Non-programmer](simulated-round-1-p3-2026-11-23.md) · [P4 · Hurried player](simulated-round-1-p4-2026-11-23.md)

All four started at clearance 1 with zero cases resolved. P3 read Orientation. All passed six drills, completed both cases independently, and reached clearance 2. No player bought a hint or revealed a solution. All wanted another query after finding the intake label and matched it to the order to identify the signer.

| Stage                     | P1 attempts | P2 attempts | P3 attempts | P4 attempts | Outcomes                                                                                |
| ------------------------- | ----------: | ----------: | ----------: | ----------: | --------------------------------------------------------------------------------------- |
| Drills 1–6                |           6 |           6 |           6 |           9 | All passed. P4 sent two unread requests and one valid request that missed a drill goal. |
| Azulejos 1 · Manifests    |           1 |           1 |           1 |           1 | Deduction accepted.                                                                     |
| Azulejos 2 · Routes       |           2 |           1 |           1 |           2 | Deduction accepted. P1 and P4 each sent one unread request.                             |
| Azulejos 3 · Travel order |           0 |           0 |           0 |           0 | Travel approved with the evidence already retrieved.                                    |
| Azulejos 4 · Luanda       |           2 |           2 |           2 |           6 | HOLD ISSUED. P4 sent three unread requests.                                             |
| Chronometer               |           1 |           1 |           1 |           1 | RECOVERED. Each had **17 of 18 hours** left.                                            |

Attempts include unread requests. Debriefs count successful transmissions. The clock made the personas combine contents and route information. The cost and budget factors remain provisional for sessions with people.

## Overload

| Stage       | New GraphQL step                                                                | New casework mechanic          | Other repeated load                                                                       |
| ----------- | ------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| Drills      | One step per teaching drill. The documentation drill applies the earlier steps. | None                           | Editor auto-pairing, notation in the completion list, and collapsed Documentation.        |
| Azulejos 1  | None                                                                            | Citing                         | Results and Deduction panels, starter comments, an unassigned Cite button.                |
| Azulejos 2  | Nesting through the shipment's destination                                      | None                           | Empty complete lists, parent facts in one citation, and transmission history.             |
| Azulejos 3  | None                                                                            | Travel order                   | Two claims, a country box, and a shortcut that fills it.                                  |
| Azulejos 4  | Two nested records side by side                                                 | Deduction over several records | New record names, two ways to reach a signer, manual brace repair, and a shared citation. |
| Chronometer | None                                                                            | Clock                          | First blank case editor, two similar currencies, and deadline controls.                   |

No stage brought more than one new GraphQL step or more than one new mechanic to two personas. Their repeated inability to explain the unassigned Cite button is a control-discovery finding under SDD 10.1. The updated citation instructions warrant an opening rerun.

## Findings and syntax leaks

| Finding                                                                                                                                                                         | Disposition                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Players did not know what an unassigned Cite button did, why its label followed the open draft, or how to attach an intake label to a transfer order.                           | **Fixed.** The empty draft explains the visible Cite label and points to Open a lead. The Findings and Side by side legends explain the destination for shared facts.                                                                                                 |
| Manually retyping multiline queries created duplicate closers. Several runners rebuilt in one line after a keyboard command failed. P4 also stumbled over the completion popup. | **Logged.** Key-by-key input shows pairing friction. The bridge also rejected some key spellings, so observe the correction workflow with people before changing the editor.                                                                                          |
| Starting examples use query and autocomplete can display String! before their explanations. P2 drew on model knowledge to move fields onto one line.                            | **Logged.** The training starts with changes inside a worked query and explains documentation notation in drill 6. Inline examples support the workaround. Observe whether people need an earlier explanation of the wrapper, type notation, or optional line breaks. |
| The empty editor, deadline controls, unused tabs, and long Results legend were unfamiliar. Drill 6 said Documentation was below, and its disclosure was collapsed.              | **Logged.** The players transferred the earlier query shape, the unused controls did not block them, and all found the reference. Recheck discovery and reading load with people.                                                                                     |
| P1 and P4 sent destination without braces. P4 guessed currency, label, Company.name, and Operative.name. P1 guessed Currency.name.                                              | **Logged.** The case or drill reference and clerk notes supplied the exact field names and shapes for recovery. P4's experience shows a cost to skimming.                                                                                                             |
| authorizedBy and authorizationLog looked like two ways to get the signer. The same consignee also appeared on another shipment.                                                 | **Logged.** The two signer routes are intentional. All four cited the proper shipment and order.                                                                                                                                                                      |
| Stage 2 says ceramic shipment but asks for the border facts. The draft describes incomplete evidence without naming the missing row.                                            | **Logged.** Stage 1 discards the slate crate and stage 2 makes a separate border claim. The draft leaves discovery to the results, briefing, and hints under SDD 3.2.                                                                                                 |
| The country shortcut felt like it picked the answer for the player.                                                                                                             | **Logged.** It appears after the cited facts complete an evidence set. No participant needed it to discover the route.                                                                                                                                                |
| Some disclosure names, key spellings, and old control indices failed in the bridge. P3 sent one mistyped tool name that the host rejected.                                      | **Logged as bridge friction.** Actions stayed on the rendered page. Replays accept short disclosure labels and common key spellings and can refresh control indices after actions.                                                                                    |

## Isolation

Four initial provider attempts stopped before a browser action. The replacements used fresh profiles and the original prompts. The audited tool calls and action logs showed no source, network, storage, hidden attribute, or off-site access. Some baseline runners requested an accessibility snapshot to confirm progression before recording an interview. Their reports show what they recalled, with weaker evidence that the next briefing stayed unread.

---

## Opening rerun on the revised build

All four fresh readers passed the drills and both cases independently. Each finished The Borrowed Chronometer in one charged transmission with **17 of 18 hours** left. P2 already had both the intake label and orders in one response and looked in the results. The other three wanted a new query. The replays and the baseline are in the four persona files.

- **Citation routing.** The Luanda interviews could describe where an intake citation went once an order was open. A bare Cite with no order retrieved and the claim value of a whole-list citation still caused hesitation. **Logged.** The briefing and empty lead list point to retrieving a transfer order, and none of the opening claims requires citing the entire parent list. Ask people how they interpret the control before giving it a new state or removing it.
- **Other repeated load.** Players still reported automatic closers, completion popups, the optional controls, and lookups inferred from common field names. A skimmer also briefly read the receiving-country selection as referring to Namibia. **Logged.** The stage distinguishes the destination from the border clue and evidence corrected the choice. The physical editor, label discovery, and recall need human observation.
- **Rerun audit.** P2's first replay stopped at a provider error during Luanda. A slow fresh replacement was retired when a second fresh replacement completed. Neither partial run contributed results. The counted reruns showed no browser boundary violations.

---

## Earlier sessions preserved from Git

## Simulated beginner sessions · Round 1 · 2026-11-23

[Front-end developer](simulated-round-1-p1-2026-11-23.md) · [Data analyst](simulated-round-1-p2-2026-11-23.md) · [Operations analyst](simulated-round-1-p3-2026-11-23.md)

All three counted sessions started at clearance 1 with 0 of 10 cases resolved. Each player passed all six drills in one send apiece and completed both cases independently. No counted session used a hint or solution reveal, or had a request returned unread. P1 and P2 skipped Orientation. P3 opened it. See the individual reports for the stage interviews and exact citation comparisons.

| Task                       | P1 sends | P2 sends | P3 sends | Result                              |
| -------------------------- | -------: | -------: | -------: | ----------------------------------- |
| Training                   |        6 |        6 |        6 | All six drills passed               |
| Azulejos · Lisbon manifest |        1 |        1 |        1 | Slate deduction accepted            |
| Azulejos · Lisbon route    |        1 |        1 |        1 | Border deduction accepted           |
| Azulejos · Travel order    |        0 |        0 |        0 | Angola chosen from existing results |
| Azulejos · Luanda          |        2 |        2 |        1 | **HOLD ISSUED**                     |
| Chronometer                |        1 |        1 |        1 | **RECOVERED**, 17 of 18 hours left  |

### Findings

| Finding                                                                                                                                                                                                                                                                                                        | Disposition                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The first drill explained the query wrapper, lookup and field placement before asking for one edit. All three recalled multiple new things from that first interaction.                                                                                                                                        | Fixed. The opening drill directs attention to adding one field in the completed Portugal lookup. The starter, Orientation and Documentation carry the request shape.                                                                                                        |
| P1 and P3 paused over the different braces and brackets in the list drill.                                                                                                                                                                                                                                     | Fixed. Put a query example and the response's square brackets in the drill task, before the player edits.                                                                                                                                                                   |
| P2 initially read Follow two links as two sibling relationships.                                                                                                                                                                                                                                               | Logged. The drill's Prague → country → borders task resolved it on the first read through the body, and all three passed on one send.                                                                                                                                       |
| All three reread “inside those braces, under name” in the three-link drill.                                                                                                                                                                                                                                    | Fixed. Show the route as four named stops and say which line gets the second list, aligned with Spain's `name` field.                                                                                                                                                       |
| Reading exact field names and reading documentation notation arrived together. P3 reread `!` and P1 noted that it looked like syntax to type.                                                                                                                                                                  | Fixed. Put the `city` entry beside a runnable lookup using the spelling a player actually types. Use the Query entry as the reference in the first blank-editor case.                                                                                                       |
| P3 could explain the training controls used and had no reason to touch the Vim toggle. The label itself was unfamiliar.                                                                                                                                                                                        | Logged. The toggle is optional and explicitly labels the editor mode by its established name. The simulation found no interruption of the drill path from the toggle.                                                                                                       |
| P2 toggled Shipment closed when returning to Documentation because the disclosure retained its open state.                                                                                                                                                                                                     | Logged. Expansion persistence preserves the player's place. The bridge's text is weaker evidence about the visibility of a native disclosure indicator than direct play.                                                                                                    |
| The first Deduction checklist implied that the lead chooser came before Cite. All three saw Cite open a lead by itself, or used the manual chooser before discovering the shortcut.                                                                                                                            | Fixed. Explain which Cite buttons open the matching lead and when to use the chooser. Keep the first briefing focused on one claim and one citation.                                                                                                                        |
| P3 read “cannot reach Namibia by road” to include an indirect route. P3 also expected the ceramic manifest to count toward the road claim.                                                                                                                                                                     | Fixed. Put the direct border test in the objective and distinguish which fact selects the ceramic candidates and which fact supports the form.                                                                                                                              |
| The road stage combined a new route chain, empty-list evidence and a grouped citation. P2 also discovered how the comparison view cites a cell.                                                                                                                                                                | Logged. Clarified the objective and retained the chain. All three cited the correct complete empty list on the first transmission and could explain the facts it carried. Side by side was optional.                                                                        |
| The travel order introduces a two-claim form, a required country choice and travel. P3 expected that a complete route citation also made the country choice.                                                                                                                                                   | Fixed. The briefing orders the steps by what the player does and says that choosing the country records the player's answer. The form still exposes the existing choice shortcut after finding complete evidence.                                                           |
| P1 and P2 stopped after reading the Luanda label and sent a second query. P3 had already requested the orders and signatures and reused one response. The intake citation initially lacked an order, and the documentation offered receipt and intake paths, plus an order signature and a registry signature. | Fixed the evidence signposts. Specify the depot intake record in the clue and distinguish the order's signature from the separate registry record. Logged both query strategies as intended. All three matched the label to the correct order and could explain the signer. |
| P2 wanted the draft to say that a registry signature also supports the Luanda claim.                                                                                                                                                                                                                           | Logged. Both evidence routes worked, and the revised documentation distinguishes them. The draft leaves the choice of source to the player until they take a hint.                                                                                                          |
| The Guest Register's locked teaser identified NIGHTJAR before players could deduce the signer.                                                                                                                                                                                                                 | Fixed. The teaser refers to the crate's signer by role.                                                                                                                                                                                                                     |
| The clock and the first empty editor arrived together. Players paused to recall the opening syntax, but all three used one query for the two clues.                                                                                                                                                            | Fixed the blank-editor signpost. The briefing points to Documentation's Query entry, leaving the editor blank. Logged the clock budget for joint review with round two.                                                                                                     |

### Overload

Using the protocol's threshold of two personas listing multiple new things in the same stage, the flags were the first drill (lookup, wrapper and field edits), the list drill (list query and JSON array), the Documentation drill (field catalog and notation), the Lisbon manifest deduction (shipment and comment syntax, draft and Cite), the Lisbon route deduction (chain, empty-list evidence and grouped Cite), the travel order (two claims, country choice and travel), Luanda (parallel evidence or a second lookup, matching records and choosing shipment and signer), and Chronometer (blank-editor recall and a clock). The drills on opening one record and following two or three links each had one central new step. The reread on the three-link drill was a placement instruction issue even though the agents could explain the step.

The opening rework reduces prose load and clarifies controls at the point of use. The case structure stays as tested. Successful first-send deductions and accurate interviews support the existing grouping of claims within the travel order and within the Luanda deduction.

### Luanda and the clock

After reading Parallax Freight on the replacement label, P1 and P2 wanted a new send because their results lacked the orders. P3 looked in the same response. All three matched Parallax Freight to LUA-012 and then read NIGHTJAR from the order or its registry log. The locked teaser compromised the surprise, so these sessions establish evidence matching only.

Every player explicitly used the one-hour price to combine the manifest and destination-currency branches in Chronometer. They each finished with 17 hours. This supports the price signal and provides no measure of the margin a person needs when recovering from mistakes or taking hints.

### Syntax and isolation audit

The three counted syntax ledgers identified no unsupported use. Tracing syntax to a starter, documentation or an earlier drill establishes that it was available to the player. Model familiarity can still affect recognition, brace placement and recall from a blank editor.

Each counted session used a fresh agent context and a separate empty-save browser context on the local production build. The action logs recorded editor replacements, UI controls, rendered accessibility output, screenshots and boundary notes. Whole-editor insertion measured query composition without measuring how a person handles individual keystrokes or editor completions.

An earlier P2 attempt ended during drill 6 after the external GitHub footer link exposed the repository landing page and its rendered README. The browser bridge had omitted the Documentation disclosure from its numbered controls. That attempt was discarded. The fresh P2 agent and profile used a bridge with external navigation blocked and direct operation of visible disclosures. The omission affected the other two sessions' input method, so it is a tooling caveat.

### Reading check after the rework

A fresh simulated reader passed Ask for a field, Read a list, and Follow a chain of three links in one send each using the revised text. They could point to where `capital` goes, explain why the list uses braces in the query, and distinguish Spain's `name` line from Portugal's. On the first Azulejos terminal, the reader could explain when Cite opens the shipment draft and when to choose a lead manually. This was a focused check of the revised teaching copy.

### Review

A later review corrected two points in this summary.

- **Overload.** This summary counted every new thing a persona listed. SDD
  section 3.15 limits a stage to one new GraphQL step and one new casework
  mechanic. Each flagged stage meets that limit when its items are sorted
  that way:
  - **Drills:** each introduces one GraphQL step and no mechanic. The
    documentation drill introduces neither.
  - **Azulejos stage 1:** citing, and no GraphQL step.
  - **Azulejos stage 2:** nested selections, and no mechanic.
  - **Azulejos stage 3:** the travel order, and no GraphQL step.
  - **Azulejos stage 4:** two records opened side by side, and deduction
    over several records.
  - **Chronometer:** the clock, and no GraphQL step.

  The other items, such as the empty editor, the documentation notation,
  and the grouped citation, are notes on load. The text fixes above
  address them.

- **The clock.** These sessions do not tune the clock, because the agent
  already knows GraphQL (SDD section 3.3). The 17 of 18 hours left is
  recorded, and the costs and factors stay provisional.
