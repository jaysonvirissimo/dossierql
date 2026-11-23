# Simulated playtest · Round 1 · P2 · 2026-11-23

# DossierQL playtest, round 1: SQL analyst who has never written GraphQL

I finished the whole round 1 path: 6 drills, The Vanishing Azulejos (4 stages) and The Borrowed Chronometer. It took 10 transmissions in total. I took no hints and viewed no solutions. The clerk returned no requests. Both cases were stamped, and the header went from Clearance 1 to Clearance 2. I stopped there and did not open The Guest Register.

## 1. Preflight

- **Header:** "Clearance 1". The desk said "You hold clearance 1. 0 of 10 cases resolved." The round 1 check passes.
- **Round 2 check (for reference):** The Guest Register showed "Locked: needs clearance 2". It was not marked completed or in progress.
- **Orientation:** not opened. The persona's reasoning: "The desk is pushing 'Start training' as the first-day thing. I learn by typing queries."

## 2. Per-stage table

| Stage                         | Transmissions | New things (persona's words)                                                                                                                                                                                                                                                          | Controls I couldn't explain                                                                                                                     | Hints / solution | Stamp / hours left                                                          | Notes                                                                                                                                                                                 |
| ----------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Training drills 1–6           | 6 (1 each)    | "The parentheses are like a WHERE. The braces are the column list. No commas. A field can hold a whole record, so it's a join without ON. Lists come back in [ ]. You can chain as deep as you want. The docs say whether a field needs braces, and `!` means required, never typed." | none                                                                                                                                            | none             | All "Passed". The induction was stamped PASSED.                             | The editor's automatic brace closing gave me 2 extra `}` in drill 1, and I deleted them by hand. In drill 6 the "documentation below" was collapsed, so I had to find the disclosure. |
| Azulejos 1 (Lisbon, manifest) | 1             | "departingShipments, manifest, `#` comments, the Findings view, Cite, a lead, Supported, Submit deduction."                                                                                                                                                                           | The top-level "Cite departing shipments" button changed its label to "Cite for LIS-0486". What does citing a whole list into one shipment mean? | none             | Dispatch "accepted · LIS-0486"                                              |                                                                                                                                                                                       |
| Azulejos 2 (Namibia border)   | 1             | "destination is a City. Chain destination→country→borders. One citation on a nested row counts as 3 facts. 'borders none'."                                                                                                                                                           | same as above                                                                                                                                   | none             | Dispatch "accepted · LIS-0522"                                              | The objective says "ceramic shipment", but the form never asked for the manifest. I hesitated over that.                                                                              |
| Azulejos 3 (travel order)     | 0             | "Travel form, a Country dropdown, 'Needs a choice', a 'Choose Angola' button."                                                                                                                                                                                                        | none, but "Choose Angola" felt like it gave the answer away                                                                                     | none             | Dispatch "travel · LIS-0417"                                                | The page said outright that no query was needed.                                                                                                                                      |
| Azulejos 4 (Luanda)           | 2             | "arrivingShipments, intake→consignee is the label, transferOrders, authorizedBy→codename. Multi-record form with For shipment and Authorized by dropdowns."                                                                                                                           | Why the intake rows showed a bare "Cite" until I had cited an order                                                                             | none             | **HOLD ISSUED**. 4 transmissions against a reference of 3.                  | The editor garbled one draft, and I rebuilt it before sending.                                                                                                                        |
| Borrowed Chronometer          | 1             | "A clock: 1 hour per query, whatever its size. Blank editor. inspection { finding }. Receiving country dropdown."                                                                                                                                                                     | "Let the deadline pass…" (I guessed it means give up, but didn't test it)                                                                       | none             | **RECOVERED**, **17 of 18 hours left**. Assessment passed, now clearance 2. | One query matched the reference's shape.                                                                                                                                              |

## 3. Stage interviews (as recorded, not revised)

- **After the drills:**
  - New: the `query {}` wrapper, copied from the prefilled editor. Parentheses as WHERE. Braces as columns. One field per line with no commas. Opening a record with braces. Lists in square brackets. Chaining. The docs disclosure. `!` meaning required and never typed. The editor closing braces for me.
  - Controls: Transmit, Next drill, the Documentation disclosure and Vim were all clear.
- **Azulejos 1:**
  - Claim: "contents not ceramic". From memory: LIS-0486's manifest "Blue slate squares (14 cm)".
  - Cited: the same, 1 fact. No difference.
  - Could not explain the top-level list Cite button.
- **Azulejos 2:**
  - Claim: "no land border with Namibia". From memory: LIS-0522 → Praia → Cabo Verde → borders none.
  - Cited: the same 3 facts. No difference.
- **Azulejos 3:**
  - Claims: the manifest is ceramic, and Luanda → Angola → borders includes Namibia.
  - Cited: manifest (1 fact) and destination→country→borders (3 facts). No difference.
- **Azulejos 4 (Luanda):**
  - Claim 1: LIS-0417's intake label says Parallax Freight, and LUA-012's consignee is Parallax Freight.
  - Claim 2: LUA-012 was authorized by NIGHTJAR.
  - Difference from what I cited: I didn't remember that "LIS-0417 · transfer orders: LUA-011, LUA-012 (complete list)" counted as a cited fact.
- **Chronometer:**
  - Claim 1: GEN-0211's manifest "Marine chronometer, brass, gimballed".
  - Claim 2: Dakar → Senegal → West African CFA franc.
  - Cited: manifest (1 fact) and the currency chain (4 facts). No difference.

## 4. Syntax ledger

| Syntax                                                                                                                                                                     | Where I learned it                                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query { … }`                                                                                                                                                              | The prefilled drill 1 editor. Later explained in the Documentation intro: "Write `query` and a pair of braces". The Azulejos debrief said it is optional.                                                                        |
| Braces for the fields you want                                                                                                                                             | Drill 1: "The braces after it hold the fields you want back".                                                                                                                                                                    |
| `(name: "Portugal")` argument and quotes                                                                                                                                   | Drill 1: "the part in parentheses says which country you want". The docs: "text, which you write in double quotes".                                                                                                              |
| One field per line, no commas                                                                                                                                              | Drill 1.                                                                                                                                                                                                                         |
| Nesting a record                                                                                                                                                           | Drill 2: "write braces after `country` and put the field you want inside them".                                                                                                                                                  |
| List fields                                                                                                                                                                | Drill 3, and docs `[Country!]!`.                                                                                                                                                                                                 |
| Multi-level and repeated nesting                                                                                                                                           | Drills 4 and 5.                                                                                                                                                                                                                  |
| `!` (read only, never typed)                                                                                                                                               | Docs: "You never type a `!` in a query."                                                                                                                                                                                         |
| `#` comments                                                                                                                                                               | The prefilled Azulejos editor: "A line that starts with # is a note for you."                                                                                                                                                    |
| Every field name I used (manifest, destination, arrivingShipments, intake, consignee, transferOrders, authorizedBy, codename, inspection, finding, currency, Company.name) | Briefings or Documentation entries. Each was checked before I used it.                                                                                                                                                           |
| Writing small blocks on one line, e.g. `intake { consignee { name } }`                                                                                                     | **Partial leak.** It was modelled on inline docs examples such as `city(name: "Lisbon") { name }`. But drill 1 says "each field on its own line", and nothing on screen says line breaks don't matter. I knew that from GraphQL. |

No other leaks found.

## 5. Points of confusion

1. **The editor adds closing braces on top of the ones I type**
   - **Where:** every terminal, first seen in drill 1, worst at the Luanda stage.
   - **What happened:** I typed `}` and the editor kept its own closing braces as well, leaving 2 extras in drill 1 and 8 at Luanda. Clicking back into the editor also moved my insertion point into the middle of `name`, which garbled one draft. It was not sent.
   - **What I did:** deleted the extras, and later stopped typing closers or wrote small blocks on one line.
   - **What would have helped:** type over a closing brace that sits on the next line, or say in the terminal header that "the editor closes braces for you". Keep the cursor where it was when the editor regains focus.
2. **The Cite button on a whole list changes its label**
   - **Where:** Findings, the "departing shipments" row.
   - **What happened:** after a cite, the list's button read "Cite for LIS-0486". Citing a list of three shipments into one shipment's draft made no sense to me.
   - **What I did:** ignored it.
   - **What would have helped:** a tooltip on the button, e.g. "cites the fact that this list is complete".
3. **Cite buttons with no lead**
   - **Where:** Luanda Findings.
   - **What happened:** the intake rows showed a bare "Cite" until I cited an order. Then they became "Cite for LUA-012".
   - **What I did:** got past it by accident.
   - **What would have helped:** on a bare Cite, say "Cite an order first, or open a lead, to choose which draft this goes into."
4. **"Choose Angola / NIGHTJAR / Senegal" shortcut buttons**
   - **Where:** Travel and Deduction forms.
   - **What happened:** they name the answer before I commit, which made the dropdown pointless.
   - **What I did:** used the dropdown myself.
   - **What would have helped:** "Your citations point to one country; choose it above", without naming it.
5. **The objective and the claims don't match**
   - **Where:** Azulejos stage 2.
   - **What happened:** the objective says "ceramic shipment", but the claim list only asks about the border.
   - **What I did:** hesitated over whether to cite the manifest too, then submitted without it.
   - **What would have helped:** state that the earlier manifest is assumed, or add it as a claim.
6. **"The documentation below" is collapsed**
   - **Where:** drill 6.
   - **What happened:** nothing visible looked like documentation.
   - **What I did:** took a screenshot and found the disclosure.
   - **What would have helped:** open it automatically on drill 6.
7. **Long documentation panel**
   - **Where:** the case Documentation tab.
   - **What happened:** with several entries open I had to scroll inside the panel to find the Company fields.
   - **What would have helped:** a "collapse all" control, or links between types (click `Company` in `consignee: Company`).
8. **"Each field on its own line"**
   - **Where:** drill 1, then the debriefs.
   - **What happened:** drill 1 reads like a rule, but the debriefs show the same queries on one line.
   - **What would have helped:** say once that line breaks and spacing don't matter.

## 6. Round 1's own questions

- **Luanda label:**
  - After reading LIS-0417's label ("Parallax Freight"), the persona wanted to **send another query**. Nothing on screen held transfer orders, and the lead dropdown said "No transfer order retrieved yet".
  - The second query re-asked for the label and added transferOrders with consignee and authorizedBy.
  - **Signer:** I matched the label company to the order with the same consignee, LUA-012. Its authorizedBy codename is **NIGHTJAR**.
- **Clock:**
  - It **changed how I wrote queries**, not just added pressure. "Size is free" led me to put the manifest, the inspection and the whole destination→country→currency route into one request.
  - In Azulejos I had gone one step at a time.
  - **17 of 18 hours left** at the end.

## 7. At the end

- **What stood out:**
  - The drill ladder worked very well for a SQL user. "Nested braces = join" clicked by drill 2.
  - The debrief comparing my queries with the reference was useful.
  - The low points were the editor's extra braces and the opaque Cite labels.
  - The Cameroon decoy (Central African CFA franc next to West African CFA franc) was a nice check that I was reading carefully.
- **Would this person play another case?** Yes. Each case was short, the clock rewarded thinking like a SQL user, and passing the assessment unlocked "Arguments", which sounds like real WHERE clauses.

## 8. Caveats

- **My GraphQL knowledge:**
  - The one-line block style is the leak recorded in the ledger.
  - My GraphQL knowledge may also have made the docs' `[Type!]!` notation and the shape of the "Not yet opened" lists feel more obvious than they would to a real beginner.
  - Leaving `#` comments in (or deleting them) without worrying is backed by on-screen text.
- **Combining intake and transferOrders at Luanda:** reasonable SQL thinking, but it may have been nudged by knowing GraphQL handles sibling selections freely. The game never explicitly taught "two sibling sub-selections".
- **Untested:** the hint costs, returned requests, Travel's clock cost, and "Let the deadline pass…".
- **Tool limits:** some editing trouble came from my tool's key handling (focus moving the cursor, Cmd+A not supported). A real keyboard user might have fewer problems.

---

## Rerun on the revised build

Round 1 is finished. The player went through the drills, _The Vanishing Azulejos_ and _The Borrowed Chronometer_, took no hints and viewed no solutions, and now holds clearance 2. One request came back unread, and that was caused by the editor adding braces on its own.

### 1. Preflight

- The header showed **Clearance 1**, and the desk said "You hold clearance 1. **0 of 10** cases resolved." The round 1 check passed.
- _The Guest Register_ was marked "Locked: needs clearance 2". It was not marked completed or in progress.

### 2. Per-stage table

| Stage                              | Transmissions         | New things (player's words)                                                                                                                                                                                                                                          | Controls the player couldn't explain                                                  | Hints / solution | Stamp / hours left                     | Notes                                                                                                            |
| ---------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Training range, drills 1–6         | 6 (free), 0 errors    | "Fields one per line, no commas"; "the filter goes in parentheses"; "braces after a field are like a join"; "lists come back in square brackets"; "you can join as deep as you like"; "the docs read like DESCRIBE TABLE"; "! means required, and you never type it" | The `__typename` entry in the completion popup; the Vim switch (never used)           | None             | n/a                                    | The Documentation panel is a collapsed bar under the terminal. I had to take a screenshot to find it in drill 6. |
| Azulejos, stage 1 (Lisbon)         | 1                     | `departingShipments`; `#` comment lines; `manifest`; the Findings tree with Cite buttons; the Deduction form                                                                                                                                                         | The list-level "Cite departing shipments" button; the Evidence, Dossiers and Map tabs | None             | "Deduction accepted" (no stamp)        | The briefing names `manifest` outright.                                                                          |
| Azulejos, stage 2 (Namibia border) | 1                     | `destination` opens a city; one Cite on a nested row brings in the rows above it (3 facts); "borders none (complete list)"                                                                                                                                           | Same as above                                                                         | None             | Accepted                               | I guessed that `destination` was a City from the "Not yet opened" list, before reading the docs.                 |
| Azulejos, stage 3 (Travel)         | 0                     | The Travel order form; the country dropdown; the "Needs a choice" state                                                                                                                                                                                              | The "Choose Angola" button: why does the form hand me the answer?                     | None             | Travel approved                        | The stage says plainly that no new query is needed.                                                              |
| Azulejos, stage 4 (Luanda)         | 2 (1 returned unread) | `arrivingShipments`, `intake`, `transferOrders`, `authorizedBy`, `codename`; the clerk's returned request; a form that covers several records                                                                                                                        | `authorizationLog` compared with `authorizedBy`                                       | None             | **HOLD ISSUED**                        | The debrief counted 3 transmissions for the case. It did not count the returned request.                         |
| Borrowed Chronometer               | 1                     | The clock; a blank editor; `inspection { finding }`; destination → country → currency; "nothing returned"                                                                                                                                                            | "Let the deadline pass…"; the cost of a hint (never opened)                           | None             | **RECOVERED**, **17 of 18 hours left** | One query answered the whole case. Clearance went to 2.                                                          |

### 3. Stage interviews (recorded at each boundary, not revised)

- **After the drills:** New things were: the `query { }` wrapper; `country(name: "…")`; fields one per line with no commas; braces after a field to open a linked record; square brackets for lists; deep chains of links; how to read a docs entry (`[X]` is a list, `!` means required or always returned, and you never type `!`); the editor closing braces and quotes by itself; the completion popup. Transmit runs the query, the drill buttons move between drills, and Documentation is the schema. I could not explain `__typename`.
- **Stage 1:** Cite attaches a row to a shipment's draft. Open a lead picks the shipment, though I never needed it because Cite opened the draft. Submit hands the deduction in. From memory, "not ceramic" rests on LIS-0486's manifest, "Blue slate squares". The draft cited exactly that.
- **Stage 2:** From memory, LIS-0522 goes to Praia in Cabo Verde, which has no land borders. That matches what I cited (one citation, 3 facts). I did not cite the manifests, although the briefing told me to "use the manifests". The form did not need them.
- **Stage 3:** The registrar's description rests on LIS-0417's manifest. The Namibia border rests on Luanda → Angola → borders, which include Namibia. That matches what I cited.
- **Luanda:** See section 6. From memory, claim 1 rests on the intake label (Parallax Freight) and LUA-012's consignee (Parallax Freight). Claim 2 rests on LUA-012 being authorized by NIGHTJAR. One difference: the draft also counted "LIS-0417 · transfer orders: LUA-011, LUA-012 (complete list)", which I had not thought of as evidence.
- **Chronometer:** The clock changed how I wrote the query; see section 6. From memory, the description rests on GEN-0211's manifest and the currency rests on Dakar → Senegal → West African CFA franc. That matches what I cited. I did not cite the inspection finding.

### 4. Syntax ledger

| Syntax                                                                                     | Where I learned it                                                                                                                       |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `query { … }`                                                                              | Drill 1's prefilled editor, and the Query paragraph in the Documentation                                                                 |
| `field(arg: "value")`, quotes                                                              | Drill 1 text: "the part in parentheses says which country you want"                                                                      |
| Braces holding fields, one per line, no commas                                             | Drill 1 text                                                                                                                             |
| Nested braces for a record                                                                 | Drill 2: "write braces after `country`"                                                                                                  |
| Lists and `[ ]` in responses                                                               | Drill 3                                                                                                                                  |
| Chains of links                                                                            | Drills 4 and 5                                                                                                                           |
| `String!`, `[Country!]!`, `ID`                                                             | Documentation, "How to read an entry" (I first saw `String!` in the completion popup in drill 5, with no explanation)                    |
| `#` comments                                                                               | The comment in the Azulejos stage 1 editor                                                                                               |
| `manifest`                                                                                 | Azulejos briefing                                                                                                                        |
| `destination`                                                                              | The "Not yet opened on this shipment" list. **Mild leak:** I assumed it was a City before reading the docs. The guess also fits drill 2. |
| `departingShipments`, `arrivingShipments`                                                  | Prefilled editor; "Not yet opened" list                                                                                                  |
| `intake`, `transferOrders`, `consignee`, `authorizedBy`, `codename`, `finding`, `currency` | Documentation entries                                                                                                                    |
| Company `name`                                                                             | **Guessed** before checking. The docs confirmed it later.                                                                                |
| Typing `{ finding }` on one line so my `}` replaces the editor's                           | Worked out from the Luanda brace failure. No leak.                                                                                       |

No aliases, fragments, `$` variables or `!` were used.

### 5. Points of confusion

1. **The editor's auto-close doubles braces**
   - **Where:** Azulejos, Luanda stage, the terminal.
   - **What happened:** I typed each `}` on its own line after a nested block, as I would close a block in SQL. The editor kept its own closing braces as well, which left 11 closes for 8 opens. The clerk returned the request: "Unexpected '}' line 22… count the braces." The note was correct, but it took me three edits to fix. Ctrl+End does not jump to the end on a Mac, so I deleted `codename` by accident.
   - **What I did:** I counted the open blocks by hand and fixed the closing braces one at a time.
   - **What would have helped:** Let a typed `}` replace an auto-inserted `}` even when it is on the next line. Or show a short tip the first time the editor inserts a closer. Or have the clerk's note say how many braces are open and how many are closed.
2. **The documentation is hard to find**
   - **Where:** Training drill 6.
   - **What happened:** The drill says "the documentation below", but the panel is a collapsed bar under the terminal.
   - **What I did:** I took a screenshot to find it.
   - **What would have helped:** Open the panel automatically in drill 6.
3. **"Choose Angola", "Choose NIGHTJAR" and "Choose Senegal" give the answer away**
   - **Where:** The Travel order and Deduction forms.
   - **What happened:** The form names the answer before I choose it. It felt like the game was making the deduction for me.
   - **What would have helped:** Say only that the cited facts point to one country, and do not name it on a button.
4. **The Cite button on a list header**
   - **Where:** Findings, the "Cite departing shipments" button.
   - **What happened:** I could never tell what citing a whole list was for.
   - **What would have helped:** A tooltip that says what the citation adds, for example "the complete list of orders".
5. **`authorizationLog` next to `authorizedBy`**
   - **Where:** Luanda, Documentation.
   - **What happened:** Two ways to find out who signed. I don't know which one counts.
   - **What would have helped:** Nothing yet. This may be a setup for a later case.
6. **The debrief transmission count leaves out returned requests**
   - **Where:** Azulejos debrief.
   - **What happened:** It says 3 transmissions. I sent 4, and one came back unread.
   - **What would have helped:** "3 transmissions (1 more returned unread)".

### 6. The round's own questions

- **Luanda label and signer:** My one combined query already held the intake label (LIS-0417 → Parallax Freight) and both transfer orders, so I did **not** want another query. I looked in the results I had. LUA-012's consignee is Parallax Freight, the same as the label, and it was signed by **NIGHTJAR**. LUA-011 goes to Lantern Export and was signed by COPPER_KITE. WVB-0031 also carries a Parallax Freight label, so I could easily have cited the wrong intake.
- **The clock:** It **changed how I wrote queries**; it was not only pressure. Reading the documentation is free and every query costs an hour whatever its size, so I read the docs first. Then I put the manifest, the inspection and destination → country → currency into a single query. **17 of 18 hours left.**

### 7. At the end

- **Moments that stood out:**
  - "Same shape in, same shape out" clicked at once.
  - The nested Cite that brings 3 to 4 facts with it is satisfying.
  - The brace failure was the one bad moment.
- **Would I play another case?** Yes. Each case so far is like a JOIN puzzle with a story, and the clock pays you for writing one good query.

### 8. Caveats

- **Leaks:**
  - I assumed `destination` was a City before reading the docs.
  - I guessed Company's `name` field before checking it.
  - Knowing GraphQL probably made "a nested field brings back its parent rows" and "one request does everything" feel obvious to me sooner than they would to a real SQL user.
  - My fix for the braces, putting a short block on one line, may come from knowing how editors behave.
- **What this run cannot show:** It cannot show real reading time, real fatigue, or how a real person handles the trackpad and keyboard. Two keyboard problems were mine as the tester, not the player's: one key sequence went nowhere because the editor did not have focus, and one Cite click timed out.
- **Not tested:** Hints were never opened, so their cost is unknown. The Orientation was not opened, because this player went straight to "Start training".

---

## Earlier run preserved from Git

## Round 1 playtest — SQL user, new to GraphQL

### Preflight

- The Assignments header showed **Clearance 1** and the desk said **0 of 10 cases resolved**. The Guest Register was locked, required clearance 2, and showed no completed or in-progress marking.
- I treated the packet's “1 is 2” line as the alternate clearance-2 condition since the assigned Round 1 starts at clearance 1. At the end I verified that the header said **Clearance 2**, the desk showed **2 of 10 cases resolved**, and The Guest Register was marked **Next in the story**. I did not open it.
- I skipped Orientation. The desk advertised an optional six-minute training range with one skill at a time. I'd start there and try a written query before reading a general introduction.

### Per-stage table

| Stage                                          | Transmissions sent | New things, in my words                                                                                                                                                                                            | Controls I could not explain | Hints and solution viewed                                             | Stamp and hours left                | Notes                                                                                                                                                           |
| ---------------------------------------------- | -----------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- | --------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Training, all six drills                       |   6, one per drill | I list the columns I want, open related records with braces, and get a JSON object or list with those fields. I can look up exact field names and the kinds of results they return.                                | None used                    | No hints or solution                                                  | All six Passed · Induction complete | The drill labels and sample queries made the sequence easy to follow. “Under name” in drill 5 took a reread.                                                    |
| Azulejos, Lisbon, non-ceramic crate            |                  1 | I can run a query with a list of shipments, and a result fact has a button to put it on a case form.                                                                                                               | None used                    | No hints or solution                                                  | Deduction accepted                  | LIS-0486 declared slate. I chose it in the dropdown before citing its manifest.                                                                                 |
| Azulejos, Lisbon, land border                  |                  1 | The same query can follow the shipment's destination to its country and the country's borders. Side by side lets me compare shipments in columns and cite a cell. A deep citation brings the parent facts with it. | None used                    | No hints or solution                                                  | Deduction accepted                  | LIS-0522 was ceramic but went to Praia in Cabo Verde. The complete border list said none. Citing this cell also opened the lead.                                |
| Azulejos, travel order                         |                  0 | I can reuse results, put facts for two claims in one form, and pick the destination country to travel.                                                                                                             | None used                    | No hints or solution                                                  | Travel order approved               | The new objective initially looked like another query task, then the form explicitly told me to use existing results.                                           |
| Azulejos, Luanda, replacement label and signer |                  2 | I can look up a shipment by its quoted ID and put the intake record and transfer orders in the same query. The form asks me to identify the order, crate and signer.                                               | None used                    | No hints or solution during play. Reference visible after resolution. | **HOLD ISSUED**                     | First looked up labels, then queried LIS-0417 for its orders and registry signatures. The debrief counted 4 total case transmissions versus 3 in the reference. |
| The Borrowed Chronometer                       |                  1 | With a one-hour charge per transmission, I started from a blank editor and asked for both the manifest and the entire destination-currency path at once.                                                           | None used                    | No hints or solution during play. Reference visible after resolution. | **RECOVERED**, 17 of 18 hours left  | GEN-0211, Senegal. Assessment passed and the header advanced to clearance 2.                                                                                    |

No request was returned unread, and I received no clerk correction. I spent no hours on hints or solutions.

### Stage interviews

1. **Drill 1, Ask for a field.** “I start with a query in braces. The country lookup tells the archive which row to use, and the inner braces list the columns I want, one per line without commas. I saw the JSON coming back in that shape. Transmit is my Run button and Next drill moves on.”
2. **Drill 2, Open a record.** “The city has a country field, but that's another record, so I put its name inside another pair of braces. Lisbon and Portugal can both have a name at different levels. Transmit runs it, and Next drill opens the next exercise.”
3. **Drill 3, Read a list.** “I asked for a neighbor's name once and got that name field on each of five neighboring records. The JSON square brackets show it's a list. I used the same Run and Next controls.”
4. **Drill 4, Follow two links.** “I can walk from city to country and then from country to its neighbors in one request. I put capital at the deepest level to get the neighbor's capital. Transmit and Next drill mean what they did before.”
5. **Drill 5, Follow a chain of three links.** “The same link name can appear twice because it's coming from two different records. I paused at ‘under name’ and put the second borders alongside Spain's name, inside the first borders block. Transmit runs it and Next drill advances.”
6. **Drill 6 and training exit.** “Documentation is the field catalog. I expanded Country and Currency to confirm that currency opens a record and name is the text it holds. The starter's city lookup plus the previous drill's nesting gave me the result. Transmit ran it and Open the first case left training. Across the drills I learned to follow the archive's existing relationships and make the returned JSON shape match my request.”
7. **Lisbon, non-ceramic.** “The blue 14 cm slate squares on LIS-0486's manifest rule out ceramic tiles. That was the line I cited. New to me were the shipment fields, the starter's hash comments, and filing evidence. Open a lead picks the crate. Cite adds that fact to its draft. Submit files the supported claim. I saw Side by side but didn't use it yet.”
8. **Lisbon, land border.** “LIS-0522 goes to Praia, Praia is in Cabo Verde, and Cabo Verde has zero land borders. I cited one border cell and the draft showed all three facts. The ceramic declaration helped me choose a plausible crate, but the draft's one claim was about the route, so it wasn't attached. Side by side compares columns and lets me cite a cell. The Cite button also opens the relevant lead draft. Submit files it.”
9. **Travel order.** “LIS-0417's manifest says blue ceramic squares, 14 cm. It heads to Luanda, Luanda is in Angola, and Angola's border list includes Namibia. All of those were attached. The registrar's description was in the brief, so I didn't cite a separate registrar row. I learned the form matches citations to claims without asking me to assign each one. The country dropdown says where I'm headed and Travel files the order and moves the case.”
10. **Luanda.** “The crate's arrival label says Parallax Freight and LUA-012 says Parallax Freight. The registry and the order both point to NIGHTJAR. The actual citations show LIS-0417 to intake INT-LUA-0417 to Parallax Freight, LIS-0417 to its order list to LUA-012 and that order's consignee, and LUA-012 to LOG-012 to NIGHTJAR. I'd also read the order-signature field but I just attached the registry's signed-by fact. I learned I can query one shipment by a quoted ID and put two branches into the same query. The draft's separate selectors tie the order back to the shipment and authorizer. Cite sends the row to that order draft and Submit files it.”
11. **Chronometer.** “GEN-0211's manifest says marine chronometer, brass, gimballed. Its destination is Dakar, Dakar is in Senegal, and Senegal uses the West African CFA franc. The two citations contain exactly that manifest and the destination-country-currency chain. The assessment gave me a blank editor and a one-hour price for a transmission. I combined both lines of inquiry in a single request. Cite adds what proves the claim, Receiving country records Senegal as my answer, and Submit files it. Seventeen hours were left.”

### Syntax ledger

| First use or encounter  | What I learned                                                                                                                                                                                                               | On-screen source                                                                                                                                                                                                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Drill 1                 | Lowercase `query`, outer brace pair, inner field braces, `country(name: "Portugal")`, parentheses with a named selector and colon, double quotes around text, `name` and `capital` as columns, whitespace in place of commas | Ask for a field instructions (“The word query and the outer braces hold the whole request,” “the part in parentheses says which record,” “Put a space or a new line between two fields, and no comma”) and filled Terminal starter. Copied the lookup without modification.                 |
| Drill 2                 | `city(name: "Lisbon")`, nested `country { name }`, and separate scopes for the two `name` fields                                                                                                                             | Starter uses `city`. Open a record instructions say the city's country field holds another record and to write braces after it.                                                                                                                                                             |
| Drill 3                 | `borders { name }` opens a list using the same query braces. Square brackets in the result mark the JSON list.                                                                                                               | Read a list instructions introduce `borders`. The Passed note points out “In the raw response, a list comes back inside square brackets.”                                                                                                                                                   |
| Drills 4–5              | Deeper nesting and repeated field names along one path                                                                                                                                                                       | The Prague starter already nests `country`. Its instructions say an opened record has links of its own. The Lisbon/Spain prompt says to put another `borders` inside the first set of border braces.                                                                                        |
| Drill 6                 | `currency { name }`. Documentation uses types and a colon, lists such as `[Country!]!`, and `!` in signatures.                                                                                                               | Documentation, Country entry `currency: Currency`, Currency entry `name: String!`. Catalog introduction says a record needs braces, an input marked `!` is required, and its query example supplies a double-quoted city name without a `!`. Types and `!` stayed in the catalog.           |
| Lisbon, non-ceramic     | `departingShipments { id manifest }`. `#` is a comment                                                                                                                                                                       | Terminal starter contains `departingShipments`, `id`, and an explicit explanation that lines starting with `#` are ignored. Brief calls the shipping declaration the `manifest`. Documentation → Shipment confirms it is text and takes no braces. I removed rather than authored comments. |
| Lisbon, land border     | `destination` opens a City record, which permits the learned `country` and `borders` path                                                                                                                                    | Findings lists it under unopened fields, and Documentation → Shipment confirms `destination: City!`.                                                                                                                                                                                        |
| Luanda, label retrieval | `arrivingShipments`, `intake`, and intake `consignee` with the Company `name` inside                                                                                                                                         | Starter supplies `city(name: "Luanda")`. Documentation entries City, Shipment, IntakeRecord and Company supply the field spellings and return types.                                                                                                                                        |
| Luanda, order retrieval | `shipment(id: "LIS-0417")`, sibling `intake` and `transferOrders`, and order `id`, `consignee`, `authorizedBy`, `authorizationLog`, log `signedBy`, operative `codename`                                                     | Documentation → Query shows `shipment(id: ID!): Shipment` and the catalog says an identifier is written in double quotes. Shipment, TransferOrder, AuthorizationLog and Operative entries supply the branches and their field names.                                                        |
| Chronometer             | No new syntax. Combined `manifest` and the `destination → country → currency` chain in a query starting from Genoa.                                                                                                          | Genoa supplied by the case brief. Field names and paths came from the drills and Azulejos.                                                                                                                                                                                                  |

I found no syntax I used without a visible source. I did not use aliases, fragments, variables, or a typed `!`.

### Points of confusion

1. **Where** — Training drill 4, “Follow two links.”  
   **What happened** — At first I thought “two links” might mean two relationships from the same record. The Prague prompt actually wanted consecutive hops.  
   **What I did** — Read the route in the prompt and built city → country → borders.  
   **What would have helped** — Give the title or opening sentence the concrete route so the word “two” immediately means depth.
2. **Where** — Training drill 5, instructions above the editor.  
   **What happened** — I reread “inside those braces, under name.” I had to decide which brace pair the text meant and whether “under” meant nested more deeply.  
   **What I did** — Identified the block for Spain and inserted its `borders` on the next line at the same indent as Spain's `name`.  
   **What would have helped** — Say “In the block for Spain, add the second `borders` on a new line at the same indent as `name`.”
3. **Where** — Azulejos stages 2 and Luanda, Documentation → Shipment.  
   **What happened** — I expected to open Shipment after switching to Documentation, but toggling it hid the fields because the entry had retained its expanded state.  
   **What I did** — Checked whether the field definitions were present and reopened the entry.  
   **What would have helped** — A conspicuous expanded-state marker on the entry heading, especially when returning to the tab.
4. **Where** — Azulejos, Travel order, objective and form.  
   **What happened** — “Identify the shipment carrying the tiles and the country receiving it” sounded like a fresh terminal task. I hesitated when I saw a Travel order and another empty lead dropdown instead.  
   **What I did** — Read the form's first instruction directing me to existing results, then cited the two facts from the last transmission.  
   **What would have helped** — Put “Use your existing results” near the objective or immediately above the lead selector so the next action is visible earlier.
5. **Where** — Azulejos, Luanda starter, documentation, and first result.  
   **What happened** — The starter asked what the depot recorded for arrivals, which I took as a label lookup. That result had the label but no order or signer. The debrief showed the reference fetches both branches together.  
   **What I did** — Read the result for the label, then requested the label, orders and signature on one targeted shipment.  
   **What would have helped** — If the intended exercise is to retrieve both in one transmission, put “Ask for the depot label and the transfer orders on each arrival” in the starter. If learning the label first is acceptable, mention that a second request may be needed with that approach.
6. **Where** — Azulejos, Luanda, comparing authorized-by and registry-signed-by.  
   **What happened** — Documentation presented both a signature on the order and the registry signature. I was unsure which evidence the claim would prefer because both matched.  
   **What I did** — Asked for both, cited the registry’s signed-by row, and saw the claim show support after entering the selections.  
   **What would have helped** — Include a short cue in the draft naming the registry signature as an acceptable supporting fact.

### The round's own questions

**Luanda label and signer.** LIS-0417’s arrival label said Parallax Freight. At that moment I wanted another query. I checked the same Side by side result first, but it displayed only the intake and named consignee fields I had requested and called out `transferOrders` as unopened. I used the Shipment and signature-related documentation to retrieve the two orders. LUA-011 was marked for Lantern Export and signed by COPPER_KITE. LUA-012 matched Parallax Freight and both its order signature and its registry log named NIGHTJAR. I used LOG-012 for the submitted signature citation.

**Clock.** It changed how I wrote the query. After looking up just the label first in Luanda, I deliberately fetched both Chronometer claims together because the briefing said the whole query costs one hour regardless of how much it asks for. I started with 18 hours, used one paid transmission, and finished with **17 hours to spare**. Knowing that thinking and drafting were free kept the clock from feeling like a real-time rush.

### At the end

The standout moments were the Cabo Verde border cell carrying the full shipment-to-country chain, the travel order using the same result without another request, and the blank assessment editor where the training links worked on unfamiliar cargo. In the chronometer case, two records had the right instrument and two had the right currency, so retrieving both fields in one request immediately showed their intersection.

I'd play another case. The evidence work had a practical purpose, and the first assessment let me extend a pattern I understood. I copied starter shapes when they taught a lookup, but no clear moment stood out where I copied a working query without understanding which record each block selected.

### Caveats

This is a simulated player. Knowing GraphQL beforehand may have made nested scopes, precise casing, matching braces, and the separation of catalog signatures from query syntax feel more natural than they would for a real SQL user. My speed at assembling several known pieces in the blank assessment and choosing a single shipment lookup in Luanda may also overstate transfer. The visible ledger provides a source for every piece of syntax used, with no observed leak. The browser bridge made editor replacement and exact control targeting convenient, so the run does not measure typing or pointer friction. It also does not show how Orientation, hints, returned requests, or a near-expired clock would feel because none of those were used. The reference appeared in the two debriefs after my submissions.
