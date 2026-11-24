# DossierQL

A browser game that teaches GraphQL through espionage casework. You are an
intelligence analyst with a terminal onto the agency's archive. Every case is
solved by querying it and submitting a conclusion, which the archive accepts
only if the facts your queries brought back prove it.

Play it at <https://virissimo.info/dossierql/>.

The design is in [SOFTWARE_DESIGN_DOCUMENT.md](SOFTWARE_DESIGN_DOCUMENT.md).
This repository implements 1.0 and the first six levels after it:
clearance levels 1 to 11, with a teaching case and an assessment for each of
nested selections, arguments, aliases, fragments, variables, introspection,
interfaces, unions, pagination, directives, and mutations. A training range of short drills comes before the
first case.

The game runs entirely in the browser. There is no backend, no account, and
no request to any other origin.

## Getting started

Node 24 is required. Scripts are TypeScript run directly by Node.

```sh
npm install
npm run dev
```

## Commands

| Command                    | What it does                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| `npm run dev`              | Development server                                                                                     |
| `npm run build`            | Production build into `dist/`                                                                          |
| `npm test`                 | Unit, schema, content and persistence tests (Vitest)                                                   |
| `npm run content:validate` | Every check of SDD 5.5 against every mission, and each mission's computed budget                       |
| `npm run test:e2e`         | Browser tests against the built site (run `npm run build` and `npx playwright install chromium` first) |
| `npm run check`            | The merge gate: format, lint, types, tests, content, build, bundle budget, origin scan                 |
| `npm run world:build`      | Regenerate `data/world.json` and `data/map.json` from the vendored sources                             |

## Layout

```
content/missions/   one YAML file per mission, discovered by glob
content/intel/      fictional records, grouped by type
content/*.yaml      glossary, concept cards, campaigns, training drills
data/               generated world and map data, and their vendored sources
scripts/            data build, content validation, bundle and origin checks
src/graphql/        the schema, per-clearance schemas, the executor that records facts
src/engine/         mission rules: clock, evidence matching, drafts, clearance
src/content/        content types, loader, Zod schemas, the validator
src/persistence/    the storage adapter and versioned saves
src/feedback/       the records clerk's error annotations
src/features/       the workspace (editor, results, drafts, tools) and the training range
src/routes/         one screen per hash route
e2e/                Playwright tests
docs/playtest/      prompts for agent playtests, and their reports
```

[AGENTS.md](AGENTS.md) has the rules for anyone, or any coding agent, changing
the text a player reads.

## How the pieces fit

- **One schema, filtered by clearance.** `src/graphql/sdl.ts` marks types and
  fields with `@clearance`. `schemaFor(level)` removes everything above the
  level before building, so validation, documentation and introspection agree.
  `@undocumented` keeps a type or field out of the documentation panel, so
  that only introspection describes it.
- **Facts are recorded during execution.** A single field resolver serves
  every record type and notes each field it resolves. Identity comes from
  the record, so an alias changes the path and not the fact. A record reached
  through an interface or a union keeps the type it was filed as, so its
  facts belong to that type.
- **The archive checks each form.** A form holds the player's choices and
  nothing else. When it is submitted, `reviewDraft` in `src/engine/draft.ts`
  looks through every fact in the ledger for a connected chain that proves
  each claim about the chosen records. A stage marked `evidence: cited`
  makes the player cite each fact by hand instead.
- **The engine is one reducer.** `act(env, state, action)` in
  `src/engine/mission.ts` holds every rule of an investigation. The interface
  only dispatches actions and renders state.
- **Rank is derived.** Saves hold the list of what happened. Clearance and
  concept cards are recomputed from it, so curriculum changes need no
  migration.
- **Costs live in one table.** `src/engine/clock.ts` has every cost and
  factor. A mission's budget is computed from its reference solution.

## Adding a mission

1. Add the records the case needs to a file in `content/intel/`, with decoys.
2. Run the queries you expect players to write before writing any text.
3. Add `content/missions/NN-name.yaml`. Copy the shape of an existing one.
   Write its text to the rules in section 5.7 of the design document,
   "Writing for the Player".
4. Run `npm run content:validate`. Every finding is an error. It checks that
   the clues identify one solution, that each claim has two evidence routes,
   that refutations and field checks work, that the reference solution solves
   the mission, and the curriculum, pacing, text and wording rules. Pacing
   means that a stage uses the clock, ruling out or a field check only once
   the course has introduced it (section 3.15).
5. Run both agent playtests in `docs/playtest/` before the mission ships.

New cities go in `data/source/cities.yaml`, followed by `npm run world:build`.

## Deployment

`ci.yml` runs the merge gate and the browser tests. `pages.yml` deploys
`dist/` to GitHub Pages after CI passes on `main`. To enable it, set
Settings → Pages → Source to "GitHub Actions" in the repository. The build
uses relative asset URLs, so it works at any path.

## Data and licences

- Country names, capitals, continents and languages: CIA World Factbook
  (public domain), via factbook.json.
- Borders, currencies and the list of sovereign states:
  [mledoze/countries](https://github.com/mledoze/countries), under the Open
  Database License 1.0. `data/world.json` is a derived database and the same
  licence applies to it.
- Map shapes: Natural Earth (public domain).

Sources, versions and hand corrections are recorded in
[data/source/README.md](data/source/README.md).

Every character, agency, organization and crime in the game is invented.
DossierQL is an independent project and is not affiliated with or endorsed by
the owners of the works that inspired it.
