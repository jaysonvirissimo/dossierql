# Clean-room solve · The Borrowed Chronometer · 2026-11-23

I solved the case with one transmission and no hints. The shipment carrying the chronometer is **GEN-0211**, going to Dakar, **Senegal**.

## 1. Preflight

- The top right showed **"Clearance 1"**.
- On the Assignments page, "The Borrowed Chronometer" was inside a collapsed group, "Placement: 5 assessments you can attempt now to skip ahead". Once I opened it, the case was labelled "Placement: attempt it to skip ahead". It was not marked completed or in progress. The page also said "0 of 10 cases resolved."

## 2. Outcome

- **Solved.** The debrief heading was "Case resolved" and the stamp was **RECOVERED**.
- **Transmissions:** 1. The reference solution also uses 1.
- **Hours left:** 17 of 18 ("with 17 hours to spare").
- **Completion mode:** "You resolved the case independently, with no hints." Also: "Placement passed. You now hold clearance 2." The header changed to Clearance 2.
- I never opened the Hints tab.

## 3. Steps

1. **Opened the Skip ahead disclosure.** The case wasn't in the Clearance 1 list. The locked Clearance 2 card said "Pass the level 1 assessment, The Borrowed Chronometer". I then clicked "Attempt placement : The Borrowed Chronometer".
2. **Read the briefing and clicked "Open the terminal".** Three clues mattered:
   - "All four shipments left Genoa."
   - "marine chronometer, brass, gimballed."
   - The currency is the "West African CFA franc."
   - The objective is the shipment and its receiving country.
3. **Opened the Documentation tab.** The briefing said: "To check how a query begins, open Documentation and read the Query entry."
4. **Opened the City, Shipment, Country, Currency and Inspection entries.**
   - Query had `city(name: String!)`.
   - City had `departingShipments` and `country`.
   - Shipment had `id`, `manifest`, `destination` and `inspection`. Its notes say the inspection finding "can tell shipments apart when their papers declare the same goods".
   - Country had `currency`, and Currency had `name` and `code`.
5. **Wrote transmission 1:** `query { city(name: "Genoa") { departingShipments { id manifest inspection { finding } destination { name country { name currency { name code } } } } } }`
   - The query shape came from the docs example `query { city(name: "Lisbon") { name } }`, plus their rule that a field returning a record "needs braces after it".
   - I typed all the closing braces and quotes myself. The editor did not double any of them when I read it back.
   - **Outside knowledge:** I already knew GraphQL, so I was confident nesting many levels deep in one query would work. The docs explain how to nest but don't show a deep example.
6. **Read the results:**

   | Shipment | Manifest                                         | Destination            | Currency                        |
   | -------- | ------------------------------------------------ | ---------------------- | ------------------------------- |
   | GEN-0211 | chronometer                                      | Dakar, Senegal         | West African CFA franc (XOF)    |
   | GEN-0236 | same chronometer manifest and inspection finding | Douala, Cameroon       | Central African CFA franc (XAF) |
   | GEN-0240 | barometer                                        | Abidjan, Côte d'Ivoire | XOF                             |
   | GEN-0252 | bicycle frames                                   | Lagos, Nigeria         | NGN                             |

   Only GEN-0211 matches both the description and the currency. I didn't need geography of my own, because the archive returned each country's currency.

7. **Cited three rows for GEN-0211:** manifest, inspection → finding, and destination → country → currency → name. The first Cite opened the GEN-0211 draft, as the Deduction panel said it would.
8. **Chose Receiving country = Senegal.** The claim said "Choose 'Receiving country' above first", and the results show GEN-0211 → country Senegal.
9. **Submitted** once both claims showed "Supported".

## 4. Evidence table (draft for GEN-0211, Senegal)

| Claim                                                 | Citation                                                                                               | Transmission |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------ |
| The shipment matches the observatory's description    | manifest: "Marine chronometer, brass, gimballed" (1 fact)                                              | T1           |
| (same claim, extra)                                   | inspection → finding: "Brass timekeeper in a gimbal mount" (2 facts)                                   | T1           |
| The receiving country uses the West African CFA franc | destination → country → currency → name (4 facts): GEN-0211 → Dakar → Senegal → West African CFA franc | T1           |

## 5. Friction

- **The case is hard to find.** It sits inside a collapsed "Skip ahead" disclosure. The Clearance 2 card names it as the gate, but there's no link to it.
- **The inspection citation didn't count toward the claim.** I cited the inspection finding, but the draft listed only the manifest under "Cited facts that support this claim". The docs say the finding "can tell shipments apart". It isn't clear whether the finding is ignored, unnecessary, or just not shown.
- **The shared manifest is a trap that the docs point the wrong way on.** GEN-0236 has the same manifest and inspection finding as GEN-0211, so only the currency separates them. The Inspection note suggests the finding is what tells shipments apart. In this case it doesn't, which could mislead a new player. The reference solution leaves inspection out entirely.
- **Draft lists every country.** The Receiving country dropdown lists every destination country, not just the lead's destination. That's fine as a test, but worth knowing.
- Nothing on screen contradicted what the game returned. Bracket auto-pairing caused no problems.

## 6. Caveats

- I used only the Findings view. I didn't try the Side by side or Raw response tabs, or the Glossary, Map, Dossiers, Orientation or Tradecraft pages.
- I didn't trigger any error messages, so I haven't checked how a query the clerk can't read is handled.
- I didn't test a wrong submission, or whether submitting with only the manifest and currency cited would have been enough. The draft suggests it would.
- My GraphQL experience made the one-query approach obvious. A newcomer might need more transmissions.
