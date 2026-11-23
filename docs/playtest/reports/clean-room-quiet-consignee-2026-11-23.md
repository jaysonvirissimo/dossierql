# Clean-room solve · The Quiet Consignee · 2026-11-23

I solved the case with one transmission and no hints. The debrief stamp was **HELD**, the game recorded the run as "Completed independently", and I was promoted to clearance 3.

## 1. Preflight

- **Clearance:** the top right of the page showed "Clearance 2", as expected.
- **Case status:** "The Quiet Consignee" is not listed under the Clearance 2 heading, which only shows The Guest Register. I found it inside a collapsed "Skip ahead → Placement: 4 assessments you can attempt now to skip ahead" section. It was marked "Placement: attempt it to skip ahead", not completed or in progress. Both checks passed.

## 2. Outcome

- **Solved:** yes. The debrief said "Case resolved".
- **Stamp:** HELD.
- **Transmissions:** 1. The game's reference solution also uses 1.
- **Hours left:** 17 of 18 ("with 17 hours to spare").
- **Completion mode:** the debrief said "You resolved the case independently, with no hints" and "Placement passed. You now hold clearance 3". The Assignments page now shows "Completed independently" and "2 of 10 cases resolved".
- **Hints:** I never opened the Hints tab. No field check was ordered.

## 3. Steps

1. **Opened the placement.** The Clearance 3 card said "Pass the level 2 assessment, The Quiet Consignee". I opened the "Skip ahead" section and clicked "Attempt placement : The Quiet Consignee".
2. **Read the briefing and opened the terminal.** Key points from the briefing:
   - shipment VAL-0733 is held in Callao, and its consignee is blank;
   - two companies have asked about it: Meridian Forwarding and Meridian Freight;
   - customs wants the receiving company and its director, "not the party that sent it";
   - each transmission costs 1 hour, "however much it asks for".
3. **Read the Documentation tab** (free). I expanded these entries, whose fields shaped my query:
   - Query: `shipment(id: ID!)`;
   - Shipment: `shipper`, `consignee`, `intake`, `unloadingReceipt`, `transferOrders`;
   - Company: `director`;
   - IntakeRecord: `consignee` ("The consignee on the label when the shipment arrived");
   - UnloadingReceipt: `labelConsignee`, `contents`;
   - TransferOrder: `consignee`, `authorizedBy`, `authorizationLog`;
   - AuthorizationLog: `signedBy`;
   - Operative: `codename`.

   The docs also said to write an ID in double quotes.

4. **Wrote and sent transmission 1:** `query { shipment(id: "VAL-0733") { id manifest shipper {…director{codename}} consignee{name} intake{…consignee{name director{codename}}} unloadingReceipt{…} transferOrders{…} } }`.
   - **Outside knowledge:** putting every possible record into one request was my own GraphQL habit. The game backed it up only indirectly, through the "1 hour, however much it asks for" line. The docs never show more than one field side by side or several levels of nesting in one query.
   - The editor readback matched what I typed; auto-pairing didn't add extra brackets.
5. **Read the results:**
   - shipper: Meridian Forwarding, director UMBER_SKUA (the sender, which the clue says to exclude);
   - consignee: "nothing returned";
   - intake INT-CAL-0733: consignee Meridian Freight, director PEWTER_SWIFT;
   - unloading receipt UNL-CAL-0733: label consignee Meridian Freight, director PEWTER_SWIFT;
   - transfer orders: none.

   Two separate records independently name Meridian Freight as the receiver.

6. **Cited "intake → consignee" for Meridian Freight.** This opened the Meridian Freight draft, and the claim "This company is to receive VAL-0733" showed **Supported**.
7. **Cited "intake → consignee → director".** The draft said "Choose PEWTER_SWIFT for 'Director' above."
8. **Picked PEWTER_SWIFT in the Director box.** Both claims showed Supported.
9. **Submitted** and got the debrief.

## 4. Evidence table

There was one draft, for Meridian Freight / PEWTER_SWIFT.

| Claim                               | Citation (facts)                                                                                                  | Transmission |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------ |
| This company is to receive VAL-0733 | intake → consignee (2 facts: shipment VAL-0733 · intake INT-CAL-0733; intake record · consignee Meridian Freight) | #1           |
| This operative directs the company  | intake → consignee → director (3 facts; shown as "company Meridian Freight · director: PEWTER_SWIFT")             | #1           |

The unloading receipt also named Meridian Freight, but I didn't cite it.

## 5. Friction

- **The case was hard to find.** At clearance 2, the level 2 assessment is not listed under "Clearance 2". It only appears inside the collapsed "Skip ahead" section, under "Placement". The only on-screen pointer was the Clearance 3 card's "Pass the level 2 assessment, The Quiet Consignee". Listing it under Clearance 2 with a "placement" badge would have helped.
- **The field-check text doesn't match what the form did.** The briefing says the form offers "Order a field check" when "the director claim shows Supported and the claim about receiving the cases still needs evidence". In my run, "Order a field check (2 hours)" appeared when the opposite was true: receiving was Supported and the director was not yet chosen. It disappeared once both claims were Supported. Either the text or the trigger is wrong.
- **One citation covers both claims.** "intake → consignee → director" alone showed facts for both claims. It's unclear whether the first citation was needed at all.
- **The type entries start collapsed.** All the Documentation type entries had to be expanded one by one, and there was no "expand all".
- **My select call failed once.** The first select failed because I left out the option text ("Select needs a combobox index and its exact visible option text"). This was a problem with my tool use, not the game; the retry worked.
- **A screenshot was out of date.** After I clicked "Back to assignments", the screenshot still showed the debrief, while the accessibility tree already showed the Assignments page. It was probably a timing issue.
- **A tag moved.** After the case, The Guest Register lost its "Next in the story" tag and Three Couriers gained it. This is probably intended, but I'm noting it.

## 6. Caveats

- I never triggered or tested a field check or its dispatch, so the case's main new feature is unverified.
- I never sent a malformed query, so I didn't test the "returned at no cost" error path.
- My single combined query skipped any staged reasoning. The run doesn't show whether a player who sends smaller, step-by-step queries would find the intake record without outside GraphQL knowledge.
- I didn't look at the Hints, Evidence, Dossiers, Map or Glossary tabs, the Raw response view, the Tradecraft manual, or the Orientation page.

---

## Rerun on the revised build

I solved "The Quiet Consignee" in 2 transmissions with 16 of 18 hours left, and I never took a hint. The game recorded the run as "resolved the case independently, with no hints" and as a passed placement.

### 1. Preflight

- **Clearance:** the top right said "Clearance 2". ✔
- **Case status:** "The Quiet Consignee" is not in the "Clearance 2" section of the Assignments page. It sits inside a collapsed "Skip ahead" group ("Placement: 4 assessments you can attempt now to skip ahead"). Its tag read "Placement: attempt it to skip ahead", so it was not marked completed or in progress. ✔ The "Three Couriers" card was the only place on the page that named it ("Pass the level 2 assessment, The Quiet Consignee…").

### 2. Outcome

- **Solved:** yes. Debrief heading "Case resolved", stamp **HELD**.
- **Answer:** the receiving company is **Meridian Freight**; its director is **PEWTER_SWIFT**.
- **Transmissions:** 2. The game's reference solution uses 1.
- **Hours left:** 16 of 18.
- **Completion mode:** "You resolved the case independently, with no hints, with 16 hours to spare." and "Placement passed. You now hold clearance 3…". The header now reads Clearance 3.
- **Hints:** I never opened the Hints tab.

### 3. Steps

1. **Opened the Skip ahead group, then the case.** The "Three Couriers" card said "Pass the level 2 assessment, The Quiet Consignee".
2. **Read the briefing and opened the terminal.** The briefing says the papers leave the consignee blank and that customs wants the receiver, not the sender.
3. **Read the Documentation tab and expanded the record types.** The terminal note says "The Documentation tab lists what the archive holds". The entries I used:
   - Query: `shipment(id: ID!)`, `company(name: String!)`.
   - Shipment: shipper, consignee, transferOrders, intake, unloadingReceipt.
   - TransferOrder and AuthorizationLog.
   - Company: director, registeredIn, shipments.
   - The docs say an ID is written in double quotes.
4. **Transmission 1:** the shipment's id, manifest, shipper and its director, consignee, and transfer orders with their sub-fields.
   - **Why:** Docs say Shipment.consignee is "the company the shipping papers give as receiving" and transferOrders are "Orders to hand the shipment to another party".
   - **Result:** shipper Meridian Forwarding, director UMBER_SKUA; consignee "nothing returned"; transfer orders "none".
   - **Outside knowledge:** none beyond the docs' own syntax examples.
5. **Read the IntakeRecord and UnloadingReceipt docs.** The Findings panel listed `intake, unloadingReceipt` under "Not yet opened on this shipment". The docs say IntakeRecord.consignee is "consignee on the label when the shipment arrived", and UnloadingReceipt.labelConsignee is "consignee on the label, as the dockhand copied it".
6. **Transmission 2:** the shipment's intake and unloading receipt, plus `company(name: "Meridian Freight")` with its registered country, director and shipments.
   - **Why:** step 5 for the two records; the briefing named Meridian Freight.
   - **Result:** intake INT-CAL-0733 consignee Meridian Freight (director PEWTER_SWIFT); unloading receipt UNL-CAL-0733 label consignee Meridian Freight; company registered in Peru, director PEWTER_SWIFT, shipments none.
   - **⚠ Outside knowledge:** putting two top-level fields in one query is GraphQL I already knew. The docs only show one field per query.
7. **Cited "intake → consignee" for Meridian Freight**, then the company's "director" row. The Findings text says to "Cite the rows that prove a claim"; the briefing says "Cite the fact that shows who directs the company".
8. **Chose PEWTER_SWIFT as Director.** The draft said "The facts you cited show PEWTER_SWIFT. Choose PEWTER_SWIFT for 'Director' above." Both claims then showed Supported.
9. **Submitted the deduction.**

### 4. Evidence table

| Claim                               | Citation                                                                                        | Transmission |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- | ------------ |
| This company is to receive VAL-0733 | intake → consignee: Meridian Freight (2 facts, with "shipment VAL-0733 · intake: INT-CAL-0733") | 2            |
| This operative directs the company  | company Meridian Freight · director: PEWTER_SWIFT (1 fact)                                      | 2            |

There was only one draft (Meridian Freight). I opened none for Meridian Forwarding.

### 5. Friction

- **The case was hard to find.** It is not in the "Clearance 2" section of Assignments, only inside the collapsed Skip ahead group. The only pointer to it was the "Three Couriers" card.
- **Record types in the Documentation tab are collapsed.** Field lists are hidden until you expand each type, and nothing says so. The free-text docs never mention `intake` or `unloadingReceipt` as the place to look when a consignee is blank. The "Not yet opened" note under the results was the real signpost.
- **Results and Documentation panels scroll inside themselves.** Page scrolling didn't move them; I had to click inside the Results panel and press PageDown.
- **The field check never came up.** The briefing spends most of a paragraph on it, but because I found the intake record first, both claims went straight to Supported. That is consistent with the briefing ("When one claim shows Supported and the other shows Needs evidence…").
- **The Director box took two tries.** That was a tool-usage error on my side (the select tool needs the option text), not a game issue.
- **Small wording mismatch:** the briefing says the papers "give the sender and leave the consignee blank". On screen the blank showed as "consignee _nothing returned_", which matches.
- I saw no text that contradicted what the game returned.

### 6. Caveats

- I never triggered the field check, so this run does not test that mechanic, its hour cost, or its dispatch.
- I never cited the unloading receipt or used Meridian Forwarding's draft, so I don't know how a wrong-company submission is handled.
- One run only, on the placement path, not via the Guest Register teaching case.
