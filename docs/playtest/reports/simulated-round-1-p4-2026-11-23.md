# Simulated playtest · Round 1 · P4 · 2026-11-23

# DossierQL playtest, round 1 report

The whole round 1 path is done. I played as a skimmer who knows JSON but has never seen GraphQL. I took no hints and viewed no solutions. Both cases are resolved: the debrief stamps were **HOLD ISSUED** for _The Vanishing Azulejos_ and **RECOVERED** for _The Borrowed Chronometer_, which finished with 17 of 18 hours left. The header now shows clearance 2.

## 1. Preflight

- The header showed **Clearance 1**, and the desk said "You hold clearance 1. **0 of 10 cases resolved.**" The round 1 check passed.
- _The Guest Register_ showed "Locked: needs clearance 2" at the time. That is the round 2 condition, so it doesn't apply here.
- **Orientation was not opened.** It is a small nav link, and the desk's big call to action is "Start training". A skimmer goes straight there.

## 2. Per-stage table

| Stage                        | Transmissions sent                 | New things (person's words)                                                                                                                                                                                                | Controls I couldn't explain                                                          | Hints / solution | Stamp / hours               | Notes                                                                                                                                                        |
| ---------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Training drills 1–6          | 9 (2 returned unread, 1 "Not yet") | "query and braces wrap it; the parentheses pick the country; one field per line; records need their own braces; lists come back in [ ]; borders inside borders; the docs list the fields; the editor closes braces for me" | Vim keybindings switch; the completion popup ("capitalString")                       | None             | Passed (no stamp)           | Drill 1 was returned because the editor's auto-close doubled my braces. In drill 3 I copied `borders { capital }` before reading that the task wanted names. |
| Azulejos 1: Lisbon manifests | 1                                  | "manifest field; Findings rows with Cite; Deduction form; Supported"                                                                                                                                                       | "Cite departing shipments" on the parent row; the Side by side and Raw tabs (unused) | None             | "Deduction accepted"        | `manifest` came straight from the briefing.                                                                                                                  |
| Azulejos 2: Namibia border   | 2 (1 returned)                     | "destination is a record too; one deep Cite counts as 3 facts; the Not-yet-opened lists"                                                                                                                                   | None                                                                                 | None             | "Deduction accepted"        | Returned for `destination` with no braces. The clerk's note fixed it.                                                                                        |
| Azulejos 3: travel order     | 0                                  | "Travel order; two claims; a country dropdown; a Choose Angola button"                                                                                                                                                     | Why I pick a country when the button already tells me                                | None             | "Travel order approved"     | The form hands over the answer.                                                                                                                              |
| Azulejos 4: Luanda           | 6 (3 returned)                     | "intake → consignee is the label; transferOrders; authorizedBy → codename; two branches in one query; inline `{ name }`; extra For shipment / Authorized by choices"                                                       | Evidence, Dossiers, Map and Glossary tabs (never opened)                             | None             | **HOLD ISSUED** (case)      | Returned: `label` (no such field), extra braces, `name` on Operative. The debrief counts 4 sends for the case and leaves out returned requests.              |
| Borrowed Chronometer         | 1                                  | "The clock: 1 hour per send; blank editor; clearance 2"                                                                                                                                                                    | "Let the deadline pass…"                                                             | None             | **RECOVERED**, 17/18 h left | One combined query. Caught the Central vs West African CFA franc decoy.                                                                                      |

## 3. Stage interviews (recorded at each boundary, unrevised)

**After the drills.**

- **New:**
  - the `query { }` wrapper
  - `country(name: "Portugal")`
  - one field per line, no commas
  - records need their own braces
  - lists come back in square brackets
  - chaining `borders`
  - the docs panel
  - the editor auto-closes braces
  - the Transmit button and Ctrl+Enter
  - "returned unread" versus "Not yet"
- **Controls:** Transmit sends the query. Docs shows the fields. Next drill moves on. I couldn't explain the Vim switch or the completion popup.
- **Returned requests:** 2, and the clerk's notes got me past both.

**Azulejos 1.**

- **New:** `departingShipments`, `manifest`, Findings and Cite, the Deduction form, Supported, and the lead dropdown, which Cite filled in for me.
- **Unexplained:** the parent-row "Cite departing shipments" and the Side by side / Raw tabs.
- **From memory:** LIS-0486's manifest says slate, so it isn't ceramic.
- **Actually cited:** the LIS-0486 manifest, "Blue slate squares (14 cm)". Memory matched.

**Azulejos 2.**

- **New:** destination needs braces, the nested chain inside a list, and one Cite counting as 3 facts.
- **From memory:** LIS-0522 goes to Praia in Cabo Verde, which has no borders.
- **Actually cited:** destination Praia, country Cabo Verde, borders none (complete list), all 3 facts from one citation. Memory matched.

**Azulejos 3.**

- **New:** the Travel order, two claims on one form, the country dropdown, and the "Choose Angola" button.
- **Unexplained:** why I choose the country when the game already names it.
- **From memory:** the ceramic manifest, plus Luanda → Angola, which borders Namibia.
- **Actually cited:** exactly that. Memory matched.

**Azulejos 4 (Luanda).**

- **New:**
  - `arrivingShipments`
  - the "label" is `intake { consignee }`
  - `transferOrders`
  - `authorizedBy` with `codename`, not `name`
  - two sibling branches in one query
  - inline braces to avoid auto-close trouble
  - the "For shipment" and "Authorized by" choices
  - the "needs one more fact that connects" message
  - the debrief comparing my queries with the reference
- **From memory:** the label says Parallax Freight, LUA-012 says Parallax Freight, and NIGHTJAR signed it.
- **Actually cited:**
  - LUA-012 consignee → name (3 facts)
  - LUA-012 authorized by → codename (3 facts)
  - LIS-0417 intake → consignee → name
- **Difference:** I didn't remember that my citations also pulled in the "transfer orders: LUA-011, LUA-012" list fact.

**Chronometer.**

- **New:** the clock, the blank editor, and passing the assessment, which raised my clearance.
- **Unexplained:** "Let the deadline pass…" and "Restart…". I guessed what they do but didn't use them.
- **From memory:** GEN-0211 is the chronometer going to Dakar, Senegal, which uses the West African CFA franc. GEN-0236 is a decoy going to Cameroon, which uses the Central African franc.
- **Actually cited:** the manifest, plus destination → country → currency → name (4 facts). Memory matched.

## 4. Syntax ledger

| Syntax                                             | Where I learned it                                                                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `query { … }`                                      | Prefilled in drill 1. Explained in the Docs intro ("Write `query` and a pair of braces").                                       |
| Field names inside braces, one per line, no commas | Drill 1 text                                                                                                                    |
| `(name: "Portugal")` argument with quotes          | Drill 1 text: "the part in parentheses says which country you want". I only ever copied it; I never wrote a new argument shape. |
| Nested braces for a record field                   | Drill 2 text: "write braces after `country`"                                                                                    |
| List field `borders { … }`                         | Drill 3 text                                                                                                                    |
| Multi-level nesting                                | Drills 4 and 5                                                                                                                  |
| `#` comments                                       | Comment text in the Azulejos editor                                                                                             |
| `manifest`                                         | Azulejos briefing                                                                                                               |
| `departingShipments` / `arrivingShipments`         | Prefilled query, and the "Not yet opened on this city" list                                                                     |
| `destination`, `intake`, `transferOrders`          | "Not yet opened on this shipment" list                                                                                          |
| `currency { name }`                                | Guessed `currency` (plain English), then the clerk's note and the Docs Currency entry                                           |
| `consignee`, `authorizedBy`, `codename`            | Docs entries for IntakeRecord, TransferOrder and Operative, after the clerk returned `label` and `name`                         |
| Inline `{ name }` on one line                      | Docs example `query { city(name: "Lisbon") { name } }`                                                                          |
| Two sibling nested branches in one query           | Extended from drill 1 (two fields) and drill 4 (`name` + `borders`)                                                             |
| Combining everything into one request              | The Azulejos debrief: "all in one request"                                                                                      |
| `!`                                                | Read in the Docs ("You never type a `!`"). Never typed.                                                                         |
| Aliases, fragments, `$` variables                  | Not used this round                                                                                                             |

**Leaks:** I found no clear leak of GraphQL syntax. Two borderline cases:

- The arrow-key trick to step past auto-closed braces is a general editor habit. It also failed because of the tool.
- I went to `authorizedBy` and never considered `authorizationLog`. That may have been my prior sense of what a "signature" field looks like.

## 5. Points of confusion

1. **The editor doubled my closing braces**
   - **Where:** drill 1, the terminal (and again in Azulejos 4, Luanda).
   - **What happened:** I typed `}` on a new line and expected it to close the block. The editor had already put one in, so I got extra braces and "Syntax Error: Unexpected '}'".
   - **What I did:** the clerk's note ("count the braces") got me past it. After that I stopped typing closers, or kept small blocks on one line.
   - **What would have helped:** when `}` is typed on a line that holds only whitespace, step over the auto-inserted `}` instead of adding another. Or add a line to drill 1: "The editor closes braces for you."
2. **"capitalString" completion**
   - **Where:** drill 3, the completion popup.
   - **What happened:** the label reads as one word, and I didn't know what it was offering.
   - **What I did:** ignored it.
   - **What would have helped:** a space between the field name and its type, e.g. "capital — String".
3. **"Label" is not a field**
   - **Where:** Azulejos 4 (Luanda), the briefing and clues.
   - **What happened:** the briefing says "replacement label", so I asked for `intake { label }`, and the request came back returned.
   - **What I did:** the clerk's note sent me to the Docs, where IntakeRecord has `consignee` ("the consignee on the label").
   - **What would have helped:** a clue in field terms, e.g. "the intake record's `consignee` is the label".
4. **Operative has no `name`**
   - **Where:** Azulejos 4, `authorizedBy`.
   - **What happened:** every record so far had `name`, so I guessed it here too, and the request came back returned.
   - **What I did:** read the Operative docs and found `codename`.
   - **What would have helped:** nothing essential, since the clerk's note works. "codename" could appear in the stage briefing.
5. **"Needs at least one more fact that connects"**
   - **Where:** Azulejos 4, Deduction claim 1.
   - **What happened:** I had cited the order's consignee. The message didn't say which fact was missing, and I stalled and reread it.
   - **What I did:** guessed that it meant the crate's intake label, and that was right.
   - **What would have helped:** name the missing link, e.g. "Also cite the consignee on the crate's intake record."
6. **"Choose X" buttons give away the answer**
   - **Where:** Azulejos 3, Luanda and the Chronometer, in the form dropdowns.
   - **What happened:** I expected to make the decision myself. The form named Angola, NIGHTJAR and Senegal for me.
   - **What I did:** clicked the button.
   - **What would have helped:** make the player pick from the dropdown, and have the form only flag a mismatch.
7. **Lead-less "Cite" buttons**
   - **Where:** Luanda, before transfer orders were retrieved.
   - **What happened:** the buttons said just "Cite", with no target.
   - **What I did:** treated it as a sign that I needed another query.
   - **What would have helped:** show a short note, e.g. "No transfer order in these results yet."
8. **Unexplained tabs**
   - **Where:** case tools (Evidence, Dossiers, Map, Glossary, Hints).
   - **What happened:** I never opened them and can't say what they're for.
   - **What would have helped:** a one-line tooltip on each tab.
9. **Briefing paragraph about Cite and leads**
   - **Where:** Azulejos 1, briefing.
   - **What happened:** I skimmed it. It didn't matter, because Cite opens the lead by itself.
   - **What would have helped:** it could be shorter.

## 6. The round's own questions

- **The Luanda label and the signer.**
  - After reading the replacement label (Parallax Freight on LIS-0417), the person wanted to **send another query**. The results in hand held only intake labels, with no orders or signers. The bare "Cite" buttons also suggested something was missing.
  - **How I identified the signer:** I matched the label's consignee against the crate's two transfer orders. LUA-012 (Parallax Freight) matched; LUA-011 went to Lantern Export, signed by COPPER_KITE. LUA-012's `authorizedBy { codename }` was **NIGHTJAR**. I never checked `authorizationLog`.
- **The clock.** The clock changed how I wrote the query; it wasn't only pressure. I wrote one combined query up front: manifest + destination → country → currency. The idea came from the Azulejos debrief. The clock also made me read the result carefully before spending another hour, which is how I caught the Central African franc decoy. **17 of 18 hours left.**

## 7. At the end

- **Moments that stood out:**
  - The brace doubling. It caused 2 of my 5 returned requests.
  - The Luanda "needs one more fact" stall.
  - The Chronometer working in a single transmission.
  - The debrief putting my queries next to the reference, which is what taught me to combine requests.
- **Pattern matching:** I started copying shapes in the Chronometer. Its query was the Azulejos route with the names swapped. I still understood each brace, but I didn't work the query out from scratch.
- **Would this person play another case?** Yes. The clerk's notes kept failures cheap, and solving the Chronometer in one shot felt clever. Clicking "Choose X" made the endings feel a bit hollow, though.

## 8. Caveats

- **No clear syntax leaks**, but see the two borderline items in the ledger: the arrow-key habit and going straight to `authorizedBy`.
- My own GraphQL knowledge probably helped without my noticing:
  - I read nested results quickly.
  - I trusted from the start that sibling fields can sit side by side.
  - I wasn't worried that combining requests might break anything.

  A real novice might stall longer on the Luanda two-branch query.

- **Tool artifacts, not game problems:**
  - A later edit call reset the cursor and garbled my arrow-key attempt.
  - Docs disclosures only opened with their full summary text.

  Neither involved a transmission.

- Typing was automated, so this run can't show real typing speed, typos, or how long the person would actually spend reading.
- This run covers round 1 only, so it can't say anything about whether lessons carry over (round 2).

---

## Rerun on the revised build

I played all of round 1: the training range, _The Vanishing Azulejos_ and _The Borrowed Chronometer_. Both cases resolved with no hints and no solutions viewed. Chronometer took one transmission and finished with 17 of 18 hours left. I stopped there and did not play any of round 2. The header now shows clearance 2.

### 1. Preflight

- **Clearance 1 line:** passes. The header showed "Clearance 1" and the desk said "0 of 10 cases resolved."
- **Clearance 2 line:** fails. The header showed clearance 1, not 2. _The Guest Register_ showed "Locked: needs clearance 2", which does not say completed or in progress.
- The two lines can't both be true at once. The clearance-2 line only makes sense as the starting state for round 2, so I treated it as that and played round 1. If you meant it as a hard stop, this run broke that rule.

### 2. Per-stage table

| Stage                        | Transmissions sent                 | New things (person's words)                                                                                                                                                                                                                                                                    | Controls I couldn't explain                                             | Hints / solution         | Stamp, hours left                                | Notes                                                                                                                                                                                                                    |
| ---------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Orientation                  | –                                  | –                                                                                                                                                                                                                                                                                              | –                                                                       | –                        | –                                                | **Not opened.** The big "Start training" button won.                                                                                                                                                                     |
| Training range, drills 1–6   | 9 (2 returned unread, 2 "Not yet") | Pre-written `query { … }`; the bit in parentheses picks which one; braces hold the fields, one per line; some fields are records and need their own braces; lists come back in square brackets; you can nest as deep as you want; the Documentation dropdown; the editor closes braces for you | Vim keybindings switch; the completion popup's "String!" text           | None (drills offer none) | – (untimed)                                      | Drill 1 was returned because the editor auto-closed braces on top of the ones I typed. In drill 3 I copied the sample `borders { capital }` instead of asking for names. In drill 6 I guessed `currency` without braces. |
| Azulejos 1: Lisbon manifests | 1                                  | `departingShipments`, `manifest`, `#` comments; Results rows with Cite; the Deduction draft; "Supported"; Submit                                                                                                                                                                               | "Cite departing shipments" on the parent row (why cite the whole list?) | None                     | Dispatch "Deduction accepted" (no stamp)         | Cite opened the lead for me, so I never touched "Open a lead".                                                                                                                                                           |
| Azulejos 2: Namibia border   | 2 counted as 1 (1 returned unread) | `destination` is a city and needs braces; following the whole route in one query; "borders none"; one Cite counts 3 facts                                                                                                                                                                      | –                                                                       | None                     | "Deduction accepted"                             | Returned unread for `destination` without braces; the clerk's note got me past it.                                                                                                                                       |
| Azulejos 3: travel           | 0                                  | Travel order; a stage with no query; Receiving-country dropdown plus a "Choose Angola" shortcut                                                                                                                                                                                                | Why I have to pick the country when the game already knows it           | None                     | "Travel order approved"                          | I briefly wondered whether "receiving" meant Namibia.                                                                                                                                                                    |
| Azulejos 4: Luanda           | 2 counted (+1 returned unread)     | `arrivingShipments`, `intake`, `transferOrders`, `authorizedBy`, `codename`; citing from an older transmission with Earlier; "needs one more fact that connects"                                                                                                                               | Why "For shipment" has no shortcut button while "Authorized by" does    | None                     | Case stamp **HOLD ISSUED** (4 sent; reference 3) | Returned unread for `name` on Operative. The editor's autocomplete swallowed my Enter and inserted `__typename`, so I had to retype.                                                                                     |
| Borrowed Chronometer         | 1                                  | The clock; a blank editor; "Transmit (1 hour)"; lookalike decoys                                                                                                                                                                                                                               | "Let the deadline pass…" (I guessed it means give up)                   | None                     | **RECOVERED**, **17 of 18 hours**                | One query that combined everything; the reference did the same.                                                                                                                                                          |

### 3. Stage interviews (as recorded, in order)

**After the drills.**

- **New:** the pre-filled query; parentheses pick the record and the name goes in quotes; braces hold fields, one per line, no commas; record fields need their own braces; lists come back in square brackets; nesting; the Documentation dropdown; the editor auto-closes braces; a suggestion popup with "String!" in it.
- **Controls:**
  - Transmit sends the query.
  - Next drill moves on.
  - The Documentation dropdown lists the fields.
  - The "Not yet" box says what to change.
  - The clerk's note says why a request bounced.
  - I couldn't explain the Vim keybindings switch or the "!" in the popup.

**Azulejos 1.**

- **New:** `departingShipments`, `manifest`, `#` comments, Cite rows, the Findings/Side by side/Raw tabs, the Deduction draft, Supported, Submit.
- **Controls:** Cite adds a row to a shipment's draft and opened the lead for me. Open a lead (not needed). Submit. Remove. Earlier/Later, which I guessed. I couldn't explain why I would cite the whole list row.
- **Facts (from memory):** LIS-0486's manifest says slate. This matched the draft.

**Azulejos 2.**

- **New:** `destination` needs braces; the whole route in one query; "borders none"; a nested citation counts 3 facts; a returned request doesn't count as a transmission.
- **Facts (from memory):** LIS-0522 → Praia → Cabo Verde → no borders. This matched the draft's 3 facts.

**Azulejos 3.**

- **New:** the Travel order, a stage with no query, the country dropdown, "Choose Angola", two claims on one form.
- **Controls:** Travel is like Submit but moves you to a new place. I couldn't explain why the dropdown is needed when the game already knows the answer.
- **Facts (from memory):** the LIS-0417 manifest says ceramic, and LIS-0417 → Luanda → Angola, whose borders include Namibia. This matched the draft (1 + 3 facts).

**Azulejos 4 (Luanda).**

- **New:** the fields `arrivingShipments`, `intake`, `transferOrders`, `authorizedBy` and `codename`; citing from an older result; the extra For shipment and Authorized by dropdowns; the "one more fact" message; autocomplete inserting `__typename`.
- **Facts (from memory):** the intake label says Parallax Freight, LUA-012 says Parallax Freight, and LUA-012 was authorized by NIGHTJAR.
- **Difference:** the draft also listed "LIS-0417 · intake: INT-LUA-0417" and "transfer orders: LUA-011, LUA-012 (complete list)". I didn't remember those parent facts; they came in with the nested citations.

**Borrowed Chronometer.**

- **New:** the clock, the blank editor, transmissions costing an hour, decoys, the "Let the deadline pass…" button.
- **Facts (from memory):** the GEN-0211 manifest names the chronometer, and GEN-0211 → Dakar → Senegal → West African CFA franc. This matched the draft.

### 4. Syntax ledger

| Syntax                                                                                     | Where I learned it                                                                                                                     |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `query { … }`, outer braces                                                                | Pre-filled editor, drill 1; Docs: "Write `query` and a pair of braces"                                                                 |
| `country(name: "Portugal")`: parentheses, `name:`, double quotes                           | Drill 1: "the part in parentheses says which country you want"                                                                         |
| One field per line, no commas                                                              | Drill 1: "Put each field on its own line, with no comma between fields"                                                                |
| Nested braces after a record field                                                         | Drill 2: "write braces after `country` and put the field you want inside them"                                                         |
| Lists                                                                                      | Drill 3: "square brackets mark the list"                                                                                               |
| Several levels of nesting                                                                  | Drills 4–5                                                                                                                             |
| Docs entry format `field: Type`, `[X!]!`, "!" means always returns, "You never type a `!`" | Documentation panel intro, drill 6                                                                                                     |
| `currency { name }`                                                                        | Clerk's note in drill 6, then the Currency docs entry                                                                                  |
| `#` comments                                                                               | Comment in the Azulejos editor: "A line that starts with # is a note for you"                                                          |
| `departingShipments`, `id`                                                                 | Pre-filled Azulejos editor                                                                                                             |
| `manifest`                                                                                 | Azulejos briefing (code word)                                                                                                          |
| `destination`, `arrivingShipments`, `intake`, `transferOrders`                             | Results panel lists headed "Not yet opened on this shipment/city"                                                                      |
| `consignee`                                                                                | IntakeRecord / TransferOrder docs                                                                                                      |
| `authorizedBy`                                                                             | TransferOrder docs                                                                                                                     |
| `codename`                                                                                 | Operative docs, after the clerk returned `name`                                                                                        |
| Company has `name`                                                                         | **Guessed** by pattern from City and Country. It worked; I never checked the Company docs. This is a reasonable inference, not a leak. |
| Combining sibling lookups in one query                                                     | Azulejos debrief (the reference merged intake and transferOrders)                                                                      |

**Leaks:**

- No piece of syntax was used before the screen showed it.
- **Possible leak (editing technique).** To get out of a block I pressed Escape, then ArrowDown, then End, then Enter. A real novice might not have found that. I worked it out from the readback after the `__typename` accident, but the speed of the fix probably reflects my editor experience.

### 5. Points of confusion

1. **Editor auto-close doubled my braces**
   - **Where:** Training range, drill 1, Terminal.
   - **What happened:** I typed closing braces by hand as well. The editor had already added them, so the request had two extra lines and was returned: "Syntax Error: Unexpected '}' … Line 7".
   - **What I did:** I compared the clerk's note ("count the braces") with the editor and spotted the extras.
   - **What would help:** One line under the drill 1 editor: "The editor adds the closing brace for you." Or, when the error is an extra `}` at the end, have the clerk's note say "the editor may have closed this for you."
2. **Copied the sample query instead of reading the task**
   - **Where:** Drill 3 briefing.
   - **What happened:** The only code in the briefing was `borders { capital }`, so a skimmer copies it, but the task asks for names.
   - **What I did:** The "Not yet" box spelled out `borders { name }`.
   - **What would help:** Use a sample field that isn't the near-answer, or put the task sentence first in bold.
3. **Autocomplete took my Enter key**
   - **Where:** Azulejos, Luanda, Terminal.
   - **What happened:** After `name`, the suggestion popup was still open. ArrowDown and Enter accepted `__typename`, which produced `__typenameauthorizedBy {`.
   - **What I did:** Retyped the whole query.
   - **What would help:** Close the popup when the typed word already matches a suggestion exactly. Don't offer `__typename` at clearance 1.
4. **Two record fields side by side are hard to write**
   - **Where:** Luanda, Terminal.
   - **What happened:** I needed `consignee { … }` and then `authorizedBy { … }` next to it. With auto-close there's no obvious way out of the first block.
   - **What I did:** Arrow keys (possible leak, see the ledger).
   - **What would help:** A drill with two record fields side by side, such as `country { name } currency { name }`, plus a tip: "press ↓ to step past a closing brace."
5. **"Needs one more fact that connects to them" was vague**
   - **Where:** Luanda, Deduction, the consignee claim.
   - **What happened:** I expected the order's consignee to be enough. The form wanted the label fact too, but didn't name it.
   - **What I did:** Read the claim again, noticed "replacement label", and went back with Earlier to cite the intake record.
   - **What would help:** "This claim also needs the crate's label: cite the intake record's consignee for LIS-0417."
6. **Answer dropdowns are inconsistent**
   - **Where:** Luanda Deduction, and the Azulejos and Chronometer forms.
   - **What happened:** "Choose NIGHTJAR", "Choose Angola" and "Choose Senegal" appeared as buttons, but "For shipment" had none. I also couldn't tell why I had to choose at all.
   - **What I did:** Picked LIS-0417 by hand.
   - **What would help:** Offer the shortcut for every dropdown, or explain that the choice is your answer and the citations are your proof.
7. **Did "receiving country" mean the end point?**
   - **Where:** Azulejos 3, Travel order.
   - **What happened:** For a moment I thought the receiving country might be Namibia, where the tiles end up. It means the crate's destination country, Angola.
   - **What I did:** The "Choose Angola" button settled it.
   - **What would help:** Label the dropdown "Country the crate is shipped to."
8. **`name` doesn't exist on Operative**
   - **Where:** Luanda, Terminal.
   - **What happened:** I expected `name`, as on every other record; it was returned unread.
   - **What I did:** The clerk's note sent me to the docs, where I found `codename`. It cost nothing.
   - **What would help:** Nothing needed. This worked as designed.

### 6. Round 1 questions

**Luanda: the label and the signer.**

- After reading the replacement label (Parallax Freight, from my first Luanda query), the person wanted to send another query. Nothing on screen showed transfer orders or signatures yet.
- Later, when the claim needed the label, they did go back to the old result with Earlier instead of sending again.
- **How they found the signer:** by eye. They matched LUA-012's consignee, Parallax Freight, to the intake label, then read its `authorizedBy` codename, NIGHTJAR. LUA-011 (Lantern Export, signed by COPPER_KITE) was the decoy. They never opened `authorizationLog`.

**Chronometer: the clock.**

- The clock changed how I wrote the query. Together with the Azulejos debrief, which showed the reference merging two lookups, it led me to write a single query: the manifest and the whole destination → country → currency chain. In Azulejos I had gone step by step.
- The pressure itself was light: 18 hours for a one-query problem. It mostly made me read the editor back before transmitting.
- **Hours left:** 17 of 18.

### 7. At the end

**Moments that stood out:**

- The clerk's notes fixed every returned request (4 of them) without a hint.
- "Choose Angola" and "Choose NIGHTJAR" felt helpful.
- The Azulejos debrief's "Yours vs Reference" comparison taught the combining technique better than any briefing did.
- The low point was the `__typename` accident.

**Would this person play another case?** Yes. Each case was short, the clerk forgives mistakes for free, and getting **RECOVERED** in one shot felt good. The next case says "Teaches: Arguments", which sounds like something new to try.

### 8. Caveats

- **Leaks and prior knowledge:**
  - The arrow-key way out of an auto-closed block (listed in the ledger).
  - Knowing that a "list of records" behaves like a single record inside braces, and guessing `name` on Company. Both are supported by the screen, but I made them faster than a novice would.
  - I recognised the lookalike decoy (Central vs West African CFA) quickly. A real skimmer might have picked GEN-0236 if it had come first in the list.
- **Not covered by this run:**
  - How a real novice handles wording they misread, which I could only simulate.
  - Timing: I can't measure how long a stall would really last.
  - Hints and their costs: no hint was taken, so their cost and usefulness weren't tested.
  - Orientation, which was never opened.
  - The Vim mode and the Side by side and Raw response views, which were never used.
- **Rule deviation:** I added fields by sending Escape and arrow keys to the editor and then typing more, rather than always retyping the whole query from scratch.
