# Decision check of The Guest Register, rerun, 24 November 2026

**Build:** the fixes for the
[first run's findings](decision-check-guest-register-2026-11-24.md)
(uncommitted, on `80e4141`) · **Agent:** a fresh osp-site-tester, browser
tools on one page only

The prompts and the seed were the same as in the first run. The browser
context was fresh.

## Preflight

The page showed clearance 2 and 1 of 26 cases resolved. The Guest Register
showed "Next in the story".

## Result

| Case               | Solved | Transmissions                                                      | Hints | Solution viewed | Hours left | Mode        |
| ------------------ | ------ | ------------------------------------------------------------------ | ----- | --------------- | ---------- | ----------- |
| The Guest Register | Yes    | 4 (1 in Luanda, 3 in Zanzibar City, counting the H. Brandt lookup) | 0     | No              | 19 of 26   | independent |

## The first run's findings, checked again

- **Two leads in contention.** The agent ruled out D. Lund (TIN_FALCON, no
  sightings) before the deduction was accepted. The first agent never
  looked at D. Lund at all.
- **The rule-out dispatch no longer gives the answer away.** The agent
  learned that COPPER_KITE owns H. Brandt from its own lookup, not from a
  dispatch.
- **The argument is the player's to write.** The agent wrote
  `coverName(name: "H. Brandt")` from a blank editor, and it worked first
  time.
- **Not reported this time:** the inactive button, the nested records in
  Findings, or the wording of the unasked fields.

## The choice of city

The agent chose Zanzibar City because of two facts:

- the guest in SGT-031 gave M. Calloway, which is on NIGHTJAR's list;
- Tanzania's languages include Swahili.

It dropped Mombasa on the name and Maputo on the language. It said that
Kenya speaks Swahili, so only the name ruled Mombasa out. The case board and
the map confirmed the choice but did not change it. The choice came from the
Findings panel and the rule-out dispatches.

## New findings

Each one is fixed as a rule for every case.

1. **The Sighting box listed only record ids.** _Fixed._
   - **Component.** Where a stage lists `leads`, every box offers a lead
     under its label and then the record's own label, for example "The
     Zanzibar City sighting (SGT-031)" (`optionLabel` in
     `src/features/workspace/leads.ts`).
   - The draft's heading uses the same label.
2. **The briefing said the order goes to a city, but the form asks for a
   country.** _Fixed._
   - **Component.** Every travel order form now says: "A travel order sends
     you to a country: the one you choose for “…”", using the box's own
     label.
   - **Content.** The Luanda briefing now says that the order goes to the
     country the hotel is in, and what the form asks for.
3. **"Argument" appeared in a starter comment before the case explained
   it.** _Fixed._
   - **Validator.** A term that a teaching mission's clearance introduces
     must be linked to the glossary in a briefing, at or before the first
     stage that uses it.
   - **Content.** The check caught ten terms in four missions:
     - _The Vanishing Azulejos_: query, transmission, field, selection,
       result and evidence.
     - _The Guest Register_: argument.
     - _The Paymaster_: fragment.
     - _The Forwarding Address_: variable and operation.

     A linked sentence was added to each briefing. The Luanda briefing now
     explains the argument with `operative(codename: "NIGHTJAR")`.

   - **Validator.** Starter comments are now checked as plain text, because
     the editor renders nothing.
4. **The reference asked for two fields in one query, and nothing in the
   case showed that this is allowed.** _Fixed._
   - **Component.** When a reference request asks for several fields
     directly inside its outer braces, and none of the player's
     transmissions did, the debrief says that one request can (`topFields`
     in `src/engine/debrief.ts`).
   - **Content.** The Zanzibar starter comment now says that one
     transmission can look up only one cover name, but can ask for other
     fields beside it.
5. **A red mark appeared in the cleared editor.** _Fixed._
   - **Cause.** The GraphQL linter reports "Unexpected <EOF>" for an empty
     document. @codemirror/lint draws that as a red point at the first
     character, and the player's typing carries the point along.
   - **Editor.** The editor now filters out every mark while it is empty.
   - **Test.** The e2e test fails without the fix and passes with it.
6. **Blank lines from the closing braces showed in the debrief.** _Fixed._
   The debrief and the recap now show the player's transmissions through
   one helper (`shownOperation`), which drops lines that hold only spaces.

## Caveats

- One AI agent played a persona. It wrote every query right the first time.
- Hints, error notes and the wrong-deduction feedback were not exercised.
- The agent did not say whether the inactive Travel button or the line
  beneath it ever held it back. In a run that rules out before choosing,
  the hold may never show.
