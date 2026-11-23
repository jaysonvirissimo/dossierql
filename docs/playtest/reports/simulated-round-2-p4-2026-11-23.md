# Simulated playtest · Round 2 · P4 · 2026-11-23

# DossierQL playtest — Round 2 report

I played the four items on the round 2 path. Every one was resolved, with no hints and no solutions viewed. There were 7 paid transmissions in total and one request the clerk returned without charge.

## 1. Preflight

- **2 is 2: passed.** The header showed **Clearance 2**. The desk showed "2 of 10 cases resolved". _The Guest Register_ was marked "Next in the story", not completed or in progress. _The Vanishing Azulejos_ and _The Borrowed Chronometer_ were both marked "Completed independently".

## 2. Per-stage table

| Stage                                 | Transmissions                | New things (person's words)                                                                                                                                                                                      | Controls I couldn't explain                                                     | Hints / solution                      | Stamp, hours left                             | Notes                                                                                     |
| ------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Guest Register: Luanda (sightings)    | 1                            | "The codename goes in brackets in quotes." Found `coverNames`, `sightings`, `nameGiven` and `languages` in Docs. New controls: the Rule out button, the Country dropdown, and the Contradicted label on a claim. | None                                                                            | None                                  | (stage) 22 of 26 left after travel            | I ruled out SGT-027 with the button. I skipped SGT-034.                                   |
| Guest Register: Zanzibar (register)   | 1                            | Starting from `coverName(name:)`. Typing "Dr. Lund" exactly. The "Choose X" shortcut button.                                                                                                                     | None                                                                            | None                                  | **IDENTIFIED**, 21 of 26 left                 | The reference asks for two things in one query. I noticed that in the debrief.            |
| Quiet Consignee (assessment)          | 2 paid, plus 1 returned free | The field check, the intake record, and asking for two different things in one query.                                                                                                                            | **Alias.** The clerk's note sent me to the Glossary, which had no entry for it. | None (I paid 2 h for one field check) | **HELD**, 14 of 18 left. Clearance 3 reached. | The duplicate `company` request was returned without charge.                              |
| Three Couriers: Zanzibar (couriers)   | 1                            | "A nickname and a colon in front of the field, so I can ask for `operative` three times."                                                                                                                        | None                                                                            | None                                  | (stage) 19 of 23 left after travel            | The alias link took me out of the case to the Tradecraft manual, and I had to press Back. |
| Three Couriers: Lusaka (payees)       | 1                            | Nothing new. I reused the alias trick with first, second and third.                                                                                                                                              | None                                                                            | None                                  | **PAYMENT STOPPED**, 18 of 23 left            |                                                                                           |
| Kata: Two lookups in one transmission | 1 (free)                     | Nothing new. The response came back as raw JSON.                                                                                                                                                                 | None                                                                            | None                                  | Passed                                        | Passed on the first try.                                                                  |

## 3. Stage interviews (as recorded, not revised)

- **Guest Register, Luanda.** "New: the codename goes between the quotes; the field names came from Docs; Rule out a lead; the Country dropdown; contradicted versus supported." All controls were explainable.
  - Facts, from memory: M. Calloway plus NIGHTJAR's cover-name list; Tanzania's languages, via Zanzibar City.
  - Comparison with what I cited: they matched. The languages citation also brought in the city and country rows, making 3 facts.
- **Guest Register, Zanzibar.** "New: coverName as a starting point, exact spelling with the title, Filed under, and the Choose button."
  - Facts, from memory: SGT-040 in Zanzibar City; Dr. Lund is filed under MARBLE_HERON. They matched what I cited.
- **Quiet Consignee.** "New: field check (2 h, tells you which record to read); intake; two different things in one query works; the same thing twice gets returned."
  - I could not explain **alias**.
  - Facts, from memory: intake INT-CAL-0733 gives the consignee as Meridian Freight; the director is PEWTER_SWIFT. They matched what I cited, plus the shipment→intake row.
- **Three Couriers, stage 1.** "New: aliases; organization and lastKnownLocation." The facts I cited matched my memory: Parallax membership, and Lusaka → Zambia → borders includes Tanzania.
- **Three Couriers, stage 2.** "Nothing new." The facts matched: Kafue is in Mozambique, where Portuguese is spoken, and its director MARBLE_HERON is in the Parallax Circle.
- **Kata.** "Passed first try, nothing to re-learn."

## 4. Syntax ledger

| Syntax                                                                                                | Where I learned it                                                                                                                  |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `query { … }` and braces after a field that returns a record                                          | Round 1. Also the Docs preface: "Write query and a pair of braces…"                                                                 |
| Argument in parentheses with a double-quoted value: `operative(codename: "")`                         | The Guest Register starter template, and the Docs: "`String` inside the parentheses means … text, which you write in double quotes" |
| `!` in Docs entries (never typed)                                                                     | Docs preface: "You never type a ! in a query."                                                                                      |
| Field names `coverNames`, `sightings`, `nameGiven`, `languages`, `director`, `intake`, `registeredIn` | The Docs tab, in the Operative, Sighting, CoverName, Country, Company, Shipment and IntakeRecord entries                            |
| `organization`, `lastKnownLocation`, `borders`                                                        | The Three Couriers starter template                                                                                                 |
| Two different root fields in one query                                                                | The Guest Register debrief ("asks for two things directly inside the outer braces of one query"). Also the Glossary "query" entry.  |
| Alias `name: field(...)`                                                                              | The Three Couriers briefing links to "alias", which opens the manual's Glossary: `first: operative(codename: "NIGHTJAR")`           |

**Leaks:** I found no case where I used syntax that I could not trace to a place on screen. Possible soft leaks are listed under Caveats.

## 5. Points of confusion

1. **The clerk's note pointed to a Glossary entry that wasn't there.**
   - **Where:** _The Quiet Consignee_, the Results error, then the Glossary tab (clearance 2).
   - **What happened:** I asked for `company` twice. The clerk returned the request with "The glossary entry for an alias shows how to write one." I opened the in-case Glossary and it had no alias entry. It listed only query, transmission, field, selection, nested selection, type, schema, result, evidence, citation and argument.
   - **What I did:** I gave up on aliases and asked for one company per query, which cost an extra transmission.
   - **What would have helped:** Two options would work:
     - show the alias entry in the Glossary at every clearance once the clerk mentions it; or
     - put a one-line example in the clerk's note itself, such as `a: company(name: "…") b: company(name: "…")`.
2. **The alias link takes you out of the case.**
   - **Where:** _Three Couriers_, the briefing's "alias" link.
   - **What happened:** I expected the Glossary tab to open inside the case. Instead the link navigated to the Tradecraft manual page.
   - **What I did:** I used browser Back, and the case state was intact.
   - **What would have helped:** Open the in-case Glossary tab, or open the manual in a popover.
3. **I was never pushed to use Rule out.**
   - **Where:** every case after Luanda, in the draft panel.
   - **What happened:** After the first case I just picked the winner. The game accepted that, so I don't know whether ruling out is meant to be part of the skill.
   - **What would have helped:** If it matters, mention it in the debrief, for example "you could have ruled out X for free".
4. **Minor: the field check was cheaper to skip, but nothing showed that beforehand.**
   - **Where:** _The Quiet Consignee_.
   - **What happened:** The debrief showed that the intake field was right there in the Docs. I paid 2 h for the field check because the briefing told me to.
   - **What would have helped:** Wording such as "if you can't find the record yourself, order a field check".

## 6. The round's own questions

**Plausible leads, and what ruled them out:**

| Case            | Lead                  | Why it looked plausible                                 | What ruled it out                                       |
| --------------- | --------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| Guest Register  | SGT-027               | Kenya speaks Swahili                                    | The name H. Brandt is not on NIGHTJAR's cover-name list |
| Guest Register  | SGT-034               | The right name, M. Calloway                             | Mozambique has no Swahili                               |
| Quiet Consignee | Meridian Forwarding   | On the papers, and it had asked customs about the cases | It is the shipper, which customs said not to give       |
| Three Couriers  | SABLE_IBIS            | Parallax member                                         | Comoros has no land borders                             |
| Three Couriers  | TIN_FALCON            | Kenya borders Tanzania                                  | Baltic Exchange Bureau, not Parallax                    |
| Three Couriers  | Beira Tile Agency     | Mozambique, and "Tile" is in the name                   | Its director TIN_FALCON is not Parallax                 |
| Three Couriers  | Copperbelt Clay Works | Its director is Parallax                                | Zambia has no Portuguese                                |

**Kata:**

- I could use the _Three Couriers_ technique on new records immediately, and passed on the first try.
- I had to work nothing out again. The kata prompt spells out `chile: country(...)`, so it barely tests recall.

**Incomplete claims:** None. The only half-finished claim was "Meridian Freight is to receive VAL-0733". The draft showed "Needs evidence" and offered the field check, and the dispatch named the intake record. That was enough to find it.

## 7. At the end

**What stood out:**

- The returned request in _Quiet Consignee_. The clerk named the fix ("alias") but the Glossary it pointed to didn't contain it. It was the only real stall of the round.
- The _Guest Register_ debrief quietly taught "two things in one query", and I used that straight away.
- The "M" note at the end of _Three Couriers_ is a good hook.

**Would this person play another case?** Yes. Every case fell in one or two transmissions with no hints, the leads were fun to check, and the story is building toward "M". The risk for this person is boredom rather than confusion: the templates and the kata give the answer shape away.

**Pattern matching:** I never stopped understanding. In _Three Couriers_ stage 2 and in the kata I was copying a shape that had worked, but I understood why it worked.

## 8. Caveats

- **No hard leaks** went into the ledger. Things I know about GraphQL that may have helped without my noticing:
  - I wasn't surprised that duplicate fields conflict, though I didn't avoid the mistake.
  - I was confident that whitespace and one-line queries are fine. The Docs examples were one-line, though.
  - I trusted that typed closing braces would be skipped over by the editor rather than doubled. They were.
  - Choosing to nest `director { codename }` inside `transferOrders` without needing it.
- **Outside knowledge:** I already knew that Comoros is islands and which countries speak Portuguese. A real player might have needed the Map tab, which I never opened.
- **Coverage:**
  - I tested only round 2. Round 1 items, the Orientation question, the Luanda label question and the clock question are out of scope for this run.
  - I never opened the Hints, Evidence, Dossiers or Map tabs, so I can't report on them.
- **Persona:** I may have read the Docs more carefully than someone who "skims briefings" would. That probably saved transmissions.

---

## Rerun on the revised build

All four items on the round 2 path were finished: The Guest Register, The Quiet Consignee, Three Couriers, and the kata "Two lookups in one transmission". I took no hints and viewed no solutions. Four requests were returned by the clerk, and every clerk's note got me past the problem. One flag up front: by the end I was mostly copying query shapes rather than understanding them (Points of confusion #6). That weakens what the kata result shows.

### 1. Preflight

The 2-is-2 check passed. The header showed **Clearance 2**, and the desk said "2 of 10 cases resolved". _The Guest Register_ was marked **"Next in the story"**, not completed and not in progress. Round 1 items both showed "Completed independently".

### 2. Per-stage table

| Stage                    | Sent (returned)          | New things (persona's words)                                                                                                   | Controls I couldn't explain | Hints / solution | Stamp / hours left             | Notes                                                                              |
| ------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------- | ---------------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| Guest Register: Luanda   | 2 (1)                    | "Put the codename in brackets with quotes"; going three levels deep (city → country → languages); Rule out; the Country picker | none                        | none             | — / 23h left before travel     | The returned request was caused by the editor's auto-closing braces                |
| Guest Register: Zanzibar | 1 (1)                    | `coverName(name:"Dr. Lund")`; the exact string matters; Filed under; Submit                                                    | none                        | none             | **IDENTIFIED**, 20h            | Arrow keys put a line outside its braces → "no sightings on Query"                 |
| Quiet Consignee          | 3 (1) + field check (2h) | Blank editor; "can't ask for the same thing twice"; Order a field check; intake record                                         | none                        | none             | **HELD**, 13h, now clearance 3 | The raw error said "aliases"; the clerk's note said to split the queries, so I did |
| Three Couriers: Zanzibar | 1 (0)                    | Aliases (`grey: operative(...)`), three lookups in one go                                                                      | none                        | none             | (travel) 19h                   | Learned the alias syntax from the Glossary through the briefing's link             |
| Three Couriers: Lusaka   | 1 (0)                    | none (the alias pattern again)                                                                                                 | none                        | none             | **PAYMENT STOPPED**, 18h       | The starter already had `first:` in it                                             |
| Kata: Two lookups        | 1 (0)                    | none                                                                                                                           | none                        | none             | Passed                         | The kata prompt shows the alias syntax itself                                      |

### 3. Stage interviews (in order, as recorded)

- **Guest Register, Luanda.** New: an argument in brackets with a quoted value (copied from the starter); nesting three deep; Rule out; the Country picker; the editor's auto-closing producing extra braces.
  - Claims from memory: the name M. Calloway plus the complete cover-name list; Zanzibar → Tanzania → languages. This matched what I cited.
  - Ruled out:
    - Mombasa looked plausible because Kenya speaks Swahili, but H. Brandt isn't a NIGHTJAR cover name.
    - Maputo looked plausible because the guest gave the right name, but Mozambique has no Swahili.
- **Guest Register, Zanzibar.** New: a `coverName` lookup, the exact punctuation in "Dr. Lund", the Filed under picker, and Submit.
  - Claims: the sightings list (SGT-040) plus Zanzibar City for the sighting; MARBLE_HERON as the operative. This matched, though I didn't know the sightings citation counted as a "complete list".
  - The look-alike name (D. Lund) never showed up, because I typed the name exactly.
- **Quiet Consignee.** New: a blank editor, the "can't ask twice" error, the field check, and the intake record.
  - Claims: the receiver is shown by the intake record's consignee (Meridian Freight); the director is shown by Freight's director field (PEWTER_SWIFT). This matched.
  - Lead dropped: Meridian Forwarding looked plausible because it is named on the papers and had asked about the cases. It is the shipper, and the briefing said not to give the sender. I dropped it informally; I never needed the rule-out button.
- **Three Couriers, Zanzibar.** New: aliases, learned from the Glossary.
  - Claims: GREY's organization; Lusaka → Zambia → borders includes Tanzania. This matched.
  - Ruled out:
    - SABLE looked plausible because he's Parallax, but Comoros has no land borders.
    - TIN looked plausible because Kenya borders Tanzania, but he's Baltic Exchange Bureau.
- **Three Couriers, Lusaka.** Claims: Kafue is registered in Mozambique (Portuguese); its director MARBLE_HERON is Parallax. This matched.
  - Leads dropped:
    - Copperbelt has a Parallax director but is registered in Zambia, with no Portuguese.
    - Beira is registered in Mozambique and "Tile" is in its name, but its director TIN_FALCON is Baltic.
- **Kata.** The technique transferred directly in 1 transmission. There was nothing to work out again.

### 4. Syntax ledger

| Syntax                                                                        | Where learned                                                                                                                       |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `query { }`, braces, nesting, field names                                     | Round 1 (earlier session); the Documentation intro also restates them                                                               |
| Argument `(codename: "…")`, quotes                                            | Guest Register starter editor; the Documentation paragraph on `city(name: String!)`                                                 |
| `!` (never typed)                                                             | The Documentation says "You never type a `!` in a query"                                                                            |
| `coverNames`, `sightings`, `nameGiven`, `city`, `country`, `languages`        | Documentation entries for Operative, Sighting and Country                                                                           |
| `Language.name`                                                               | **Guessed** from the pattern that every type so far has `name`; it was not opened in the docs. A minor leak or reasonable inference |
| `coverName(name:)`                                                            | Stage 2 starter                                                                                                                     |
| `shipment(id:)`, `intake`, `shipper`, `consignee`, `director`, `registeredIn` | Documentation entries for Shipment, Company and IntakeRecord                                                                        |
| Several lookups at the root of one query                                      | Guest Register debrief (the reference solution's 2nd query)                                                                         |
| Alias `name: field(...)`                                                      | Glossary "alias" entry, reached through the link in the Three Couriers briefing                                                     |
| `organization`, `lastKnownLocation`, `borders`                                | Three Couriers starter                                                                                                              |

No fragments, variables or `$` were used.

### 5. Points of confusion

1. **The editor added extra braces at the end.**
   - **Where:** Guest Register, Luanda, editor.
   - **What happened:** I typed the closing braces myself. The editor had already auto-inserted them, so `}\n}` was left over at the bottom and the request was returned: "Unexpected }" at line 8.
   - **What I did:** The clerk's note about counting braces got me past it. I retyped without the final closers.
   - **What would help:** Step over a typed `}` even across newlines, or show a one-time tip: "the editor closes brackets for you".
2. **Arrow keys put a line in the wrong braces.**
   - **Where:** Guest Register, Zanzibar, editor.
   - **What happened:** After the editor inserted `")`, I used End/Down/Enter to keep typing. `sightings` landed at the query root, and the request was returned: "Cannot query field sightings on type Query".
   - **What I did:** The clerk's note was clear, and I fixed it.
   - **What would help:** Have the note say "sightings belongs to CoverName; move it inside coverName's braces."
3. **Old results stayed on screen under the error.**
   - **Where:** Guest Register, Zanzibar, Results panel.
   - **What happened:** Under the returned-request error, the previous transmission's Findings stayed visible. For a moment I thought the request had partly worked.
   - **What would help:** Hide earlier results, or label them "From transmission 2".
4. **Contradictory advice about asking twice.**
   - **Where:** Quiet Consignee, error panel.
   - **What happened:** The raw error said "Use different aliases". The clerk's note said "ask for company once per transmission… transmit the other separately". I followed the clerk, which cost an extra transmission. One case later the game taught aliases as the right answer.
   - **What would help:** Keep the clerk's advice, but add "(At clearance 3 you'll learn a way to ask twice in one go.)" so the two messages don't seem to conflict.
5. **The alias link leaves the case.**
   - **Where:** Three Couriers briefing, the "alias" link.
   - **What happened:** It navigated to the full Tradecraft manual page, away from the case, and I needed browser Back.
   - **What would help:** Open the in-case Glossary tab, or a popover.
6. **Pattern matching set in.**
   - **Where:** Three Couriers onward.
   - **What happened:** From here I was mostly copying the starter's field shape three times with different prefixes. Since the kata prompt spells out the alias form, it tests copying more than recall.
   - **What would help:** Have the kata starter not show the alias example inline. Point to the manual instead.
7. **Intended traps never fired.**
   - **Where:** Guest Register (D. Lund) and Quiet Consignee (shipper).
   - **What happened:** Because I typed the exact string, the "D. Lund" trap never appeared. I also dropped Meridian Forwarding without using the rule-out flow, so that lesson went unexercised. This is fine, but the lesson only lands in the debrief.

### 6. The round's own questions

- **Plausible leads:** covered in §3. Each red herring passed one clue and failed the other, which made them feel fair.
- **Kata:** I applied the technique from Three Couriers directly to countries. Nothing had to be worked out again. `capital` taking no braces was already shown in the starter.
- **Incomplete claims:** none. The closest was Quiet Consignee's "receives VAL-0733". After the papers' consignee came back empty and Freight's shipments were empty, I couldn't see what was missing. The draft did tell me what to do next: the field check appeared, and its dispatch named the intake record, which was enough.

### 7. At the end

- **What stood out:**
  - The clerk's notes are excellent safety nets.
  - The field-check dispatch pointed me straight to the missing record.
  - The debrief's reference query quietly taught me "two lookups in one query" a case early.
  - The "Choose Tanzania/Zambia" auto-suggest made the forms painless.
- **Would this person play another case?** Yes. Every stage gave a quick win, transmitting cost nothing when I got it wrong, and the closing note from "M" is a good hook.

### 8. Caveats

- **Leak:** I guessed `Language { name }` without opening the Language docs.
- **Background knowledge:** My knowledge of GraphQL may have made the docs' "list → braces" rule and the error messages read as obvious. A real newcomer might stall longer on "Cannot query field … on type Query", and on deciding which braces a field belongs in.
- **Typing realism:** I sent each query in a few large typing steps rather than strictly key by key.
- **Round 1 and preflight:** This run covers round 2 only, so the round 1 questions (the Luanda label and signer, the clock) aren't answered here. I also didn't check the round 1 preflight (clearance 1, 0 of 10).
