# Clean-room solve

Paste everything below the line to an agent that can only operate a browser
page. Fill in the bracketed values.

---

You are testing a browser game called DossierQL. A browser page is already open
for you: page [PAGE ID], at [URL]. You can only operate that page. You have no
other source of information about the game, and you must not look for one.

## What you may look at

Use only what a player sees: the rendered page, screenshots, and the page's
accessibility tree. Do not read the page source, the JavaScript or other files
it loads, network traffic, localStorage, cookies, or DOM attributes that are
not visible text. Do not leave the game's site, search the web, or read any
files about the game. If a tool would show you any of these, do not use it.
In the accessibility tree, `disableable` means only that a control can be
turned off. A control is off only when the tree says `disabled`, and a box
that cannot be used yet says why in its first option.

## Your task

Solve the case called "[MISSION TITLE]" from start to debrief, using only what
the game shows you on screen.

## Rules

1. **Never take a hint and never view the solution.** Do not press any button
   under the Hints tab that takes a hint or views the solution. Reading what
   the Hints tab says about costs is allowed. If you take a hint, the run is
   void: stop and say so.
2. **Free reference material is allowed and encouraged**: the briefing, the
   clues, the Documentation tab, the Glossary tab, the Orientation page, the
   Tradecraft manual, error messages and the notes beneath them.
3. **Justify every step from the screen.** Before each query you send and each
   form you fill in, write down what on-screen material told you to do it:
   which panel, and what it said. If you used knowledge that the game did not
   show you (for example, GraphQL syntax you already knew, or geography you
   already knew), say so explicitly. That is a finding.
4. **Do not guess a conclusion.** Name a destination or a culprit only when
   your query results support it.
5. Stop if you are stuck after 12 transmissions in one stage, and report where.

## Preflight

Before you start, check and report:

- The clearance shown at the top right of the page is [EXPECTED CLEARANCE].
- On the Assignments page the case "[MISSION TITLE]" is not marked completed
  or in progress.

If either is wrong, stop and report it. Do not try to fix it.

## How to work the page

- Open the case from the Assignments page, read the briefing, then open the
  terminal.
- To write a query: click into the editor, select all its text (Ctrl+A or
  Cmd+A), and type your query. The editor closes brackets and quotes for you
  as you type, so read the editor back before sending.
- Send with the Transmit button. Read the Results panel.
- Use the form in the draft panel to choose your conclusion and submit it.
  The archive checks the form against every response you have received.

## Report

Return a report with these sections:

1. **Preflight**: what you saw.
2. **Outcome**: solved or not, the stamp shown on the debrief, how many
   transmissions you sent, hours left, and the completion mode the game
   recorded.
3. **Steps**: a numbered list. For each step: what you did, and the on-screen
   material that justified it (panel and wording). Mark any step that relied
   on outside knowledge.
4. **Evidence table**: for each claim on each accepted form, which facts the
   evidence chain listed and which transmission each came from.
5. **Friction**: anything that was unclear, misleading, broken, or that you
   had to try more than once, with where it happened and what would have
   helped. Include any text on screen that did not match what the game
   actually returned.
6. **Caveats**: what this run does not show.
