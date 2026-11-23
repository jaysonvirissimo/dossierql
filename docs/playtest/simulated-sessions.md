# Simulated sessions with beginners

The project has no access to people who know JSON and have never written
GraphQL. This prompt stands in for the two rounds of sessions with beginners
(SDD section 10.1). In each run, an AI agent plays one simulated player and
also acts as its own observer. Run each round once per persona, in a fresh
context each time, so that one simulated player's notes cannot reach the next.

A simulation is weaker evidence than a person. Its biggest weakness is that
the model already knows GraphQL. The prompt makes the agent say where on
screen it learned each piece of syntax, and treats anything it cannot point
to as a leak. Read the reports with that in mind.

## Operator notes (not part of the prompt)

- **Isolation.** Run the agent in an empty directory outside this
  repository. Give it a browser and nothing else from the project. The
  built JavaScript holds every mission's answers, so the agent must not
  read page source, network responses, storage, or DOM attributes. The
  prompt forbids it. Check the transcript afterward to confirm.
- **Site.** Use the public site, or `npm run build && npm run preview` and
  the local URL.
- **Fresh profile per run.** Use a new browser profile or private window
  for every run.
- **Seeding.** Seed the save before you hand over the page, then reload:
  - **Round 1:** no seed. The header shows clearance 1. The desk shows
    0 of 10 cases resolved.
  - **Round 2:** seed the completions below. Check that the header shows
    clearance 2.

    ```js
    localStorage.setItem(
      "dossierql:save",
      JSON.stringify({
        format: 1,
        events: ["vanishing-azulejos", "borrowed-chronometer"].map(
          (missionId) => ({
            type: "completed",
            missionId,
            mode: "independent",
            late: false,
          }),
        ),
        investigations: {},
      }),
    );
    ```

- **Filling in the prompt.** Fill in [URL], [ROUND] and [PERSONA]. Copy the
  persona's paragraph from the list below, unchanged. Paste everything
  below the second line whole.
- **Reports.** Save each report as
  `docs/playtest/reports/simulated-round-<N>-<persona>-<date>.md`. Then
  write one summary per round that lists every finding as fixed, or
  logged with the reason it stands (see "After a round", below the prompt).

### Personas

Run every persona in each round.

- **P1, front-end developer.** "You build web pages and have called REST
  APIs with fetch, reading the JSON that comes back. You have heard the
  word GraphQL and never looked at it. You read quickly and skim long
  paragraphs."
- **P2, data analyst.** "You write SQL every day and export JSON from
  dashboards. You have never written GraphQL. You expect a query language
  to work like SQL, and you notice when it does not."
- **P3, non-programmer.** "You work in operations. You have edited JSON
  config files and once followed a tutorial to call a web API. You do not
  program. You read every word carefully, and jargon stops you."
- **P4, hurried player.** "You have used JSON and called a web API from a
  tutorial. You have never written GraphQL. You skim briefings, start
  typing before you finish reading, and transmit to see what happens."

---

You are taking part in a playtest of a browser game called DossierQL. You
will play one simulated player and also observe yourself, the way a
researcher would watch a real person play. A browser page is open for you
at [URL]. You may operate only that page.

## Rules you must not break

- Use only what a player sees: the rendered page, screenshots, and the
  page's accessibility tree. Do not read the page source, the JavaScript or
  other files it loads, network traffic, localStorage, cookies, or DOM
  attributes that are not visible text. Do not search the web or read any
  files about the game. If a tool would show you any of these, do not use
  it.
- Do not change the URL by hand, except to go back to a page you have
  already reached through the game.

## Who you are

Play as this person, and stay in character:

> [PERSONA]

You, the AI, already know GraphQL. This person does not. That is the main
risk in this test, so follow these rules:

- **Keep a syntax ledger.** The first time you use any piece of syntax,
  such as braces, nesting, a field name, an argument in parentheses,
  quotes, an alias, a fragment, a `$` variable, `query`, or `!`, record
  where on screen you learned it: the panel and the words. If you cannot
  point to the place, you have leaked prior knowledge. Record the leak,
  then do what the person would do: look for the answer in the game, take
  a hint, or stay stuck.
- **Do not fix things silently.** If the person would misread something,
  misread it, and record what you misread and why.
- **Send what the person would send.** Do not correct a mistake before you
  transmit if this person would not have caught it. Do not invent mistakes
  either: make only the ones this person's reading of the screen leads to.
- **Think aloud.** Before each action, write one or two sentences, in the
  person's voice, about what they read, what they expect, and what they
  are unsure of.

## Preflight

Check and report:

- [ROUND] is 1: the header shows clearance 1, and the desk shows 0 of 10
  cases resolved.
- [ROUND] is 2: the header shows clearance 2, and _The Guest Register_ is
  not marked completed or in progress.

If the check fails, stop and report what you saw.

## The path for round [ROUND]

**Round 1.** This round tests the opening of the game.

1. The Orientation, only if this person would open it. Record whether
   they did.
2. The training range, all of its drills.
3. _The Vanishing Azulejos_, all of its stages.
4. _The Borrowed Chronometer_.

**Round 2.** This round tests whether a lesson carries over to new
records.

1. _The Guest Register_.
2. _The Quiet Consignee_. This case brings you to clearance 3.
3. _Three Couriers_.
4. On the training range, the kata "Two lookups in one transmission".
   Do not look back at _Three Couriers_ while you do it. A real player
   would not reopen the case.

Play only the path for round [ROUND].

## How to play

- Play to learn. Take a hint when this person would, and record its cost.
  View a solution only when this person would otherwise give up, and
  record that you did.
- If a case makes no progress in 20 transmissions, stop it, record where
  you stopped, and go on to the next item on the path.
- To write a query: click in the editor, select all (Ctrl+A or Cmd+A) to
  replace what is there, and type it key by key, as the person would. Do
  not paste or insert the whole query at once. The editor closes braces,
  parentheses and quotes as you type. Record each time that changes what
  you meant to type, and read the editor back before you send. Send with
  the Transmit button.

## Interview yourself at every stage boundary

At the end of each stage, and once after the drills, stop. Answer these
questions in the person's own words, before you read the next stage. Do not
go back and revise an answer later.

1. "What was new in that stage?" List each new thing separately: GraphQL
   syntax and game controls alike.
2. For each control the stage used, such as Cite, the draft form, Submit,
   travel, a hint, or a field check: "What was that for?" If you cannot
   explain a control, say so.
3. After a stage that ends in a submitted form: "Which facts support each
   claim?" Answer from memory. Then compare your answer with the facts you
   actually cited, and record any difference.

Answer these at the points named:

- **Round 1, _The Vanishing Azulejos_, the Luanda stage.** After you read
  the replacement label, record whether this person wants to send another
  query or look for the answer in the results they already have. Then
  record how they identified the signer.
- **Round 1, _The Borrowed Chronometer_.** This is the first case with a
  clock. Record whether the clock changed how you wrote queries, for
  example by combining two requests into one, or whether it only added
  pressure. Record the hours left at the end.
- **Round 2, any case.** Each time you rule out a lead, explain why the
  lead looked plausible, and what ruled it out.
- **Round 2, the kata.** Record whether you could use the technique from
  _Three Couriers_ on these new records. Record which parts you had to
  work out again.
- **Round 2, any claim you could not complete.** Record what you thought
  was missing, and whether the draft told you enough to find it.

## What to note as you go

- **Stalls.** Each moment where the person would hesitate for a long time
  or reread. Record what was on screen.
- **Returned requests.** Each request the records clerk returned unread,
  and whether the clerk's note got you past it.
- **Hints and solutions.** Each hint taken, and each solution viewed.
- **Pattern matching.** The point, if there is one, where you stopped
  understanding and began copying shapes that worked.
- **Debriefs.** The stamp on each debrief.

## Report

Write the report in Markdown, with these sections:

1. **Preflight.** What you saw.
2. **Per-stage table.** One row per stage or drill set, with these
   columns:
   - stage;
   - transmissions sent;
   - new things, in the person's words;
   - controls the person could not explain;
   - hints taken and solution viewed;
   - stamp, and hours left where the stage has a clock;
   - notes.
3. **Stage interviews.** Your answers, in order.
4. **Syntax ledger.** Each piece of syntax, where you learned it, and every
   leak.
5. **Points of confusion.** A numbered list. For each point, give:
   - **Where:** the case, the stage, and the panel or control.
   - **What happened:** what you expected, and what you got.
   - **What you did:** how you got past it, or that you did not.
   - **What would have helped:** a concrete change to the wording or the
     interface.
6. **The round's own questions.**
   - Round 1: the Luanda label and the signer, and the clock.
   - Round 2: the plausible leads, the kata, and incomplete claims.
7. **At the end.**
   - Which moments stood out.
   - Whether this person would choose to play another case, and why.
8. **Caveats.** What this run cannot show. Include every leak in the
   ledger, and anything you knew about GraphQL that may have helped you
   without your noticing.

---

## After a round

Combine the persona reports into one summary per round, named
`docs/playtest/reports/simulated-round-<N>-<date>.md`. In it:

- **Findings.** List every finding. Mark each one as fixed, or log it with
  the reason it stands.
- **Overload.** Sort each new thing the personas listed into a GraphQL
  step, a casework mechanic (the table in SDD section 3.15), or something
  else, such as a record, a phrase, or a panel. A stage breaks SDD section
  3.15 when two or more personas meet more than one new GraphQL step, or
  more than one new casework mechanic, in it. Something else that two or
  more personas list for the same stage is a finding about load.
- **Leaks.** Treat a leak in the syntax ledger as a finding against the
  game, not against the persona. It marks a place where the screen did not
  teach what the player needed.

After round 1, rework the opening from the summary, then run round 1 again
before going on. Round 2 also decides whether the draft should say more
about an incomplete claim. Neither round tunes the clock, because the agent
already knows GraphQL (SDD section 3.3). Record the hours left, and leave
the costs and factors as they are.
