# Simulated playtest · Round 1 · P1 · 2026-11-23

# DossierQL playtest, round 1: a web developer new to GraphQL

The whole round 1 path is done. The player cleared all 6 drills, solved _The Vanishing Azulejos_ (stamp HOLD ISSUED) and _The Borrowed Chronometer_ (stamp RECOVERED, 17 of 18 hours left). That took 11 transmissions in all, plus 1 request the clerk returned. No hints were taken and no solution was viewed. Clearance is now 2. I did not play round 2.

## 1. Preflight

- **Round 1 check ("1 is 1"): passed.** The header said "Clearance 1" and the desk said "You hold clearance 1. 0 of 10 cases resolved."
- **Round 2 check ("1 is 2"): not met, as expected.** The header showed clearance 1, not 2, which fits a fresh start. _The Guest Register_ showed "Locked: needs clearance 2", so it was neither completed nor in progress. Since only round 1 was being played, I went ahead.
- **Orientation: not opened.** The player went straight to the "Start training" card ("about six minutes"). Orientation is only a link in the top menu, and a skimmer passes it by.

## 2. Per-stage table

| Stage                      | Transmissions            | New things (player's words)                                                                                                                                                                                                                                        | Controls I couldn't explain                                                | Hints / solution | Stamp / hours                   | Notes                                                                                                                                                                  |
| -------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ---------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Training range, drills 1–6 | 6 (all passed first try) | "`query { }` wraps it; parentheses pick the thing; braces list the fields I want; a field that's a record gets its own braces, nest as deep as you like; lists come back in `[ ]`; the docs list every field; `!` means required/always there and I never type it" | Vim toggle (didn't care)                                                   | none             | n/a (untimed)                   | Editor added a duplicate `}` in drill 1. The autocomplete showed `String!` (drill 3) before anything explained it. Drill 6 docs are a closed panel under the terminal. |
| Azulejos, Lisbon slate     | 1                        | "`departingShipments`, `manifest`, `#` notes; Cite puts a row into a draft; Supported; Submit"                                                                                                                                                                     | Side by side, Raw response, Evidence, Dossiers, Map, Glossary (never used) | none             | "Deduction accepted" (no stamp) | Cite opened the right draft by itself.                                                                                                                                 |
| Azulejos, Namibia border   | 1 + 1 returned           | "`destination` is a record, needs braces; one Cite on a deep row = 3 facts"                                                                                                                                                                                        | same as above                                                              | none             | "Deduction accepted"            | I sent `destination` with no braces, as the player would. The clerk's note fixed it right away.                                                                        |
| Azulejos, Travel order     | 0                        | "Travel form, a 'Country receiving' dropdown, 'Needs a choice'"                                                                                                                                                                                                    | Why I must pick the country when the form already says "Choose Angola"     | none             | "Travel order approved"         | My first Travel press was rejected as "a choice … still blank". That was a slip in my own tool use, not the player's.                                                  |
| Azulejos, Luanda           | 2                        | "`arrivingShipments`, `intake`, `transferOrders`, `authorizedBy { codename }`; two blocks side by side; extra dropdowns 'For shipment' / 'Authorized by'"                                                                                                          | What `authorizationLog` was for (ignored)                                  | none             | **HOLD ISSUED** (case)          | Braces stacked up again; I rebuilt with one-line blocks.                                                                                                               |
| Borrowed Chronometer       | 1                        | "The clock, 1 hour per transmission no matter how big; blank editor"                                                                                                                                                                                               | "Let the deadline pass…"                                                   | none             | **RECOVERED**, 17/18 hours left | The one query matched the reference's single transmission.                                                                                                             |

## 3. Stage interviews (as recorded, not revised)

**After the drills.**

1. New: `query { … }`; the part in parentheses says which thing I want; braces hold the fields, one per line, no commas; record fields need their own braces and can be nested; lists come back in square brackets; the docs panel; `!` means "must give" or "always returns", and I never type it; the editor closes braces for me; an autocomplete pops up.
2. Transmit sends the query. "Next drill" moves on. The Documentation disclosure is the field reference. The drill buttons jump between drills. The Vim toggle is for Vim users. I could explain every control.

**Azulejos, stage 1 (slate).**

1. New: `departingShipments`, `id`, `manifest`, `#` comments; the Findings view; Cite; the lead dropdown; Supported; Submit deduction; Dispatches.
2. Cite puts that row into the draft for the shipment named on the button, and it opened LIS-0486's draft on its own. Submit sends the deduction. Remove takes a citation out. I can't explain Side by side, Raw response, Earlier/Later, or the Evidence, Dossiers, Map and Glossary tabs, because I never needed them.
3. From memory: LIS-0486 isn't ceramic because its manifest says "Blue slate squares (14 cm)". Cited: that same manifest row, 1 fact. They match.

**Azulejos, stage 2 (Namibia).**

1. New: `destination` returns a record, so it needs braces. I learned that from the returned request. Also new: the clerk's note with line and column; one Cite on a deep row counting as 3 facts; "(complete list)" in the draft; Earlier/Later, where a returned request isn't counted.
2. Citing a nested row brings its parent rows along.
3. From memory: LIS-0522 goes to Praia in Cabo Verde, which has no land borders. Cited: destination Praia → country Cabo Verde → borders none, 3 facts. They match.

**Azulejos, stage 3 (Travel).**

1. New: no GraphQL. New controls: the Travel order form, the "Country receiving the shipment" dropdown, "Needs a choice", the "Choose Angola" button, Travel.
2. Travel sends the order and moves me. The dropdown records my answer, though it felt like a formality.
3. From memory: the LIS-0417 manifest says blue ceramic squares; Luanda → Angola → borders include Namibia. Cited: manifest (1 fact), and destination → country → borders (3 facts). They match.

**Azulejos, stage 4 (Luanda).**

1. New: `arrivingShipments`, `intake`, `transferOrders`, `authorizedBy`, `codename`; putting two nested blocks side by side; writing `consignee { name }` on one line; the "For shipment" and "Authorized by" dropdowns; the debrief comparing my queries with the reference.
2. "For shipment" ties the order to the crate. "Authorized by" records the signer. I still can't explain Side by side, Raw response, Evidence, Dossiers, Map, Glossary or Hints. I also don't know what `authorizationLog` was for.
3. From memory: the label (intake) on LIS-0417 says Parallax Freight; order LUA-012's consignee is Parallax Freight; LUA-012 was authorized by NIGHTJAR. Cited: intake → consignee → name, transfer orders → consignee → name, and transfer orders → authorized by → codename, 3 facts each. **Difference:** I didn't remember that the intake record has its own ID (INT-LUA-0417). I also didn't remember that "transfer orders: LUA-011, LUA-012 (complete list)" was pulled in as a fact.

**Chronometer.**

1. New: the clock; a blank editor; "Transmit (1 hour)"; the "Let the deadline pass…" button. No new GraphQL.
2. Transmit costs an hour. The dropdown records the country. I can't explain "Let the deadline pass…". I never opened Hints, so I don't know what they cost.
3. From memory: the GEN-0211 manifest says marine chronometer; Dakar → Senegal → West African CFA franc. Cited: manifest (1 fact), and destination → country → currency → name (4 facts). They match.

## 4. Syntax ledger

| Syntax                                                  | Where I learned it                                                                                            |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `query { … }`                                           | Drill 1's starter query; drill 6 docs: "Write `query` and a pair of braces"                                   |
| Braces hold fields; one per line, no commas             | Drill 1: "The braces after it hold the fields you want back… Put each field on its own line, with no comma"   |
| Argument in parentheses `name: "Portugal"`              | Drill 1: "the part in parentheses says which country you want"                                                |
| Double quotes                                           | Drill 1 sample; drill 6 docs: "text, which you write in double quotes"                                        |
| Nested selection                                        | Drill 2: "write braces after `country` and put the field you want inside them"                                |
| Lists                                                   | Drill 3: "square brackets mark the list"                                                                      |
| `!`                                                     | Seen in the drill 3 autocomplete without understanding it; explained in drill 6 docs ("You never type a `!`") |
| `capital`, `borders`, `currency`                        | Drill text (`capital`, `borders`); drill 6 docs Country entry (`currency`)                                    |
| `Currency.name`                                         | **Guessed** from the pattern, not checked in the docs                                                         |
| `#` comments                                            | Azulejos starter comment: "A line that starts with # is a note"                                               |
| `departingShipments`, `manifest`                        | Starter query; Azulejos briefing                                                                              |
| `destination` needs braces                              | Clerk's note on the returned request                                                                          |
| `arrivingShipments`, `intake`, `transferOrders`         | Results "Not yet opened" lists, plus the Documentation tab                                                    |
| `consignee`, `authorizedBy`, `codename`, `Company.name` | Documentation tab (IntakeRecord, TransferOrder, Operative, Company)                                           |
| Two sibling record blocks                               | Generalised from drills 2 and 4 (`name` next to `country` / `borders`); not taught for two records            |
| One-line block `x { y }`                                | Drill 3's inline `borders { capital }`                                                                        |

Not used in round 1: aliases, fragments, `$` variables, named queries.

**Leaks:**

- I guessed `Currency.name` (a pattern guess, not GraphQL knowledge).
- In Luanda I switched to one-line blocks on purpose because I had worked out how the editor steps over closing characters. A real player might have taken longer, or kept hitting the duplicate braces.

## 5. Points of confusion

1. **The editor adds a second closing brace.**
   - **Where:** Drill 1, and Azulejos Luanda, in the terminal editor.
   - **What happened:** Typing `}` on a new line adds a brace instead of stepping over the one the editor already added. Drill 1 ended with two stray `}` lines. In Luanda three extra braces stacked up with jagged indents. On a single line, `)`, `"` and `}` do step over correctly.
   - **What I did:** Retyped without closing braces, deleted the extras, and in Luanda rebuilt the query with one-line blocks.
   - **What would have helped:** Step over a matching `}` even after a newline, or show a one-line note under the terminal: "The editor closes braces for you; don't type `}` yourself."
2. **`String!` appears before it's explained.**
   - **Where:** Drill 3, in the autocomplete popup.
   - **What happened:** `nameString!` appeared with no explanation; the meaning only arrives in drill 6's docs.
   - **What I did:** Ignored it until drill 6.
   - **What would have helped:** Put a space or colon between name and type in the popup (`name: String!`), and link "what does ! mean?" to the docs.
3. **No way to tell which fields need braces.**
   - **Where:** Azulejos stage 2, the "Not yet opened on this shipment" list.
   - **What happened:** The list gives `destination` with no sign that it needs braces, and a REST developer expects a plain string.
   - **What I did:** Sent it bare; the clerk's note fixed it at no cost.
   - **What would have helped:** Mark record fields in that list, for example `destination { }`.
4. **Two fields that both seem to name the signer.**
   - **Where:** Luanda, the TransferOrder docs entry.
   - **What happened:** Both `authorizedBy` and `authorizationLog` ("who signed the order") are listed. I couldn't tell which counts, and the debrief never says.
   - **What I did:** Used `authorizedBy`, and it was accepted.
   - **What would have helped:** One sentence in the debrief or the clue on why the registry log does or doesn't matter here.
5. **Redundant country choice.**
   - **Where:** Azulejos stage 3 (and the Chronometer), the Travel and Deduction forms.
   - **What happened:** The claim says "The facts you cited show Angola. Choose Angola", but still demands a manual choice.
   - **What I did:** Picked it from the dropdown.
   - **What would have helped:** Explain why the choice is mine ("you're committing to an answer"), or fill it in automatically.
6. **Long text above every result.**
   - **Where:** Every Results panel, plus the briefings.
   - **What happened:** The two paragraphs explaining Findings repeat on every transmission. As a skimmer I stopped reading them.
   - **What I did:** Skipped them.
   - **What would have helped:** Show them once, then collapse them.
7. **Hard-to-find docs in drill 6.**
   - **Where:** Training drill 6.
   - **What happened:** "The documentation below" is a closed panel under the terminal, and I had to look for it.
   - **What would have helped:** Open it by default in drill 6.

## 6. The round's own questions

- **Luanda label and signer:** After reading the replacement label (LIS-0417's intake consignee, Parallax Freight), the player wanted to **send another query**. Nothing already in the results had transfer orders or signers. They identified the signer by adding `transferOrders { consignee authorizedBy { codename } }` to the same query. That showed LUA-011 → Lantern / COPPER_KITE and LUA-012 → Parallax / **NIGHTJAR**, and the match with the label settled it.
- **Clock:** It **changed how the query was written**. Because each transmission costs 1 hour "however much it asks for", I put manifest, destination, country and currency into one request on purpose, instead of going step by step as in Lisbon. It added little pressure. **17 of 18 hours were left.**

## 7. At the end

- **Moments that stood out:**
  - The clerk's note on the bare `destination`: clear, and free.
  - One Cite on a deep row pulling in the whole chain (3–4 facts).
  - The CFA-franc trap in the Chronometer: "Central" versus "West" nearly slipped past a skimmer.
  - Fighting the stacked braces in Luanda.
- **Would they play another case?** Yes. The responses look like the JSON they already read from fetch, and the Chronometer felt like a payoff: one query and it was done.

## 8. Caveats

- **Leaks:** The guessed `Currency.name`, and the deliberate one-line workaround for the editor (section 4).
- **Possible hidden help:** I already knew that the response mirrors the query and that nesting is free. The game says both, but my knowledge may have made the steps feel smoother than they would for this person. I may also have been quicker to notice the duplicate braces, and to avoid `authorizationLog`, because I know GraphQL.
- **Tool slips:**
  - My first Travel press failed because my select call was malformed. It doesn't count as player confusion.
  - Several key presses in the editor were refused by the tool, so editor recovery took more steps than a real keyboard would.
- **Not covered:** Hints were never opened, so their cost and quality are untested. Orientation and the Tradecraft manual were not read.
- **Single run:** This is one simulated run of one persona, not a real person.

---

## Rerun on the revised build

I played all of round 1 and stopped there. Both cases resolved with no hints and no solutions viewed:

- **The Vanishing Azulejos:** stamp HOLD ISSUED, 4 transmissions (the reference uses 3).
- **The Borrowed Chronometer:** stamp RECOVERED, 1 transmission, 17 of 18 hours left. The header then moved to clearance 2.

No requests were returned unread. The biggest problem was the editor's automatic closing braces, which made multi-line queries hard to edit.

### 1. Preflight

- **Round-1 check passed:** the header showed **"Clearance 1"** and the desk said **"You hold clearance 1. 0 of 10 cases resolved."**
- **Round-2 check (clearance 2) does not apply to round 1.** For the record, _The Guest Register_ showed "Locked: needs clearance 2" and was not marked completed or in progress.

### 2. Per-stage table

| Stage                           | Transmissions                           | New things (the person's words)                                                                                                                                                                                                                                             | Controls I couldn't explain                                                       | Hints / solution | Stamp / hours                   | Notes                                                                                                                         |
| ------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Orientation                     | —                                       | —                                                                                                                                                                                                                                                                           | —                                                                                 | —                | —                               | **Not opened.** The person went straight to "Start training".                                                                 |
| Training drills 1–6             | 6, one per drill, all passed first time | Fields go inside braces, one per line, no commas. `(name: "Portugal")` picks which one. Braces open a linked record. Lists come back in `[ ]`. You can nest as deep as you like. The Documentation panel shows field, colon, type, and "needs braces" or "takes no braces". | Vim switch (never tried it)                                                       | none             | —                               | My first try at drill 1 came out with 4 closing braces for 2 opening ones (see confusion point 1). I fixed it before sending. |
| Azulejos 1: Lisbon, not ceramic | 1                                       | `departingShipments`, `manifest`, `#` comments, Findings view, Cite, the draft, Submit deduction                                                                                                                                                                            | "Cite departing shipments" on the parent row                                      | none             | —                               | LIS-0486 is "Blue slate squares".                                                                                             |
| Azulejos 2: Namibia border      | 1                                       | `destination` (a City) → `country` → `borders`. Citing a deep row brings its parent rows along (3 facts).                                                                                                                                                                   | Same parent-row Cite                                                              | none             | —                               | LIS-0522 goes to Praia, Cabo Verde, which has no land borders.                                                                |
| Azulejos 3: Travel              | 0                                       | Travel order, two claims, a receiving-country dropdown, and a "Choose Angola" button                                                                                                                                                                                        | None, but "Choose Angola" gives the answer away                                   | none             | —                               | Chose Angola.                                                                                                                 |
| Azulejos 4: Luanda              | 2                                       | `arrivingShipments`, `intake { consignee { name } }`, `transferOrders`, `authorizedBy { codename }`. A transfer order is the lead. Bare "Cite" buttons. "For shipment" and "Authorized by" dropdowns.                                                                       | Bare "Cite" before a lead is open. Citing "transfer orders 2 on file" as a whole. | none             | **HOLD ISSUED**                 | The extra transmission came from following the starter comment, which asks only about intake.                                 |
| Borrowed Chronometer            | 1                                       | The clock, "Transmit (1 hour)", a blank editor, `inspection { finding }`, `currency { name }`                                                                                                                                                                               | "Let the deadline pass…"                                                          | none             | **RECOVERED**, 17/18 hours left | Clearance 2 reached.                                                                                                          |

### 3. Stage interviews (as recorded at the time, not revised)

**After the drills.**

- **New:**
  - the `query { }` wrapper, which was in the starter text but not explained until the docs;
  - fields inside braces;
  - one field per line, no commas;
  - `(name: "…")` to pick a record;
  - braces after a field that holds a record;
  - lists coming back in square brackets;
  - deep nesting;
  - Documentation entries;
  - `!` (skimmed).
- **Controls:** Transmit sends the query. The drill tabs switch drills. Documentation lists the fields. Vim: "an editor mode, I guess."
- No form was submitted.

**Azulejos 1.**

- **Controls:** Cite puts a row into a shipment's draft as proof. Open a lead picks the shipment, but Cite did it for me. Submit deduction hands it in.
- **Couldn't explain:** what citing the parent row "departing shipments" would do.
- **Facts from memory:** LIS-0486's manifest, "Blue slate squares". This matches what I cited.

**Azulejos 2.**

- **Facts from memory:** LIS-0522 → Praia → Cabo Verde → borders none. This matches the 3 cited facts. I didn't cite LIS-0522's ceramic manifest, and the form didn't ask for it.

**Azulejos 3.**

- **Facts from memory:** LIS-0417's ceramic manifest for the first claim. Luanda → Angola → borders including Namibia for the second. These match.
- "Choose Angola" made the dropdown feel pointless.

**Azulejos 4 (Luanda).**

- **Facts from memory:** the intake label says Parallax Freight, LUA-012's consignee is Parallax Freight, and LUA-012 was authorized by NIGHTJAR.
- **Difference:** the draft also listed "transfer orders: LUA-011, LUA-012 (complete list)" and "intake: INT-LUA-0417". These came along as parent rows, and I didn't know they were part of the citation.

**Chronometer.**

- **Facts from memory:** GEN-0211's manifest, "Marine chronometer, brass, gimballed". Dakar → Senegal → West African CFA franc. These match.
- I didn't cite the inspection finding, and it wasn't needed.

### 4. Syntax ledger

| Syntax                                                                                                                 | Where I learned it                                                                                                                                                         | Leak?                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query { … }` wrapper                                                                                                  | Starter text in drill 1, not explained there. Explained later in the drill 6 Documentation: "Write `query` and a pair of braces". The Azulejos debrief says it's optional. | No, but I used it before it was explained.                                                                                                                       |
| A field name inside braces                                                                                             | Drill 1: "The braces after it hold the fields you want back"                                                                                                               | No                                                                                                                                                               |
| One field per line, no commas                                                                                          | Drill 1 text                                                                                                                                                               | No                                                                                                                                                               |
| `(name: "Portugal")` argument                                                                                          | Drill 1: "the part in parentheses says which country you want"                                                                                                             | No                                                                                                                                                               |
| Double quotes for text                                                                                                 | Copied from the starter in drill 1. Explained in Documentation: "text, which you write in double quotes".                                                                  | No                                                                                                                                                               |
| Braces after a field that holds a record                                                                               | Drill 2                                                                                                                                                                    | No                                                                                                                                                               |
| Lists and `[ ]`                                                                                                        | Drill 3                                                                                                                                                                    | No                                                                                                                                                               |
| Multi-level nesting                                                                                                    | Drills 4–5                                                                                                                                                                 | No                                                                                                                                                               |
| Reading `field: Type`, `[T!]!`, `!`                                                                                    | Drill 6 Documentation ("You never type a `!`")                                                                                                                             | No                                                                                                                                                               |
| `#` comments                                                                                                           | Azulejos starter comment: "A line that starts with # is a note for you"                                                                                                    | No                                                                                                                                                               |
| Writing the whole query on one line                                                                                    | Documentation example `query { city(name: "Lisbon") { name } }`                                                                                                            | **Partial leak:** I knew spaces could separate fields even though drill 1 said "put each field on its own line". The example showed it only with a single field. |
| Field names (`manifest`, `destination`, `intake`, `transferOrders`, `authorizedBy`, `codename`, `currency`, `finding`) | Briefing (`manifest`) and Documentation entries                                                                                                                            | No                                                                                                                                                               |
| Guessing that `Currency` and `Company` have `name`                                                                     | Not on screen at the time; I guessed from the pattern (drill 6 and Luanda)                                                                                                 | Pattern guess, not a GraphQL leak                                                                                                                                |
| Aliases, fragments, `$` variables                                                                                      | Not used                                                                                                                                                                   | —                                                                                                                                                                |

### 5. Points of confusion

1. **Auto-closed braces doubled up.**
   - **Where:** Training drill 1, the editor.
   - **What happened:** I typed the query with its closing braces on new lines and indents. The editor had already added its own closers and indents, so the result had 4 `}` for 2 `{`.
   - **What I did:** retyped it without the closers.
   - **What would have helped:** step over a closer typed on its own line, or show a one-line notice like "The editor closes braces for you."

2. **Couldn't get out of nested braces to add a sibling field.**
   - **Where:** Azulejos 4, the editor.
   - **What happened:** I expected arrow-down then Enter to put me after the closing brace. Instead, "transferOrders" got stuck onto `name` as `nametransferOrders` inside `consignee`.
   - **What I did:** rewrote the whole query on one line, where typing `}` steps over the auto-closer.
   - **What would have helped:** a tip in drill 4 or 5 on adding a field next to an open block, or a "Format" button.

3. **The starter comment split one lookup into two.**
   - **Where:** Azulejos 4, starter comment "What did the depot record for the arriving shipments?"
   - **What happened:** I asked only for intake, then needed a second query for the transfer orders. The reference does both in one.
   - **What I did:** sent the second query.
   - **What would have helped:** a comment that also points at the orders and their signers.

4. **Cite buttons with no ID.**
   - **Where:** Azulejos 4, Findings.
   - **What happened:** after the first Luanda query every button said just "Cite", because no transfer order had been fetched yet.
   - **What I did:** worked it out once I fetched the orders and the buttons changed to "Cite for LUA-012".
   - **What would have helped:** a disabled state that says "Fetch a transfer order to cite into."

5. **The draft hands out the answer.**
   - **Where:** Azulejos 3 and the Chronometer, in the draft.
   - **What happened:** buttons like "Choose Angola" and "Choose Senegal" fill in the answer the player is meant to choose.
   - **What I did:** chose from the dropdown myself.
   - **What would have helped:** only flag a mismatch after the player has made a choice.

6. **Parent-row Cite is unclear.**
   - **Where:** Findings, the "departing shipments 3 on file" and "transfer orders 2 on file" rows.
   - **What happened:** I never learned what citing these rows does.
   - **What I did:** avoided them.
   - **What would have helped:** a tooltip saying what the citation would include.

7. **"CFA franc" near-miss.**
   - **Where:** Chronometer, Findings.
   - **What happened:** reading quickly, "Central African CFA franc" almost matched "West African CFA franc".
   - **What I did:** noticed it because GEN-0211 was listed first.
   - **What would have helped:** this is a good trap for a careful reader. It just needs to show up in the debrief, and it does.

### 6. The round's own questions

**The Luanda label and the signer.**

- After reading the label (LIS-0417's intake consignee, Parallax Freight), the person **wanted to send another query**. The results so far had no transfer orders, and the Cite buttons couldn't target anything.
- **How I identified the signer:** I matched the label to the transfer order with the same consignee, LUA-012, and read its `authorizedBy` codename, **NIGHTJAR**.
- I never opened `authorizationLog`, the "separate registry record". The form accepted the answer without it.

**The clock.**

- The clock **changed how I wrote queries**. I read the docs first, since reading was free, and put manifest, inspection and destination → country → currency into **one query**, instead of the step-by-step approach from Azulejos.
- It felt like planning, not just pressure.
- **Hours left:** 17 of 18.

### 7. At the end

- **Moments that stood out:**
  - One click citing 3–4 facts at once.
  - The debrief comparing my queries with the reference.
  - The Cabo Verde joke ("the truck that can drive from an island").
  - The CFA franc trap.
  - Fighting the auto-closing braces.
- **Would this person play another case?** Yes. Each query worked first time, the debrief showed a better way, and _The Guest Register_ is now open. The main thing that could put them off is the brace editing in the editor.

### 8. Caveats

- **Leaks:**
  - The single-line layout. I treated spaces as separators, which the drill said to avoid. The example only showed it with one field.
  - Guessing a `name` field on Currency and Company. This was a pattern guess, but prior knowledge probably made me more confident.
- **Tacit knowledge that may have helped:**
  - I knew immediately that nested braces mirror the JSON shape.
  - I expected one query could fetch sibling branches like `intake` and `transferOrders` together.
  - I suspected `authorizationLog` was a red herring and skipped it.

  A real newcomer might have tried both signature sources, or not combined the two branches.

- **Not shown by this run:**
  - The Orientation page (never opened).
  - Hints and their costs, returned requests, the Side by side and Raw response tabs, the Vim mode, and what happens when the deadline runs out.
  - Real reading time. The "skimming" was simulated.

---

## Earlier run preserved from Git

## DossierQL simulated playtest · Round 1 · Participant 1

### 1. Preflight

The header showed **Clearance 1**. The Assignments desk said **“You hold clearance 1. 0 of 10 cases resolved.”** The Guest Register was locked at clearance 2 and had no completed or in-progress marker. This was the Round 1 profile, so I used the clearance 1 preflight. I skipped Orientation. “Start training,” with an estimate of about six minutes and a chance to try the terminal, caught my eye.

### 2. Per-stage table

| Stage                                   | Transmissions sent | New things, in my words                                                                                         | Controls I could not explain | Hints and solution | Stamp and hours left                                | Notes                                                                                                                                        |
| --------------------------------------- | -----------------: | --------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------ | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Drill 1 · Ask for a field               |                  1 | “The outside braces hold the whole form. The inside ones say what I want to get back.”                          | None used                    | None               | Passed                                              | Kept the filled-in lookup and added capital on its own line.                                                                                 |
| Drill 2 · Open a record                 |                  1 | “A country inside a city has fields of its own.”                                                                | None used                    | None               | Passed                                              | Asked for both Lisbon and Portugal’s names to see the two levels.                                                                            |
| Drill 3 · Read a list                   |                  1 | “I ask for the name once, and the response repeats it for every neighbor.”                                      | None used                    | None               | Passed                                              | Initially expected brackets for a list request. The drill explained to use braces before I typed.                                            |
| Drill 4 · Follow two links              |                  1 | “One request walks from Prague to Czechia to the neighbors’ capitals.”                                          | None used                    | None               | Passed                                              | Added neighbor names beside capitals to make the response readable.                                                                          |
| Drill 5 · Follow a chain of three links |                  1 | “The second borders belongs to Spain, so it lines up with Spain’s name.”                                        | None used                    | None               | Passed                                              | Reread the paragraph for where to place the second borders field.                                                                            |
| Drill 6 · Consult the documentation     |                  1 | “Find the exact field, read what it returns, and open that record to find the next field.”                      | None used                    | None               | Passed · Induction complete                         | Expanded Country and Currency. Returned Angolan kwanza.                                                                                      |
| Azulejos · Lisbon manifest              |                  1 | “Cite copies a fact into the shipment’s draft. Supported means the draft accepts it.”                           | None used                    | None               | Deduction accepted                                  | Citing the slate manifest also opened the LIS-0486 lead.                                                                                     |
| Azulejos · Lisbon road border           |                  1 | “A complete empty list is proof. Citing the last row brings the facts above it.”                                | None used                    | None               | Deduction accepted                                  | Eliminated LIS-0522 using Cabo Verde’s complete empty border list.                                                                           |
| Azulejos · Travel order                 |                  0 | “The form matches citations to two claims. I still have to choose the country.”                                 | None used                    | None               | Travel approved                                     | Used the second Lisbon response and the Choose Angola shortcut.                                                                              |
| Azulejos · Luanda transfer              |                  2 | “I can fetch one shipment by its ID and cite from a previous response.”                                         | None used                    | None               | **HOLD ISSUED**                                     | Compared the intake label to two orders. Cited the order’s direct signature. Debrief recorded 4 case transmissions against a reference of 3. |
| Borrowed Chronometer · Genoa            |                  1 | “There’s no starter. The clock charges once for the whole request, so I can get both pieces of proof together.” | None used                    | None               | **RECOVERED**, **17 of 18 hours left**, clearance 2 | GEN-0211, Senegal. One transmission, the same count as the reference.                                                                        |

No request came back unread. I took no hints, incurred no hint costs, and never opened a solution to advance a case. I read the reference comparisons after resolution.

### 3. Stage interviews

The boundary notes were recorded before opening the next drill or reading the next stage.

1. **Ask for a field.** “The opening word and braces hold the form. The part in parentheses picks Portugal. The fields inside its braces tell the archive which values to return. I separated name and capital with a new line. The editor is where I change the request, Transmit runs it, Response shows the JSON, and Next drill moves me on.”
2. **Open a record.** “A field can hold another record. I follow country with a pair of braces and ask for name inside those. The inner name is Portugal, the outer name is Lisbon. Transmit fetched both, Response showed which was which, and Next drill advances.”
3. **Read a list.** “I thought I might need square brackets in the request. I opened borders with braces and asked for name once. Response used square brackets around the five results. Transmit ran the request, and Next drill moves on.”
4. **Follow two links.** “The fields in the deepest braces belong to each bordering country. I kept their names alongside the capitals so I could read which capital went with which country. Transmit fetched the pairs, Response showed them, and Next drill advances.”
5. **Follow a chain of three links.** “A list can lead to another list. The second borders goes beside Spain’s name, inside the first borders. I used Transmit and checked that Spain was the middle record. Portugal shows up among Spain’s neighbors. Next drill moves forward.”
6. **Consult the documentation.** “The documentation tells me the field’s spelling and whether it comes back as text or as a record I need to open. I expanded Country, then Currency. The editor and Transmit got Angolan kwanza. The exclamation marks are for reading the documentation. The first-case link is how I continue.”
7. **After training.** “I can add fields, open records, ask once for a field on every item in a list, walk deeper links, and look up a field. The starter forms gave me somewhere to begin.” There were no claim forms in the drills.
8. **Lisbon manifest.** “I learned the clerk skips lines starting with #. Findings shows facts I can cite. A lead is the shipment whose draft I’m filing. Open a lead picks it. Cite on a shipment row can open it for me. Documentation told me manifest was text. I used Submit deduction once the form showed Supported.” From memory, the blue slate squares on LIS-0486 show the contents are nonceramic. The actual citation was exactly that manifest, one fact.
9. **Lisbon road border.** “I used the same braces from training to go from a shipment to its destination, then to the country and borders. None counts as evidence if it’s the complete list. Transmit fetched the three routes. Cite on the last row brought the route with it, and Submit filed the deduction.” From memory, LIS-0522 goes to Praia in Cabo Verde, which has no borders. One citation gave the form all three facts, including “none (complete list).” I remembered that its manifest said ceramic, but the form did not require that citation.
10. **Travel order.** “I used the prior response. Cite put each piece of evidence under the right claim. Choose Angola filled the receiving-country box, and Travel filed it and moved me.” From memory, LIS-0417’s blue ceramic squares of the right size match the registrar’s description, and the route is Luanda in Angola, which borders Namibia. The cited facts matched that account. The country was a separate choice after the evidence.
11. **Luanda.** “I looked up a shipment by its quoted ID. The lead is a transfer order this time. Earlier let me go back to the label result without losing the draft. Cite put the order and label facts in the same draft. Choose NIGHTJAR and Choose LIS-0417 filled the two required boxes, and Submit filed it.” From memory, LIS-0417’s arrival label shows Parallax Freight and LUA-012 gives the same consignee. LUA-011 goes to Lantern Export. The direct signature on LUA-012 says NIGHTJAR. The actual citations were intake consignee, order consignee, and order authorized by. The draft also listed the complete transfer-order list to connect LUA-012 to LIS-0417. I remembered seeing the registry log as corroboration but did not cite it.
12. **Chronometer.** “I had to build the whole query with an empty editor. The clock charges one story hour regardless of how much I ask for. I combined the two questions. Cite added the proof, Choose Senegal filled the country box, and Submit finished the case.” From memory, the GEN-0211 manifest says marine chronometer, brass, gimballed, and GEN-0211 went to Dakar in Senegal, which uses the West African CFA franc. The draft showed exactly those facts. One transmission left 17 hours, which the debrief confirmed.

### 4. Syntax ledger

| First use                                                              | What I used and where I learned it                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Drill 1 · request and field selection                                  | The instructions say “The word `query` and the outer braces hold the whole request” and “The inner braces hold the fields you want from that record.” The starter shows the literal `country(name: "Portugal")`, including parentheses, colon, and double quotes. The text says the part in parentheses chooses a record and prompts me to add `capital` next to `name`, separated by a space or new line, with no comma. |
| Drill 2 · `city` and nested records                                    | The visible starter shows `city(name: "Lisbon")` and `name`. The instructions say `country` holds another record, to “write braces after `country`,” and to put the desired field inside them.                                                                                                                                                                                                                            |
| Drill 3 · `borders` and lists                                          | The instructions identify a country’s `borders` field and say to open a list with braces. The passed response and feedback show square brackets in the returned JSON. I did not type square brackets into a query.                                                                                                                                                                                                        |
| Drill 4 · two consecutive links                                        | The starter has Prague’s `country` already open. The instructions identify Czechia’s `borders` list. `capital` was established on Country in Drill 1.                                                                                                                                                                                                                                                                     |
| Drill 5 · reused field at another level                                | The instructions say to write another `borders` “with braces inside those braces, under `name`.” I used `name` on each country at the end of that chain.                                                                                                                                                                                                                                                                  |
| Drill 6 · `currency { name }` and reading types                        | Documentation → Country says `currency: Currency` returns one record and needs braces. Documentation → Currency identifies `name: String!` as the currency’s name in English and says the field takes no braces. Documentation’s introduction explains `ID` in double quotes, list notation such as `[Country!]!`, and the meaning of `!` in a field listing. I did not type `!`.                                         |
| Lisbon manifest · shipment list, identifier, manifest, comments        | The starter supplies `departingShipments` and `id`. The briefing spells out `manifest`, and Documentation → Shipment confirms `manifest: String!`. The starter says a line starting with `#` is a note the archive ignores.                                                                                                                                                                                               |
| Lisbon road · `destination { name country { name borders { name } } }` | Documentation → Shipment had `destination: City!`. The training starters and Drill 2 established `name` and `country` on City, and Drills 3–5 established `name` and `borders` on Country.                                                                                                                                                                                                                                |
| Luanda label · `arrivingShipments`, `intake`, `consignee`              | The earlier Lisbon Findings showed `arrivingShipments` under the city’s unopened fields. Documentation → Shipment says `intake: IntakeRecord` is the depot record of the shipment on arrival. IntakeRecord says `consignee: Company` is the consignee on the arrival label. Company lists `name` as the registered name.                                                                                                  |
| Luanda orders · `shipment(id: "LIS-0417")`                             | Documentation → Query shows `shipment(id: ID!): Shipment` and describes it as one shipment by its identifier. The Documentation introduction says to write IDs in double quotes. The exact ID was in the Luanda clue and the intake response.                                                                                                                                                                             |
| Luanda orders · `transferOrders` and signer fields                     | Documentation → Shipment lists `transferOrders: [TransferOrder!]!`. TransferOrder lists `id`, `consignee`, `authorizedBy` as the signature on the order, and `authorizationLog` as the registry’s own log. AuthorizationLog shows `signedBy: Operative`, and Operative shows `codename`.                                                                                                                                  |
| Chronometer · whole request from blank                                 | No new syntax. Recreated the Lisbon request using the briefing’s Genoa and added the `currency { name }` branch from the documentation drill.                                                                                                                                                                                                                                                                             |

I used no syntax for which I lacked an on-screen source. I saw in the Azulejos debrief that `query` can be omitted, but used it in every request. I did not use aliases, fragments, variables, or `!` in a query.

### 5. Points of confusion

1. **Where:** Training, Read a list, drill instructions. **What happened:** I expected special list brackets in a request based on reading JSON. **What I did:** The instruction to open the list with braces corrected that before I typed. **What would have helped:** Put a short `borders { name }` example beside the resulting JSON array so the different brackets are visible together.
2. **Where:** Training, Follow a chain of three links, instructions. **What happened:** I skimmed the first pass and had to reread “inside those braces, under name” to tell whose borders the second field would open. **What I did:** I matched the indentation to Spain’s name and checked the result. **What would have helped:** Break before “Spain is a country too” and show Lisbon → Portugal → Spain → Spain’s neighbors next to the starter.
3. **Where:** Azulejos, Lisbon manifest, first Deduction form. **What happened:** I read the numbered-feeling checklist as requiring me to choose a lead before I could Cite, while the actual Cite button already carried the lead’s ID. **What I did:** I clicked the slate manifest’s Cite and watched LIS-0486 open with the claim supported. **What would have helped:** Add “You can also open a shipment’s draft by citing a row that names that shipment” beneath the lead chooser.
4. **Where:** Azulejos, Luanda, terminal and first label result. **What happened:** I treated the starter’s depot question as the task for my first send. It gave me Parallax Freight on LIS-0417 and another shipment, with no transfer orders to choose. **What I did:** I queried the known shipment’s orders and used Earlier to cite its intake label. **What would have helped:** Add one separate starter comment about comparing the intake label with the consignees on that shipment’s orders, so there is a reason to write both branches up front.
5. **Where:** Azulejos, Luanda, Documentation. **What happened:** I paused over `authorizedBy` and `authorizationLog`, since both are described in terms of a signature. **What I did:** I fetched both, saw that they agreed, and cited the order’s direct authorized-by row. **What would have helped:** In TransferOrder documentation, say that `authorizedBy` is the signer shown on the order and that the registry log is a separate record to open when a claim calls for registry evidence.
6. **Where:** Borrowed Chronometer, blank terminal. **What happened:** I paused at the loss of the starter to recall the city lookup and which braces enclosed the shipment list. **What I did:** I used the Lisbon pattern, adding the currency link from training. The result supported both claims. **What would have helped:** Link the inline Documentation instruction directly to the Query entry so I can check the opening syntax without scanning the whole panel.

### 6. The round’s own questions

#### Luanda label and signer

Immediately after reading the replacement label, I wanted to **send another query**. The first Luanda response showed Parallax Freight on LIS-0417 and on WVB-0031, but it had no transfer orders or signatures. The earlier Lisbon results had the manifests and destinations. The next transmission asked specifically for LIS-0417’s orders. LUA-011 gave Lantern Export, while LUA-012 gave Parallax Freight. The direct signature on LUA-012 was NIGHTJAR, and the registry log independently showed the same codename. I went back one response to cite the original intake label, checked the shipment and operative choices, and finished without a third Luanda transmission. The onboarding desk’s blurb for the locked Guest Register had already printed NIGHTJAR, so this run cannot show that the identity was a surprise. I selected the signer using the evidence on the matching order.

#### The clock

The clock affected what I wrote. The Luanda debrief showed me how two branches could come back in one transmission, and the new brief gave me a reason to do it. I included manifest plus destination → country → currency on each Genoa shipment in the first query. GEN-0236’s manifest matched but Douala’s country uses the Central African CFA franc. GEN-0240 had the right currency but was a barometer. GEN-0252 held bicycle frames and went to a country using the Nigerian naira. GEN-0211 fit both clues. The clock had no real-time pressure, and I left **17 hours** after the one-hour transmission.

### 7. At the end

“The empty border list was the first time the response felt like evidence instead of just an answer. I liked taking the same result and using it for travel. Luanda felt more like an investigation because I had to match two different records. The assessments’ blank editor was the moment I found out I actually remembered the request shape. I’d play another case because I want to see what the signer was arranging, and the clock doesn’t count down while I read.”

I reused shapes that had worked, especially the Lisbon shipments request in the assessment. I could still explain which record each part opened and which fact each field returned. I did not reach a point where copying was the only way I could proceed.

### 8. Caveats

This was one simulated browser playthrough. My real GraphQL knowledge could have made it easier to count braces, distinguish plain fields from linked records, and combine fields into one request. The ledger records the visible source for every piece of syntax used. The clipboard-style whole-editor replacement did not test how a novice handles individual keystrokes or autocompletion. Some visible disclosures and links were absent from the bridge’s numbered controls, and keyboard navigation was used to operate them. The first lead dropdown also did not commit a selection through the bridge. Cite provided an alternate way to open that lead. Those bridge limitations are excluded from the game findings. I did not test Orientation, hint pricing, unread-request feedback, deadline expiration, failed deductions, or the Round 2 cases.
