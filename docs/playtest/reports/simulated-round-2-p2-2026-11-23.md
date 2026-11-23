# Simulated playtest · Round 2 · P2 · 2026-11-23

# DossierQL playtest, round 2: SQL analyst persona

## 1. Preflight

- The header showed **Clearance 2**. The desk read "2 of 10 cases resolved."
- _The Guest Register_ was marked "Next in the story", so it was neither completed nor in progress. The check passed.

## 2. Per-stage table

| Stage                    | Transmissions | New things (in the person's words)                                                                                                                          | Controls I couldn't explain                                     | Hints / solution                | Stamp, hours left                             | Notes                                                                                                                       |
| ------------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Guest Register, Luanda   | 1             | "Parentheses after a field act like a WHERE"; quotes around text; `!` means required and I never type it; ruling a lead out with a fact that contradicts it | none                                                            | none / none                     | —                                             | One query fetched all 3 sightings. I guessed `Language.name` without checking it.                                           |
| Guest Register, Zanzibar | 1             | A second top-level lookup, `coverName(name:)`, which matches the text exactly                                                                               | none                                                            | none / none                     | **IDENTIFIED**, 21h left of 26                | The exact match meant I never saw the "D. Lund" look-alike trap                                                             |
| Quiet Consignee          | 3             | Two top-level lookups in one query (copied from the last debrief); "nothing returned" is a NULL; the intake record; the field check                         | none                                                            | none / none. 1 field check (2h) | **HELD**, 13h left of 18; reached clearance 3 | I held back a second `company()` in transmission 1 because I feared a duplicate-name clash. That cost 1 extra transmission. |
| Three Couriers, Zanzibar | 1             | Aliases: `label: field(...)`, with the label in front (backwards from SQL `AS`)                                                                             | Why Tin's organization-name Cite counted as "bears on no claim" | none / none                     | —                                             | Aliases worked on the first try                                                                                             |
| Three Couriers, Lusaka   | 1             | Nothing new; the same alias shape on `company`                                                                                                              | none                                                            | none / none                     | **PAYMENT STOPPED**, 18h left of 23           | Retyping the same block 3 times felt like SQL without a CTE                                                                 |
| Kata: Two lookups        | 1             | nothing                                                                                                                                                     | —                                                               | none                            | Passed                                        | The kata prompt contains the example almost word for word                                                                   |

## 3. Stage interviews (as recorded at the time)

- **Guest Register, Luanda.** New: an argument in parentheses works like WHERE but sits on the field; quotes; `!` is required and never typed; rule out; the "complete list" tag. Every control was clear. From memory: 031 gave M. Calloway, and that name is on the cover list (M. Calloway, E. Vasco). Zanzibar City is in Tanzania, where Swahili is spoken. This matched what I cited.
- **Guest Register, Zanzibar.** New: `coverName`, and an exact-text match. From memory: Dr. Lund has a sighting, SGT-040, in Zanzibar City, and the name is filed under MARBLE_HERON. This matched what I cited. I didn't notice that the draft also labelled the sightings "complete list."
- **Quiet Consignee.** New: two top-level lookups; a null consignee; no transfer orders; the field check. The field check was clear: pay 2h and get a pointer to the intake record. From memory: intake INT-CAL-0733 names Meridian Freight, whose director is PEWTER_SWIFT. This matched. The long stall came after the null consignee: I had no idea where the receiver was recorded until the field check told me.
- **Three Couriers, Zanzibar.** New: aliases, with the label written before the field. One control I couldn't explain (point 1 below). From memory: GREY_PETREL is in the Parallax Circle and was last seen in Lusaka, Zambia, which borders Tanzania. This matched.
- **Three Couriers, Lusaka.** Nothing new. From memory: Kafue is registered in Mozambique, where Portuguese is spoken, and its director MARBLE_HERON is in the Parallax Circle. This matched.
- **Kata.** I carried the technique over directly and passed first time.

## 4. Syntax ledger

| Syntax                                                                                                                                                  | Where I learned it                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `query { … }`, braces, nested selections                                                                                                                | Earned in round 1. The Documentation tab repeats them: "Write `query` and a pair of braces…"                                        |
| `field(arg: "value")`                                                                                                                                   | Guest Register starter editor `operative(codename: "")`, and the Documentation intro "`city(name: "Lisbon")`…"                      |
| Double quotes for text and IDs                                                                                                                          | Documentation: "which you write in double quotes"; "an identifier in double quotes"                                                 |
| `!`                                                                                                                                                     | Documentation: "You never type a `!` in a query"                                                                                    |
| Field names (`coverNames`, `sightings`, `nameGiven`, `city`, `country`, `shipper`, `consignee`, `intake`, `transferOrders`, `director`, `registeredIn`) | The type entries in the Documentation tab                                                                                           |
| `languages { name }`                                                                                                                                    | **Leak (small).** I never opened the `Language` entry. I assumed `name` from the pattern of the other types.                        |
| `organization`, `lastKnownLocation`, `borders`                                                                                                          | Three Couriers starter editor                                                                                                       |
| Two top-level fields in one query                                                                                                                       | Guest Register debrief, "Two questions in one query are still a single transmission". The glossary entry for "query" says the same. |
| Alias `label: field(...)`                                                                                                                               | Three Couriers briefing → Glossary "alias": "`first: operative(codename: "NIGHTJAR")`"                                              |
| `capital`                                                                                                                                               | Kata starter editor                                                                                                                 |

## 5. Points of confusion

1. **Where:** Three Couriers, stage 1, the Results Cite button on TIN_FALCON's organization name.
   - **What happened:** On Sable and Grey this button reads "Cite organization → name" and counts as 2 facts. On Tin it reads just "Cite name" and counts as 1 fact. The draft then said "Bears on no claim for this lead," and the claim stayed "Needs evidence."
   - **What I did:** I cited the parent "organization" row instead, and the claim became Contradicted.
   - **What would have helped:** Label the button and count the facts the same way on every alias. If a citation bears on no claim, suggest the parent row.
2. **Where:** Quiet Consignee, transmission 1, the Terminal.
   - **What happened:** My SQL instinct said that two `company(...)` fields would clash like duplicate column names. I split the lookup into two transmissions. The briefing didn't say whether this was safe; that only came in the next case.
   - **What I did:** I spent an extra hour.
   - **What would have helped:** The Guest Register debrief could add one line: "the same field twice needs aliases, which come at clearance 3."
3. **Where:** Quiet Consignee, Results after the consignee came back with "nothing returned."
   - **What happened:** I expected the consignee field or the transfer orders to name the receiver. I found nothing pointing to the intake record until I ordered the field check.
   - **What I did:** I paid for the field check (2h), which pointed me to the intake record.
   - **What would have helped:** This may be the intended design. Still, the line under "consignee: nothing returned" could say "the papers left this blank; other records may say who received it."
4. **Where:** Three Couriers briefing, the "alias" link.
   - **What happened:** The link leaves the case for the Tradecraft manual page.
   - **What I did:** I used browser Back.
   - **What would have helped:** Open the definition in the case's own Glossary tab.
5. **Where:** Guest Register, Zanzibar stage.
   - **What happened:** I typed the exact string "Dr. Lund," so the look-alike lead never appeared and the "hurried clerk" trap taught nothing. I only learned about D. Lund from the debrief.
   - **What would have helped:** This is a note for the designers rather than a confusion.

## 6. The round's own questions

- **Plausible leads, and what ruled them out:**
  - SGT-027 looked right because Kenya speaks Swahili. H. Brandt is not one of NIGHTJAR's cover names.
  - SGT-034 gave the right cover name, M. Calloway. Mozambique's languages don't include Swahili.
  - Meridian Forwarding asked customs about the cases and has a near-identical name. It is the shipper, not the receiver.
  - TIN_FALCON went to Kenya, which borders Tanzania. Its organization is the Baltic Exchange Bureau.
  - SABLE_IBIS is a Parallax member. Comoros has no land borders.
  - Copperbelt Clay Works has a Parallax director. Zambia has no Portuguese.
  - Beira Tile Agency is in Mozambique and has "Tile" in its name. Its director is TIN_FALCON, of the Baltic bureau.
- **Kata:** The technique transferred completely and needed no rework. The kata prompt contains `chile: country(name: "Chile")`, so it tests transfer only weakly.
- **Incomplete claims:** none in the end. The one claim that stalled was Tin's (point 1), and the draft's "Bears on no claim" message was a clue but didn't say what to cite instead.

## 7. At the end

- **Moments that stood out:**
  - Three sightings came back in one query and I resolved them by citing alone.
  - The alias order is the reverse of SQL's `AS`, and I noticed it at once.
  - The field check broke the dead end in Callao.
  - The "M" note in the Three Couriers debrief.
- **Would this person play on?** Yes. The cases reward packing one transmission well, the way a good SQL join does, and the clock makes that feel worth it. I'm curious about fragments, because the repeated selection block is irritating.

## 8. Caveats

- **Leak:** I assumed `Language { name }` without reading its entry.
- **Possible hidden help:**
  - I knew GraphQL already, so typing well-formed nested braces on one line, and never mis-nesting them, was probably easier for me than for a real newcomer.
  - My hesitation over duplicate fields was in character, but I already knew the answer.
  - I may have trusted that `null` and an empty list mean what they mean in GraphQL.
- **Editor auto-closing:** It never changed what I typed. Typing the closing characters seems to step over the ones the editor inserted, and every readback matched exactly. A person typing across several lines might see something different.
- **Coverage:** This run covered round 2 only. The rules applied to me rather than to a real reader, so the speed of reading and the ease of citing are probably better than a real newcomer would manage.

---

## Rerun on the revised build

I played all four items on the round 2 path. Every case was solved with no hints and no solutions viewed. The only real stumble was in _The Quiet Consignee_, where I asked for the same company lookup twice in one request and the clerk sent it back. That mistake set up the aliases lesson well. The kata at the end tested less than it should, because its own text gives away the technique.

### 1. Preflight

- **Header:** "Clearance 2".
- **Desk:** "2 of 10 cases resolved".
- **_The Guest Register_:** marked "Next in the story", so not completed and not in progress. The check passed.
- **Side observation:** _The Quiet Consignee_ was not listed under the Clearance 2 heading. It was reachable only through the Guest Register debrief's "Next case" link, or presumably the "Skip ahead" placement group.

### 2. Per-stage table

| Stage                    | Transmissions                  | New things (person's words)                                                                                                                                                  | Controls I couldn't explain                                     | Hints / solution       | Stamp, hours left        | Notes                                                             |
| ------------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------- | ------------------------ | ----------------------------------------------------------------- |
| Guest Register: Luanda   | 1                              | "Arguments in parentheses, like WHERE codename = …"; "text goes in double quotes"; "the `!` means required, but I never type it"; Rule out (free); the "(complete list)" tag | Why SGT-034 was marked Contradicted before I picked its country | none                   | (clock 25/26)            | One nested query held every fact I needed                         |
| Guest Register: Zanzibar | 1                              | "Asking for a cover name directly, an exact match like =, not LIKE"; Filed-under box; Submit deduction                                                                       | none                                                            | none                   | **IDENTIFIED**, 21h      | I never saw the look-alike name D. Lund                           |
| Quiet Consignee          | 3 sent, plus 1 returned unread | Blank editor; "two different lookups in one query are fine, but the same lookup twice gets bounced"; field check                                                             | none                                                            | none (field check, 2h) | **HELD**, 13h            | Clearance 3 granted. The reference solution needed 1 transmission |
| Three Couriers: Zanzibar | 1                              | "Aliases: like AS, but the name goes in front"; results come back under my names                                                                                             | none                                                            | none                   | (19/23 after travel)     | The alias link took me out of the case to the manual. I used Back |
| Three Couriers: Lusaka   | 1                              | nothing new                                                                                                                                                                  | none                                                            | none                   | **PAYMENT STOPPED**, 18h | Lots of copying the same field list three times                   |
| Kata: Two lookups        | 1                              | nothing new                                                                                                                                                                  | none                                                            | none                   | Passed                   | The kata text gives away the technique                            |

### 3. Stage interviews (as recorded)

- **Guest Register, Luanda**
  - _New:_ arguments, double-quoted text, the `!` meaning "required", Rule out, the "complete list" tag.
  - _Claims from memory:_
    - Cover name: SGT-031 gave M. Calloway, and NIGHTJAR's list is M. Calloway, E. Vasco.
    - Swahili: Zanzibar City is in Tanzania, which lists Swahili, English and Arabic.
    - This matched what I cited.
  - _Couldn't explain:_ why SGT-034 was contradicted before I chose a country.
- **Guest Register, Zanzibar**
  - _New:_ exact-match `coverName("Dr. Lund")`.
  - _Claims:_ Dr. Lund's only sighting is SGT-040, in Zanzibar City, and the name is filed under MARBLE_HERON. This matched what I cited.
- **Quiet Consignee**
  - _New:_ blank editor, the clerk's rule against repeating a lookup, the field check.
  - _Claims:_ the intake record INT-CAL-0733 names Meridian Freight as consignee, and Meridian Freight's director is PEWTER_SWIFT. This matched what I cited.
- **Three Couriers, Zanzibar**
  - _New:_ aliases, plus the fields organization, lastKnownLocation and borders.
  - _Claims:_ GREY_PETREL is in The Parallax Circle, and Lusaka is in Zambia, which borders Tanzania. This matched what I cited.
- **Three Couriers, Lusaka**
  - _New:_ no new syntax.
  - _Claims:_ Kafue is registered in Mozambique (which lists Portuguese), and its director MARBLE_HERON is in Parallax. This matched what I cited.
- **Kata:** I applied the technique directly and had nothing to work out again.

### 4. Syntax ledger

| Syntax                                                                                         | Where I learned it                                                                                                           |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `query { … }`, braces, nesting                                                                 | Round 1 (concept card "Fields and nested selections"), and again in the Documentation intro                                  |
| `field(arg: "value")`                                                                          | Guest Register starter template in the editor, and the Documentation paragraph "The Query entry shows city(name: String!)…"  |
| Double quotes for text and IDs                                                                 | Documentation: "In a query you write an identifier in double quotes"                                                         |
| `!` is never typed                                                                             | Documentation: "You never type a ! in a query"                                                                               |
| Field names: coverNames, sightings, nameGiven, languages, director, shipper, intake, consignee | Documentation entries, opened for Operative, Sighting, CoverName, Country, Company, Shipment, IntakeRecord and TransferOrder |
| organization, lastKnownLocation, borders                                                       | Three Couriers starter template                                                                                              |
| Two top-level fields in one query                                                              | Guest Register debrief: "asks for two things directly inside the outer braces"                                               |
| Alias `name: field(...)`                                                                       | Glossary entry "alias", reached from the briefing link                                                                       |

**Leaks:**

- **L1:** I typed `city { country { … } }` and `languages { name }` without opening the City or Language entries in this session. I was relying on memory of round 1, or on GraphQL knowledge; I can't point to a place on screen in round 2.
- **L2:** In The Quiet Consignee, my first draft left out the second `company` lookup because I knew it would clash. I recorded this, then rewrote and sent what the persona would send. The clerk returned it.
- **L3:** I wrote every query on one compact line. That is my habit, not the persona's.

### 5. Points of confusion

1. **The same lookup twice was returned**
   - **Where:** Quiet Consignee, Results panel.
   - **What happened:** I expected two `company(...)` lookups to work, like two WHERE clauses. The request was returned. The error mentioned "aliases", which were not yet taught.
   - **What I did:** followed the clerk's note and split the request into separate transmissions.
   - **What would have helped:** a clerk's note that adds "you'll learn a way around this at clearance 3", or that hides the word "aliases" in the raw error before the lesson.
2. **Contradicted before a country was chosen**
   - **Where:** Guest Register, Luanda, SGT-034 draft.
   - **What happened:** the claim was marked Contradicted even though the draft said "Choose Country of the sighting first".
   - **What I did:** ruled the lead out anyway.
   - **What would have helped:** drop the "choose first" text once a citation already settles the claim.
3. **The alias link left the case**
   - **Where:** Three Couriers briefing.
   - **What happened:** the link opened the full Tradecraft manual instead of the in-case Glossary tab.
   - **What I did:** used browser Back.
   - **What would have helped:** open the in-case Glossary tab instead.
4. **I didn't think to open the intake record**
   - **Where:** Quiet Consignee.
   - **What happened:** I had no reason to look at `intake`. I paid 2 hours for a field check, then 1 more transmission.
   - **What I did:** followed the dispatch to the intake record.
   - **What would have helped:** this is probably intended, since the briefing explains the field check.
5. **Copying the same field list**
   - **Where:** Three Couriers, both stages.
   - **What happened:** I had to copy the same field list three times. A SQL user would notice this. It probably sets up the Fragments lesson.

### 6. The round's own questions

- **Plausible leads, and what ruled them out:**

  | Lead                | Why it looked plausible                            | What ruled it out                                      |
  | ------------------- | -------------------------------------------------- | ------------------------------------------------------ |
  | SGT-027             | Kenya speaks Swahili                               | H. Brandt is not on the cover list                     |
  | SGT-034             | It gave M. Calloway, a real cover name             | Mozambique has no Swahili                              |
  | Meridian Forwarding | Asked customs about the cases, near-identical name | It is the shipper (not formally ruled out in the form) |
  | TIN_FALCON          | Kenya borders Tanzania                             | Baltic Exchange Bureau                                 |
  | SABLE_IBIS          | Parallax member                                    | Comoros has no land borders                            |
  | Copperbelt          | Parallax director                                  | Zambia has no Portuguese                               |
  | Beira               | Mozambique, "Tile" in the name                     | Director is Baltic                                     |

- **Kata:** I transferred the technique cleanly and had nothing to work out again. But the kata prompt restates the rule and gives `chile:` as the example, so it tests almost no recall.
- **Incomplete claim:** the Quiet Consignee "receives VAL-0733" claim. I thought the missing piece was a receiving record. The papers' consignee was blank and there were no transfer orders. The draft didn't say where to look, but the field-check dispatch did.

### 7. At the end

- **Moments that stood out:**
  - The "(complete list)" tag, which makes "not in the list" provable.
  - The returned request in The Quiet Consignee setting up the aliases lesson.
  - The raw JSON keyed `chile`/`peru`.
- **Would play on?** Yes. Each case pays off in one or two queries, mistakes cost nothing, and the copy-paste in Three Couriers makes me curious whether there's a "write it once" feature next.

### 8. Caveats

- The leaks above:
  - L1: City/Language field names came from memory.
  - L2: I pre-empted the duplicate-field clash, then corrected myself.
  - L3: one-line query formatting.
- My GraphQL knowledge probably made me more confident about how deep to nest. I asked for every fact up front in each query, so I rarely needed a second transmission. A real SQL user might send more, smaller queries.
- I never opened Hints, so hint cost and quality are untested.
- Round 1 was outside this run's path, so the Orientation and the first-case experience are not covered here.

---

## Earlier run preserved from Git

## Round 2 playtest — P2, daily SQL user

### 1. Preflight

The header read **Clearance 2**, and the desk said **2 of 10 cases resolved**. The first two cases were marked Completed independently. The Guest Register was labeled **Next in the story** and had no completion or in-progress marker. Orientation was outside this round's path and I did not open it.

### 2. Per-stage table

| Stage                             | Transmissions sent | New things, in my words                                                                                                                                                 | Controls I couldn't explain | Hints / solution viewed          | Stamp and clock                     | Notes                                                                                                                                 |
| --------------------------------- | -----------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | -------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| The Guest Register, Luanda        |                  1 | “Put the codename in parentheses to get one file. I can ask for linked rows in the same request. A complete list can disprove a claim.”                                 | None used                   | 0 / no                           | Travel approved, 22/26 hours left   | Ruled out Mombasa and Maputo, traveled on SGT-031 for 3 hours.                                                                        |
| The Guest Register, Zanzibar City |                  1 | “Use the full name, period and all. I still have to choose the answer after I cite it.”                                                                                 | None used                   | 0 / no                           | IDENTIFIED, 21/26 hours left        | Dr. Lund → MARBLE_HERON. Two sends matched the reference count.                                                                       |
| The Quiet Consignee, Callao       |                  3 | “Two different lookup names can fit inside one request. A field check tells me where to look. The depot's record has a receiver even if the shipping papers are blank.” | None used                   | 0 / no, field check cost 2 hours | HELD, 13/18 hours left, clearance 3 | Ruled out Meridian Forwarding. Identified Meridian Freight and PEWTER_SWIFT. Reference needed one send.                               |
| Three Couriers, Tanzania          |                  1 | “An alias is basically the key I want in the returned object. I can run three lookups with the same field name.”                                                        | None used                   | 0 / no                           | Travel approved, 19/23 hours left   | Ruled out SABLE_IBIS and TIN_FALCON. Traveled to Zambia for 3 hours.                                                                  |
| Three Couriers, Zambia            |                  1 | “I can do the same thing with the companies and work out which details to ask for.”                                                                                     | None used                   | 0 / no                           | PAYMENT STOPPED, 18/23 hours left   | Ruled out Copperbelt Clay Works and Beira Tile Agency. Stopped Kafue Ceramics Trust's payment. Two sends matched the reference count. |
| Two lookups in one transmission   |                  1 | “Pick two new keys. Use the new country and capital fields.”                                                                                                            | None used                   | 0 / no                           | Passed, untimed                     | Santiago under chile and Lima under peru. No return to Three Couriers.                                                                |

The clerk returned no requests unread. The “nothing returned” at the shipment's consignee was part of a successful response. Standard debriefs displayed references after the cases were solved. I did not open a solution during play.

### 3. Stage interviews

#### Guest Register, Luanda

- “The parentheses give the lookup a codename. Braces let me say what I want from each record. A Cite can open a draft for a specific sighting, and citing a nested row carries some of the rows above it. I can use a complete list to prove that something's missing.”
- “Documentation gave me the exact field spellings and what they return. Transmit ran the query for an hour. Cite attached what I found. Rule out dismissed a lead free once I had a contradiction. The country box stated where I wanted to go. Travel sent the supported order and cost three hours.”
- “From memory the Zanzibar report says M. Calloway and NIGHTJAR has M. Calloway and E. Vasco on file. The SGT-031 report puts the guest in Zanzibar City, which is in Tanzania, and Tanzania's list includes Swahili.” The draft explicitly used those five facts and additionally displayed English and Arabic in the full language list.

#### Guest Register, Zanzibar City

- “The argument can take the title and period as written. The cover-name file points to the operative and also to the sightings. The Choose button copies the cited answer to the form.”
- “Transmit fetched the cover-name file. Cite opened the Dr. Lund draft and attached rows. Choose MARBLE_HERON filled the Filed under box. Submit deduction sent the answer.”
- “From memory SGT-040 is in Zanzibar City and says Dr. Lund, and the registry files Dr. Lund under MARBLE_HERON.” I cited the sighting city and name separately. For the first claim the draft credited the complete Dr. Lund sightings list containing SGT-040 and the sighting's city. The extra name-given citation did not appear in the facts it credited. The second claim used Dr. Lund's direct operative link.

#### Quiet Consignee, Callao

- “This editor started blank. I put a shipment and a company at the top level of one request. I found out the main shipping papers can be blank where the depot's intake record has the receiver. A field check spends time but leaves the draft alone.”
- “Documentation showed the available fields. Transmit ran the whole request for one hour. Cite saved rows to the company draft. Rule out dismissed the sender. Choose filled the Director box. The field check gave me a dispatch pointing to the intake, and Submit sent the deduction.”
- “From memory the depot intake for VAL-0733 names Meridian Freight and the Meridian Freight file names PEWTER_SWIFT.” The draft showed the link from shipment to INT-CAL-0733, then from INT-CAL-0733 to Meridian Freight, and the company's director link. I remembered the intake relationship but not its identifier.

#### Three Couriers, Tanzania

- “The name before the field plus a colon is an alias. I can call operative three times with different codenames and keep all three keys. The starter gave me the organization and last-location fields.”
- “Glossary supplied the alias example, Transmit ran all three lookups for an hour, and Findings grouped them under my labels. Cite attached facts to each courier. Rule out closed the two contradicted leads. Choose Zambia filled the country. Travel took three hours.” I noticed the field check while the destination was blank and didn't use it.
- “From memory GREY_PETREL is in the Parallax Circle and was last seen in Lusaka, Zambia. Zambia's borders include Tanzania.” The draft credited all of those links and included the full list of Zambia's borders.

#### Three Couriers, Zambia

- “I can apply aliases to company names, and choose the fields for comparing the new leads myself. Registered in takes me to the country, and director takes me to the operative's organization.”
- “Documentation showed the paths I could follow. Transmit fetched all three companies. Findings labeled the groups. Cite put the language or membership chain in the right draft. Rule out closed a contradicted payee. Submit requested that the bank stop the chosen payment.”
- “From memory Kafue is registered in Mozambique, which lists Portuguese. Its director MARBLE_HERON belongs to the Circle.” The draft credited both links in each chain and displayed Mozambique's full language list.

#### Kata

- “The starter gave me the country lookup and the capital field. I could do aliases again without returning to the case. I had to read which records to request and which fields and values to use. The exercise printed its own example, which helped.”
- “Transmit ran one free query. The exercise checked for both capitals and the use of aliases. There was no draft or clock.” The response reported **Passed** and returned Santiago and Lima under the expected keys.

### 4. Syntax ledger

| First use or encounter                                                                                                     | Visible source                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`, outer braces, fields separated by space or line breaks, inner braces                                              | Guest Register Luanda starter `query { operative(codename: "") { … codename … } }`. Documentation's `query { city(name: "Lisbon") { name } }` labels the starting field and explains that a field that returns a record needs braces containing the requested fields. The starter had `#` comments, but I removed them and wrote none. |
| Argument parentheses, colon between name and value, double quotes, `operative`, `codename`                                 | Same starter and its “Write the codename between the quotes.” Documentation explains `city(name: "Lisbon")`, `String!`, identifiers in double quotes, brackets in type signatures, and that `!` in the schema is not typed into these requests.                                                                                        |
| `coverNames`, `sightings`, `id`, `nameGiven`, `city`, `country`, `languages`, `note`, `name`                               | Luanda Documentation entries for Operative, CoverName, Sighting, City, Country and Language. I followed their record types. `name` also appeared in the Lisbon example.                                                                                                                                                                |
| `coverName(name: "Dr. Lund")` and nested `operative { codename }`                                                          | Zanzibar starter says to copy the name exactly. The briefing supplies title and period. Luanda CoverName documentation listed `operative: Operative` and `sightings: [Sighting!]!`. Operative listed `codename`.                                                                                                                       |
| Two differently named lookups side by side inside the outer braces                                                         | Guest Register debrief explicitly showed both `coverName(name: "Dr. Lund")` and `city(name: "Zanzibar City")` in one transmission. I first wrote that shape in The Quiet Consignee using shipment and company.                                                                                                                         |
| `shipment(id: …)`, `company(name: …)`, `shipper`, `consignee`, `director`, `shipments`, `intake`, `intake { consignee … }` | Clearance 2 Documentation, Query, Company, Shipment, and IntakeRecord entries. Quiet Consignee dispatch first told me the intake was relevant to proving the receiver.                                                                                                                                                                 |
| Alias and separate keys, plus `organization`, `lastKnownLocation` and `borders`                                            | Three Couriers Tanzania Glossary entry “alias” shows `first: operative(codename: "NIGHTJAR")` and explains colon placement and distinct keys. Starter supplied `organization { name }` and `lastKnownLocation { name country { name borders { name } } }`.                                                                             |
| Aliases on company calls, `registeredIn`, `director { … organization … }`                                                  | Three Couriers Zambia starter shows `first: company(name: "Copperbelt Clay Works")`. Company documentation lists `registeredIn: Country` and `director: Operative`. Operative documentation and the previous starter show `organization`.                                                                                              |
| `country(name: …) { name capital }`                                                                                        | Kata starter for Chile. Kata instructions show `chile: country(name: "Chile")` and ask for Peru as well. I adapted that shape with my own second label.                                                                                                                                                                                |

No query syntax was used before a visible source. I did anticipate a repeated JSON-key problem in The Quiet Consignee before reading the alias rule. That may have been inference from the persona's dashboard experience or prior GraphQL knowledge. The anticipation saved a potential failed attempt, and I did not use alias syntax until reading the Glossary. No fragments, variables, or exclamation marks were typed.

### 5. Points of confusion

1. **Where.** Guest Register, Luanda, Documentation. **What happened.** I had a codename starter but had to work out six connected record entries before sending the first request. My SQL instinct was to look for tables with join keys. **What I did.** I read the returned type of each field and opened that record entry. **What would have helped.** Make return type names jump to their expanded entry so I can follow the path without rereading the type list.
2. **Where.** Guest Register, Luanda, SGT-027 draft. **What happened.** I cited “H. Brandt” and saw “The claim needs more facts that connect to this one.” The draft didn't say what fact I needed. **What I did.** I inferred from the briefing and results that the full cover-name list would let me compare. **What would have helped.** Say “Cite NIGHTJAR's cover names to show whether this name is in the file” after the first citation.
3. **Where.** Guest Register, Zanzibar, Findings. **What happened.** The repeated city/name and name-given/name rows made me reread which clicks would carry the right context. I expected the draft to need both city and name given explicitly. **What I did.** I cited both siblings and compared them with the credited facts. The parent sighting-list link and the city were sufficient. **What would have helped.** Preview carried facts on each Cite so I can see the parent sighting relationship before adding a redundant row.
4. **Where.** The Quiet Consignee, Callao, receiving claim. **What happened.** Shipment said “nothing returned” for consignee and Freight said “shipments none.” The form only said “Needs evidence” for Freight as receiver. I initially looked for the connection on the company file. **What I did.** After I cited and chose the director, I ordered the field check. The dispatch named the intake record. **What would have helped.** Point out in the draft that “nothing returned” only describes the shipping papers, and label the field-check offer as a way to locate a receiving record.
5. **Where.** Three Couriers, Tanzania, starter and Glossary. **What happened.** The starter asked for three copies in a single transmission without showing the alias in the editor. I paused before trying SQL's `AS`. **What I did.** I used the Glossary's example and kept the picked labels readable. **What would have helped.** Link “alias” beside the starter prompt or show the first alias in the starter, as the Zambia stage does.
6. **Where.** Three Couriers, Tanzania, Grey's Travel order. **What happened.** After I cited sufficient facts to show Zambia bordered Tanzania, the form still said the claim needed a choice and offered a paid check. I paused to find Choose Zambia. **What I did.** I used Choose Zambia. Both claims became supported and the field-check button disappeared. **What would have helped.** Place the suggested country next to the claim status, and withhold the check when the cited facts already establish the destination.

### 6. Round 2 questions

- **Plausible leads.** SGT-027 was filed under NIGHTJAR and its country Kenya lists Swahili. H. Brandt was absent from NIGHTJAR's complete cover-name list. SGT-034 had M. Calloway, but Mozambique's complete language list omitted Swahili. The Zanzibar near-match looked plausible by spelling alone. The exact register wording retrieved Dr. Lund. The debrief reported D. Lund belonged to TIN_FALCON, so I did not investigate it separately.
- **Plausible companies and couriers.** Meridian Forwarding had asked about VAL-0733 but was listed as the shipper, which the draft treated as a contradiction. SABLE_IBIS was in the Circle but last seen in Comoros, whose complete borders list was empty. TIN_FALCON's Kenya location passed the border check, but the file put Tin in the Baltic Exchange Bureau. Copperbelt's director OPAL_WREN was in the Circle, but Zambia's complete language list omitted Portuguese. Beira was registered in Mozambique, which lists Portuguese, but its director TIN_FALCON belonged to the Baltic Exchange Bureau. Each formally ruled-out lead stayed in its draft and ruling it out cost no time.
- **Transfer to the kata.** I reused labels before same-field lookups and kept them distinct. I worked out the country selection, argument, two input strings, and capital field from the new prompt and editor. The prompt supplied one exact alias example. I completed it in one transmission and did not revisit the case.
- **Incomplete claims.** I completed every required claim on a submitted draft. The Luanda name check initially lacked the full registry list. The Quiet Consignee draft initially lacked a receiving record and gave no specific path until the field check. For the winning travel orders, the form also needed a destination choice even when the evidence was already in the draft. Wrong leads did not require me to finish their other claims.

### 7. At the end

The memorable moment was seeing a missing value in a complete list become evidence against a lead. I also liked recognizing the alias as a JSON key I could choose and getting all three records for one hour. I would play another case to see who sent the note signed “M,” and because the reference queries gave me concrete ideas for writing shorter searches. I could explain why the same alias pattern worked on a courier, company, and country. I used the examples as templates, but did not hit a point where I was just copying a shape to get past a check.

### 8. Caveats

This was a simulated player on a seeded clearance-2 profile. It does not measure actual novice hesitation, keyboard and editor friction, Round 1 onboarding, or independent alias recall without an example. I used the rendered accessibility view and editor replacement through the player-facing bridge, so the pace of finding controls and typing could differ for a person. Existing GraphQL knowledge may have made it easier to turn the schema into deep nested selections, to pick the most useful Cite rows, and to anticipate repeated JSON keys. The syntax ledger records the latter as a possible leak. Each piece of syntax I actually sent had a visible example or field definition beforehand.
