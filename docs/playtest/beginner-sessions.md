# Sessions with beginners, round 1

This is the observer's script for the first round of sessions with beginners
(SDD section 10.1). The round tests the opening of the game: the drills, _The
Vanishing Azulejos_, and _The Borrowed Chronometer_. Its result decides whether
the opening needs more work before Milestone 5 goes on (SDD section 11).

The agent playtests show what the screen says. These sessions show what a
person does with it, and how long it takes them.

## Who to recruit

Three to five people who have seen JSON or called an API, and who have never
written GraphQL (SDD section 1.2). Do not recruit anyone who has used GraphiQL or
read a GraphQL tutorial. They need not be programmers.

## Setup

- A fresh browser profile on the public site, or a private window. Check that
  the header shows clearance 1, and that the desk shows 0 of 10 cases resolved.
- The observer sits beside the player, or watches a shared screen, and takes
  notes. Record the screen if the player agrees.
- Allow an hour. The desk estimates six minutes for the drills. No one has
  timed the two cases yet, and the minutes in these notes will be the first
  measure.

## What to say at the start

> This is a game that teaches a query language called GraphQL. I'm testing the
> game, not you. Please think aloud as you play: say what you're reading, what
> you expect to happen, and what surprises you. I won't help unless you're
> stuck for a long time. The game's own help is fair to use.

Do not explain GraphQL, the controls, or what to click. If the player asks,
answer "What would you try?" Help only after about three minutes of being
stuck. Write down that you helped, and what you said.

## The path

1. The Orientation, only if the player chooses to open it. Note whether they
   do.
2. The training range, all six drills.
3. _The Vanishing Azulejos_, all four stages.
4. _The Borrowed Chronometer_.

## Questions to ask

**After each stage** (and once after the drills), ask the questions below
before the player goes on. Write the answers down in the player's own words.

- "What was new in that stage?" A stage where the player meets more than
  one new GraphQL step, or more than one new casework mechanic, asked for
  too much (SDD section 3.15). Note anything else they list, such as a
  record, a phrase, or a panel, as load.
- Point at each control the stage used (Cite, the draft form, Submit, travel)
  and ask "What was that for?" A control the player cannot explain is a
  finding.
- After a stage that ends in a submitted form: "Which facts support each
  claim?" Check the answer against what the player actually cited.

**In Azulejos, stage 4 (Luanda)**: after the player reads the replacement
label, watch whether they want to send another query or look for the answer
in the results they already have. Afterward, ask them how they identified the
signer.

**In _The Borrowed Chronometer_**, which is the first case with a clock: watch
whether the clock changes how the player writes a query, for example by
combining two requests into one, or whether it only makes them anxious. Ask
afterward: "Did the clock change what you did?"

**At the end**:

- "Which moments do you remember?"
- "Would you play another case?"

## What to note on the way

- Where the player hesitated for more than about 30 seconds, and what was on
  screen.
- Each request the records clerk returned unread, and whether the clerk's note
  got the player past it.
- Each hint taken, and the solution if it was viewed.
- Where the player stopped understanding and began copying shapes that
  worked.
- Hours left at the end of Chronometer, and the stamp on each debrief.

## Notes template

Copy one per player into
`docs/playtest/reports/beginners-round-1-<date>.md`. Refer to players as P1,
P2, and so on, and record no names.

```markdown
## P1

Background: (JSON, APIs, programming, in the player's words)
Opened the Orientation: yes / no

| Stage                        | Minutes | New, in their words | Controls they could not explain | Hints / solution | Notes |
| ---------------------------- | ------- | ------------------- | ------------------------------- | ---------------- | ----- |
| Drills (6)                   |         |                     |                                 |                  |       |
| Azulejos 1, the manifests    |         |                     |                                 |                  |       |
| Azulejos 2, the routes       |         |                     |                                 |                  |       |
| Azulejos 3, the travel order |         |                     |                                 |                  |       |
| Azulejos 4, Luanda           |         |                     |                                 |                  |       |
| Borrowed Chronometer         |         |                     |                                 |                  |       |

Which facts support each claim (their answer, and whether it matches what was cited):

Luanda: did the label prompt another query? How did they identify the signer?

Chronometer: did the clock change how they wrote a query? Hours left:

Remembered moments:

Would play another case:

Points where the observer helped:
```

## After the round

List every finding in the report, as the agent playtests do. Mark each one as
fixed, or log it with the reason it stands. Rework the opening from these
findings before Milestone 5 goes on to its next task (SDD section 11). Notes
on the clock are kept for the second round, which tunes the clock from both
rounds.
