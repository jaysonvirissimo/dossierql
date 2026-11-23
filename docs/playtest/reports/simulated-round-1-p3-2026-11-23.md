# Simulated playtest · Round 1 · P3 · 2026-11-23

# DossierQL playtest, round 1

I played all of round 1 and stopped at the round 2 boundary. Both cases came back resolved, I took no hints and viewed no solutions, and the clerk returned no requests. The biggest problem was the editor itself: twice it filled my multi-line queries with extra `}` lines, and my attempt to fix one made things worse.

## 1. Preflight

- **Passed.** The header showed "Clearance 1", and the desk read "You hold clearance 1. 0 of 10 cases resolved."
- _The Guest Register_ showed "Locked: needs clearance 2".
- **Orientation:** the person opened it. They read everything, and it was their first day.

## 2. Per-stage table

| Stage                               | Transmissions | New things (person's words)                                                                                                                                      | Controls I couldn't explain                                                                    | Hints / solution | Stamp / hours left                          | Notes                                                                 |
| ----------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------- | --------------------------------------------------------------------- |
| Orientation                         | 0             | "Parentheses say which record, braces hold what I want back."                                                                                                    | none                                                                                           | none             | —                                           | The leading word `query` isn't explained here                         |
| Training range, drills 1–6          | 6 (1 each)    | One field per line with no commas; braces open a linked record; lists come back in square brackets; chains of links; a docs panel with `!` and `query` explained | Vim keybindings                                                                                | none             | — (no stamp, only "Passed")                 | The editor's auto-closing braces added duplicate `}` lines in drill 1 |
| Azulejos, stage 1: Lisbon manifests | 1             | Case screen; `#` note lines; `manifest`; Cite button; lead dropdown; claim shown as Supported; Submit                                                            | The top-level "Cite departing shipments" button, and why its label changed after my first cite | none             | "accepted" dispatch                         | Briefing sentence about Cite reread twice                             |
| Azulejos, stage 2: Namibia borders  | 1             | `destination` needs braces; going 4 links deep; one cite on a nested row counts as 3 facts                                                                       | Earlier/Later (guessed), Side by side, Raw response                                            | none             | "accepted"                                  | —                                                                     |
| Azulejos, stage 3: Travel order     | 0             | Travel order; two claims on one form; country dropdown; "Needs a choice"; "Choose Angola" button                                                                 | none, though I suspected "Choose Angola" gives the answer away                                 | none             | travel approved                             | The page itself said "This stage needs no new query"                  |
| Azulejos, stage 4: Luanda           | 2             | Intake record (the label); transfer orders; `authorizedBy`/`codename`; a form that asks for three things                                                         | Why the intake rows' Cite buttons said a bare "Cite" until I opened a lead                     | none             | **HOLD ISSUED** (4 sent, reference sends 3) | Editor brace trouble again; I switched to typing on one line          |
| The Borrowed Chronometer            | 1             | Mission clock; blank editor; Inspection's `finding`; currency reached through the country                                                                        | "Let the deadline pass…"                                                                       | none             | **RECOVERED**, 17 of 18 hours left          | Now at clearance 2                                                    |

## 3. Stage interviews (as recorded, not revised)

**After the drills**

- New: braces, quoted names in parentheses, one field per line, nested records, lists in square brackets, chains of links, the docs panel (`!` you never type, the word `query`), and the editor adding closing braces by itself.
- Controls: Transmit sends. Next drill moves on. The docs show what fields exist. "Vim keybindings: I don't know what that is, so I left it alone."

**Azulejos, stage 1**

- New: the whole case screen, `#` notes, `manifest`, Cite buttons labelled with a shipment, the lead dropdown, the draft, Submit.
- Controls: Cite adds proof to a shipment's draft. Submit sends it. Remove takes a citation out. I couldn't explain the top-level Cite button.
- Evidence from memory: LIS-0486's manifest, "Blue slate squares." This matched what I actually cited.

**Azulejos, stage 2**

- New: `destination` needs braces; one nested cite brings in the rows above it.
- Evidence from memory: Praia → Cabo Verde → borders none. This matched what I cited (3 facts).

**Azulejos, stage 3**

- New: the Travel order, a country dropdown, and the "Choose Angola" helper button.
- Evidence from memory: LIS-0417's manifest, plus Luanda → Angola → borders including Namibia. This matched.

**Azulejos, stage 4 (Luanda)**

- New: intake, transfer orders, `authorizedBy`, a three-part form, and the one-line typing workaround.
- Evidence from memory: label Parallax Freight, order LUA-012 to Parallax Freight, and NIGHTJAR on LUA-012.
- Difference from what I cited: the nested cites also brought in the full list of LIS-0417's orders ("LUA-011, LUA-012 (complete list)") and the intake ID INT-LUA-0417. I didn't remember citing either.

**Chronometer**

- New: the clock, a blank editor, `inspection { finding }`, currency.
- Controls: I couldn't explain "Let the deadline pass…".
- Evidence from memory: GEN-0211's manifest, plus Dakar → Senegal → West African CFA franc. This matched.

## 4. Syntax ledger

| Syntax                                                                                                               | Where I learned it                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{ }` braces hold the fields                                                                                         | Orientation: "The braces after it hold the pieces of information you want"                                                                                       |
| `(name: "Chile")` argument and its quotes                                                                            | Orientation: "The part in parentheses says which record"; the docs: "text, which you write in double quotes"                                                     |
| Field names (`name`, `capital`)                                                                                      | Drill 1 text                                                                                                                                                     |
| One field per line, no commas                                                                                        | Drill 1: "Put each field on its own line, with no comma between fields"                                                                                          |
| Nesting                                                                                                              | Drill 2: "write braces after `country` and put the field you want inside them"                                                                                   |
| Lists / `[ ]` in responses                                                                                           | Drill 3                                                                                                                                                          |
| Leading `query`                                                                                                      | Seen in the Orientation example without explanation. Explained in the drill 6 docs ("Write `query` and a pair of braces"). The first debrief says it is optional |
| `!`                                                                                                                  | Drill 6 docs: "You never type a `!` in a query"                                                                                                                  |
| `#` notes                                                                                                            | Comment in the Azulejos editor                                                                                                                                   |
| Field names `manifest`, `destination`, `intake`, `transferOrders`, `authorizedBy`, `codename`, `finding`, `currency` | Documentation tab entries                                                                                                                                        |

No GraphQL syntax leaked. Aliases, fragments, `$` variables and `query` arguments were never used. One editor-skill leak is listed in Caveats.

## 5. Points of confusion

1. **The editor's auto-closing braces**
   - **Where:** drill 1 and the Luanda stage, in the Terminal.
   - **What happened:** I typed each closing `}` on its own line, as the examples show. The editor had already inserted one, so duplicates appeared: 2 extra in drill 1 and 5 extra in Luanda. My fix in Luanda deleted the wrong lines and broke the query.
   - **What I did:** I retyped the whole query on one line, where a typed `}` steps over the one the editor inserted.
   - **What would have helped:** either step over a matching `}` on the next line, or add a line under the editor such as "The editor adds closing braces for you." The game's examples model a multi-line layout that the editor fights.
2. **The briefing's Cite sentence**
   - **Where:** Azulejos briefing.
   - **What happened:** "When the button shows a shipment's ID, Cite opens that shipment's draft" made no sense before I had seen any results. I reread it twice.
   - **What I did:** It became clear once I saw a "Cite for LIS-0486" button.
   - **What would have helped:** "Each Cite button is labelled with the shipment it belongs to, for example 'Cite for LIS-0486'."
3. **Cite buttons change their labels**
   - **Where:** Azulejos stages 1 and 4, Results.
   - **What happened:** The top-level "Cite departing shipments" button turned into "Cite for LIS-0486" after my first cite. In Luanda, the intake rows showed a bare "Cite" until a lead was open.
   - **What I did:** Ignored it, then guessed that the label follows whichever lead is open.
   - **What would have helped:** a short line in Findings, such as "Rows that belong to no single lead go into whichever lead is open."
4. **The word `query` is unexplained at first**
   - **Where:** Orientation.
   - **What happened:** The example starts with `query`, but nothing says whether it is required. The answer only came in the drill 6 docs, and "optional" only in the first debrief.
   - **What would have helped:** one clause in the Orientation: "Requests start with the word `query` (optional)."
5. **The "Choose X" helper buttons**
   - **Where:** Travel order and Deduction forms.
   - **What happened:** "Choose Angola", "Choose NIGHTJAR" and "Choose Senegal" fill in the answer from my citations. It felt like the form was answering for me.
   - **What would have helped:** if the choice is meant as a test, drop the button. If not, the button is fine.
6. **`authorizationLog` versus `authorizedBy`**
   - **Where:** Luanda, Documentation.
   - **What happened:** The docs describe two kinds of signing record. The briefing says the orders "carry different signatures".
   - **What I did:** Chose `authorizedBy` without checking the log. It was accepted, but I'm still not sure whether the log mattered.
7. **Unexplained controls**
   - **Where:** "Vim keybindings" (jargon, on every terminal) and "Let the deadline pass…" (Chronometer).
   - **What would have helped:** tooltips, or hiding the Vim switch behind Settings.
8. **The documentation in drill 6 was hard to find**
   - **Where:** Drill 6.
   - **What happened:** The drill says "the documentation below", but it is a collapsed section. Opening an entry also needs a click on its summary line.
   - **What would have helped:** open it by default in drill 6.

## 6. The round's own questions

**The Luanda label and the signer.**

- After reading the replacement label (LIS-0417, intake consignee Parallax Freight), the person wanted to **send another query**. Nothing in the earlier results contained transfer orders, and the lead dropdown said "No transfer order retrieved yet".
- They identified the signer by matching consignees: the label's Parallax Freight matched order LUA-012 (LUA-011 goes to Lantern Export). Then they read LUA-012's `authorizedBy`, which is NIGHTJAR.
- The reference solution fetches the label and the orders in one query. I spent one extra transmission (4 against 3).

**The clock.**

- The clock **changed how I wrote the query**, not just the pressure. Because of "however much the query asks for", I put manifest, inspection, destination, country and currency into a single transmission, and read the free docs before sending.
- **Hours left: 17 of 18.**

## 7. At the end

- **What stood out:**
  - The drills ramped up well; each one passed on the first try.
  - The citation panel's "Supported" feedback was reassuring.
  - The debrief's side-by-side comparison with the reference solution was useful.
  - The low point was fighting the editor's braces in Luanda.
- **Would this person play another case?** Yes. The cases are short, the feedback is clear, and they felt capable. They would want the editor fixed, because tidying braces is exactly the kind of fiddly thing that puts off someone who doesn't program.

## 8. Caveats

- **Editor-skill leak:** typing on one line so a typed `}` steps over the auto-inserted one came from my knowledge of code editors. A real ops person might have stayed stuck on the duplicate braces, or taken a hint, at drill 1 or in Luanda.
- **Choices GraphQL knowledge may have eased:**
  - Going straight to four links deep in Azulejos stage 2.
  - Folding everything into one query in the Chronometer case.

  The drills and the clock text both support these choices, but a real novice might have gone one level at a time.

- **Reading pace:** I read the long documentation blocks faster and with less fatigue than a real person would. Their stalls in the docs may be longer than recorded.
- **Tool quirk:** opening a docs entry by its short name timed out, and I had to use the full summary text. A sighted mouse user would not hit this, so it is not reported as a game issue.
- **Not covered:** round 2 (_The Guest Register_ onward) and the kata.
- **Never exercised:** hints, viewing a solution, and returned requests.

---

## Rerun on the revised build

I played the whole Round 1 path as the operations persona and stopped there. All three items were solved without hints or solutions, and no request was returned by the clerk. The run ended at clearance 2 with 17 of 18 hours left on the Chronometer clock. The biggest problem was the editor's automatic closing braces: twice they left extra `}` in my query, and fixing them cost real effort.

### 1. Preflight

- **1 is 1 (applies):** the header showed **Clearance 1**, and the desk read **"You hold clearance 1. 0 of 10 cases resolved."** Pass.
- **1 is 2:** does not apply to Round 1. At that point _The Guest Register_ was shown as "Locked: needs clearance 2", not as completed or in progress.

### 2. Per-stage table

| Stage                              | Transmissions     | New things (in the person's words)                                                                                                                                                                                                                     | Controls I couldn't explain                            | Hints / solution | Stamp / hours left                                          | Notes                                                                                                                                                 |
| ---------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | ---------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orientation                        | 0                 | "A query lists what I want, in the shape I want it back. Parentheses pick the record, braces hold what I want."                                                                                                                                        | none                                                   | none             | —                                                           | **Opened it.** It's in the main menu and sounds like the day-one reading.                                                                             |
| Training range, drills 1–6         | 6 (one per drill) | One field per line, no commas. A field holding a record needs its own braces. Lists come back in square brackets. You can nest as deep as you like. The Documentation drawer, with String, ID, `!`, `[X!]!` and null. The editor closes braces itself. | Vim keybindings switch                                 | none             | — (untimed)                                                 | Drill 1: auto-close left 2 extra `}` and my clean-up deleted part of `capital`, so I retyped it. In drill 6 the docs "below" were a collapsed drawer. |
| Azulejos, stage 1 (Lisbon, slate)  | 1                 | `#` notes in the editor, `manifest`, Findings view with a Cite button on every row, Open a lead, the draft, "Supported", Submit deduction                                                                                                              | the plain "Cite departing shipments" button at the top | none             | —                                                           | Briefing paragraph about Cite and the draft was hard to picture before seeing it (reread).                                                            |
| Azulejos, stage 2 (Namibia border) | 1                 | `destination`; going three levels deep; one Cite on a deep row brings in the rows above it ("3 facts")                                                                                                                                                 | same                                                   | none             | —                                                           | I didn't cite that LIS-0522 is ceramic, and the form didn't ask for it.                                                                               |
| Azulejos, stage 3 (travel order)   | 0                 | Travel order form, receiving-country dropdown, "Needs a choice", a **"Choose Angola"** button                                                                                                                                                          | none                                                   | none             | —                                                           | The form offered the answer itself.                                                                                                                   |
| Azulejos, Luanda                   | 2                 | `arrivingShipments`, `intake → consignee`, `transferOrders`, `authorizedBy → codename`; a lead that is a transfer order; extra dropdowns for shipment and operative                                                                                    | "Cite arriving shipments" (top row)                    | none             | Debrief stamp **HOLD ISSUED** (no clock)                    | Auto-close piled up 3 extra `}`. I fixed it by counting (and over-deleted once). 4 transmissions against the reference's 3.                           |
| The Borrowed Chronometer           | 1                 | Mission clock, "Transmit (1 hour)", blank editor, `inspection { finding }`, writing small blocks on one line                                                                                                                                           | "Let the deadline pass…" (I guessed it means give up)  | none             | **RECOVERED**, **17 of 18 hours left**; clearance 2 granted | 1 transmission, same as the reference.                                                                                                                |

Total: 15 transmissions (6 drills, 4 Azulejos, 1 Chronometer, plus 4 in Azulejos counted above → 6 + 4 + 1 = 11 sent to the archive; see note below). No requests returned, no hints, no solutions viewed.

> Correction to the line above: the total is **11 transmissions** (6 in the drills, 4 in Azulejos, 1 in Chronometer).

### 3. Stage interviews (in order, as recorded)

**After the drills.** New: the word `query` and the outer braces; parentheses pick a record, with the name in double quotes; one field per line, no commas; a field holding another record needs its own braces ("opening a link"); lists come back in square brackets, and asking for `name` once returns it for every item; nesting as deep as needed; the Documentation drawer ("needs braces" or "takes no braces"; String = text; ID = reference number in quotes; `!` = must give / always returned, never typed); the editor adds closing braces; the Transmit button. Controls: Transmit sends, and it was free here. The drill buttons jump between drills. The Documentation drawer lists what I can ask for. Next drill moves on. **The Vim keybindings switch I couldn't explain.** I didn't open the Tradecraft manual.

**Azulejos, stage 1.** New: a half-written query with `#` notes; `departingShipments` (it came prefilled and I never looked it up); `manifest`; Findings with Cite buttons; "Not yet opened on this shipment"; Open a lead; the draft (Claims, Supported, Citations, Remove, Submit deduction); Side by side and Raw response (not used). Controls: Cite puts the fact into that shipment's folder. Open a lead picks the shipment (my Cite set it for me). Submit hands it in. Remove takes a citation out. **I couldn't explain the plain "Cite departing shipments" button, or "one citation can count as several facts" in practice.**
Claims from memory: LIS-0486's manifest says blue slate squares. Actually cited: `manifest: Blue slate squares (14 cm)`. No difference.

**Azulejos, stage 2.** New: `destination`; three levels deep; a deep Cite counting as 3 facts; "borders none (complete list)"; Earlier and Later. Controls: Cite, Submit, Earlier/Later (flip between transmissions, not used). Still can't explain the top-level Cite button.
Claims from memory: LIS-0522 goes to Praia, which is in Cabo Verde, and Cabo Verde has no borders. Actually cited: destination Praia → Cabo Verde → borders none (complete list). Matches. I didn't cite that it was ceramic and worried a little that it would be needed.

**Azulejos, stage 3 (Travel).** New: Travel order form; receiving-country dropdown; "Needs a choice"; the "Choose Angola" shortcut; being told no query was needed. Controls: Travel is "like Submit, but it moves me on". "Choose Angola" felt like the form answering itself.
Claims from memory: (1) manifest says blue ceramic squares, 14 cm; (2) goes to Luanda, in Angola, and Angola borders Namibia. Actually cited: the manifest; Luanda → Angola → borders DRC, Republic of the Congo, Namibia, Zambia (complete list). Matches.

**Azulejos, Luanda.** New: `arrivingShipments`; `intake → consignee` (the label); `transferOrders`; `authorizedBy → codename`; a lead that is a transfer order; three-record form; Cite buttons that say only "Cite" until a lead is open; braces piling up when I typed my own `}`. Controls: Open a lead (set by my first Cite); the For shipment and Authorized by dropdowns (I picked them myself); a label Cite went into LUA-012's draft because that draft was open. Still can't explain "Cite arriving shipments".
Claims from memory: label = Parallax Freight, and LUA-012 goes to Parallax Freight; LUA-012 signed by NIGHTJAR. Actually cited: intake INT-LUA-0417 → Parallax Freight; LIS-0417's transfer orders LUA-011 and LUA-012 (complete list); LUA-012 → Parallax Freight; LUA-012 authorized by NIGHTJAR. **Difference:** I didn't remember the "complete list of orders" fact or the intake record's ID being part of it.

**Chronometer.** New: the clock; Transmit costing 1 hour; blank editor; `inspection { finding }`; one-line blocks; "Let the deadline pass…"; the "Choose Senegal" offer. Controls: all explained except "Let the deadline pass…", which I only guessed means giving up.
Claims from memory: (1) GEN-0211's manifest says marine chronometer, brass, gimballed, plus the inspector's brass timekeeper; (2) Dakar → Senegal → West African CFA franc. Actually cited: manifest; inspection finding (2 facts); destination → country → currency name (4 facts). **Difference:** the draft listed only the manifest under claim 1, not the finding I'd assumed counted.

### 4. Syntax ledger

| Syntax                                                                                                   | First used                   | Where I learned it                                                                                         |
| -------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `query` keyword and outer braces                                                                         | Drill 1                      | Orientation figure "A query"; the drill's prefilled editor. The Azulejos debrief later said it's optional. |
| Braces for "what I want"                                                                                 | Drill 1                      | Orientation: "The braces after it hold the pieces of information you want"                                 |
| Argument in parentheses, `name: "…"`                                                                     | Drill 1 (prefilled), retyped | Orientation: "The part in parentheses says which record"                                                   |
| Double quotes around text                                                                                | Drill 1                      | Orientation example; Docs: "text, which you write in double quotes"                                        |
| Field names `name`, `capital`                                                                            | Drill 1                      | Drill 1 text                                                                                               |
| One field per line, no commas                                                                            | Drill 1                      | Drill 1: "Put each field on its own line, with no comma between fields"                                    |
| Nested braces for a record-valued field                                                                  | Drill 2                      | Drill 2: "write braces after `country`"                                                                    |
| List fields, `[ ]` in the response                                                                       | Drill 3                      | Drill 3 text and its pass message                                                                          |
| Multi-level nesting                                                                                      | Drills 4–5                   | Drill 4–5 text: "one pair of braces for each link"                                                         |
| `String`, `ID`, `!`, `[X!]!`, `null` (reading only)                                                      | Drill 6                      | Documentation drawer intro paragraphs                                                                      |
| `currency`                                                                                               | Drill 6                      | Docs, Country entry                                                                                        |
| `#` notes                                                                                                | Azulejos 1                   | The prefilled editor comment itself                                                                        |
| `departingShipments`, `id`                                                                               | Azulejos 1                   | Prefilled editor (not looked up)                                                                           |
| `manifest`                                                                                               | Azulejos 1                   | Briefing, then Docs, Shipment entry                                                                        |
| `destination`                                                                                            | Azulejos 2                   | Prefilled comment, then Docs, Shipment                                                                     |
| `arrivingShipments`, `intake`, `consignee`, Company `name`, `transferOrders`, `authorizedBy`, `codename` | Luanda                       | Docs: City, Shipment, IntakeRecord, Company, TransferOrder, Operative                                      |
| `inspection { finding }`                                                                                 | Chronometer                  | Docs: Shipment ("can tell shipments apart") and Inspection                                                 |
| Writing a block on one line, `x { y }`                                                                   | Chronometer                  | Orientation figure and the debrief's one-line listings                                                     |

**Leaks:**

- No GraphQL syntax was used before the game showed it.
- One borderline case: I expected that typing `}` on the same line would step over the editor's own closer. That is general code-editor knowledge, and the game never says it.
- Choosing `authorizedBy` over `authorizationLog` came from the docs wording, not from prior knowledge.

### 5. Points of confusion

1. **Closing braces from the editor pile up**
   - **Where:** Training drill 1 and Azulejos Luanda; the terminal editor.
   - **What happened:** I expected typing `}` on a new line to close the open block. Instead it added a brace on top of the one the editor had already put in. In the drill that left 2 extras; in Luanda, 3, with a crooked staircase of braces.
   - **What I did:** In drill 1, my clean-up deleted part of `capital`, so I retyped the query leaving the closers out. In Luanda I counted the openers, deleted extras, deleted one too many and typed one back. From then on I wrote small blocks on one line.
   - **What would have helped:** Make `}` step over a matching closer on the next line too, not only on the same line. Or say in drill 1: "The editor closes braces for you. Don't type `}`; press ↓ to leave a block." A brace-mismatch marker before sending would also help.

2. **Cite and draft explained before they're on screen**
   - **Where:** Azulejos briefing, second paragraph.
   - **What happened:** "When the button shows a shipment's ID, Cite opens that shipment's draft…" Which button? I reread it.
   - **What I did:** It made sense once I pressed Cite.
   - **What would have helped:** Move that paragraph into the Findings panel the first time results appear, or show an annotated picture of the button.

3. **Top-level "Cite departing shipments" / "Cite arriving shipments"**
   - **Where:** Results › Findings, list header row.
   - **What happened:** I couldn't tell what citing a whole list proves, or when I'd want to.
   - **What I did:** I never used it.
   - **What would have helped:** A tooltip such as "Cites that the list is complete (e.g. 'no other orders')", since the drafts did show "(complete list)" facts.

4. **"Choose Angola", "Choose NIGHTJAR" and "Choose Senegal" buttons**
   - **Where:** Travel and Deduction drafts.
   - **What happened:** I expected to record the answer myself. The form named the answer for me.
   - **What I did:** I picked from the dropdown anyway.
   - **What would have helped:** Say "Your citations point to one country; choose it above" without naming it, at least in the assessment case.

5. **Inspection finding not counted toward claim 1**
   - **Where:** Chronometer draft.
   - **What happened:** I cited the inspection finding (shown as 2 facts) but only the manifest appeared under "matches the observatory's description".
   - **What I did:** Submitted anyway; it passed.
   - **What would have helped:** Mark citations that support no claim ("not needed for any claim").

6. **Which signature counts: `authorizedBy` or `authorizationLog`**
   - **Where:** Luanda; the docs and the results line "Not yet opened on this transfer order: authorizationLog".
   - **What happened:** The docs give two sources for who signed. The results kept nudging me toward the one I hadn't opened.
   - **What I did:** Trusted the form saying Supported.
   - **What would have helped:** One line in the briefing on which source the claim uses, or no nudge when the field isn't needed.

7. **Dense documentation intro**
   - **Where:** Documentation › intro paragraph about `!` and `null`.
   - **What happened:** A lot of jargon at once; I reread it twice.
   - **What I did:** Moved on. "You never type a `!`" was the useful part.
   - **What would have helped:** Put that line first, and collapse the rest under "How to read the types".

8. **Docs "below" were hidden**
   - **Where:** Drill 6.
   - **What happened:** The drill says "the documentation below", but it was a collapsed drawer with a small triangle.
   - **What I did:** Took a screenshot to find it.
   - **What would have helped:** Open it automatically in drill 6.

9. **Vim keybindings switch**
   - **Where:** Terminal header, every stage.
   - **What happened:** Jargon to this person. I didn't know whether I should turn it on.
   - **What I did:** Ignored it.
   - **What would have helped:** Move it to Settings, or label it "Vim keybindings (for programmers; leave off)".

### 6. Round 1 questions

- **The Luanda label and the next step:**
  - After reading the label (LIS-0417 → Parallax Freight), this person wanted **to send another query**.
  - The results held no transfer orders or signatures, "Open a lead" said "No transfer order retrieved yet", and every Cite button said only "Cite".
  - So I added `transferOrders { id consignee { name } authorizedBy { codename } }` to the same query.
- **How I identified the signer:**
  - I matched the label's company to the order with the same consignee: **LUA-012** (Parallax Freight). LUA-011 goes to Lantern Export.
  - Then I read that order's "authorized by" row: **NIGHTJAR**.
  - I never opened the registry's `authorizationLog`.
- **The clock:**
  - It **changed how I wrote the query**. Because every query costs an hour whatever it asks for, I read the docs first (free) and asked for manifest, inspection, destination, country and currency in one request.
  - In Azulejos, with no clock, I had split the label and the transfer orders into two queries.
  - It felt like a reason to plan, not pressure.
  - **Hours left at the end: 17 of 18.**

### 7. At the end

- **Moments that stood out:**
  - Seeing one deep Cite turn into "3 facts", which finally explained the Findings paragraph.
  - The Cameroon trap ("Central African", not West African, CFA franc) felt fair and satisfying.
  - Fixing the brace staircase in Luanda was the low point.
  - Solving the Chronometer in one transmission felt like real progress.
- **Would this person play another case?** Yes. The drills built up one step at a time, the docs answered every "what's it called?" question, and the clock felt like a planning puzzle rather than stress. Their worry going in is the editor's braces, not the queries.

### 8. Caveats

- **Prior knowledge may still have helped:**
  - **Brace fixing:** knowing GraphQL ignores whitespace, so blocks can go on one line. The game shows one-line examples, but I may have used that faster than a newcomer would.
  - **Query structure:** a sense that sibling fields can each have their own braces.
  - **Reading data:** reading nested results quickly.
- **Keyboard and editor know-how** (Ctrl+End or Meta+Arrow to jump to the end, recovering from a selection) is a tester skill. A real persona might have retyped everything or got stuck longer.
- **Persona judgements:**
  - Whether this person would open the Orientation, notice the brace imbalance, or ignore `authorizationLog` are my calls, not observations.
  - The interview answers are a simulation of their words.
- **Scope:**
  - Round 2 was not played, as instructed.
  - I didn't use the Tradecraft manual, Hints, Evidence, Dossiers, Map or Glossary tabs, so they are untested here.

---

## Earlier run preserved from Git

## Round 1 playtest · Operations analyst

### Preflight

The header said **Clearance 1** and the assignments desk said **0 of 10 cases resolved**. The Guest Register was marked **Locked: needs clearance 2**. I treated the clearance 2 line in the preflight instructions as conditional on round 2. I opened the optional Orientation because I wanted to know what the terminal would do before I used it.

### Per-stage table

The transmission counts below are new sends at each stage. All were accepted by the archive. I took no hints and used no in-case solution reveal. The two completed-case debriefs displayed reference queries automatically.

| Stage                                                 | Transmissions sent | New things, in my words                                                                                          | Controls I could not explain | Hints and solution viewed | Stamp and hours left               | Notes                                                                                  |
| ----------------------------------------------------- | -----------------: | ---------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------- |
| Orientation                                           |                  0 | A query is a request, and the archive returns the shape I asked for.                                             | None used                    | None                      | —                                  | I opened it voluntarily, then chose Start training.                                    |
| Drill 1 · Ask for a field                             |                  1 | Add the field next to the first one. Keep the braces and leave out the comma.                                    | Vim keybindings, unused      | None                      | Passed                             | Portugal came back with its capital, Lisbon.                                           |
| Drill 2 · Open a record                               |                  1 | A field can hold another record. Braces give me space to ask for that record's fields.                           | None used unexplained        | None                      | Passed                             | The two `name` fields came back under different records.                               |
| Drill 3 · Read a list                                 |                  1 | I ask for each field once. The archive returns that field for every record in the list.                          | None used unexplained        | None                      | Passed                             | I paused over curly braces in the request and square brackets in the response.         |
| Drill 4 · Follow two links                            |                  1 | A record inside a record can have its own link.                                                                  | None used unexplained        | None                      | Passed                             | I reached the capitals of Czechia's neighbors starting with Prague.                    |
| Drill 5 · Follow a chain of three links               |                  1 | I can ask for another `borders` list inside Spain's record.                                                      | None used unexplained        | None                      | Passed                             | I reread “under `name`” before deciding where to place the second `borders`.           |
| Drill 6 · Consult the documentation                   |                  1 | The Documentation tells me the exact field spelling, what comes back, and whether the field needs braces.        | None used unexplained        | None                      | Passed · Induction complete        | I had to parse the punctuation instructions. The response said Angolan kwanza.         |
| Azulejos · Exclude the slate crate                    |                  1 | A lead is the shipment my claim is about. Cite can open its draft and attach the row in one click.               | None used unexplained        | None                      | Deduction accepted                 | LIS-0486: the manifest said blue slate squares.                                        |
| Azulejos · Exclude the shipment without a land border |                  1 | One citation of a fact far inside the result can bring the linked facts above it. An empty complete list counts. | None used unexplained        | None                      | Deduction accepted                 | LIS-0522 went to Praia, Cabo Verde. Its complete borders list was empty.               |
| Azulejos · Travel order                               |                  0 | I can use facts from an earlier response. I still have to choose a country after citing the evidence.            | None used unexplained        | None                      | Travel order approved              | LIS-0417's manifest and borders matched. I chose Angola and traveled.                  |
| Azulejos · Luanda                                     |                  1 | A lead can be a transfer order. A citation without its own order goes into the open draft.                       | None used unexplained        | None                      | **HOLD ISSUED**                    | Two Parallax Freight entries connected LIS-0417 to LUA-012, whose signer was NIGHTJAR. |
| The Borrowed Chronometer                              |                  1 | One send costs an hour even if I ask for several things. Side by side aligns fields across shipments.            | None used unexplained        | None                      | **RECOVERED**, 17 of 18 hours left | Started from a blank editor. GEN-0211 and Senegal met both clues. Clearance 2 earned.  |

### Stage interviews

1. **Ask for a field.** “The word `query` and the outside braces hold the whole request. The parentheses pick Portugal. The inside braces hold the fields. Transmit sends my edit, Response shows the JSON, and Next drill keeps going. I don't know what Vim is.”
2. **Open a record.** “The first `name` labels Lisbon. The `name` inside `country` labels Portugal. I used the same editor, send button and response, and Next drill continued.”
3. **Read a list.** “I ask for `name` once inside `borders` braces and get one name per country. The square brackets in the answer look like lists in my JSON files. Transmit still sends the request and Next drill advances.”
4. **Follow two links.** “A link here is a field with another record in it. I can ask Prague for its country and the country for its neighbors all in one request. I used the editor, Transmit, Response and Next drill.”
5. **Follow a chain of three links.** “Each pair of braces owns its own fields. I can ask for borders again while I'm inside the first border record. I edited the starting query, sent it, checked the response, and moved on.”
6. **Consult the documentation.** “Query is where the request starts. After I open a country, Country is where I find its field spelling and see whether to add braces. The little headings expand the lists. I read the exclamation mark explanation twice. Transmit gave me the currency name.”
7. **After the drills.** “I can ask for a single value, open a record, get a list, follow several links and look up a field I haven't seen. Transmit sends to Response and the pass message takes me to the next drill or case. Everything was free. I still don't know what Vim means, and I haven't cited anything yet.”
8. **Lisbon, slate deduction.** “The lead is the shipment I'm making a claim about. Cite took the row and opened that draft, and Supported said the evidence matched. Submit turned it in. From memory, LIS-0486 was ruled out because its manifest was blue slate squares, 14 cm. The draft listed just that manifest. I didn't need to use the lead menu separately.”
9. **Lisbon, border deduction.** “LIS-0522 goes to Praia in Cabo Verde, which has no land borders. I cited the deepest borders row and the draft included the shipment's destination, the city's country and the complete empty border list. I thought the ceramic manifest could count too, but the claim only needed the route. Submit sent that draft.”
10. **Lisbon, travel order.** “LIS-0417's manifest was blue ceramic squares, 14 cm. It was headed to Luanda in Angola, and Angola's borders include Namibia. I cited the manifest and the borders row from a response I already had. The draft listed both sets of facts. I had to Choose Angola as my answer after citing it. Travel sent the form and took me there.”
11. **Luanda, transfer deduction.** “LIS-0417's depot label says Parallax Freight. LUA-012 also says Parallax Freight, and its authorized-by row says NIGHTJAR. I cited those three rows. The draft also listed the intake ID and the full two-order list connecting LUA-012 to LIS-0417. I didn't remember those as separate facts. I opened LUA-012's draft by citing its consignee first, so the intake citation went to that draft. The Choose buttons attached the shipment and signer as my answers. Submit handed it in.”
12. **The Borrowed Chronometer.** “GEN-0211's manifest said marine chronometer, brass, gimballed. It goes to Dakar, Senegal, where they use the West African CFA franc. I cited the manifest and currency, and the draft listed the same facts with the full route. Side by side made the comparison easier. Choose Senegal gave my answer and Submit sent it. I had 17 hours left.”

### Syntax ledger

| First use         | Syntax or fields                                                                                                                               | Visible source                                                                                                                                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Drill 1           | `query { … }`, inner braces, parentheses, colon and double quotes in `country(name: "Portugal")`, `name`, `capital`, whitespace between fields | Orientation's Terminal example showed `country(name: "Chile")` and explained the parentheses and braces. Drill 1 described the outer wrapper and told me to add `capital`, with a space or line break and no comma. The starter contained the remaining exact text. |
| Drill 2           | `city(name: "Lisbon")` and nested `country { name }`                                                                                           | Starter showed the city lookup. “Open a record” said that `country` holds another record and to write braces after it with the requested field inside.                                                                                                              |
| Drill 3           | `borders { name }` on a list                                                                                                                   | “Read a list” explained `borders` and said to open the list with braces. The pass message identified square brackets in the response.                                                                                                                               |
| Drills 4 and 5    | More than one nested level, repeating `borders` inside `borders`                                                                               | Drill 4 starts at Prague and asks for each neighboring country's capital. Drill 5 identifies Spain inside Portugal's border list and directs me to put another `borders` beneath Spain's `name`.                                                                    |
| Drill 6           | `currency { name }` and Documentation notation `String`, `ID`, `[Country!]!`, and `!`                                                          | The Country entry says `currency: Currency` needs braces. Currency's `name` entry says it takes no braces. The Documentation introduction explains quoted identifiers, brackets for list types, and how to read `!`. I never typed `!` in a request.                |
| Azulejos, slate   | `departingShipments`, `id`, `manifest`, and starter comment marker `#`                                                                         | Starter supplied the first two fields. Its comment explained that the archive ignores lines beginning with `#`. The briefing named `manifest`, and Shipment Documentation confirmed that it takes no braces. I removed the starter comments.                        |
| Azulejos, borders | `destination { name country { name borders { name } } }`                                                                                       | Shipment Documentation said `destination` returns a City. The city-to-country shape came from drill 2, and the country-to-borders shape from drills 3–5.                                                                                                            |
| Azulejos, Luanda  | `arrivingShipments`, `intake`, `intake { id consignee { name } }`, `transferOrders { id consignee { name } authorizedBy { codename } }`        | City and Shipment in Documentation give the shipment links. IntakeRecord, TransferOrder, Company, and Operative identify the field names and whether they need braces. Luanda starter supplies the city lookup.                                                     |
| Chronometer       | No new syntax. Rebuilt the full query without a starter.                                                                                       | “All four shipments left Genoa” in Clues provided the new city. I reused the Lisbon departure and destination structure and the Luanda drill's currency selection.                                                                                                  |

No known unsupported syntax use. The Azulejos debrief said that `query` is optional. I had used it every time up to then and kept using it for the assessment. I never used aliases, fragments or variables.

### Points of confusion

1. **Where:** Training drill 5, instructions above the Terminal.  
   **What happened:** “Inside those braces, under `name`” made me stop and check whether under meant one level deeper or just the next line.  
   **What I did:** I placed the second `borders` beside Spain's `name`, since the list belongs to Spain and `name` holds a word.  
   **What would have helped:** An example with Spain's `name` and the second `borders` aligned, or “on the next line, at the same indent as `name`.”
2. **Where:** Training drill 6, the Documentation introduction.  
   **What happened:** I expected to copy the notation in the entry. The colon, brackets and exclamation marks made me reread the instructions to see which parts belong in a query.  
   **What I did:** I followed the prose and used only the field names, adding braces for links.  
   **What would have helped:** Put one Documentation entry next to the request that it produces, so I can compare the two before looking through all the entries.
3. **Where:** Azulejos, second Lisbon deduction, Objective.  
   **What happened:** I initially read “cannot reach Namibia by road” as any possible route, including a route through another country.  
   **What I did:** I reread the dispatch, which says the truck crosses directly from the country receiving the crate, and requested that country's border list.  
   **What would have helped:** Put the direct-crossing condition in the objective, for example “Identify the ceramic shipment going to a country that does not border Namibia.”
4. **Where:** Azulejos, travel order, claim and country selector.  
   **What happened:** I thought the nested citation was enough because it already showed Angola and Namibia. The draft still needed a separate country selection.  
   **What I did:** I followed the line below the claim and clicked Choose Angola.  
   **What would have helped:** Put “Choose your answer” next to the required selector and show “Evidence complete” separately when the citation is already sufficient.
5. **Where:** Azulejos, Luanda, Documentation and Cite.  
   **What happened:** The depot intake record and the dockside receipt both describe the label. In Findings, the intake Cite initially showed no order name, unlike the transfer-order Cite buttons.  
   **What I did:** “The depot logged” pointed me to intake. I cited the order first and checked that the intake button then said it would go into the LUA-012 draft.  
   **What would have helped:** Repeat “depot intake record” in the clue, and give unattributed Cite buttons a short message about choosing an order draft first.
6. **Where:** The Borrowed Chronometer, blank Terminal.  
   **What happened:** The clock and blank editor made me stop to work out whether I needed two sends and how to build the outside of the request myself.  
   **What I did:** I rebuilt the Lisbon query from memory and substituted the currency path from training. The brief's price per send gave me a reason to put both clues into one query.  
   **What would have helped:** A short reminder next to the blank editor that Documentation's Query entry has a starting example. I found the corresponding information previously in training.

### The round's own questions

- **Luanda label and signer.** “Once I saw Parallax Freight on LIS-0417's replacement label, I wanted to look in the response I already had. I had asked for both orders and signatures in the same send. The same shipment's LUA-012 named Parallax Freight and signed as NIGHTJAR. LUA-011 named Lantern Export and COPPER_KITE. I didn't need a second transmission.”
- **Clock.** “The price changed how I wrote the request. I planned to get the manifest and the currency together before spending an hour, rather than send a manifest-only request first. I'd already combined fields on the first case, so I remembered how to do it. Knowing the clock used story hours meant I could reread without losing time. I spent one hour and ended with 17.”

### At the end

Citing a nested row and seeing the full route appear in the draft stood out. Side by side also made it easy to see why either clue alone could lead me to a different crate. I'd play another case. I could start from a blank editor and get both facts back, and the debrief confirmed I had understood the request.

### Caveats

- This is a simulated novice. I identified no actual syntax leak, but prior GraphQL familiarity may have made it easier to match closing braces, translate the Documentation entries, and combine two branches in one send. The drills and briefings supplied the syntax I used. I copied the shape of prior requests and could still explain what each branch asked for.
- The assignments desk teaser for The Guest Register named NIGHTJAR before the first case started. I identified the signer in the actual results by matching the replacement label to the order, but this run cannot test unspoiled surprise at the codename.
- The bridge required keyboard focus and screenshots for visible disclosures and the Next case link. That procedure added time to this run. It does not measure mouse discoverability or typing difficulty for a human player.
- I had no unread returns, hints, solution reveals, failed submissions, or timeouts. The run cannot show whether those recovery paths would help.
