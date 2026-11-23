# Clean-room solve · The Receipt · 2026-11-23

I solved "The Receipt" in 2 transmissions without taking a hint. The answer is the **Fourth Desk**. I never opened the Hints tab.

## 1. Preflight

- The top right showed **Clearance 6**. ✔
- On the Assignments page, "The Receipt" (Clearance 5 · Coda) was labelled **"Next in the story"**, not completed or in progress. ✔ The page also said "You hold clearance 6. 1 of 10 cases resolved." The only case marked done was The Registrar's Return ("Completed independently").

## 2. Outcome

- **Solved.** Debrief heading: "File closed". **Stamp: UNSIGNED.**
- **Transmissions:** 2. The debrief says the reference solution uses 1.
- **Hours left:** the debrief shows none. The briefing says "Nothing here is timed."
- **Completion mode:** the debrief says "You resolved the case independently, with no hints." The Assignments page now shows "Completed independently" for The Receipt and adds a "Read debrief" link.

## 3. Steps

1. **Opened the case and read the briefing.** I was following the prompt. The objective reads: "Identify the office that cleared the crate's orders and issued your travel orders." The clues: RCT-0417 is for crate LIS-0417; two Luanda transfer orders were cleared by two different offices; the office cleared the payment to Kafue Ceramics Trust; the office issued my Lisbon→Luanda travel order.
2. **Opened the terminal and read the starter text in the editor.** It is a `receipt(id: "RCT-0417")` query with a comment: "releaseOrder is an order: open it, then open its registerEntry. lossReport is already a register entry: open it and ask for its serial."
3. **Read the Documentation tab.** I opened the Query, Receipt, RegisterEntry, TransferOrder, TravelOrder, PaymentOrder, Office, Company, Shipment and City entries. They gave me the field names, plus `travelOrders`, `paymentOrders`, `shipment(id)` and `Shipment.transferOrders`. The text explains that a field returning a record needs braces, and that IDs go in double quotes.
4. **T1:** `receipt(id:"RCT-0417") { id receivedBy releasedBy releaseOrder { id consignee{name} clearedBy{name} registerEntry{serial office{name} note} } lossReport{serial office{name} note} }`. This came from the starter comment and the Receipt, TransferOrder and RegisterEntry entries. The editor readback was correct: typing `}` stepped over the brackets it had auto-closed. Result: REL-0417 went to Tagus Sample Agency and was cleared by Fourth Desk at serial 4126. The loss report is serial 4128, also in Fourth Desk's register. `releasedBy` returned nothing.
5. **T2:** `shipment(id:"LIS-0417"){ transferOrders{...} } paymentOrders{...} travelOrders{...}`, all in one request. This came from the clues and the Query entry. **Outside knowledge:** I already knew that one GraphQL request can hold several top-level fields. The Documentation only says to "put one of its fields inside the braces". Result:
   - LUA-011 (to Lantern Export) was cleared by Luanda Port Office.
   - LUA-012 (to Parallax Freight) was cleared by Fourth Desk.
   - PAY-0501 (to Kafue Ceramics Trust) was cleared by Fourth Desk.
   - TRV-101 (Lisbon→Luanda) was issued by Fourth Desk. In fact all nine travel orders, TRV-101 to TRV-109, were issued by Fourth Desk.
6. **Opened the Fourth Desk lead** from the "Open a lead" menu. The Deduction panel says to "choose the office your claim is about", and Fourth Desk is what the results supported.
7. **Cited findings.** My first citation for claim 1 was not enough. The panel said: "The claim needs more facts that connect to this one." I added the payee row and the claim turned Supported. I then cited the rows for the other two claims (table below).
8. **Submitted** once all three claims showed "Supported".

## 4. Evidence table (draft: Fourth Desk)

| Claim                                                  | Cited findings                                                                                                                    | Transmission |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Cleared an order for the Parallax Circle               | PAY-0501 · payee → name: Kafue Ceramics Trust; PAY-0501 · cleared by: Fourth Desk                                                 | T2           |
| Issued the Lisbon→Luanda travel order                  | TRV-101 · from → name: Lisbon; to → name: Luanda; issued by: Fourth Desk                                                          | T2           |
| Release order's serial is lower than the loss report's | release order → register entry → serial 4126; → office → name Fourth Desk; loss report → serial 4128; → office → name Fourth Desk | T1           |

## 5. Friction

- **Cite counts aren't explained up front.** Citing only "cleared by" for PAY-0501 counted as 1 fact and didn't support the claim. I had to add the payee row. The hint text appeared only after the first citation.
- **The cleared-by citation shows "1 fact".** That suggests nested citations don't pull in their parent rows here, even though the Findings text says a nested citation "also includes the rows it is nested under". The parent here is a list item (payment order PAY-0501), so it may simply not count.
- **"Back to assignments" on the debrief did nothing.** After clicking it the page still showed the debrief. The header's Assignments link worked.
- **The resolved counter didn't change.** The Assignments page still says "1 of 10 cases resolved" after I finished The Receipt, though The Receipt and The Registrar's Return now both show "Completed independently". Either the counter is stale or codas are left out of it, and the page doesn't say which.
- **"Next in the story" moved backwards.** After the coda it now sits on The Vanishing Azulejos (Clearance 1), even though the debrief says "The Shadow Network ends here."
- **Grammar:** the Deduction panel says "A Cite button that shows a office".
- **Multiple top-level fields aren't documented.** The Documentation never says a request can hold more than one top-level field. The debrief's reference solution does exactly that.
- **Deduction claim 3 never asks for the 4127 objection entry.** The debrief makes it the story's key point. Only the reference query opens `register` to reveal it, so a player who solves the case never sees it.

## 6. Caveats

- I never queried `Office.register`, so I didn't see entry 4127 or any countersignatures myself. The debrief described them.
- I didn't test wrong leads, wrong submissions, error messages, variables, or the Vim mode.
- I didn't check the Glossary, Tradecraft manual, Orientation, Map, Dossiers or Evidence tabs.
- Hours-left or timing behaviour couldn't be observed, because the case is untimed.
