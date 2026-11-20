# Working in this repository

DossierQL is a browser game that teaches GraphQL through espionage casework.
The design is in [SOFTWARE_DESIGN_DOCUMENT.md](SOFTWARE_DESIGN_DOCUMENT.md)
(the SDD). The [README](README.md) has the commands and the layout.

`npm run check` is the merge gate. Run it before you report a change as done.
Run `npm run test:e2e` as well when you change anything a player can see.

## Writing player-visible text

Player-visible text is anything a player can read: the YAML in `content/`,
the records clerk's notes in `src/feedback/annotate.ts`, the schema
descriptions in `src/graphql/sdl.ts`, and the strings inside the components
in `src/features/` and `src/routes/`.

Read SDD section 5.7, "Writing for the Player", before you write or edit any
of it, and section 5.6 before you write a mission. Section 5.7 has six rules,
a table of reserved words, and a before-and-after example of each rule.

The reader has seen JSON and has never written GraphQL. Text written by a
model tends to fail this reader in one way: it is compressed until each
sentence depends on something the reader has to go back and find. Check your
draft for these before you finish:

- A phrase that points backward without saying at what: "the same way", "as
  before", "that type", or an "it" with two possible targets.
- "Name" used as a verb. Most records have a field called `name`. Write "ask
  for" a field and "identify" a person.
- A rule stated before the example that shows it.
- A passive sentence that hides whether the player or the archive acts.
- Two sentences that should have been five.

Keep the dry voice of the cast in dispatches and debriefs. The rules apply in
full to sentences that teach.

## Things that fail the build or the tests

- **Wording.** `npm run content:validate` rejects the phrases listed in
  `src/content/style.ts`. Rewrite the sentence. Do not loosen a pattern to get
  a sentence through.
- **Terms by clearance.** Text may not use a GraphQL term before the
  clearance at which `content/glossary.yaml` introduces it. "Argument" starts
  at clearance 2, "alias" at 3, "fragment" at 4, and "variable" and
  "operation" at 5. Drills are held to clearance 1.
- **Identifiers.** A token in mission text that looks like a record id, such
  as `LIS-0486` or `GREY_PETREL`, or any word of six or more capital letters,
  must be a real record id.
- **Markdown.** Backticks and glossary links are rendered only in some
  fields. SDD section 5.7 lists them. In the other fields they appear as
  typed, and validation rejects them.
- **Tests that match wording.** `e2e/*.spec.ts`, `src/engine/mission.test.ts`
  and `src/feedback/annotate.test.ts` match exact phrases. Search the tests
  for a phrase before you change it, and update the test in the same change.

## Other rules

- Text must describe what the engine returns. Run the query before you write
  about its result (SDD section 5.6).
- Do not edit `data/world.json` or `data/map.json`. Edit the files in
  `data/source/` and run `npm run world:build`.
- A change to how the game works belongs in the SDD too.
- Review new teaching text with a reader who does not know the answer. The
  prompts are in `docs/playtest/`.
