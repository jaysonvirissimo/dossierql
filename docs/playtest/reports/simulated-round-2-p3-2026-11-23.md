# Simulated playtest · Round 2 · P3 · 2026-11-23

# DossierQL playtest, round 2: _Guest Register_, _Quiet Consignee_, _Three Couriers_ and the alias kata

The persona finished all four items on the round-2 path. They took no hints, viewed no solutions, and the clerk returned no requests unread. That run was very smooth, and I can't fully trust it: I never made a syntax error, and a real non-programmer probably would have. See section 8.

## 1. Preflight

- **2 is 2 passes.** The header showed **Clearance 2**, and the desk said "You hold clearance 2. 2 of 10 cases resolved."
- _The Guest Register_ was marked "Next in the story", so it was neither completed nor in progress.
- _The Vanishing Azulejos_ and _The Borrowed Chronometer_ were both "Completed independently". I didn't play round 1.

## 2. Per-stage table

| Stage                                     | Transmissions                | New things (person's words)                                                                                    | Controls the person couldn't explain | Hints / solution | Stamp, hours left               | Notes                                                                                      |
| ----------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------- | ------------------------------- | ------------------------------------------------------------------------------------------ |
| Guest Register, stage 1 (Luanda → travel) | 1                            | "Putting the codename inside the quotes in the brackets"; "Rule out this lead (free)"; the "complete list" tag | none                                 | none / none      | 22/26 after travel              | The editor came pre-filled with `operative(codename: "")`. I ruled out two leads for free. |
| Guest Register, stage 2 (Zanzibar)        | 1                            | "Starting from a cover name instead of a person"; the "Filed under" box                                        | none                                 | none / none      | **IDENTIFIED**, 21 left         | I never saw the look-alike name. Typing "Dr. Lund" exactly was enough.                     |
| Quiet Consignee (assessment)              | 3, plus a 2-hour field check | "Blank editor, I write it all"; field check; intake record; "nothing returned"                                 | none                                 | none / none      | **HELD**, 13 left (clearance 3) | The reference took 1 transmission.                                                         |
| Three Couriers, stage 1                   | 1                            | "Alias: a name and a colon in front, so I can ask for the same thing three times"                              | none                                 | none / none      | 19/23 after travel              | The alias link took me off the case page.                                                  |
| Three Couriers, stage 2                   | 1                            | Nothing new; I reused `first:` from the template                                                               | none                                 | none / none      | **PAYMENT STOPPED**, 18 left    | No rule-out button appeared in this form.                                                  |
| Kata "Two lookups in one transmission"    | 1                            | "The answer comes back as raw JSON, not rows"                                                                  | none                                 | n/a              | Passed (untimed)                |                                                                                            |

## 3. Stage interviews (as recorded, in order)

1. **Guest Register, stage 1**
   - **New:** quotes inside brackets; the docs paragraph on `()`, `""` and `!`; Rule out; the country dropdown; "complete list".
   - **Controls:**
     - Cite attaches a row to a sighting's draft.
     - Open a lead picks which sighting I'm arguing about.
     - The Country dropdown is my answer.
     - Rule out strikes off a wrong sighting for free.
     - Travel commits me, for 3 hours.
   - **Facts from memory:** the name claim rests on SGT-031 giving "M. Calloway" plus NIGHTJAR's cover names (Calloway, Vasco). The Swahili claim rests on Zanzibar City → Tanzania → its languages include Swahili. This matched what I cited.
   - **Caveat:** the screenshot I took to see the travel result already showed the next stage's clue (Dr. Lund) before I recorded this interview.
2. **Guest Register, stage 2**
   - **New:** a query that starts from a cover name; "Filed under"; a "Choose MARBLE_HERON" shortcut button.
   - **Facts from memory:** Dr. Lund's sighting SGT-040 was in Zanzibar City, and Dr. Lund's operative is MARBLE_HERON. This matched what I cited.
   - I wasn't sure whether I'd dodged the "hurried clerk" trap or missed something.
3. **Quiet Consignee**
   - **New:** a blank editor, the field check, the intake record.
   - **Controls:** Director is who runs the company. "Order a field check" pays hours for the local office to tell me which record to look in.
   - **Facts from memory:** the receiving claim rests on VAL-0733's intake record naming Meridian Freight. The director claim rests on Meridian Freight's director being PEWTER_SWIFT. This matched what I cited.
4. **Three Couriers, stage 1**
   - **New:** aliases, plus the fields `organization` and `lastKnownLocation`, which I learned from the template.
   - **Facts from memory:** GREY_PETREL is in the Parallax Circle, and Lusaka → Zambia has borders that include Tanzania. This matched what I cited.
   - **Stall:** the alias link left the case page.
5. **Three Couriers, stage 2**
   - **New:** nothing.
   - **Facts from memory:** Kafue is registered in Mozambique, whose languages include Portuguese, and its director MARBLE_HERON is in the Parallax Circle. This matched what I cited.
6. **Kata**
   - I used the technique straight away and had to work nothing out again.
   - The kata text gave the alias pattern again, so this was close to copying.

## 4. Syntax ledger

| Syntax                                                                                | Where I learned it                                                                                                                            |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `query { … }`, braces, nesting                                                        | Round 1, already earned (the "Fields and nested selections" concept card). The Documentation intro repeats it.                                |
| Argument `(codename: "…")`, double quotes                                             | The pre-filled editor in the Guest Register. Documentation: "`String` inside the parentheses means … text, which you write in double quotes." |
| `!` (never typed)                                                                     | Documentation: "You never type a `!` in a query."                                                                                             |
| `coverNames`, `sightings`, `nameGiven`, `city`, `country`, `languages`                | Documentation › Operative / Sighting / City / Country                                                                                         |
| `coverName(name:)`                                                                    | The template in Guest Register stage 2, and Documentation › Query                                                                             |
| `shipment(id:)`, `shipper`, `consignee`, `transferOrders`, `director`, `registeredIn` | Documentation › Shipment / Company / TransferOrder                                                                                            |
| `intake { consignee }`                                                                | The field-check dispatch ("its intake record … says who is to receive them") and Documentation › IntakeRecord                                 |
| `organization`, `lastKnownLocation`, `borders`                                        | The Three Couriers template (I didn't reopen the docs)                                                                                        |
| Alias `name: field(...)`                                                              | The Glossary "alias" entry, reached from the briefing link: "`first: operative(codename: "NIGHTJAR")`"                                        |
| Several top-level fields in one query                                                 | The Guest Register debrief reference, and the Glossary "query" entry                                                                          |

**Leaks:**

- I typed every query on one line on purpose, to avoid the editor's auto-indent. The person had no on-screen reason to do that.
- In 6 transmissions I made no typo and no brace mismatch. That reflects my own fluency, not the persona's.

**Auto-closing:** the editor's automatic closing of `(`, `"` and `{` never changed what I meant to type. Each readback matched.

## 5. Points of confusion

1. **The "alias" link leaves the case**
   - **Where:** _Three Couriers_ briefing, the "alias" link.
   - **What happened:** I expected the Glossary tab to open inside the case. Instead the link went to the full Tradecraft manual page.
   - **What I did:** used browser Back.
   - **What would have helped:** open the in-case Glossary tab, or a popover.
2. **The "hurried clerk" look-alike was never visible**
   - **Where:** _Guest Register_ stage 2, the briefing.
   - **What happened:** the briefing warns of two names a clerk could confuse, but an exact lookup never shows the second one. Only the debrief named it (D. Lund, TIN_FALCON). I was left unsure whether I'd missed a step.
   - **What I did:** typed "Dr. Lund" exactly, as the clue said, and moved on.
   - **What would have helped:** a line such as "An argument must match exactly; a near-miss returns nothing."
3. **"shipments none" next to the dispatch's "who is to receive them"**
   - **Where:** _Quiet Consignee_, Meridian Freight's company record.
   - **What happened:** the record said "shipments none", which briefly made Freight look like the wrong lead.
   - **What I did:** the field check got me past it.
   - **What would have helped:** a note in the docs that `Company.shipments` only lists the papers' consignee, not the intake record's.
4. **No rule-out step in some forms**
   - **Where:** _Quiet Consignee_ and _Three Couriers_ stage 2, the deduction forms.
   - **What happened:** these forms gave no way to strike off the losing leads, which the Guest Register had taught me to do.
   - **What I did:** left them unchecked and submitted.
   - **What would have helped:** say in the form when ruling out isn't needed.

## 6. The round's own questions

**Leads I ruled out, and why they looked plausible:**

- **SGT-027** looked right because Kenya speaks Swahili. Ruled out because the name it gave, H. Brandt, isn't on NIGHTJAR's list.
- **SGT-034** gave M. Calloway, a real cover name. Ruled out because Mozambique has no Swahili.
- **Meridian Forwarding** was the only company on the papers. Ruled out because it is the shipper, and customs asked not to be given the sender.
- **SABLE_IBIS** is in the Parallax Circle. Ruled out because Comoros has no land borders.
- **TIN_FALCON** is in Kenya, which borders Tanzania. Ruled out because it belongs to the Baltic Exchange Bureau.
- **Copperbelt Clay Works** has a Circle director. Ruled out because Zambia doesn't list Portuguese.
- **Beira Tile Agency** is in Mozambique. Ruled out because its director is TIN_FALCON.

**Kata:** the technique carried over completely, and I worked nothing out again. The test was weak, though, because the kata prompt spells out `chile: country(name: "Chile")`.

**Incomplete claims:** none were left incomplete. The nearest was the _Quiet Consignee_ "receive" claim. The draft said "Needs evidence" and offered a field check, and the dispatch named the record to look in. That was enough to find it.

**Round 1 questions** (the Luanda label and the clock) don't apply, because I didn't play round 1.

## 7. At the end

- **Moments that stood out:**
  - The draft turning a claim into "Contradicted" and offering a free rule-out felt fair.
  - The field check felt like a sensible lifeline, not a penalty.
  - The debriefs that compare my queries with a reference were useful.
- **Would this person play another case?** Yes. Each case made them read a clue, check a list and see a satisfying stamp. The jargon stayed manageable because every new term came with an example.

## 8. Caveats

- **Too fluent:** I wrote long nested and aliased queries in one go, with no errors. A real ops person would likely have mismatched a brace or misspelled a field, and the "returned at no cost" path went untested.
- **One-line typing:** a deliberate habit with no on-screen source. See the ledger.
- **Early look at the next stage:** I saw the Guest Register stage-2 clue before recording the stage-1 interview.
- **Things I knew from GraphQL that may have helped unnoticed:**
  - Asking for several fields at the top level of one query is fine.
  - An exact-match argument wouldn't return the look-alike name.
  - `Company.shipments` meant the papers' consignee only.
- **Not covered:** round 1, the Orientation and the drill set weren't played, so there are no Luanda-label or clock findings.

---

## Rerun on the revised build

I played all four items on the round 2 path as the operations persona. All three cases were resolved with no hints and no solutions viewed, in 9 paid transmissions in total. The kata passed on the first try. No request was ever returned unread, and auto-closing of braces and quotes never changed what I meant to type. The run is easier than a real player's would be, because I already know GraphQL (see Caveats).

### 1. Preflight

- **Round 2 check: passed.** The header showed **Clearance 2**. The desk read "You hold clearance 2. 2 of 10 cases resolved." _The Guest Register_ was labelled **"Next in the story"**, not completed and not in progress.
- The Azulejos and the Chronometer were both labelled "Completed independently". Three Couriers was locked behind clearance 3.

### 2. Per-stage table

| Stage                                  | Transmissions sent | New things, in the person's words                                                                                                                                              | Controls I couldn't explain | Hints / solution | Stamp, hours left                                  | Notes                                                                                                                                                                |
| -------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- | ---------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guest Register, Luanda                 | 1                  | Putting a codename in parentheses after a field to get one file; quotes around text; "!" means required and I never type it; free Rule out; "Country of the sighting" dropdown | none                        | none / no        | — (case clock: 25 of 26 left after this query)     | One query fetched cover names and all 3 sightings with their country languages. Two leads ruled out, then travel (3 hours).                                          |
| Guest Register, Zanzibar City          | 1                  | Looking up a cover name typed exactly, dot included; "Filed under" dropdown and its "Choose …" shortcut                                                                        | none                        | none / no        | **IDENTIFIED**, 21 of 26 hours left                | The look-alike name, D. Lund, never appeared because I typed the exact name. I only learned of the trap from the debrief.                                            |
| The Quiet Consignee (assessment)       | 3                  | Blank editor; company lookup; field check; intake record; Director box                                                                                                         | none                        | none / no        | **HELD**, 13 of 18 hours left; reached clearance 3 | Stalled briefly at "consignee: nothing returned / transfer orders: none". The field check (2 hours) pointed to the intake record. The reference used 1 transmission. |
| Three Couriers, Zanzibar City          | 1                  | Alias: a nickname and a colon before a field, so I can ask for operative three times                                                                                           | none                        | none / no        | — (case clock: 22 of 23 left after this query)     | The starter query and the comment "Ask for GREY_PETREL and TIN_FALCON in this same transmission" told me the inner fields.                                           |
| Three Couriers, Lusaka                 | 1                  | nothing new                                                                                                                                                                    | none                        | none / no        | **PAYMENT STOPPED**, 18 of 23 hours left           | Reused aliases on company.                                                                                                                                           |
| Kata "Two lookups in one transmission" | 1 (free)           | nothing new                                                                                                                                                                    | none                        | none / no        | Passed                                             | The kata's own text repeats the alias rule and gives an example.                                                                                                     |

### 3. Stage interviews (as recorded, not revised)

**Guest Register, stage 1**

1. New:
   - The value in parentheses (`operative(codename: "NIGHTJAR")`).
   - Quotes around text.
   - "!" means required and I never type it.
   - Ruling out a lead for free.
   - The country dropdown.
2. What the controls were for:
   - Cite puts a row into a sighting's draft.
   - Rule out drops a wrong sighting for free.
   - Travel submits the order for 3 hours.
   - The country dropdown tells the form which country I mean.
   - The Documentation tab gave me the field names.
3. Which facts support each claim:
   - From memory: M. Calloway plus NIGHTJAR's cover list (M. Calloway, E. Vasco); Zanzibar City is in Tanzania, where Swahili is spoken.
   - Against the citations: it matches. The languages citation also counted the city and country rows (3 facts).

**Guest Register, stage 2**

1. New:
   - The `coverName(name: "Dr. Lund")` lookup, typed exactly.
   - The "Filed under" dropdown and its "Choose" button.
2. What the controls were for:
   - Cite adds rows to the draft.
   - Filed under picks the operative I'm naming.
   - Submit deduction closes the stage.
3. Which facts support each claim:
   - From memory: Dr. Lund was given in sighting SGT-040 in Zanzibar City, and the name is filed under MARBLE_HERON.
   - Against the citations: it matches.

**The Quiet Consignee**

1. New:
   - A blank editor, so I wrote the whole query.
   - Looking up a company by name.
   - The field check.
   - The intake record.
   - The Director box.
2. What the controls were for:
   - The field check: when I can prove the director but not the receiving, it asks the local office where to look next.
   - The Director box says which operative I'm naming.
   - Submit hands in the deduction.
3. Which facts support each claim:
   - From memory: intake record INT-CAL-0733 lists Meridian Freight as consignee, and the company record lists PEWTER_SWIFT as director.
   - Against the citations: it matches.

**Three Couriers, stage 1**

1. New:
   - Aliases.
   - The fields organization, lastKnownLocation and borders.
2. What the controls were for:
   - Cite, Rule out and Travel as before.
   - "Country last seen in" picks the country I'm claiming, and "Choose Zambia" fills it in.
3. Which facts support each claim:
   - From memory: GREY_PETREL is in the Parallax Circle; he was last seen in Lusaka, Zambia, and Zambia borders Tanzania.
   - Against the citations: it matches.

**Three Couriers, stage 2**

1. New: no new syntax.
2. What the controls were for: Cite and Submit deduction, both clear.
3. Which facts support each claim:
   - From memory: Kafue is registered in Mozambique, where Portuguese is spoken; its director MARBLE_HERON is in the Parallax Circle.
   - Against the citations: it matches.

**Kata**

- I used the alias technique directly and didn't have to work anything out again.

### 4. Syntax ledger

| Syntax                                                                                                                            | Where I learned it                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query { … }`, braces, nesting                                                                                                    | Round 1 (taken as known). Restated in Documentation: "Write `query` and a pair of braces…"                                                        |
| Argument in parentheses, `codename: "…"`                                                                                          | The Guest Register starter query and its comment "Write the codename between the quotes". Documentation explains `city(name: String!)`.           |
| Double quotes for text and IDs                                                                                                    | Documentation: "In a query you write an identifier in double quotes, as you write text."                                                          |
| `!` is never typed                                                                                                                | Documentation: "You never type a `!` in a query."                                                                                                 |
| Field names (coverNames, sightings, nameGiven, city, country, shipper, consignee, transferOrders, intake, director, registeredIn) | The Documentation entries for each type                                                                                                           |
| `languages { name }`                                                                                                              | **Small leak.** I guessed that Language has a `name` field without opening the Language entry. The guess matches the pattern of every other type. |
| `organization`, `lastKnownLocation`, `borders`                                                                                    | The Three Couriers starter query. Borders is also in the Documentation's Country entry.                                                           |
| Alias `name: field(...)`                                                                                                          | Glossary entry "alias" (linked from the briefing). The starter used `first:`. The kata text gave `chile:`.                                        |
| One field holding a single value takes no braces (`capital`)                                                                      | Documentation: "Holds a single value, so this field takes no braces."                                                                             |

**Leaks:**

- The `languages { name }` guess above.
- More broadly, I wrote one query that combined everything I needed from the start. Someone who doesn't program might have sent several smaller queries.

### 5. Points of confusion

1. **The empty consignee in The Quiet Consignee**
   - **Where:** first results panel.
   - **What happened:** I expected `consignee` or `transferOrders` to name the receiver. I got "nothing returned" and "none".
   - **What I did:** I looked up Meridian Freight and then used the field check, whose dispatch named the intake record.
   - **What would have helped:** One line in the Shipment documentation: "When the papers leave the consignee blank, the depot's intake record may show it."
2. **The Dr. Lund trap never showed itself**
   - **Where:** Guest Register stage 2.
   - **What happened:** I typed the exact name, so the look-alike never appeared and the lesson about exact matching only came in the debrief.
   - **What I did:** Nothing was needed.
   - **What would have helped:** Nothing, really. This is acceptable, but the stage teaches exact matching only to players who get it wrong.
3. **Ruling out was uneven across forms**
   - **Where:** the deduction forms in The Quiet Consignee and in Three Couriers stage 2.
   - **What happened:** Travel orders had a "Rule out this lead (free)" step. On these deduction forms I never reached one. I simply picked the right lead, and I couldn't tell whether ruling out was even possible there.
   - **What would have helped:** Say whether deductions need rule-outs.
4. **The kata gives the answer away**
   - **Where:** the kata text.
   - **What happened:** It restates the alias rule and gives `chile: country(name: "Chile")`, so it tests copying more than recall.

### 6. The round's own questions

- **Plausible leads and what ruled them out:**

  | Lead                  | Why it looked plausible                             | What ruled it out                                 |
  | --------------------- | --------------------------------------------------- | ------------------------------------------------- |
  | SGT-027               | Kenya speaks Swahili                                | The name H. Brandt isn't a cover name             |
  | SGT-034               | Its name, M. Calloway, is a cover name              | Mozambique has no Swahili                         |
  | Meridian Forwarding   | It's tied to the shipment and has the Meridian name | It's the shipper, the sender customs warned about |
  | TIN_FALCON            | Kenya borders Tanzania                              | His organization is the Baltic Exchange Bureau    |
  | SABLE_IBIS            | He's a Parallax member                              | Comoros has no land borders                       |
  | Copperbelt Clay Works | Its director is Parallax                            | Zambia doesn't speak Portuguese                   |
  | Beira Tile Agency     | It's in Mozambique and has "Tile" in its name       | Its director is TIN_FALCON                        |

- **Kata:** I could apply aliases to the Chile and Peru records directly and didn't have to work anything out again. Because the prompt gives the example, the kata shows little about transfer.
- **Incomplete claims:** none. The only claim that stayed at "Needs evidence" for a while was "This company is to receive VAL-0733". The draft named the field check button but not where to look. The dispatch supplied that.
- **Pattern matching:** none that I noticed. I copied the starter's inner block three times in Three Couriers, but I understood what each part did.

### 7. At the end

- **Moments that stood out:**
  - Ruling out leads for free, which feels good.
  - The field check dispatch, which got me past the empty consignee.
  - The Kafue name misdirection.
  - The unsigned note from "M" in the Three Couriers debrief.
- **Would this person play on?** Yes. The cases reward reading carefully, the Documentation explains its notation in plain words, and no screen hit me with jargon I couldn't look up. The glossary covered "alias".

### 8. Caveats

- I know GraphQL. I wrote one combined, deeply nested query on the first try in each case. A real non-programmer would probably send more transmissions, misplace braces, and hit returned requests. This run never had a returned request, so it can't show whether the clerk's notes help.
- **Leak:** the `languages { name }` guess (section 4).
- I chose the shipment-first plan in The Quiet Consignee and checked for transfer orders without being prompted. That choice came partly from what I know.
- I read the round 2 preflight check, "2 is 2", as "round 2". The header and desk matched that reading.
- Round 1 wasn't played here, so its questions (the Luanda label and the clock) don't apply to this run.

---

## Earlier run preserved from Git

## DossierQL simulated playtest · Round 2 · Persona 3

### 1. Preflight

The header showed **Clearance 2** and the assignments desk showed **2 of 10 cases resolved**. The Guest Register was labeled **Next in the story**, with no completion or in-progress marker. Both clearance 1 cases were marked **Completed independently** and Three Couriers was locked behind The Quiet Consignee. I used the round 2 preflight. I did not open Orientation or play the round 1 drills or cases.

### 2. Per-stage table

| Stage                                        |     Transmissions sent | New things, in my words                                                                                                                                                                                                   | Controls I could not explain                                                                                | Hints or solutions          | Stamp and hours left                  | Notes                                                                                                                   |
| -------------------------------------------- | ---------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| The Guest Register · Luanda travel order     |                      1 | “Put the codename between quotes to get one file. Follow the reports to their countries’ language lists. The table lines up each report and one Cite can gather facts above the row.”                                     | None of the controls I used. How the combined citations were counted took a reread.                         | None                        | Travel approved, 22/26 h after travel | Ruled out SGT-027 and SGT-034 for free. Travel cost 3 h.                                                                |
| The Guest Register · Zanzibar City deduction |                      1 | “Type the name exactly as it was signed, period and title included. When the form says Needs a choice, I still have to give it my answer.”                                                                                | None                                                                                                        | None                        | **IDENTIFIED**, 21/26 h               | Cited an extra given-name row. The city citation already carried the link from Dr. Lund to the sighting.                |
| The Quiet Consignee · Callao deduction       |                      3 | “Start with a blank editor and look up the shipment by its number. Ask for a shipment and a company in one transmission. The depot has its own record. Pay for a field check if the first papers leave the answer blank.” | None after reading the briefing and seeing the dispatch                                                     | None. Field check cost 2 h. | **HELD**, 13/18 h. Clearance 3.       | Ruled out the sender. Shipment consignee returned “nothing returned” as data. The request itself went through.          |
| Three Couriers · Tanzania travel order       | 2 attempts, 1 accepted | “The three answers would all be called operative. Put a different label and colon before each request so I can tell which is which.”                                                                                      | None. I hesitated when a paid field check was available alongside a form that said the facts were complete. | None. Free Glossary used.   | Travel approved, 19/23 h after travel | One request returned unread, costing 0 h. Ruled out SABLE_IBIS and TIN_FALCON. Travel cost 3 h.                         |
| Three Couriers · Zambia deduction            |                      1 | “Use different labels on company lookups too. Follow the country to its languages and the director to their organization.”                                                                                                | None                                                                                                        | None                        | **PAYMENT STOPPED**, 18/23 h          | Ruled out Copperbelt Clay Works and Beira Tile Agency. The debrief counted 2 accepted transmissions for the whole case. |
| Training · Two lookups in one transmission   |                1, free | “Use different labels for two country requests. The JSON shows the labels above the two answers.”                                                                                                                         | None                                                                                                        | None                        | **Passed**, untimed                   | Chile returned Santiago and Peru returned Lima. I did not look back at Three Couriers.                                  |

### 3. Stage interviews

1. **The Guest Register · Luanda.** “The text in parentheses picks the file. I had to follow City to Country to see the languages. Side by side puts the facts on rows and gives each report a column. Cite adds proof and can open the draft for that lead. The country dropdown is where I state my answer. Rule out saves a contradiction for free. Travel sends the order for three hours. From memory, SGT-031’s guest gave M. Calloway and NIGHTJAR’s own list had that name. The report was in Zanzibar City, in Tanzania, and Tanzania listed Swahili.” The two name citations and one languages citation matched. The languages button carried all three location facts.
2. **The Guest Register · Zanzibar City.** “I used the exact spelling of Dr. Lund, then asked which operative the registry files it under and where a guest gave that name. Cite attaches facts. Choose fills in the operative. Submit sends the deduction. I thought I used the city and the signed-name row to prove someone gave that name in Zanzibar City.” The claim actually listed Dr. Lund’s sightings list and SGT-040’s city, both from the city citation. The separate signed-name citation was unnecessary. The second claim used the Dr. Lund → MARBLE_HERON relationship as expected.
3. **The Quiet Consignee.** “I had to write the whole thing from a blank editor. I used the shipment number in quotes and sent a company request beside it. Cite saved the proof. Rule out crossed the sender off. Choose filled in the director. The field check cost two hours, told me where to look, and kept what I’d cited. Submit sent the completed form. The shipment points to intake INT-CAL-0733, which lists Meridian Freight as consignee. The company row says its director is PEWTER_SWIFT.” The two citation buttons yielded exactly those three proof facts.
4. **Three Couriers · Tanzania.** “The clerk returned the request when the three answers would have the same name. The Glossary showed a label written before the field and followed by a colon. The headings came back with those labels. Cite attaches facts, Rule out saves a contradiction, Choose fills the country and Travel sends it. I didn’t need a field check once the draft said I had all the facts. GREY_PETREL belongs to the Parallax Circle. The last location is Lusaka, in Zambia, and Zambia’s borders list includes Tanzania.” The organization and borders citations matched. The latter carried the location and country.
5. **Three Couriers · Zambia.** “I used the labels again for companies and asked for two different trails from each company. This time the open lead was my answer. Cite adds the registration with the country’s languages, or the director with their organization. Rule out saves the contradiction and Submit sends the deduction. Kafue Ceramics Trust is registered in Mozambique, which lists Portuguese, and its director MARBLE_HERON belongs to the Circle.” The displayed citations matched those four facts.
6. **Training kata.** “I put a different label and colon before each country request. I worked out which countries and fields the exercise wanted from the prompt and starter. Transmit here is free and the exercise checks that both answers come back using the technique. There’s no deduction form.” The result showed both capitals under the two labels and marked the exercise Passed.

### 4. Syntax ledger

| First use                      | Syntax or field                                                                                                                     | Where I learned it                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guest Register · Luanda        | `query`, outer braces, line breaks and nested selections, `operative(codename: "...")`                                              | Starter displayed the shape and said “Whose file? Write the codename between the quotes.” Documentation → Query said to write `query` and a pair of braces and showed `query { city(name: "Lisbon") { name } }`. The guide distinguished parentheses with quoted values from braces with requested fields.                                                                         |
| Guest Register · Luanda        | `codename`, `coverNames`, `sightings`, `id`, `nameGiven`, `city`, `country`, `languages`, and the various `name` fields             | Starter had `codename`. Documentation → Operative named the cover-name and sighting lists. CoverName gave `name`. Sighting gave `id`, `nameGiven` and `city`. City gave `name` and `country`. Country gave `name` and `languages`. Language gave `name`. Each entry said whether the field needed braces.                                                                          |
| Guest Register · Luanda        | `String!`, `ID!`, and list notation such as `[Country!]!`                                                                           | Documentation explained text and identifiers in double quotes, a field returning a list of records, and that `!` is in the reference rather than in the query. I never typed these markers.                                                                                                                                                                                        |
| Guest Register · Zanzibar City | `coverName(name: "Dr. Lund")`, nested `operative { codename }`, and `sightings` on a CoverName                                      | Starter put the name in quotes and said to write it exactly as the register had it. Case clue specified the title. Documentation → Query had `coverName(name: String!): CoverName`. CoverName said it had an Operative and a list of Sightings. The earlier sections supplied the child fields.                                                                                    |
| Quiet Consignee · Callao       | Two different top-level fields in one query                                                                                         | Guest Register debrief explicitly showed `coverName` and `city` directly inside the outer braces and said two questions there are one transmission.                                                                                                                                                                                                                                |
| Quiet Consignee · Callao       | `shipment(id: "VAL-0733")`, `company(name: "...")`, `shipper`, `consignee`, `director`, and `intake { id consignee { name } }`      | Documentation → Query had `shipment(id: ID!): Shipment` and `company(name: String!): Company`. Shipment supplied `id`, `shipper`, `consignee` and `intake`. Company supplied `name` and `director`. The field-check dispatch pointed to the intake record. Documentation → IntakeRecord supplied `id` and its own `consignee`.                                                     |
| Three Couriers · Tanzania      | `organization { name }`, `lastKnownLocation { name country { name borders { name } } }`                                             | Starter contained these exact selections under SABLE_IBIS. I repeated that block and changed the codenames.                                                                                                                                                                                                                                                                        |
| Three Couriers · Tanzania      | `first: operative(...)`, `second: operative(...)`, `third: operative(...)`                                                          | The clerk’s note on the returned request said a response could not hold two entries both called `operative` and directed me to Glossary. The alias entry said “a name you choose for a field’s result” and showed `first: operative(codename: "NIGHTJAR")`. The three headings confirmed what the labels do.                                                                       |
| Three Couriers · Zambia        | `registeredIn`, combined paths through `director { codename organization { name } }` and `registeredIn { name languages { name } }` | Company documentation listed `registeredIn: Country` and `director: Operative`. Operative documentation confirmed `organization: Organization`. The name selection for Organization came from the Tanzania starter. Country and Language fields were already documented in The Guest Register. The Zambia starter showed `first: company(name: "Copperbelt Clay Works") { name }`. |
| Kata                           | `chile: country(name: "Chile") { name capital }` and matching `peru:` request                                                       | Exercise prompt explicitly showed `chile: country(name: "Chile")` and asked for Peru’s capital too. Starter had `name` and `capital`. The technique carried over from Three Couriers.                                                                                                                                                                                              |

I recorded no instance of typing syntax before a visible example or field entry supplied it. I used no fragments, variables or punctuation from other clearances. The presence of a source cannot tell me how much previous GraphQL knowledge sped up combining documented pieces.

### 5. Points of confusion

1. **Where:** The Guest Register, Luanda, Documentation and terminal. **What happened:** I knew which facts I wanted but had to follow six separate entries to determine the exact one-transmission shape. The field shown inside parentheses and the colon that describes what comes back were easy to confuse until I reread the Lisbon example. **What I did:** I followed the return names through Operative, CoverName, Sighting, City, Country and Language and read the editor back. **What would have helped:** Make return names like `City` and `Country` open the corresponding entries.
2. **Where:** The Guest Register, Luanda and Zanzibar City, Results and draft. **What happened:** Rows such as “name given” and “name given → name” displayed identical text. In Zanzibar City I also assumed the given-name citation was necessary in addition to the city citation. **What I did:** I checked the facts listed under each supported claim. The city citation included the fact that SGT-040 is in Dr. Lund’s own sightings list. **What would have helped:** Show which facts each Cite button will attach, with the list visible before or immediately after the click.
3. **Where:** The Guest Register, Luanda, Travel order. **What happened:** After citing M. Calloway, “more facts that connect to this one” did not say which fact was missing. The separate country choice also remained blank despite the result showing the country. **What I did:** I reused the cover-name list from the first lead and chose Tanzania after citing the languages. **What would have helped:** Say “Cite NIGHTJAR’s cover-name list” after the given name is cited. Use the existing “Needs a choice” language consistently when evidence already establishes the country.
4. **Where:** The Quiet Consignee, Callao, Findings and deduction. **What happened:** Shipment consignee returned nothing and the receiving claim only said “Needs evidence.” The field-check action appeared only after I chose the director, even though the proof was already attached. **What I did:** I chose PEWTER_SWIFT and paid 2 h for the dispatch. It identified the intake record. **What would have helped:** Add a short line at the receiver claim explaining that another record can supply the missing consignee and that the field check becomes available after the director is chosen.
5. **Where:** Three Couriers, Tanzania, starter and Results. **What happened:** I carried over “two requests in one transmission” and copied the operative request three times with distinct codenames. The clerk returned it unread because the responses still shared the same field name. **What I did:** I followed the clerk’s note to the Glossary and added distinct aliases. That first revision worked and the rejected attempt spent 0 h. **What would have helped:** Link the alias entry near the starter’s “same transmission” instruction, or link straight to it from the clerk’s note.
6. **Where:** Three Couriers, Tanzania, travel draft. **What happened:** “Order a field check (3 hours)” appeared even while the draft said “The facts you cited are complete” and offered Choose Zambia. I paused over whether the paid check was another required step. **What I did:** I chose Zambia. Both claims became Supported and the field check disappeared. **What would have helped:** Hide the check when the evidence is complete and only a form choice remains.

### 6. The round’s own questions

#### Plausible leads

| Lead ruled out        | Why it looked plausible                                                  | What ruled it out                                                                                    |
| --------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| SGT-027               | Filed under NIGHTJAR, and Kenya’s list includes Swahili.                 | The guest gave H. Brandt. NIGHTJAR’s complete list showed M. Calloway and E. Vasco.                  |
| SGT-034               | Filed under NIGHTJAR, and the guest gave M. Calloway.                    | The sighting was in Maputo, Mozambique. The archive’s complete language list had no Swahili.         |
| Meridian Forwarding   | It asked customs about the cases, and the papers name it.                | The papers name it as the shipper. The draft treated that as a contradiction of the receiving claim. |
| SABLE_IBIS            | Member of the Parallax Circle.                                           | Moroni is in the Comoros, whose complete borders list was empty.                                     |
| TIN_FALCON            | Last seen in Nairobi, Kenya, whose list includes a border with Tanzania. | The organization is Baltic Exchange Bureau.                                                          |
| Copperbelt Clay Works | Its director OPAL_WREN belongs to the Parallax Circle.                   | Registered in Zambia, whose complete language list did not include Portuguese.                       |
| Beira Tile Agency     | Registered in Mozambique, which lists Portuguese.                        | Director TIN_FALCON belongs to the Baltic Exchange Bureau.                                           |

The Guest Register debrief disclosed the look-alike D. Lund after completion. I did not query or open it as a lead. The clue said Dr. Lund with the title, and the one lookup established the cover name’s connections.

#### Kata transfer

I followed the Three Couriers debrief’s direct link to the training exercise and did not reopen the case. I transferred the reason for distinct labels, their placement before a repeated field, and the colon. I worked out the new lookup field, the two country names and the desired result field from the exercise itself. I sent once and both answers came back under my labels. The exercise prints the Chile alias as part of the instructions, so this measures application with a reminder.

#### Incomplete claims

Every required claim was eventually complete. In The Guest Register the draft gave a useful prompt to choose a country and gave an exact operative-choice button. The partial cover-name message was less precise about the missing list. In The Quiet Consignee the draft identified the unsupported receiver claim but offered no record name until I used the field check. Its dispatch plus Documentation then gave enough to retrieve the intake evidence. In Three Couriers the Zambia claim gave the exact choice once its proof was present. The paid field check alongside that prompt briefly made the path less clear.

### 7. At the end

“The side-by-side comparison made it satisfying to cross out a report for one clear reason, even when its other clue fit. I also liked learning from a request the clerk returned for free. The two labels in the exercise looked like keys in a JSON file I might edit at work. I’d play another case. The records have enough detail to make the decisions feel like mine, and I’d use the free Documentation before spending hours on another field check.”

### 8. Caveats

This was a simulated playtest using rendered accessibility text and a browser bridge. It does not measure reading time, visual discoverability, manual editor behavior or how auto-closing punctuation feels during typing. The bridge replaced the editor and returned the text for verification. The opening state was already at clearance 2, so this says nothing about how the persona acquired the earlier skills. I recorded no definite syntax leak. Familiarity with GraphQL may still have shortened the process of tracing record types, assembling several nested selections in one query, choosing enough fields to give a useful result, and distinguishing an empty field from a failed request. I left the repeated unaliased calls in the first Three Couriers attempt to test the inference a player could make from the previous debrief and starter. The kata’s explicit alias reminder limits what its first-attempt success can show about recall.
