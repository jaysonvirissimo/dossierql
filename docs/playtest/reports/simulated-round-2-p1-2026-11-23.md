# Simulated playtest · Round 2 · P1 · 2026-11-23

# DossierQL playtest report: round 2

I played the whole round-2 path as the persona: _The Guest Register_, _The Quiet Consignee_, _Three Couriers_ and the kata "Two lookups in one transmission". Every case resolved without hints or solutions, and the kata passed on the first try. The two most important findings are under Points of confusion: the records clerk sent me to a glossary entry that wasn't there (point 1), and a Cite button that silently dropped its link to the lead (point 4).

## 1. Preflight

The check for "2 is 2" passed. The header showed **Clearance 2**. The desk said "2 of 10 cases resolved". _The Guest Register_ was marked "Next in the story", not completed or in progress. _Azulejos_ and _Chronometer_ were marked "Completed independently". Following the prompt, I played only the round-2 path.

## 2. Per-stage table

| Stage                    | Transmissions               | New things (persona's words)                                                                                      | Controls I couldn't explain                          | Hints / solution | Stamp / hours left                          | Notes                                                                      |
| ------------------------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------- | ------------------------------------------- | -------------------------------------------------------------------------- |
| Guest Register: Luanda   | 1                           | Parentheses with a value; quotes for text; "!" means required and I never type it; Rule out; "Contradicted" label | none                                                 | none             | n/a (25h after the query, 22h after travel) | Ruled out two leads for free, then travelled (3h)                          |
| Guest Register: Zanzibar | 1                           | A different lookup field, `coverName(name:)`; "Filed under" dropdown; Submit deduction                            | none (the "Choose X" button did the thinking for me) | none             | **IDENTIFIED**, 21h                         | I never saw the look-alike "D. Lund" lead                                  |
| Quiet Consignee          | 3 charged + 1 returned free | Blank editor; field check; intake record; the clerk returning a request                                           | none                                                 | none             | **HELD**, 13h (clearance 3)                 | Alias error, and the glossary had no alias entry                           |
| Three Couriers: Zanzibar | 1                           | Alias, `name:` before a field                                                                                     | none                                                 | none             | n/a (22h after the query)                   | The alias link left the case page; a Cite button lost its link to the lead |
| Three Couriers: Lusaka   | 1                           | Nothing new; went one level deeper                                                                                | none                                                 | none             | **PAYMENT STOPPED**, 18h                    |                                                                            |
| Kata                     | 1 (free)                    | Nothing new; the response shown as raw JSON                                                                       | none                                                 | none             | Passed                                      | The prompt hands over the exact alias                                      |

## 3. Stage interviews

- **Guest Register, Luanda.**
  - New: arguments, quotes, the "!" rule, Rule out, the Contradicted and Supported labels.
  - Controls: Cite puts a row into a lead's draft. Rule out strikes a lead once a claim is contradicted. Travel commits to a lead and costs 3h.
  - Claims from memory: Calloway is on the cover list; Zanzibar City is in Tanzania, where Swahili is spoken. This matched what I cited.
- **Guest Register, Zanzibar.**
  - New: `coverName(name:)`, the "Filed under" dropdown, Submit deduction.
  - Claims from memory: Dr. Lund was sighted in Zanzibar City and is filed under MARBLE_HERON. This matched what I cited.
- **Quiet Consignee.**
  - New: a blank editor, the field check, the intake record, a request returned by the clerk.
  - Claims from memory: the intake record names Meridian Freight; Freight's director is PEWTER_SWIFT. This matched what I cited.
- **Three Couriers, Zanzibar.**
  - New: aliases. Results come back under the alias names.
  - Claims from memory: GREY_PETREL is in the Parallax Circle; Lusaka is in Zambia, which borders Tanzania. This matched what I cited.
- **Three Couriers, Lusaka.**
  - Nothing new.
  - Claims from memory: Kafue is in Mozambique, where Portuguese is spoken, and its director MARBLE_HERON is in the Parallax Circle. This matched what I cited.
- **Kata.** I applied the alias right away and had nothing to work out again.

## 4. Syntax ledger

| Syntax                                              | Where I learned it                                                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `query { }`, braces, nesting                        | Assumed from round 1, which I didn't play this session. Also in the Documentation intro and the glossary "nested selection" entry           |
| `(codename: "...")` argument and quotes             | Guest Register starter query, and the Documentation paragraph "In your query, write `city(name: "Lisbon")`"                                 |
| `!`                                                 | Documentation: "means that you must give that value… You never type a `!`"                                                                  |
| `coverNames`, `sightings`, `nameGiven`, `languages` | The Operative, Sighting and Country entries in Documentation                                                                                |
| `city { country { … } }` on Sighting                | **Mild leak.** I never opened the City entry and guessed it had a `country` field from the round-1 shape                                    |
| Language `{ name }`                                 | **Mild leak.** I never opened the Language entry                                                                                            |
| Two top-level fields in one query                   | Guest Register debrief: "asks for two things directly inside the outer braces"                                                              |
| `coverName(name:)`                                  | Starter template                                                                                                                            |
| `shipment(id:)`, `intake`, `shipper`, `director`    | The Query, Shipment, IntakeRecord and Company entries                                                                                       |
| Alias `x:`                                          | Three Couriers briefing → glossary in the Tradecraft manual ("`first: operative(...)`"). The persona did _not_ invent it in Quiet Consignee |
| `organization`, `lastKnownLocation`, `borders`      | Three Couriers starter template                                                                                                             |

## 5. Points of confusion

1. **The clerk's note points to a glossary entry that doesn't exist.**
   - **Where:** _Quiet Consignee_, the returned request and the in-case Glossary tab.
   - **What happened:** I asked for `company` twice. The note said "The glossary entry for an alias shows how to write one", but the glossary at clearance 2 has no alias entry.
   - **What I did:** dropped the company lookups and spent 2 extra transmissions.
   - **What would have helped:** show the alias entry whenever the note names it, or put an inline example in the note itself ("`a: company(...) b: company(...)`").
2. **The Guest Register debrief invites a mistake the game can't yet support.**
   - **Where:** the _Guest Register_ debrief, then _Quiet Consignee_.
   - **What happened:** the debrief teaches "two questions in one query", so I tried the same field twice one case before aliases are taught.
   - **What I did:** got the returned request in point 1.
   - **What would have helped:** add "…different fields. The same field twice needs an alias, coming at clearance 3."
3. **The alias link in the briefing leaves the case.**
   - **Where:** _Three Couriers_, the briefing's "alias" link.
   - **What happened:** I expected it to open the in-case Glossary tab. It loaded the Tradecraft manual page instead.
   - **What I did:** used browser Back.
   - **What would have helped:** open the in-case Glossary tab, or a popover.
4. **A Cite button silently lost its link to the lead.**
   - **Where:** _Three Couriers_, Zanzibar stage, the Findings for TIN_FALCON.
   - **What happened:** the nested row's button read "Cite name", where every other courier's read "organization → name". The citation said "Bears on no claim".
   - **What I did:** removed it and cited the parent row instead.
   - **What would have helped:** label that button with its full path, like the others.
5. **The look-alike lead was never shown.**
   - **Where:** _Guest Register_, Zanzibar stage.
   - **What happened:** the briefing warned of two names a hurried clerk could confuse. Typing the exact name skipped the lesson, and I only learned about "D. Lund" from the debrief.
   - **What would have helped:** this may be intended. If the look-alike is meant to teach something, make it visible during the stage.
6. **The transmission count leaves out the returned request.**
   - **Where:** _Quiet Consignee_ debrief.
   - **What happened:** it said "You sent 3". That's fine because the returned request was free, but it surprised me.

## 6. The round's own questions

- **Plausible leads ruled out:**
  - SGT-027: in Kenya, where Swahili is spoken, but the guest's name wasn't on the cover list.
  - SGT-034: the right cover name, but no Swahili in Mozambique.
  - Meridian Forwarding: had asked customs about the cases, but it was the shipper, i.e. the sender.
  - SABLE_IBIS: in the Parallax Circle, but Comoros has no land borders.
  - TIN_FALCON: in Kenya, next to Tanzania, but in the Baltic Exchange Bureau.
  - Copperbelt Clay Works: a Parallax director, but no Portuguese in Zambia.
  - Beira Tile Agency: in Mozambique, where Portuguese is spoken, but its director is in the Baltic Exchange Bureau.
- **Kata:** the technique carried over completely, but the test is weak. The prompt spells out `chile: country(...)`, so I had nothing to recall.
- **Incomplete claims:** in _Quiet Consignee_, "Freight is to receive VAL-0733" had no evidence at first. The draft offered "Order a field check", and the dispatch named the intake record. Together that was enough to find it.

## 7. At the end

- **Moments that stood out:**
  - The dead-end clerk note.
  - The satisfying one-query sweeps of all three sightings and all three couriers.
  - The "Choose X" buttons, which made the dropdowns trivial.
- **Would this person play on?** Yes. The cases are short, ruling out leads feels like detective work, and the clock never bit. Pattern-matching started in _Three Couriers_, stage 2: I copied the alias block three times without thinking further.

## 8. Caveats

- Round 1 wasn't played this session. The basic brace and nesting syntax is assumed from the saved progress, not observed.
- **Leaks:**
  - City's `country` field and Language's `name` field were guessed, not read.
  - Writing everything on one line, so the editor's auto-closing never got in the way, is something I chose knowing editors behave this way. It may have hidden typing problems a real player would hit.
  - Recognising that "Fields 'company' conflict" meant aliases was helped by what I already know about GraphQL. The clerk's note said so, though.
- Reading the results cleanly, with no misreads, may be more careful than a skimmer would be.

---

## Rerun on the revised build

**Summary:** I finished all four items on the round 2 path without a hint or a solution: The Guest Register, The Quiet Consignee, Three Couriers and the kata. Clearance went from 2 to 3. There was one returned request (a missing alias), one paid field check, and one place where the game sent me to the wrong page. The main weakness is that the kata says how to write an alias in its own task text, so passing it doesn't show the lesson carried over.

### 1. Preflight

- The header showed **Clearance 2**. The desk said "2 of 10 cases resolved".
- _The Guest Register_ was marked "Next in the story", not completed or in progress. The check passed.
- Round 1 was already done in this save, but I did not play it in this run. Anything the person "learned" in round 1 is outside my ledger (see Caveats).

### 2. Per-stage table

| Stage                                        | Transmissions           | New things (person's words)                                                                                                          | Controls I couldn't explain              | Hints / solution | Stamp, hours left           | Notes                                                                                                                  |
| -------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- | ---------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Guest Register, stage 1 (Luanda → sightings) | 1                       | Put a value in the parentheses; "Rule out this lead (free)"; country dropdown with a "Choose Tanzania" button; "(complete list)" tag | none                                     | none             | — (25/26 h before travel)   | I asked for everything in one nested query and ruled out 2 leads.                                                      |
| Guest Register, stage 2 (Zanzibar)           | 1                       | Starting a query from a cover name; the "Filed under" dropdown                                                                       | none                                     | none             | **IDENTIFIED**, 21 h        | I never saw the look-alike name D. Lund. The debrief taught me that two top-level fields can share one query.          |
| Quiet Consignee                              | 3 (+1 field check, 2 h) | Blank editor; Order a field check; the intake record                                                                                 | none                                     | none             | **HELD**, 13 h; clearance 3 | The reference uses 1 transmission. My first query asked for consignee and transfer orders, which both came back empty. |
| Three Couriers, stage 1                      | 1 (+1 returned, free)   | Alias (`name: field(...)`); results shown under my alias names                                                                       | The "alias" link took me to another page | none             | — (22 h before travel)      | I copied the operative block three times without aliases and the clerk returned it.                                    |
| Three Couriers, stage 2                      | 1                       | none (I reused aliases)                                                                                                              | none                                     | none             | **PAYMENT STOPPED**, 18 h   | Worked on the first try.                                                                                               |
| Kata: Two lookups                            | 1 (free)                | Raw JSON response; aliases appear as JSON keys                                                                                       | none                                     | none             | Passed                      | The task text includes the alias recipe.                                                                               |

### 3. Stage interviews (as recorded, in order)

**Guest Register, stage 1**

- New: the argument in parentheses (the scaffold gave the shape), Rule out, the country dropdown and its shortcut button, the "complete list" tag.
- Controls: Cite drops a row into a lead's draft. Open a lead picks which sighting the draft is about. Rule out strikes a fake sighting for free. Travel commits the answer and costs 3 h.
- Claims from memory: Calloway was the name given at Zanzibar, and Calloway is on NIGHTJAR's list. Zanzibar City is in Tanzania, which speaks Swahili. This matches what I cited.

**Guest Register, stage 2**

- New: starting from `coverName(...)`, the "Filed under" dropdown, and Submit deduction.
- Claims: Dr. Lund has one sighting, in Zanzibar City, and the name belongs to MARBLE_HERON. This matches what I cited.

**Quiet Consignee**

- New: the blank editor, the field check (a paid tip-off once one claim is supported), and the intake record.
- Claims: the intake record for VAL-0733 names Meridian Freight as consignee, and that company's director is PEWTER_SWIFT. This matches what I cited.

**Three Couriers, stage 1**

- New: aliases, a returned request with a clerk's note, and the "Country last seen in" dropdown.
- The "alias" link pulled me off the case page.
- Claims: GREY_PETREL is in the Parallax Circle, and Lusaka is in Zambia, whose borders include Tanzania. This matches what I cited.

**Three Couriers, stage 2**

- New: nothing.
- Claims: Kafue Ceramics Trust is registered in Mozambique (Portuguese) and its director, MARBLE_HERON, is in the Parallax Circle. This matches what I cited.

**Kata**

- It passed on the first try. The kata text repeats the recipe, so I had nothing to work out again.

### 4. Syntax ledger

| Syntax                                                                                        | Where learned                                                                                                                  |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `query { }`, braces                                                                           | Documentation tab intro ("Write `query` and a pair of braces…"); the editor scaffold                                           |
| Nesting / braces after a record field                                                         | Documentation: "A field that returns a record needs braces after it"                                                           |
| Argument in parentheses, `codename: "..."`                                                    | Guest Register scaffold `operative(codename: "")` plus its comment "Write the codename between the quotes"                     |
| Double quotes for text and IDs                                                                | Documentation: "In a query you write an identifier in double quotes"                                                           |
| `!` (never typed)                                                                             | Documentation: "You never type a `!` in a query"                                                                               |
| Field names (coverNames, sightings, nameGiven, city, country, languages, director, intake, …) | Documentation entries for each type                                                                                            |
| `languages { name }`                                                                          | **Guess.** I never opened the Language entry; I assumed `name` like every other type. Not a leak, since `name` was everywhere. |
| `organization`, `lastKnownLocation`                                                           | Three Couriers scaffold (these fields weren't in the docs I'd opened)                                                          |
| Two different top-level fields in one query                                                   | Guest Register debrief: "Two questions in one query are still a single transmission"                                           |
| Alias `name:`                                                                                 | Glossary entry `first: operative(codename: "NIGHTJAR")`, reached after the clerk's note                                        |
| `first:` style in stage 2                                                                     | Stage 2 scaffold                                                                                                               |

There are no clear leaks. One suspicion: in Quiet Consignee my first query reached straight for `transferOrders`. The docs justify it ("Orders to hand the shipment to another party"), but prior knowledge of the game's story may have nudged me.

### 5. Points of confusion

1. **The alias link leaves the case**
   - **Where:** Three Couriers, briefing, the "alias" link.
   - **What happened:** I expected the in-case Glossary tab to open. Instead the whole page went to the Tradecraft manual.
   - **What I did:** I pressed browser Back. The draft survived.
   - **What would have helped:** Open the Glossary tab inside the case, or show the definition in a popover.

2. **Three plain `operative(...)` calls were returned**
   - **Where:** Three Couriers, stage 1, Transmit.
   - **What happened:** I skimmed past the alias sentence and copied the block three times. The clerk returned it.
   - **What I did:** The clerk's note ("an alias in front of each one… glossary entry shows how") got me past it at no cost.
   - **What would have helped:** It worked as designed. Showing a one-line example right in the clerk's note would save the trip to the glossary.

3. **A query that came back empty**
   - **Where:** Quiet Consignee, first query.
   - **What happened:** I asked for consignee and transfer orders, and both came back empty ("nothing returned", "none"). I didn't know where else to look until the field check.
   - **What I did:** I paid the 2 h field check, which pointed to the intake record.
   - **What would have helped:** The docs line for `intake` could say "names who is to receive the shipment". Right now only the IntakeRecord entry says "consignee on the label".

4. **The decoy never appeared**
   - **Where:** Guest Register, stage 2.
   - **What happened:** The briefing warned of a look-alike name, but typing "Dr. Lund" exactly meant I never saw D. Lund. I only learned about it in the debrief.
   - **What I did:** Nothing; I submitted without ever meeting the trap.
   - **What would have helped:** If the lesson is that arguments must match exactly, let a near-miss argument return null with a note. Otherwise the teaching moment never happens.

5. **A stale control number**
   - **Where:** Guest Register, the cover-names Cite button.
   - **What happened:** One Cite click timed out because the button's target had changed to a different draft.
   - **What I did:** I clicked it again and it worked.
   - **What would have helped:** This is minor, and may be a quirk of my testing tool rather than the game.

### 6. The round's own questions

**Plausible leads I ruled out**

| Lead                  | Why it looked plausible                                 | What ruled it out                                              |
| --------------------- | ------------------------------------------------------- | -------------------------------------------------------------- |
| SGT-027               | Mombasa, Kenya, where Swahili is spoken                 | The name given, H. Brandt, isn't one of NIGHTJAR's cover names |
| SGT-034               | Used the right name, M. Calloway                        | Mozambique's languages don't include Swahili                   |
| Meridian Forwarding   | Same name stem; the only company on the shipping papers | It's the shipper, and the briefing said not to name the sender |
| SABLE_IBIS            | Parallax Circle member                                  | Comoros has no land borders                                    |
| TIN_FALCON            | Kenya borders Tanzania                                  | Works for Baltic Exchange Bureau, not Parallax                 |
| Copperbelt Clay Works | Its director is in the Parallax Circle                  | Zambia's languages don't include Portuguese                    |
| Beira Tile Agency     | In Mozambique, and "Tile" is in the name                | Its director, TIN_FALCON, is Baltic Exchange Bureau            |

**The kata**

- Yes, I could use the alias technique on new records, and it passed first try.
- I had nothing to work out again, because the kata text spells out `chile: country(name: "Chile")`. So it doesn't test whether the lesson carried over from Three Couriers.
- Seeing the raw JSON keys `"chile"` and `"peru"` made aliases click for a fetch user.

**Incomplete claims**

- None stayed incomplete. The closest was "Meridian Freight is to receive VAL-0733".
- I thought the missing piece was "some record that names the receiver". The draft said only "Needs evidence", which didn't tell me where to look; the field check dispatch did.

### 7. At the end

- **Moments that stood out:**
  - Ruling out leads for free and getting a witty dispatch each time.
  - The clerk returning my query at no cost.
  - The debrief comparing my query to the reference: 3 transmissions against 1 stung in a useful way.
  - The "M" note: "You read quickly. Read further." That fits this person exactly.
- **Would this person play another case?** Yes. It feels like puzzle-solving with a real API, each case adds one trick, and the mistakes are cheap. The debriefs make them want to beat the reference transmission count.

### 8. Caveats

- I did not play round 1 in this run. I assumed the person's round 1 learning only through what the screens showed; anything round 1 taught them isn't in the ledger.
- I know GraphQL. That probably made me trust nesting and one-line queries at once, write correct syntax first time apart from the alias, and guess `languages { name }` without checking.
- Possible nudge: going straight for `transferOrders` and `intake`-style fields (see the ledger).
- A real skimmer might have made more typos, mismatched braces, or misread "(complete list)". This run can't show those mistakes.
- The editor never doubled a brace or quote on my one-line input. Line-by-line typing might behave differently.

---

## Earlier run preserved from Git

## Round 2 playtest · Web developer, new to GraphQL

### 1. Preflight

The header showed **Clearance 2**, and the assignments desk showed **2 of 10 cases resolved**. The Guest Register was tagged **Next in the story**. It had neither a completed nor an in-progress label. The two clearance 1 cases were marked completed independently. Orientation and Round 1 drills were outside this run.

### 2. Per-stage table

| Stage                                      |      Transmissions sent | New things, in my words                                                                                                                          | Controls I could not explain                       | Hints and solution                                   | Stamp and time                                | Notes                                                                                                                        |
| ------------------------------------------ | ----------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| The Guest Register · Angola                |                       1 | “I can pick a file in parentheses, then build out the JSON shape I want. Citing the bottom row can carry the rows that link it to the sighting.” | None used that I could not explain at the boundary | 0 hints, no solution opened                          | Travel approved, 22 of 26 hours               | Ruled out SGT-027 and SGT-034 free. SGT-031's supported draft cost 3 hours to file as a travel order.                        |
| The Guest Register · Tanzania              |                       1 | “An exact cover name is another lookup. I can go from that name to its sightings and its operative.”                                             | None used that I could not explain at the boundary | 0 hints, no solution opened                          | **IDENTIFIED**, 21 hours left                 | The debrief's reference used two different lookup fields in one request. Mine used one cover-name lookup with nested fields. |
| The Quiet Consignee · Peru                 |                       3 | “The shipment papers and the intake record can each have a field called consignee. A field check gives me a clue and keeps the draft open.”      | None used that I could not explain at the boundary | 0 hints, no solution opened. One 2-hour field check. | **HELD**, 13 of 18 hours. Clearance 3 earned. | The shipper citation ruled out Meridian Forwarding. I got the other director before the intake record.                       |
| Three Couriers · Tanzania                  | 2 attempts, 1 processed | “I need a different result key for each lookup when I reuse the same field with a different value. I can cite in the side-by-side table.”        | None used that I could not explain at the boundary | 0 hints, no solution opened                          | Travel approved, 19 of 23 hours               | One returned request, free. The clerk sent me to the Glossary. Two free rule-outs and 3 hours for travel.                    |
| Three Couriers · Zambia                    |                       1 | “The label trick also works for company. I can follow a company to its director and the director's organization.”                                | None used that I could not explain at the boundary | 0 hints, no solution opened                          | **PAYMENT STOPPED**, 18 hours left            | Side by side stayed selected. Ruled out Copperbelt and Beira.                                                                |
| Training · Two lookups in one transmission |                       1 | “Same idea, now on country. Capital is a field I can take from the starter.”                                                                     | None used that I could not explain at the boundary | 0 hints, no solution opened                          | **Passed**, untimed                           | Chile returned Santiago and Peru returned Lima, each under its own label.                                                    |

I read the reference comparisons shown on the completed case debriefs. I did not open a solution during an attempt.

### 3. Stage interviews

#### The Guest Register · Angola

“I used a codename inside parentheses and quoted it to get one file. Then I asked for fields nested like my JSON. Transmit paid an hour. Documentation let me find the record names, and I had to open the separate entries. Cite put rows in the named lead's draft. The country dropdown set my answer, the status identified missing or contrary evidence, Rule out crossed a lead off for free, and Travel filed the supported order.”

“From memory, M. Calloway was both in SGT-031 and on the NIGHTJAR list. Zanzibar City was in Tanzania, and Tanzania had Swahili.” The draft agreed. It showed that the one languages citation included the sighting-to-city and city-to-country links as well as the language list.

#### The Guest Register · Tanzania

“I changed from looking up a codename to looking up the exact cover name, including the title and its punctuation. I went from the cover name to both an operative and a sighting. Cite opened a draft for Dr. Lund and attached rows, Filed under chose my operative, and Submit deduction sent the supported answer.”

“From memory, the name appeared in a sighting in Zanzibar City and the operative row said MARBLE_HERON.” The receipts agreed and also named SGT-040 and showed the complete Dr. Lund sightings list. I left those details out of the memory answer.

#### The Quiet Consignee · Peru

“I wrote the whole request with a blank editor. I could put a shipment and a company question in one outer block. The same word can appear on two records, with a blank consignee on the first and a named one on the other. The field check spent two hours on a dispatch pointing to intake and kept my director evidence. Cite attached the source, Director picked my answer, Rule out struck off Forwarding after I cited the shipper, and Submit sent two supported claims.”

“From memory, the intake record for VAL-0733 named Meridian Freight as consignee, and the company record named PEWTER_SWIFT as director.” The receipts agreed, and the intake identifier I didn't recall was INT-CAL-0733. The draft told me which claim lacked proof. The field check dispatch told me which record to ask for.

#### Three Couriers · Tanzania

“I assumed three operative lookups would come back as three entries like an array. The clerk returned the attempt for free and pointed me to the Glossary. I put a different label and colon before each repeated field so each answer got its own key. The value in parentheses still picked the record. Side by side put a candidate in each column and let me cite. Cite attached an organization or a chain of location facts to a named draft. Rule out struck off leads with contradictions. I chose Zambia in the picker before Travel could move the case.”

“From memory, GREY_PETREL was in the Parallax Circle and was last seen in Lusaka in Zambia, whose border list contains Tanzania.” The receipts agreed. The location citation counted three linked rows from one click.

#### Three Couriers · Zambia

“I reused the alias on company and picked my own labels. I asked the registration country for its languages and followed the director to their organization. Side by side stayed selected. Cite carried the connected facts into each company draft. Rule out struck off Copperbelt on language and Beira on organization. Submit was ready when Kafue had both claims supported. I didn't have another answer to pick.”

“From memory, Kafue was registered in Mozambique, whose list included Portuguese, and its director was in the Circle.” The receipts agreed and named MARBLE_HERON as the director, which I didn't recall on my first pass.

#### Two lookups in one transmission

“I used the different-name trick on country. I had to identify which lookup field gets a country, what goes in parentheses, and what to request for the capital. The starter gives all three, and the instructions even give a country-specific alias example. Transmit ran a practice check for free. There was no draft or citation.”

### 4. Syntax ledger

| First use                | Pieces used                                                                                                                                                                  | Where I found them                                                                                                                                                                                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Guest Register, Angola   | `query`, outer braces, nested braces, `operative(codename: "NIGHTJAR")`, and bare `codename`                                                                                 | The starter had `query { operative(codename: "") { ... codename ... } }` and said “Whose file? Write the codename between the quotes.” The briefing supplied NIGHTJAR. Documentation's `city(name: "Lisbon")` example reinforced the parentheses, colon, quoted value, and nested result fields. |
| Guest Register, Angola   | `coverNames { name }`, `sightings { id note nameGiven { name } ... }`                                                                                                        | Documentation → Operative listed `coverNames` and `sightings` and said record lists need braces. CoverName listed the literal `name`. Sighting listed `id`, `note`, `nameGiven`, and `city`, and said which need braces.                                                                         |
| Guest Register, Angola   | `city { name country { name languages { name } } }`                                                                                                                          | Documentation → City listed `name` and `country`. Country listed `name` and `languages`. Language listed `name`.                                                                                                                                                                                 |
| Guest Register, Angola   | Schema `String!`, `ID`, and list brackets                                                                                                                                    | Documentation explained that a required text input goes in quotes, identifiers are also double-quoted, list brackets in the entry mean multiple records, and “You never type a ! in a query.” I didn't type schema punctuation into the editor.                                                  |
| Guest Register, Tanzania | `coverName(name: "Dr. Lund")` and `operative { codename }` inside it                                                                                                         | The starter showed `coverName(name: "")` and instructed me to use the text exactly as in the register. The earlier Documentation → CoverName entry listed `operative` and `sightings`.                                                                                                           |
| Quiet Consignee          | Two _different_ fields under one outer pair of braces, `shipment(id: "VAL-0733")` with `shipper` and `consignee`, and `company(name: "Meridian Forwarding")` with `director` | The Guest Register debrief showed `coverName` and `city` together and said “Two questions in one query are still a single transmission.” Documentation → Query supplied the two lookup names and their inputs. Shipment and Company supplied the requested record fields.                        |
| Quiet Consignee          | `intake { id consignee { name } }`                                                                                                                                           | The dispatch sent me to the depot's intake record. Documentation → Shipment listed `intake`, and IntakeRecord listed `id` and `consignee`.                                                                                                                                                       |
| Three Couriers, Tanzania | `organization { name }`, `lastKnownLocation { name country { name borders { name } } }`                                                                                      | All were in the case's SABLE_IBIS starter. I repeated the starter block with the other two codenames in the comment, expecting three entries.                                                                                                                                                    |
| Three Couriers, Tanzania | `sable: operative(...)`, `grey: operative(...)`, `tin: operative(...)`                                                                                                       | The returned-request note said to put an alias in front of each lookup. Glossary → alias showed `first: operative(codename: "NIGHTJAR")` and said the results come back under their aliases.                                                                                                     |
| Three Couriers, Zambia   | `copperbelt: company(...)` and other aliased companies, `registeredIn { name languages { name } }`, `director { codename organization { name } }`                            | The starter had `first: company(name: "Copperbelt Clay Works")`. The earlier Company entry listed `registeredIn` and `director`, Guest Register Documentation supplied the country/language fields, and the first couriers stage supplied `organization`.                                        |
| Kata                     | Aliased `country(name: "...") { name capital }`                                                                                                                              | Training supplied the entire unaliased Chile request, the `chile: country(name: "Chile")` example, and Peru as the second argument value. I chose `peru` for the second key.                                                                                                                     |

No unsupported syntax use identified. The attempted repeated unaliased field was a mistaken inference from the earlier example with two different fields. I learned the working syntax from the clerk and Glossary before I typed it. Fragments, variables, and other request syntax did not come up.

### 5. Points of confusion

1. **Where** · The Guest Register, Angola, Documentation. **What happened** · I had a filled-in lookup shape and still didn't know what to ask for. I paused over the number of linked record entries and had to keep track of which `name` belonged to which record. **What I did** · Opened Operative, then CoverName and Sighting, then City, Country and Language. **What would have helped** · Make each linked return type take me to its section, so I can follow Sighting → City → Country without rescanning the list.
2. **Where** · The Guest Register, Angola, SGT-027 draft. **What happened** · H. Brandt looked like a contradiction to me, but the name-only citation still said Needs evidence. **What I did** · Cited the complete NIGHTJAR cover-name list to prove what was absent. **What would have helped** · When the draft already holds a guest name, say it still needs the operative's complete cover-name list.
3. **Where** · The Guest Register, Angola, country picker. **What happened** · Citing the nested languages row did not itself set the country. An unset country was enough to flag SGT-034's contradiction, but a valid lead still needed an explicit choice. **What I did** · Chose Tanzania for SGT-031 after citing it. **What would have helped** · Put the named value from the evidence next to the picker, as the later couriers form does with Zambia.
4. **Where** · The Quiet Consignee, Freight draft and first Findings. **What happened** · The first request confirmed the missing shipping-paper consignee. The company lookup gave me a director, but the draft just asked me to prove that Freight receives the cargo. **What I did** · Selected the cited director, then spent 2 hours for a field check that identified the intake record. **What would have helped** · Label the blank finding “consignee on the shipping papers” and explicitly display that it is blank. The field check already supplied a concrete next record.
5. **Where** · Three Couriers, Tanzania, editor and returned request. **What happened** · I took “same transmission” to mean I could paste the same lookup field three times, expecting a list. The clerk rejected it free. **What I did** · Followed the clerk's note to Glossary, read the alias example and resent. **What would have helped** · Make “alias” in the clerk's note open that Glossary entry directly. The note's explanation about three entries with the same name was enough to explain the error.

### 6. Round 2 questions

#### Plausible leads

- **SGT-027, Mombasa.** The report was filed under NIGHTJAR and its country listed Swahili. It gave H. Brandt, absent from the complete NIGHTJAR list of M. Calloway and E. Vasco.
- **SGT-034, Maputo.** It gave M. Calloway, an actual cover name. Mozambique's archived languages did not include Swahili.
- **The second Lund spelling.** The brief said a rushed reader might confuse two names. I never opened a separate draft or queried the look-alike. The exact signature “Dr. Lund” was sufficient and returned a Zanzibar City sighting and MARBLE_HERON. The debrief later gave the other spelling as D. Lund.
- **Meridian Forwarding.** It asked customs about the shipment and its name was similar to Freight's. VAL-0733 identified Forwarding as the shipper. The cited row explicitly contradicted the receiver claim.
- **SABLE_IBIS.** A member of the right group. Last seen in Moroni, Comoros, whose complete land-border list was empty.
- **TIN_FALCON.** Last seen in Nairobi, Kenya, whose list included Tanzania. The organization was Baltic Exchange Bureau.
- **Copperbelt Clay Works.** Its director belonged to the Circle. Its registration country was Zambia, whose archived languages lacked Portuguese.
- **Beira Tile Agency.** Registered in Mozambique, whose list included Portuguese. Its director TIN_FALCON belonged to the Baltic Exchange Bureau.

#### Transfer to the kata

I used the aliases in the case first on operatives and then on companies, and used them again on a pair of country records without reopening the case. I knew a label changes the response key and the value in parentheses still chooses the record. I reused the starter's country lookup and capital field, provided the second country and supplied a distinct label. The kata passed on the first request, with Santiago and Lima under separate keys. Since the exercise supplied the alias shape again, this shows application with a prompt and does not establish unaided recall.

#### Incomplete claims

All claims on the submitted leads eventually passed. At first the SGT-027 draft needed the cover list before the name could count as contrary evidence. A correct location or operative citation could still leave an answer picker empty. The clearest prompt was for GREY_PETREL: “The facts you cited show Zambia. Choose Zambia for ‘Country last seen in’ above.” The Freight draft only identified the missing receiver claim. The field check supplied “intake record for VAL-0733,” which gave me a concrete next lookup. The deliberately rejected drafts still had claims without evidence when I ruled them out.

### 7. At the end

The moments that stood out were the two sightings that each fit half the clues, the blank consignee becoming a real name on a different piece of paperwork, and recognizing the alias error as a duplicate JSON-key problem. The table made the two contrasting checks on each courier and payee quick to scan. I started copying block shapes when repeating queries, but the clerk's error made me explain the distinction between an argument and an alias. I could still explain which parts chose the record and which parts changed the response keys at the kata.

I'd play another case. I liked taking a plausible lead off the list for a specific reason, and the dispatches made the archives feel like part of the investigation. I would probably skim another opening if its examples were as easy to find as the starter here.

### 8. Caveats

This is a simulated web developer who knows JSON, with access to rendered accessibility text and editor readback. It cannot establish how a human would scan the page, find documentation visually, or struggle with manual typing and bracket or quote completion. My proximity to GraphQL may have made tracing record types, recognizing a response-key collision, or composing deeply nested fields in one pass faster than it would be for a new player. I found a screen source for every syntax piece before using it, with no recorded leak. The interviews were recorded before viewing the next stage, but I had just checked the submitted citations, so memory here is immediate recall rather than an independent delayed test.
