# Clean-room solve · The Vanishing Azulejos · 2026-11-23

I solved the case with 3 transmissions and took no hints. The debrief shows the stamp "HOLD ISSUED". The game never showed hours left anywhere.

## 1. Preflight

- The header at the top right read **"Clearance 1"**.
- On the Assignments page, "The Vanishing Azulejos" carried only the tag **"Next in the story"**. It was not marked completed or in progress. The page also said "0 of 10 cases resolved."
- Both checks passed.

## 2. Outcome

- **Solved:** yes. The debrief heading is "Case resolved" and the outcome reads "Luanda holds the crate. The clerk files the transfer order with NIGHTJAR's name circled."
- **Stamp:** HOLD ISSUED.
- **Transmissions:** 3. The debrief says "You sent 3 transmissions. The reference solution sends 3 transmissions."
- **Hours left:** not shown. No hours counter or time budget appeared on the case page, the terminal or the debrief. The only time-related text was "Reading the documentation costs no time."
- **Completion mode:** "You resolved the case independently, with no hints."
- I never pressed anything under the Hints tab; I did not open the tab at all.

## 3. Steps

1. **Opened the case and read the briefing.** The Assignments page link "Open case: The Vanishing Azulejos". The briefing said that if a crate's manifest says it holds something other than tiles, "that is evidence enough."
2. **Opened the terminal and read the Shipment entry in the Documentation tab.** The pre-filled editor said: "Add the field that says what each shipment contains. The Documentation tab lists the fields a shipment has." The docs list `manifest: String!`, described as "Customs takes the declaration as evidence of what a shipment holds."
3. **T1:** `query { city(name: "Lisbon") { departingShipments { id manifest } } }`. This is the editor's starter query with `manifest` added, as its comment asked. I also knew GraphQL syntax beforehand, but the docs explain it well enough that I didn't need to.
4. **Cited LIS-0486's manifest ("Blue slate squares (14 cm)") and submitted.** The claim on the form was "The contents of this shipment are not ceramic." The other two manifests say "ceramic". _Outside knowledge:_ reading "slate" as not ceramic is my own, though the side-by-side wording makes it obvious. The draft showed Supported and the deduction was accepted.
5. **Read the City and Country entries in the docs.** Stage 2's objective was "the ceramic shipment going to a country that does not border Namibia." The editor comment said to add "the field that says where each shipment is going." The docs give `destination: City!`, `country: Country!` and `borders`, described as "Countries that share a land border with this one."
6. **T2:** the T1 query plus `destination { name country { name borders { name } } }`.
7. **Cited LIS-0522's destination → country → borders row and submitted.** The result was Praia, Cabo Verde, "borders none". The briefing said to "cite the route evidence for the shipment you set aside." The draft showed Supported, built from 3 facts.
8. **Travel order, with no query.** The form said "This stage needs no new query." I cited LIS-0417's manifest ("Blue ceramic squares (14 cm)") and its borders row (Luanda, Angola, borders including Namibia). I chose Angola in the dropdown myself rather than using the "Choose Angola" button. Both claims showed Supported and I pressed Travel.
9. **Stage 4, Luanda.** This stage was not mentioned in the original briefing. Its briefing said to find who signed the transfer order whose consignee matches the crate's label. The clue said "The depot's intake record gives the label attached to LIS-0417." The editor stub was `city(name:"Luanda")` with the comment "What did the depot record for the arriving shipments?" I expanded the IntakeRecord, TransferOrder, AuthorizationLog, Company and Operative entries in the docs.
10. **T3:** `arrivingShipments { id intake { id consignee { name } } transferOrders { id consignee { name } authorizedBy { codename } authorizationLog { id signedBy { codename } } } }`. I added `authorizationLog` because the docs call it "a separate registry record of who signed." I wanted to check whether it agreed with the signature on the order.
11. **Results and submission.** LIS-0417's intake label says Parallax Freight. Transfer order LUA-012 names Parallax Freight and is authorized by NIGHTJAR, and the log LOG-012 also says NIGHTJAR. LUA-011 names Lantern Export and COPPER_KITE. I opened lead LUA-012 and cited three rows: the intake consignee name, LUA-012's consignee name, and LUA-012's authorized-by codename. I set For shipment to LIS-0417 and Authorized by to NIGHTJAR. Both claims showed Supported, I submitted, and the debrief appeared.

## 4. Evidence table

| Draft                | Claim                                                   | Citation                                                                                                                   | From                               |
| -------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| LIS-0486 (deduction) | Contents not ceramic                                    | manifest: "Blue slate squares (14 cm)" (1 fact)                                                                            | T1                                 |
| LIS-0522 (deduction) | Receiving country has no land border with Namibia       | destination → country → borders: Praia / Cabo Verde / none (complete list) (3 facts)                                       | T2                                 |
| LIS-0417 (travel)    | Matches the registrar's description                     | manifest: "Blue ceramic squares (14 cm)" (1 fact)                                                                          | T1/T2 rows, cited from the T2 view |
| LIS-0417 (travel)    | Destination country borders Namibia (Angola chosen)     | destination → country → borders: Luanda / Angola / DRC, Rep. Congo, Namibia, Zambia (3 facts)                              | T2                                 |
| LUA-012 (deduction)  | Order gives the same consignee as the replacement label | intake → consignee → name: Parallax Freight (3 facts), plus transfer orders → consignee → name: Parallax Freight (3 facts) | T3                                 |
| LUA-012 (deduction)  | This operative authorized the matching order (NIGHTJAR) | transfer orders → authorized by → codename: NIGHTJAR (3 facts)                                                             | T3                                 |

## 5. Friction

- **Hours left was never shown.** The task asks for it, but no time budget appeared anywhere I looked.
- **The case has an extra stage.** The opening briefing and the Assignments card describe only the three crates. The fourth stage (the transfer order in Luanda) appears only after Travel.
- **Collapsed doc entries.** Each type in Documentation is collapsed, and the panel scrolls on its own, separately from the page. My first attempt to expand an entry using just the name "Shipment" timed out; it worked with the full summary line. The Deduction and Results panels also scroll internally, so I sometimes had to read them through the accessibility tree.
- **Cite buttons change label without warning.**
  - In stage 4, the intake rows first showed a plain "Cite" with no target. When I opened lead LUA-012, every one of those buttons changed to "Cite for LUA-012", so my queued click on the intake row timed out and I had to redo it.
  - The form text "If Results asks you to open a lead first…" didn't match what I saw. Results never asked; the buttons simply had no target.
- **The draft fills in the answer for you.** "Choose Angola" and "Choose NIGHTJAR" buttons appear once the citations are in place. This is convenient but weakens the "name your conclusion" step.
- **Unneeded log field.** I also asked for `authorizationLog` in T3. It agreed with `authorizedBy` and wasn't needed; the reference solution leaves it out. It cost nothing extra.
- **Select needs option text.** My first select attempt failed because I passed the option's index; the tool needs the combobox index plus the exact option text.

## 6. Caveats

- I took the shortest path. I did not test wrong submissions, rejected deductions, error messages, or the Hints, Evidence, Dossiers, Map or Glossary tabs.
- I couldn't check the time or hours mechanic because nothing on screen showed it.
- My knowledge of GraphQL may have made the docs seem clearer than they would to a true beginner.
- Only one run on one browser page.
