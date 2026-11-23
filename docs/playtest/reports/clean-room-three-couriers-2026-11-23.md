# Clean-room solve · Three Couriers · 2026-11-23

I solved "Three Couriers" with 2 transmissions. I took no hints and never opened the Hints tab.

## 1. Preflight

- The top right of the page showed **Clearance 3**.
- On the Assignments page, "Three Couriers" was labelled **"Next in the story"**. It was not marked completed or in progress.

## 2. Outcome

- **Solved.** The debrief heading was "Case resolved" and the stamp was **PAYMENT STOPPED**.
- **Answers:** the courier was **GREY_PETREL**, who went to **Zambia** (last seen in Lusaka). In the second stage, the payment was going to **Kafue Ceramics Trust**.
- **Transmissions:** 2. The debrief says the reference solution also uses 2.
- **Hours left:** 18 of 23. The travel order cost 3 hours.
- **Completion mode:** the debrief says "You resolved the case independently, with no hints". The Assignments page now shows "Completed independently" and "2 of 10 cases resolved".

## 3. Steps

1. **Read the briefing.** The case page named the three couriers and gave two clues: the courier is a Parallax Circle member, and "crossed a land border out of Tanzania". It said each transmission costs 1 hour, and pointed to "alias in the Glossary".
2. **Opened the terminal.** I used the "Open the terminal" button on the briefing page.
3. **Read the alias definition.** I clicked the "alias" link in the briefing. It opened the Tradecraft manual page, whose Glossary says: write a name and a colon before the field, as in `first: operative(codename: "NIGHTJAR")`, and one query can then ask for the same field twice. I used Back to return.
4. **Read the Documentation tab.** I opened the Operative entry. It lists `organization`, `lastKnownLocation`, and the other fields.
5. **Transmission 1.** I asked for all three couriers in one query, each under an alias, with the same fields as the starter query.
   - The starter query in the editor showed those fields (`codename`, `organization { name }`, `lastKnownLocation { name country { name borders { name } } }`).
   - Its comment said "Ask for GREY_PETREL and TIN_FALCON in this same transmission".
   - The alias syntax came from the Glossary. I picked the alias names myself.
   - I read the editor back before sending. The automatic bracket and quote closing did not duplicate anything.
6. **Read the results.**
   - SABLE_IBIS: Parallax Circle, last seen in Moroni, Comoros, borders "none".
   - GREY_PETREL: Parallax Circle, last seen in Lusaka, Zambia. Zambia's borders include Tanzania.
   - TIN_FALCON: Baltic Exchange Bureau, last seen in Nairobi, Kenya.
   - Only GREY_PETREL meets both clues. I relied on the Documentation saying `borders` means "Countries that share a land border". I used no outside geography.
7. **Filled in the travel order.** I cited two GREY_PETREL rows, chose Zambia under "Country last seen in", and pressed Travel (3 hours). The draft showed both claims as "Supported".
8. **Read the stage 2 briefing.** There were three payees. Clues: the payee is registered in a country where Portuguese is spoken, and the payee's director is a Parallax member. The Documentation entries for Company, Country and Language list `registeredIn`, `director`, and `languages`.
9. **Transmission 2.** I asked for all three companies under aliases, with each one's registration country, its languages, and its director's organization.
   - The starter query used `first: company(...)`, with the comment "Compare the other two payees in this same transmission".
   - The field names came from the Documentation.
10. **Read the results.**
    - Kafue Ceramics Trust: registered in Mozambique (languages include Portuguese), director MARBLE_HERON of the Parallax Circle.
    - Copperbelt Clay Works: registered in Zambia, where Portuguese is not listed.
    - Beira Tile Agency: its director, TIN_FALCON, belongs to the Baltic Exchange Bureau.
    - Only Kafue meets both clues.
11. **Submitted the deduction.** I cited two Kafue rows, both claims showed "Supported", and I pressed Submit deduction.

**Outside knowledge:** I did not need any geography. I already knew how GraphQL aliases work, but everything I used was also shown on screen in the Glossary and the starter queries.

## 4. Evidence table

| Draft                            | Claim                                        | Citation                                                                                     | Transmission |
| -------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------ |
| Travel order (GREY_PETREL)       | Member of the Parallax Circle                | organization → name (2 facts): The Parallax Circle                                           | T1           |
| Travel order (GREY_PETREL)       | Last seen in a country that borders Tanzania | last known location → country → borders (3 facts): Lusaka → Zambia → list including Tanzania | T1           |
| Deduction (Kafue Ceramics Trust) | Registered in a Portuguese-speaking country  | registered in → languages (2 facts): Mozambique, Portuguese…                                 | T2           |
| Deduction (Kafue Ceramics Trust) | Director is a Parallax member                | director → organization → name (3 facts): MARBLE_HERON → The Parallax Circle                 | T2           |

## 5. Friction

- **The "alias" link leaves the terminal.** In the briefing, it opens the full Tradecraft manual page instead of the terminal's Glossary tab. Back restored the terminal and nothing was lost, but linking to the in-terminal Glossary tab would keep the player in place.
- **One Cite button label doesn't match the others.** Under TIN_FALCON in transmission 1, the nested organization row was labelled "Cite name". The matching rows for the other two couriers said "Cite organization → name".
- **The draft suggests the answer.** After the citations, the travel order showed "The facts you cited show Zambia" with a "Choose Zambia" button. This is convenient, but it fills in the conclusion for the player. I picked Zambia from the dropdown myself.
- **My first dropdown selection failed.** The error came from my browser tool (it needs the dropdown number and the option text), not from the game. The second attempt worked.
- **The second objective isn't visible at the start.** The opening objective is only the courier and the country. The payee stage appears after travel, so a player can't plan for it.
- **The "Not yet opened" notes only appear on the first record.** They are shown under the first aliased result but not the second or third. It's a small inconsistency.
- I found no on-screen text that contradicted what the game returned.

## 6. Caveats

- Every query worked first time, so I saw no error messages, no free malformed requests, and no wrong-answer feedback.
- I didn't try citing wrong or incomplete evidence, so I don't know how the game handles weak drafts.
- I didn't use the Map, Dossiers, Evidence, Side by side or Raw response views. Of the Hints tab, I saw only its tab name.
- I didn't test the clock running out, restarting, or "Investigate again".
- The debrief shows the reference solution automatically after resolution. I didn't request it.
- This was one run, in one browser, with the accessibility tree as my main view. I didn't check the visual layout through screenshots.
