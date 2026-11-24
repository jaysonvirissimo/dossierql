# Running a round of agent playtests

This is the prompt for an orchestrating agent, such as Codex, that runs a
round of agent playtests and acts on what they find. The orchestrator works
inside this repository. The agents it starts do not: each one sees only its
prompt and a browser page.

Paste everything below the line to the orchestrator. Fill in [DATE] and edit
the run list if this round needs different runs.

---

You are running a round of playtests for DossierQL, a browser game that
teaches GraphQL. You work in this repository. Read `AGENTS.md`,
`docs/playtest/README.md`, and SDD sections 3.15, 5.7, and 10.1 before you
start.

## Your role and the runners' role

- **You** may read the repository. You build and serve the game, seed each
  save, start each run, read the reports, and act on them.
- **Each run** is a separate agent with a fresh context. It gets only the
  prompt you paste and one browser page. Give it no access to this
  repository, no shell, and no file tools. The built JavaScript holds every
  mission's answers, so a runner that reads it learns nothing about what the
  game teaches.

## Setup for each run

1. Serve the current build: `npm run build && npm run preview`. Rebuild
   after every change you make to the game.
2. Open a fresh browser profile or private window for each run. Block every
   origin except the preview server, so a runner cannot follow the footer
   link to the repository.
3. Seed the save if the run list gives a seed. Use the snippet in
   `docs/playtest/README.md` with the assessment id given, then reload.
   Simulated round 2 uses the seed in `simulated-sessions.md`.
4. Check the clearance in the header against the run list. If it differs,
   fix the seed. Do not hand the page over until it matches.
5. Paste the prompt whole, with its bracketed values filled in. Change
   nothing else in it.

## The run list

| Prompt                           | Case                               | Seed                   | Clearance |
| -------------------------------- | ---------------------------------- | ---------------------- | --------- |
| `clean-room-solve.md`            | _The Vanishing Azulejos_           | none                   | 1         |
| `clean-room-solve.md`            | _The Borrowed Chronometer_         | none                   | 1         |
| `clean-room-solve.md`            | _The Guest Register_               | `borrowed-chronometer` | 2         |
| `clean-room-solve.md`            | _The Quiet Consignee_              | `borrowed-chronometer` | 2         |
| `clean-room-solve.md`            | _Three Couriers_                   | `quiet-consignee`      | 3         |
| `clean-room-solve.md`            | _The Receipt_                      | `registrars-return`    | 6         |
| `novice-walkthrough.md`          | _The Receipt_                      | `registrars-return`    | 6         |
| `clean-room-solve.md`            | _The Sealed Cabinet_               | `registrars-return`    | 6         |
| `novice-walkthrough.md`          | _The Sealed Cabinet_               | `registrars-return`    | 6         |
| `clean-room-solve.md`            | _The Exchange Book_                | `registrars-return`    | 6         |
| `novice-walkthrough.md`          | _The Exchange Book_                | `registrars-return`    | 6         |
| `clean-room-solve.md`            | _The Valparaíso Draft_             | `exchange-book`        | 7         |
| `novice-walkthrough.md`          | _The Valparaíso Draft_             | `exchange-book`        | 7         |
| `clean-room-solve.md`            | _The Station File_                 | `exchange-book`        | 7         |
| `novice-walkthrough.md`          | _The Station File_                 | `exchange-book`        | 7         |
| `clean-room-solve.md`            | _The Listening Post_               | `station-file`         | 8         |
| `novice-walkthrough.md`          | _The Listening Post_               | `station-file`         | 8         |
| `clean-room-solve.md`            | _The Door Watch_                   | `station-file`         | 8         |
| `novice-walkthrough.md`          | _The Door Watch_                   | `station-file`         | 8         |
| `clean-room-solve.md`            | _The Corridor Book_                | `door-watch`           | 9         |
| `novice-walkthrough.md`          | _The Corridor Book_                | `door-watch`           | 9         |
| `clean-room-solve.md`            | _The Cipher Counter_               | `door-watch`           | 9         |
| `novice-walkthrough.md`          | _The Cipher Counter_               | `door-watch`           | 9         |
| `clean-room-solve.md`            | _The Inner Room_                   | `cipher-counter`       | 10        |
| `novice-walkthrough.md`          | _The Inner Room_                   | `cipher-counter`       | 10        |
| `clean-room-solve.md`            | _The Envelope Book_                | `cipher-counter`       | 10        |
| `novice-walkthrough.md`          | _The Envelope Book_                | `cipher-counter`       | 10        |
| `clean-room-solve.md`            | _The Messengers' Fares_            | `envelope-book`        | 11        |
| `novice-walkthrough.md`          | _The Messengers' Fares_            | `envelope-book`        | 11        |
| `clean-room-solve.md`            | _The Chair's Account_              | `envelope-book`        | 11        |
| `novice-walkthrough.md`          | _The Chair's Account_              | `envelope-book`        | 11        |
| `clean-room-solve.md`            | _The Handler's Road_               | `chairs-account`       | 12        |
| `novice-walkthrough.md`          | _The Handler's Road_               | `chairs-account`       | 12        |
| `clean-room-solve.md`            | _The Courier's Guidebook_          | `chairs-account`       | 12        |
| `novice-walkthrough.md`          | _The Courier's Guidebook_          | `chairs-account`       | 12        |
| `clean-room-solve.md`            | _The River Quay_                   | `couriers-guidebook`   | 13        |
| `novice-walkthrough.md`          | _The River Quay_                   | `couriers-guidebook`   | 13        |
| `clean-room-solve.md`            | _The Last Sailing_                 | `couriers-guidebook`   | 13        |
| `novice-walkthrough.md`          | _The Last Sailing_                 | `couriers-guidebook`   | 13        |
| `simulated-sessions.md`, round 1 | the drills and the first two cases | none                   | 1         |
| `simulated-sessions.md`, round 2 | the path given in the prompt       | in the prompt          | 2         |

- **_The Receipt_.** It is the coda of the campaign. It appears once
  _The Registrar's Return_ has any completion, so the one seed is enough.
  Check that the desk shows it before you hand the page over. For the
  novice walkthrough, set [PRIOR PLAY] to: "You have played every earlier
  case of the campaign, and you remember what its debriefs taught."
- **_The Sealed Cabinet_ and _The Exchange Book_.** They open the second
  campaign, at clearance 6. For the novice walkthrough of _The Sealed
  Cabinet_, set [PRIOR PLAY] to: "You have played every case of the first
  campaign, and you remember what its debriefs taught. You have never asked
  an archive to describe itself." For _The Exchange Book_, add: "You have
  also played The Sealed Cabinet."
- **_The Valparaíso Draft_ and _The Station File_.** They are the clearance 7
  cases of the second campaign. Seed the completion of `exchange-book`, and
  for _The Station File_ the completion of `valparaiso-draft` as well. For the
  novice walkthrough of _The Valparaíso Draft_, set [PRIOR PLAY] to: "You have
  played every case of the first campaign, The Sealed Cabinet, and The
  Exchange Book, and you remember what their debriefs taught. You have never
  read a list whose records are of different kinds." For _The Station File_,
  add: "You have also played The Valparaíso Draft."
- **_The Listening Post_ and _The Door Watch_.** They are the clearance 8
  cases of the second campaign. Seed the completion of `station-file`, and
  for _The Door Watch_ the completion of `listening-post` as well. For the
  novice walkthrough of _The Listening Post_, set [PRIOR PLAY] to: "You have
  played every case of the first campaign, The Sealed Cabinet, The Exchange
  Book, The Valparaíso Draft, and The Station File, and you remember what
  their debriefs taught. You have read a list of documents that share some
  fields, and you have never read a list whose records share none." For
  _The Door Watch_, add: "You have also played The Listening Post."
- **_The Corridor Book_ and _The Cipher Counter_.** They are the clearance 9
  cases of the second campaign. Seed the completion of `door-watch`, and for
  _The Cipher Counter_ the completion of `corridor-book` as well. For the
  novice walkthrough of _The Corridor Book_, set [PRIOR PLAY] to: "You have
  played every case of the first campaign and every earlier case of the
  second, through The Door Watch, and you remember what their debriefs
  taught. You have never read a list one page at a time." For _The Cipher
  Counter_, add: "You have also played The Corridor Book."
- **_The Inner Room_ and _The Envelope Book_.** They are the clearance 10
  cases of the second campaign. Seed the completion of `cipher-counter`, and
  for _The Envelope Book_ the completion of `inner-room` as well. For the
  novice walkthrough of _The Inner Room_, set [PRIOR PLAY] to: "You have
  played every case of the first campaign and every earlier case of the
  second, through The Cipher Counter, and you remember what their debriefs
  taught. You have never written a directive." For _The Envelope Book_,
  add: "You have also played The Inner Room."
- **_The Messengers' Fares_ and _The Chair's Account_.** They are the
  clearance 11 cases of the second campaign. Seed the completion of
  `envelope-book`, and for _The Chair's Account_ the completion of
  `messengers-fares` as well. For the novice walkthrough of _The Messengers'
  Fares_, set [PRIOR PLAY] to: "You have played every case of the first
  campaign and every earlier case of the second, through The Envelope Book,
  and you remember what their debriefs taught. You have only ever read from
  the archive, and you have never written a mutation." For _The Chair's
  Account_, add: "You have also played The Messengers' Fares."
- **_The Handler's Road_ and _The Courier's Guidebook_.** They are the
  clearance 12 cases of the second campaign, and the first cases that end
  in a warrant. Seed the completion of `chairs-account`, and for _The
  Courier's Guidebook_ the completion of `handlers-road` as well. For the
  novice walkthrough of _The Handler's Road_, set [PRIOR PLAY] to: "You have
  played every case of the first campaign and every earlier case of the
  second, through The Chair's Account, and you remember what their debriefs
  taught. You have filed mutations with simple arguments, and you have never
  filled a form in braces or applied for a warrant." For _The Courier's
  Guidebook_, add: "You have also played The Handler's Road."
- **_The River Quay_ and _The Last Sailing_.** They are the clearance 13
  cases of the second campaign, and its last. Seed the completion of
  `couriers-guidebook`, and for _The Last Sailing_ the completion of
  `river-quay` as well. For the novice walkthrough of _The River Quay_, set
  [PRIOR PLAY] to: "You have played every case of the first campaign and
  every earlier case of the second, through The Courier's Guidebook, and
  you remember what their debriefs taught. Every request you have sent came
  back once, and you have never kept a subscription open." For _The Last
  Sailing_, add: "You have also played The River Quay."
- **The simulated rounds.** Run each round once for each persona, P1 to P4,
  in a fresh context each time. Start round 2 only after round 1's summary
  is written and its fixes are made. If round 1's fixes change the opening,
  run round 1 again on the new build before you start round 2.

## Checking each run

Read each transcript before you read its report. Discard a run that read
page source, network traffic, storage, or DOM attributes, or that left the
game's site, and run it again in a fresh context. Note each discarded run
in the summary.

## Reports

- Save each report under `docs/playtest/reports/`, named as
  `docs/playtest/README.md` says, with [DATE] as the date.
- Write one summary for each simulated round, as "After a round" in
  `simulated-sessions.md` says. Sort overload by SDD section 3.15: a stage
  asks too much only when it brings more than one new GraphQL step or more
  than one new casework mechanic. Do not tune the clock. Record the hours
  left.
- Write one summary for the clean-room solves and the coda's walkthrough,
  named `docs/playtest/reports/agent-playtests-[DATE].md`.

## Acting on the findings

- Mark every finding as fixed, or log it with the reason it stands.
- Follow `AGENTS.md` for every fix.
  - Read SDD section 5.7 before you change text a player can read.
  - Search the tests for a phrase before you change it, and update the
    test in the same change.
  - Run the query before you write about its result.
  - Put any change to how the game works in the SDD as well.
- Give each changed passage of teaching text to a fresh reader who does
  not know the answer, and revise it from what they report.
- Run `npm run check`. Then build and run `npm run test:e2e`. Both must
  pass.
- Do not commit. Leave the changes and the reports for review. End with a
  short list of what you changed, what you logged, and what still needs a
  person.
