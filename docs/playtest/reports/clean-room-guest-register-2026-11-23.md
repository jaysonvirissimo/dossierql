# Clean-room solve · The Guest Register · 2026-11-23

I solved "The Guest Register" in 2 transmissions with no hints. The debrief stamp is **IDENTIFIED**, with 21 of 26 hours left, and the Assignments page records the case as **"Completed independently"**.

## 1. Preflight

- **Clearance:** the top right showed "Clearance 2". The Assignments page said "You hold clearance 2. 1 of 10 cases resolved."
- **Case status:** "The Guest Register" was tagged only "Next in the story", not completed or in progress.

Both checks passed.

## 2. Outcome

- **Result:** solved. The debrief heading was "Case resolved", stamp IDENTIFIED: "You resolved the case independently, with no hints, with 21 hours to spare."
- **Transmissions:** 2. The debrief says the reference solution also uses 2.
- **Hours left:** 21 of 26. Each transmission cost 1 hour and travel cost 3; ruling out leads was free.
- **Recorded mode:** "Completed independently". The Assignments page now says "2 of 10 cases resolved".
- **Hints:** I never opened the Hints tab.

## 3. Steps

1. **Opened the case and read the briefing.** It said to identify the NIGHTJAR sighting and its country, and to rule out a lead by citing a fact that contradicts one of its claims. Clues: a true sighting gives a name from NIGHTJAR's own file, and the guest bargained in Swahili.
2. **Opened the terminal.** The editor's starter text was `operative(codename: "")`, with comments asking for the cover names and where the operative has been seen.
3. **Read the Documentation tab** and expanded Operative, Sighting, CoverName, Country, Language and City. This gave the fields `coverNames`, `sightings`, `nameGiven`, `city`, `country` and `languages`.
4. **Transmission 1:** `query { operative(codename: "NIGHTJAR") { codename coverNames { name } sightings { id note nameGiven { name } city { name country { name languages { name } } } } } }`
   - **Why:** the Documentation fields from step 3, plus the briefing note that each transmission costs 1 hour however much it asks for.
   - **Outside knowledge:** I wrote it on one line with nested braces. The Documentation shows the brace form, so this barely relied on prior GraphQL knowledge. I also expected the editor to skip over closing brackets I typed, and the readback confirmed it.
   - **Result:** cover names M. Calloway and E. Vasco, plus three sightings:

     | Sighting | Name given  | City          | Country    | Languages                                        |
     | -------- | ----------- | ------------- | ---------- | ------------------------------------------------ |
     | SGT-027  | H. Brandt   | Mombasa       | Kenya      | English, Swahili                                 |
     | SGT-031  | M. Calloway | Zanzibar City | Tanzania   | Swahili, English, Arabic                         |
     | SGT-034  | M. Calloway | Maputo        | Mozambique | Portuguese, Makhuwa, Tsonga, Nyanja, Sena, Lomwe |
5. **Ruled out SGT-027 (free).** I cited its name given and the cover names, following the briefing ("cite the name given and the complete list of cover names"). The name claim turned "Contradicted", and "Rule out this lead (free)" appeared. Dispatch: H. Brandt is filed under COPPER_KITE.
6. **Ruled out SGT-034 (free).** I cited city → country → languages, and the Swahili claim turned "Contradicted". Dispatch: "nobody there bargains in Swahili".
7. **Built the SGT-031 travel order.** I cited name given → name, city → country → languages and cover names. The form said "The facts you cited show Tanzania", so I pressed "Choose Tanzania". Both claims showed "Supported", and I clicked Travel (3 hours).
8. **Stage 2 began.** The new objective was "Identify the operative who dined with NIGHTJAR". The clue said the guest signed as "Dr. Lund, title included", and the starter text said to write the cover name "exactly as the register has it".
9. **Transmission 2:** `query { coverName(name: "Dr. Lund") { name operative { codename } sightings { id city { name } } } }`
   - **Why:** the CoverName fields in the Documentation and the stage 2 starter text.
   - **Result:** operative MARBLE_HERON, with one sighting, SGT-040 in Zanzibar City.
10. **Submitted the deduction.** I cited operative → codename and sightings → city → name. The form said "The facts you cited show MARBLE_HERON", so I pressed "Choose MARBLE_HERON", then "Submit deduction". The debrief followed.

## 4. Evidence table

| Draft                | Claim                                           | Citation (facts)                                                          | Transmission | Status       |
| -------------------- | ----------------------------------------------- | ------------------------------------------------------------------------- | ------------ | ------------ |
| SGT-027 (ruled out)  | Name is one of NIGHTJAR's cover names           | name given → name: H. Brandt (2); cover names: M. Calloway, E. Vasco (1)  | T1           | Contradicted |
| SGT-034 (ruled out)  | In a Swahili-speaking country                   | city → country → languages: Maputo, Mozambique, no Swahili (3)            | T1           | Contradicted |
| SGT-031 (travel)     | Name is a NIGHTJAR cover name                   | name given → name: M. Calloway (2); cover names (1)                       | T1           | Supported    |
| SGT-031 (travel)     | In a Swahili-speaking country, Tanzania chosen  | city → country → languages: Zanzibar City, Tanzania, includes Swahili (3) | T1           | Supported    |
| Dr. Lund (deduction) | A guest in Zanzibar City gave this name         | sightings → city → name: SGT-040, Zanzibar City (3)                       | T2           | Supported    |
| Dr. Lund (deduction) | Filed under this operative, MARBLE_HERON chosen | operative → codename: MARBLE_HERON (2)                                    | T2           | Supported    |

## 5. Friction

- **Inconsistent country requirement.** On SGT-027 the Swahili claim said "Choose 'Country of the sighting' above first." On SGT-034 the same claim was marked Contradicted with no country chosen. It's unclear whether a country choice is needed before a contradiction counts.
- **Surprise second stage.** The first objective, "Identify the sighting… and the country it was in", reads like the whole case, but travel opened a second stage with a new objective. A note in the briefing that the case has more than one stage would help.
- **Look-alike name never shown.** The stage 2 briefing warns of "two cover names that a hurried clerk could read as Dr. Lund", but the look-alike (D. Lund, filed under TIN_FALCON) only appears in the debrief. The exact-match query skipped the trap entirely, so the lesson that arguments match exactly is easy to miss in play.
- **Travel button.** I clicked Travel by screen coordinates from a screenshot rather than by control number. It worked the first time.
- **Recovered "Cite" shortcut.** A row's Cite button sends the citation to the draft of the lead it belongs to, while the top-level rows (codename, cover names) go to the currently open draft. After I opened another draft, the "cover names" button's target changed from SGT-027 to SGT-034, then to SGT-031. This worked, but it is easy to cite into the wrong draft without reading the button label.
- I found no mismatch between the on-screen text and what the game returned.

## 6. Caveats

- I only tried the efficient path. I didn't test error messages, wrong-name queries, a wrong conclusion, the free cost of an unreadable request, or the timeout.
- I didn't need to rule out the two false sightings, since the briefing calls it optional. So I haven't tested whether travelling without ruling them out works.
- The Glossary, Tradecraft manual, Orientation, Map, Dossiers and Evidence tabs went unread, so I can't comment on them.
- One run, one browser, accessibility-tree-driven. It says nothing about how a sighted mouse user or keyboard-only user experiences the layout.
