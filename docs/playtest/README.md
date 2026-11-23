# Agent playtests

Automated tests show that a mission can be solved. These reviews show what
the game communicates on screen. Run both before a mission ships (SDD 10.1).

- [clean-room-solve.md](clean-room-solve.md): can the mission be solved from
  what the game shows, without a hint?
- [novice-walkthrough.md](novice-walkthrough.md): where does someone who
  knows JSON and has never written GraphQL get confused?

## Rules for a run

- **The agent operates the page and nothing else.** Give it a browser page
  and the prompt. It gets no access to this repository. A reviewer who knows
  the answer, or how the game is built, is not a fair test of what the game
  teaches.
- **The prompt is self-contained.** Paste it whole. Fill in the bracketed
  values and change nothing else.
- **Start from a verified save.** Use a fresh browser profile. For a mission
  above clearance 1, seed the save with only the completions that give the
  clearance the mission needs, then check the clearance shown in the header
  before handing the page over. The seed below promotes by placement and
  leaves every other case untouched.

  ```js
  // Clearance N+1: one passed assessment at level N.
  localStorage.setItem(
    "dossierql:save",
    JSON.stringify({
      format: 1,
      events: [
        {
          type: "completed",
          missionId: "<level N assessment id>",
          mode: "independent",
          late: false,
        },
      ],
      investigations: {},
    }),
  );
  ```

  Assessment ids by level: `borrowed-chronometer`, `quiet-consignee`,
  `bound-ledgers`, `lantern-export`, `registrars-return`, `exchange-book`,
  `station-file`.

- **Every finding is fixed or logged with a reason**, in the report, and the
  walkthrough is then run again.
- **Keep a caveats section.** An agent that solves a mission shows that the
  material on screen is sufficient. It does not show that a beginner will
  find it, or how long that takes (SDD section 9).

Sessions with people follow [beginner-sessions.md](beginner-sessions.md),
the observer's script for the first round of sessions with beginners.
Until beginners are available, both rounds are held as
[simulated-sessions.md](simulated-sessions.md), one agent run per persona.

To run a whole round and act on its findings, give an orchestrating agent
[orchestrator.md](orchestrator.md).

Reports go in `docs/playtest/reports/`, named `<kind>-<mission or level>-<date>.md`.
