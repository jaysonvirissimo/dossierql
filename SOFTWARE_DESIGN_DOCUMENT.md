# WhereQL — Software Design Document

**Status:** Draft
**Version:** 0.4
**Last updated:** November 20, 2026

## 1. Introduction and Overview

### 1.1 Purpose

WhereQL (working title) is a browser-based educational espionage game that teaches GraphQL through interactive geographical mysteries and intelligence investigations.

Inspired by the globe-trotting educational gameplay of *Where in the World Is Carmen Sandiego?* and the early espionage novels of Ian Fleming, the game combines real-world geography, fictional international conspiracies, and a distinctive Cold War intelligence aesthetic.

Players assume the role of intelligence operatives investigating crimes, tracking suspects, and uncovering clandestine organizations. Their primary investigative tool is a GraphQL-powered intelligence terminal.

The game should make learning GraphQL feel like conducting an international intelligence operation rather than completing conventional programming exercises.

### 1.2 Audience

The game is written for people who have seen JSON or used an API but have never written GraphQL. It does not teach what an API is, and it does not assume experience with any particular programming language.

Experienced developers should still find the later missions interesting, because those missions depend on deduction as much as on syntax.

### 1.3 Goals

- Make GraphQL the means of solving every mystery. A mission should not be solvable from general knowledge alone.
- Teach GraphQL progressively. Each mission introduces or practises a named concept, from basic selections to mutations.
- Encourage exploration, deduction, and independent problem-solving rather than reproducing predetermined queries.
- Incorporate real geographical facts, providing incidental geography education.
- Create a memorable atmosphere inspired by mid-20th-century espionage fiction, balancing intrigue with understated humor.
- Operate entirely client-side, with static hosting through GitHub Pages.
- Support easily authored, version-controlled missions that can be added without modifying application code.

### 1.4 Non-Goals

At least initially, the project will not require:

- User accounts, authentication, or multiplayer functionality.
- A backend API, hosted database, or server-side GraphQL execution.
- Real-time geographical or economic data.
- Sophisticated procedural mystery generation. Seeded variants of hand-authored missions (Section 3.12) are a much smaller feature and are in scope after the MVP.
- Comprehensive coverage of every GraphQL feature. Subscriptions and schema authoring are out of scope.
- Combat, action sequences, or complex character movement.
- Real-time pressure. The mission clock counts game hours, and nothing in the game is timed against a real clock.
- Telemetry or analytics.

## 2. Creative Direction and Narrative Design

### 2.1 Setting and Atmosphere

WhereQL takes place in a fictional international intelligence agency whose style is drawn from the Cold War era of the 1950s and 1960s.

Its visual and narrative vocabulary includes classified dossiers, intelligence briefings, vintage cartography, diplomatic intrigue, coded messages, secret organizations, and international travel.

The aesthetic should evoke the early Ian Fleming novels rather than the gadget-heavy spectacle of later spy films.

The setting is timeless and deliberately anachronistic. The world has present-day countries, borders, and capitals, because the geography the player learns should be true today. The agency simply never updated its furniture: a GraphQL intelligence terminal sits beside typewriters, rotary telephones, and mid-century office fittings. Missions should avoid dates and real historical events.

### 2.2 Tone

The narrative should balance three qualities:

- **Espionage intrigue:** Missions involve genuine mysteries, conflicting evidence, hidden relationships, and consequential deductions. Conflicting evidence is a mechanic, not only a flavor (Section 3.6).
- **Geographical curiosity:** Locations possess recognizable cultural, historical, and geographical identities.
- **Understated absurdity:** Eccentric villains, improbable crimes, bureaucratic frustrations, and dry humor prevent the atmosphere from becoming overly serious.

Humor should arise primarily from characters, situations, and dialogue rather than constant jokes or parody.

The player should feel like a competent intelligence analyst working for an occasionally incompetent bureaucracy.

### 2.3 Narrative Structure

The game will distinguish between:

- **Missions:** Self-contained investigations with specific objectives.
- **Stages:** Individual investigative steps or locations within missions.
- **Campaigns:** Collections of missions connected by recurring characters, organizations, and larger conspiracies.

Early missions may involve stolen artifacts, missing diplomats, or suspicious travel itineraries. Later missions can reveal connections to an overarching criminal organization.

All characters, agencies, organizations, and storylines will be original creations. References to the game's creative influences must not imply affiliation with the owners of the source franchises.

### 2.4 Recurring Cast

A small recurring cast gives the game's systems a voice.

- **The records clerk** runs the archive behind the terminal. The clerk annotates GraphQL errors, delivers hints, and returns malformed requests unprocessed. The clerk is weary and precise, never mocking.
- **The adversary** is a recurring figure in the campaign's criminal organization who leaves notes, narrowly escapes, and gives the player someone to pursue across missions.
- **The bureaucracy** grants clearance, approves or rejects warrants, and bills travel. It explains the game's rules in the form of regulations.

## 3. Game and Learning Design

This section describes how the game plays and how it teaches. Later sections describe the systems that support it.

### 3.1 Core Gameplay Loop

1. Receive a classified mission briefing.
2. Query the intelligence terminal.
3. Read the results. Every fact returned is recorded as evidence.
4. Pin the evidence that matters to the evidence board.
5. Submit a deduction, travel, or apply for a warrant, citing pinned evidence.
6. Receive the consequence: new intelligence, a dead end, or a resolution.
7. Repeat until the mission is resolved, then read the debrief.

### 3.2 Evidence

The player's conclusions must rest on what their queries returned.

The game records every fact that appears in a query result in an **evidence ledger**. A fact is a field value of an entity, or a relationship between two entities. The player pins facts from the ledger to an evidence board and cites them when submitting a deduction.

A deduction is accepted only when it is correct and the cited evidence supports it. A player who already knows the answer still has to retrieve the facts that prove it.

To make this meaningful, every puzzle should depend on fictional intelligence data, such as shipments, aliases, and transactions, that no player can know in advance. Real geography then narrows the possibilities. A typical clue chain joins the two: an intercepted shipment leads to a city, and the city's country must satisfy a geographical clue.

### 3.3 The Mission Clock

Each mission has a budget of hours. Actions spend it.

| Action | Provisional cost |
|---|---|
| Transmission (one executed query or mutation) | 1 hour |
| Travel | Several hours, depending on distance |
| Hint | 1 to 8 hours, rising with each step of the hint ladder |
| Solution reveal | More than all the hints together |
| Rejected warrant or wrong destination | Several hours |

The clock exists to teach GraphQL's central idea. One nested query costs the same as one flat query, so a player who asks for everything they need in a single transmission is rewarded.

The clock counts game hours only. The player may take as long as they like over any decision, and the cost of an action is shown before the player commits to it.

The clock must not discourage experimentation:

- Queries that fail validation are returned by the records clerk before transmission and cost nothing.
- Browsing schema documentation and the evidence ledger is free.
- Onboarding missions have generous budgets.
- Katas (Section 3.11) have no clock.

When the clock runs out, the suspect escapes and the mission can be restarted. There is no numeric score in the MVP. Actual costs and budgets will be set by playtesting.

### 3.4 Warrants

Missions that end with an arrest require a warrant. The player names an operative and cites evidence for each claim the warrant makes, such as an alias link or presence at the scene.

The bureaucracy rejects a warrant that names the wrong operative or lacks support, and the rejection costs time. Early missions end with a destination rather than an arrest, so warrants are introduced once the player is comfortable gathering evidence.

### 3.5 Failure and Dead Ends

Failure should be entertaining and informative.

Traveling to the wrong destination produces an in-character dead end, written for that destination where the author has provided one, and costs travel time. The player then returns to the investigation with less time and no penalty beyond that.

A dead end should, where possible, hint at which piece of evidence was misread.

### 3.6 Unreliable Sources

Intelligence reports carry a source and a reliability grade. Later missions include reports that conflict, and the player resolves the conflict by corroborating one account against other data.

A mission with conflicting reports must contain enough corroborating data to settle the conflict in favor of a single answer.

### 3.7 Curriculum

Concepts are introduced in a fixed order. Each is tied to a clearance level and to a story situation that makes the concept the natural tool.

| Clearance | Concept | Story reason | Scope |
|---|---|---|---|
| 1 | Fields and nested selections | Follow a shipment to its destination and that destination's country | MVP |
| 2 | Arguments | Pull one operative's file instead of the whole registry | MVP |
| 3 | Aliases | Compare two suspects side by side in one transmission | MVP |
| 4 | Fragments | Reuse one dossier template for every associate | MVP |
| 5 | Variables | Keep a standing query and rerun it in each city of a pursuit | MVP |
| 6 | Introspection | Explore a newly seized archive that has no documentation | Later |
| 7 | Unions and inline fragments | Read a case file whose records are of mixed kinds | Later |
| 8 | Pagination | Work through surveillance logs too long to request whole | Later |
| 9 | Directives | Request costly detail only when a standing query needs it | Later |
| 10 | Mutations | File travel orders and warrants through the terminal | Later |

Each mission declares the concept it teaches, the concepts it practises, and the concepts it requires. The course as a whole follows four rules:

- A mission teaches at most one new concept. If two concepts will not separate, a mission is missing.
- A mission may only require concepts taught at or below its clearance level.
- Every concept is practised in at least one mission after the one that teaches it.
- Each clearance level ends with an **assessment mission**. It teaches nothing new, has no scaffold, and combines the concepts learned so far.

The curriculum governs what is taught and what a mission needs. It does not restrict what the terminal accepts: any valid GraphQL that the player's schema supports will execute at any time.

Wherever possible, a mission should teach through its situation and the clock rather than by checking syntax. A player comparing two suspects will reach for aliases because the alternative is two transmissions.

### 3.8 Clearance and Progression

Clearance is the player's rank. It rises when the player completes the assessment mission of their current level.

Clearance controls two things:

- **Mission availability.** The first two clearance levels form a short linear onboarding. After that, the player may choose any mission at or below their clearance.
- **The visible schema.** Types and fields above the player's clearance are absent from the schema and from introspection. A beginner sees a small schema that grows with each promotion.

Separately, individual records may be classified above the player's clearance. A field on such a record returns `null` with an error, alongside the rest of the data. This teaches GraphQL's partial-result behavior and gives the player a reason to come back after a promotion.

### 3.9 Scaffolding and Hints

Support is strongest when a concept is new and is then withdrawn.

Each stage declares a scaffold level:

- **Guided:** The editor opens with a starter query that has a gap to fill.
- **Partial:** The editor opens with the outer structure only.
- **None:** The editor opens blank.

Assessment missions always use the last of these.

Hints follow a four-step ladder. Each step costs more time than the last.

1. **Nudge:** Restates what the player is looking for.
2. **Concept:** Names the GraphQL idea involved.
3. **Schema pointer:** Names the relevant types and fields.
4. **Skeleton:** Shows the shape of a working query.

Beyond the ladder there is a **solution reveal**, which shows the stage's reference solution. It is named as such and is never presented as one more hint.

The player should always know what help costs. Each hint is labelled with its position and purpose, such as "Hint 2 of 4: names the concept", and the price of the ladder and of the solution reveal is stated before the first hint is taken.

Hints carry technique, not reference material. Anything the player needs in order to reason, such as the schema documentation and the meaning of a term, is free and always available.

Each completed mission records a **completion mode**: independent, hinted, or solution-revealed. All three count toward promotion, so no player is ever stuck. The mission list shows the mode honestly, and the player can investigate again to earn an independent result.

The interface should make GraphQL errors understandable. The original error is always shown unaltered, and the records clerk adds a plain-language annotation beneath it. An annotation says where to look and is worded as a suggestion. It never contains the text to type. Errors are a routine part of the work and should not be presented as failures.

### 3.10 Debrief

Every mission ends with a debrief containing:

- The narrative outcome.
- The player's transmissions beside the mission's reference solution, with a note on the difference where it is instructive, such as several transmissions that could have been one.
- The real geographical fact the mission turned on.
- A concept card for the tradecraft manual.

The tradecraft manual has two parts. Its glossary defines every term the game uses and is available from the start, because a definition is reference material. Its concept cards are earned, one per concept, and summarize what the player has learned to do.

### 3.11 Katas

A GraphQL kata is an optional drill outside the story, offered in a training range with no clock and no narrative stakes.

Katas are the only place where the game inspects the structure of a query, for example to confirm that a fragment was used. Missions never do.

### 3.12 Replay

After the MVP, a mission may define a pool of variants, such as different culprits, routes, and shipments. The game selects one by seed when the mission starts.

Every variant is authored and validated in advance. This gives replay value and makes answers harder to share without requiring procedural generation.

### 3.13 Orientation

An optional orientation is offered before the first mission. It explains what the terminal is, how to read a result, what a transmission costs, and where the schema documentation and glossary are.

The orientation is never required and can be reopened at any time. It exists so that the first mission can teach GraphQL without also having to teach the interface.

## 4. System Architecture

### 4.1 Overview

The application will be a static web application bundling a GraphQL execution engine, geographical and fictional intelligence data, and declarative game content.

All query execution and game-state management will occur within the player's browser.

Major subsystems:

1. **Game UI:** Displays briefings, dossiers, the evidence board, maps, query results, and investigation progress.
2. **GraphQL Engine:** Parses, validates, and executes genuine GraphQL operations against local data.
3. **World Data:** Provides factual geographical entities and relationships.
4. **Intelligence Data:** Provides fictional operatives, organizations, incidents, and other investigative entities.
5. **Game Engine:** Manages missions, stages, the evidence ledger, the mission clock, deductions, warrants, and completion conditions.
6. **Feedback System:** Produces error annotations, hints, and debriefs.
7. **Content Loader:** Loads and validates declarative mission definitions.
8. **Persistence:** Stores local game progress.

### 4.2 Boundary Between the GraphQL Engine and the Game

The GraphQL engine should know nothing about missions, so the same schema can support different missions and game mechanics. It meets the game at three narrow points:

- **Schema construction.** The engine builds its schema for a given clearance level. Elements above that level are left out, so validation, documentation, and introspection all agree on what exists.
- **Evidence reporting.** After executing an operation, the engine reports the facts contained in the result. The game engine records them in the evidence ledger.
- **Actions.** Mutation resolvers do not change game state themselves. They call an action interface supplied through the execution context, and the game engine decides the outcome.

### 4.3 Technology Considerations

| Concern | Candidate |
|---|---|
| Language | TypeScript |
| UI | React |
| Build tooling | Vite |
| GraphQL execution | GraphQL.js |
| Query editor | CodeMirror or GraphiQL |
| Mission definitions | YAML |
| Content validation | Zod or JSON Schema |
| Geographical data | Static JSON |
| Progress storage | localStorage or IndexedDB, behind a single adapter |
| Routing | Hash routes with a relative base path |
| Hosting | GitHub Pages |

These are initial preferences, not final implementation decisions.

Two constraints follow from static hosting and should be designed in from the start:

- **Linkable state.** Each mission, manual entry, and screen has its own route, so a reload returns the player to where they were and a link can point at a specific mission.
- **Bundle size.** The editor, the GraphQL tooling, and the world data are loaded on demand. The size of the initial bundle is a budget checked in continuous integration, so that a size warning never becomes a standing one.

## 5. Data Design

### 5.1 World Data

The game will use a normalized geographical dataset derived primarily from archived CIA World Factbook information, potentially supplemented by other openly available geographical sources.

Candidate entities include:

- Country
- City
- Continent or region
- Language
- Currency
- Landmark
- International border
- Trade relationship

Relationships should be navigable where useful. For example, players should be able to retrieve a country's languages or discover countries sharing a particular language.

A versioned snapshot of geographical data will ensure puzzles remain deterministic.

### 5.2 Intelligence Data

A complementary fictional dataset will represent the intelligence world.

Candidate entities include:

- Operative
- Alias
- Intelligence agency
- Criminal organization
- Incident or crime
- Shipment
- Company
- Financial transaction
- Sighting
- Intelligence report
- Case file

These entities should connect naturally to geographical data and to one another.

For example, an operative may have several aliases, belong to an organization, maintain known associates, and have a history of visiting particular countries. A shipment has an origin city, a destination city, a manifest, and a consignee.

Intelligence reports carry a source and a reliability grade (Section 3.6). A case file gathers records of different kinds, such as reports, shipments, transactions, and sightings, which the schema exposes as a union.

Every entity has a stable identifier so that evidence can refer to it.

The intelligence graph should support increasingly sophisticated investigations without requiring a fundamentally different GraphQL interface.

### 5.3 GraphQL Schema

The schema should expose meaningful relationships rather than simply mirror the underlying datasets.

An illustrative query:

    query {
      operative(codename: "SCARLET_FOX") {
        aliases
        knownAssociates {
          codename
        }
        lastKnownLocation {
          name
          country {
            name
            borders {
              name
            }
          }
        }
      }
    }

Each schema element is assigned a clearance level, and the schema served to the player contains only the elements at or below their clearance.

A record classified above the player's clearance produces an ordinary GraphQL partial result:

    {
      "data": {
        "operative": {
          "codename": "SCARLET_FOX",
          "handler": null
        }
      },
      "errors": [
        {
          "message": "Operative.handler is classified above your clearance.",
          "path": ["operative", "handler"]
        }
      ]
    }

At the highest clearance level, game actions become available as mutations. An illustrative warrant application:

    mutation {
      requestWarrant(input: {
        operative: "SCARLET_FOX"
        evidence: ["EV-0031", "EV-0044"]
      }) {
        approved
        reasons
      }
    }

Schema design should balance educational usefulness, realism, discoverability, and implementation simplicity.

The schema will evolve as new missions introduce additional entities, relationships, and GraphQL features.

### 5.4 Mission Definitions

Missions should be declarative and stored as human-readable YAML files in version control.

Each mission contains one or more stages. A stage represents an investigation objective, usually associated with a location.

A mission declares what it teaches, what it practises, what it requires, and its time budget. An assessment mission teaches nothing and lists the concepts it combines under `practises`. A stage declares its clues, scaffold, hint ladder, accepted solution with the evidence that must support it, dead ends, and a reference solution.

Illustrative structure:

    id: vanishing-azulejos
    title: The Vanishing Azulejos
    campaign: shadow-network
    clearance: 1
    teaches: nested-selections
    practises: []
    requires: []
    clock:
      budgetHours: 48
    startingStage: lisbon

    stages:
      lisbon:
        location: PT
        objective: Find where the stolen tiles were shipped.

        briefing: |
          A priceless collection of azulejos has vanished from a
          Lisbon museum. Three shipments have left the port since.
          One of them is not roofing samples.

        clues:
          - text: >
              An informant overheard the buyer complaining about
              the long drive to the Namibian border.
            constraint:
              destinationCountry:
                borders: NA

        scaffold:
          level: guided
          starterQuery: |
            query {
              city(name: "Lisbon") {
                departingShipments {
                  manifest
                  # Where is each shipment going?
                }
              }
            }

        hints:
          nudge: >
            Each shipment has a destination, and each destination
            is in a country.
          concept: >
            A field that returns an object needs its own selection
            in braces.
          schema: >
            Look at Shipment.destination, City.country, and
            Country.borders.
          skeleton: |
            destination { name country { name borders { name } } }

        solution:
          type: destination
          country: AO
          requiredEvidence:
            - entity: Shipment:LIS-0417
              field: destination
            - entity: Country:AO
              field: borders
              includes: Country:NA

        deadEnds:
          MZ: |
            The harbourmaster in Maputo opens the crate with some
            ceremony. It contains roofing samples.
          default: |
            Nobody here has seen any tiles. The agency has billed
            you for the flight.

        referenceSolution: |
          query {
            city(name: "Lisbon") {
              departingShipments {
                manifest
                destination {
                  name
                  country {
                    name
                    borders {
                      name
                    }
                  }
                }
              }
            }
          }

        next: luanda

      luanda:
        location: AO
        # Remaining stages omitted.

In this example the three shipments are bound for Luanda, Maputo, and Praia. Only Angola borders Namibia, so the clue identifies exactly one destination, and the player cannot know which shipments exist without querying.

The starter query supplies the `name` argument, so the player only has to add nested selections. Arguments are taught at the next clearance level.

The content model should eventually support branching investigations, multiple acceptable solutions, variant pools (Section 3.12), and connections between missions.

Longer narrative content may use Markdown, either embedded in YAML or stored separately.

### 5.5 Data Validation

A build-time validation process should check:

- **Structure:** Mission definitions have the required fields.
- **References:** Geographical entities, operatives, organizations, stages, missions, and campaigns that are referred to all exist.
- **Reachability:** Every stage can be reached and every mission has a terminal outcome.
- **Uniqueness:** The machine-verifiable clues of a stage identify exactly one solution among the candidates the data offers. Where reports conflict, the corroborating data settles the conflict.
- **Evidence:** Every piece of required evidence can be retrieved through the schema available at the mission's clearance.
- **Solvability:** The reference solution executes without error, yields the required evidence, and fits within the mission clock with a margin.
- **Curriculum order:** A mission requires only concepts taught at or below its clearance, and its reference solution uses the concept it claims to teach.
- **Course shape:** The rules of Section 3.7 hold. Every taught concept is practised later, every clearance level ends with an assessment mission, and every mission file in the content directory is part of the course.
- **Starter queries:** A stage's starter query does not, unchanged, yield the required evidence.
- **Hints:** Every stage has the complete hint ladder, and each schema pointer names types and fields that exist at the mission's clearance.
- **Terms:** GraphQL terms used in mission text are glossary entries, and are introduced at or below the mission's clearance.
- **Text references:** Entity names and identifiers quoted in mission text exist in the data.
- **Variants:** Where a mission defines variants, every variant passes all of the checks above.

Every check is an error that fails the build. A check that only prints a warning will eventually be ignored.

### 5.6 Authoring Rules

Validation cannot catch everything, so mission authors also follow these rules.

- **State the objective, not the method.** An objective says what to find. It never says which query to write or which GraphQL feature to use. Technique belongs in the hints, where the player chooses to see it.
- **Run the queries before writing the text.** Briefings, clues, hints, and dead ends must describe what the engine actually returns. Text written from expectation is the most common source of broken missions.
- **Introduce a term before using it.** Otherwise link its glossary entry.
- **Say what to change.** A starter query marks the part the player is meant to complete.
- **Write for an intelligent player.** Copy is short and concrete. The cast may be dry, but there is no tutorial chatter and no motivational filler.

Missions are discovered from the content directory. There is no separate list of missions to keep in step with the files.

## 6. Interface Design

### 6.1 GraphQL Execution Interface

The application will expose a local execution interface to the editor and game engine.

It takes an operation, its variables, and the player's clearance level. It returns the standard GraphQL result together with the facts that result contains.

Operations should support normal GraphQL functionality, including schema validation, variables, fragments, aliases, directives, and introspection, within the schema for the given clearance.

The implementation should preserve ordinary GraphQL result and error semantics. Error annotations are produced separately by the feedback system and never replace or reword the original errors.

### 6.2 Game Engine Interface

The game engine will receive player actions, update investigation state, and report outcomes.

Actions:

- Transmit a query. This spends time and adds facts to the evidence ledger.
- Pin or unpin evidence.
- Examine a dossier, report, or the schema documentation. This is free.
- Request a hint.
- Travel to a destination.
- Submit a deduction, citing pinned evidence.
- Apply for a warrant, citing pinned evidence.

Travel and deductions are available as controls in the interface from the first mission, and warrants from the first mission that ends in an arrest. Once the player reaches the clearance level that teaches mutations, the same actions can also be performed through the terminal, and missions at that level ask for the paperwork to be filed that way. Both routes call the same engine actions.

**Query validation and puzzle validation must remain distinct.** A syntactically valid query does not necessarily solve a puzzle, and multiple different queries may support the same correct deduction.

Missions evaluate the player's conclusion and the evidence cited for it. They never require an exact query string. Only katas inspect a query's abstract syntax tree.

## 7. Component Design

### 7.1 Investigation Engine

Responsible for mission progression, the evidence ledger, the mission clock, travel decisions, evaluating deductions and warrants, and success or failure conditions.

Each mission may be modeled as a small state machine whose transitions depend on player decisions.

Campaign-level state may track recurring suspects, discoveries, or narrative developments across multiple missions.

### 7.2 GraphQL Runtime

Responsible for executing user-authored operations against local geographical and intelligence data.

It builds a schema for each clearance level from clearance annotations on the schema definition. After execution, it walks the result using the schema's type information and reports each entity field and relationship it contains as a fact.

Potential considerations include query complexity limits, execution timeouts, and Web Workers to avoid blocking the interface.

### 7.3 Content System

Responsible for loading declarative missions, briefings, dialogue, hints, dead ends, and other narrative material, along with each mission's curriculum metadata and any variant pool.

The system should make it practical to add new missions without implementing new application logic.

### 7.4 Progress System

Responsible for recording completed missions and their completion modes, investigations in progress, the editor's contents for each stage, and the player's preferences.

Persistence should work without registration or a network connection. The following rules keep saved progress trustworthy as the game changes:

- All storage access goes through one adapter. If storage is unavailable, the game remains playable and simply does not remember.
- Saved data carries a format version. An investigation in progress also records the version of its mission's content. If the mission has since changed, the investigation restarts instead of loading state that no longer fits.
- The system stores what happened, such as which missions were completed and how. Clearance, concepts learned, and the earned concept cards are derived from that record, so a change to the curriculum needs no migration.
- Preferences are global and stored apart from progress. Resetting progress keeps preferences and asks for confirmation first.

### 7.5 Feedback System

Responsible for everything the game says about the player's GraphQL:

- Annotating validation and execution errors in the records clerk's voice.
- Serving the hint ladder and the solution reveal, stating their cost in advance, and charging it.
- Assembling the debrief, including the comparison with the reference solution.

## 8. User Interface Design

### 8.1 Visual Direction

The interface should evoke a mid-century intelligence headquarters adapted to a modern browser.

Potential visual elements include:

- Classified document folders and stamped case files.
- Vintage maps, travel posters, and geographical illustrations.
- Typewriter-inspired typography for narrative elements.
- Monochrome or restrained-color intelligence terminals.
- Passport stamps, dossier photographs, and agency insignia.

The actual GraphQL editor should prioritize modern usability, readability, and accessibility over strict historical authenticity.

Visual embellishments should support immersion without obstructing query composition or investigation. In practice:

- The interface is mostly a working tool and partly atmosphere. The editor and results take precedence over decoration, and query text is never smaller or fainter than the prose around it.
- Display typefaces are for headings and short labels. Body text and code use plain, legible faces.
- Hints, the manual, and other help open beside the editor and results and never cover them.
- Status is never shown by color alone, and each color has one meaning.
- No information needed to solve a mission exists only on the map or in decoration.
- The whole game can be played from the keyboard, and motion respects the reduced-motion preference.
- The layout remains usable in a window 1024 pixels wide.

### 8.2 Primary Screens

The screens support the gameplay loop described in Section 3.1.

**Orientation:** The optional introduction to the terminal and its tools (Section 3.13).

**Mission Selection:** Available assignments, the clearance each requires, the concept each teaches, the completion mode of those already finished, and campaign progress.

**Mission Briefing:** Classified narrative introduction, objectives, and initial intelligence.

**Intelligence Terminal:** GraphQL editor, schema documentation for the player's clearance, query results, error annotations, hints, the mission clock, and current location.

**Evidence Board:** The evidence ledger, the facts the player has pinned, and the forms for submitting a deduction or applying for a warrant.

**World Map:** Visualizes geographical locations and supports travel decisions, showing the time each journey would cost.

**Operative Dossiers:** Displays known suspects, aliases, and associations. A dossier shows only what the player's queries have retrieved.

**Debrief:** Displays the outcome, the comparison with the reference solution, the geographical fact, and the new concept card.

**Tradecraft Manual:** The glossary and the concept cards the player has earned, available for reference at any time.

**Training Range:** Optional katas.

## 9. Assumptions, Dependencies, and Constraints

- GitHub Pages can serve all required application assets.
- Geographical and intelligence data can be bundled in a reasonably sized static distribution.
- GraphQL.js provides the required client-side execution functionality, including building a reduced schema for each clearance level.
- Source datasets and assets must be checked for licensing and attribution requirements.
- The application should work offline after its required assets have been cached, if offline support is implemented.
- Because game logic and answers reside client-side, determined players can inspect them. Preventing cheating is not a primary objective. The evidence requirement is a learning aid, not a security measure.
- Present-day geography in a period-styled setting is intentional (Section 2.1).
- Accessibility and keyboard navigation should be considered throughout development.
- Agent-run playtests (Section 10.1) have limits. An agent that solves a mission shows that the material on screen is sufficient. It does not show that a beginner will find it, or how long that takes.
- Fictional intelligence content should remain sufficiently distinct from existing protected characters, organizations, and stories.

## 10. Testing Strategy

Testing should prioritize deterministic game behavior and content correctness.

Suggested coverage:

- **Unit tests:** GraphQL resolvers, mission transitions, evidence recording, clock accounting, and evaluation of deductions and warrants.
- **Schema tests:** Each clearance level exposes exactly its intended types and fields, including through introspection. Classified records return partial data with errors.
- **Content tests:** The validation checks of Section 5.5, run against every mission. These recompute what a mission asserts from the data and do not trust the authored answer.
- **Integration tests:** Execute representative GraphQL operations against actual game data.
- **Persistence tests:** Saved data from an older format version, a changed mission, and unavailable storage are each handled as Section 7.4 describes.
- **End-to-end tests:** Complete an investigation through the browser UI. At least one test submits a wrong deduction, corrects it, completes the mission, reloads the page, and confirms that the progress survived.

Every authored mission must include a reference solution. Continuous integration plays each mission using its reference solution and fails if the mission cannot be completed within its clock.

The test suite gates deployment. A build that fails any test or validation check is not published.

### 10.1 Playtesting

Automated tests show that a mission can be solved. They do not show that it teaches. Before a mission ships, two reviews are run by browser agents, so that neither depends on finding a human tester.

- **Clean-room solve:** An agent that can only operate the page, starting from a verified empty save, solves the mission without taking a hint. For each step it lists the on-screen material that justified it. This answers one question: can the mission be solved from what the game shows?
- **Novice walkthrough:** An agent plays in the persona of the audience described in Section 1.2. It records numbered points of confusion, each with where it happened and what would have helped, and reports where it stopped understanding and began matching patterns. Every point is either fixed or logged with a reason, and the walkthrough is then run again.

The agents are given a self-contained prompt and no knowledge of how the game is built. A reviewer who knows the answer is not a fair test of what the game teaches.

## 11. Development Milestones

### Milestone 1 — Technical Prototype

- Deploy a themed placeholder page through GitHub Pages, with tests gating the deployment.
- Render a basic GraphQL editor.
- Execute real queries locally.
- Load a small geographical dataset.
- Display results and errors.

**Success criterion:** A player can query geographical data without a backend, on the public site.

### Milestone 2 — First Playable Mission

- Implement the mission definition format.
- Add a small intelligence dataset linked to the geographical data.
- Load one espionage-themed investigation with several stages.
- Record evidence from query results and require it for deductions.
- Implement the mission clock, destination selection, dead ends, and completion.
- Validate uniqueness and run the mission's reference solution in tests.
- Introduce an intelligence briefing and basic dossier interface.
- Persist basic progress in versioned saves.
- Add the end-to-end test that fails a deduction, corrects it, and reloads.

**Success criterion:** A player can solve a complete international mystery, and can only do so by using GraphQL.

### Milestone 3 — Educational MVP

- Author teaching and assessment missions covering clearance levels 1 through 5, from nested selections to variables.
- Implement clearance, promotion, and clearance-scoped schemas.
- Add schema documentation, scaffolded starter queries, the hint ladder, the solution reveal, and error annotations.
- Add the orientation, the debrief, and the tradecraft manual with its glossary.
- Incorporate a world map and Cold War–inspired visual design.
- Introduce the recurring cast and a simple campaign.
- Run the full set of content validation checks automatically, including course shape.
- Run the clean-room solve and the novice walkthrough on every mission, and act on what they find.

**Success criterion:** A beginner can learn several fundamental GraphQL concepts through an engaging, self-directed espionage adventure.

### After the MVP

- Clearance levels 6 through 10, from introspection to mutations.
- Warrants and missions that end in an arrest.
- Conflicting reports and source reliability.
- Game actions as mutations.
- Seeded mission variants.
- The training range and katas.

## 12. Open Questions

The following decisions are intentionally deferred:

1. **Clock tuning:** What costs and budgets reward economical queries without making beginners afraid to experiment?
2. **Evidence strictness:** Must a deduction cite exactly the required evidence, or is any sufficient set acceptable? How is sufficiency defined for missions with several valid lines of reasoning?
3. **MVP curriculum:** Should introspection move into the MVP, given how central schema exploration is to working with GraphQL?
4. **Data scope:** What is the smallest geographical and intelligence dataset capable of supporting compelling mysteries?
5. **Narrative format:** Should missions use YAML exclusively, or combine YAML with Markdown?
6. **Replayability:** Beyond seeded variants, should later versions support procedurally generated investigations?
7. **Offline support:** Is full offline functionality an MVP requirement or a later enhancement?
8. **Skipping ahead:** Should an experienced player be able to open missions above their clearance, with a warning? Locking nothing is friendlier, but the clearance-scoped schema assumes the player has been promoted.
9. **Save portability:** Should the player be able to export and import their progress?

## 13. Glossary

**Campaign:** A sequence of related missions forming a larger narrative.

**Mission:** A complete intelligence investigation comprising one or more stages.

**Stage:** An investigation objective within a mission.

**Clue:** Information used to narrow possible solutions.

**World Data:** The factual geographical dataset exposed through GraphQL.

**Intelligence Data:** Fictional entities and relationships used to construct espionage mysteries.

**Game State:** The player's current investigation, discoveries, decisions, and progress.

**Transmission:** One executed GraphQL operation. Each transmission spends time on the mission clock.

**Mission Clock:** The budget of hours a mission allows, spent by transmissions, travel, hints, and mistakes.

**Evidence:** A fact that has appeared in one of the player's query results.

**Evidence Ledger:** The record of all evidence gathered during a mission.

**Deduction:** A conclusion the player submits, citing pinned evidence.

**Warrant:** An application to arrest a named operative, supported by cited evidence.

**Clearance:** The player's rank, which determines the missions available and the schema visible.

**Learning Objective:** The GraphQL concept a mission is designed to teach.

**Reference Solution:** An authored set of operations that solves a stage. It is used for testing, for the solution reveal, and for the debrief.

**Solution Reveal:** The step beyond the hint ladder, which shows the reference solution.

**Completion Mode:** How a mission was completed: independently, with hints, or with the solution revealed.

**Assessment Mission:** The mission that ends a clearance level. It teaches nothing new and combines the concepts learned so far.

**Orientation:** The optional introduction to the terminal offered before the first mission.

**Clean-Room Solve:** A playtest in which an agent solves a mission using only what the game shows, without hints.

**Debrief:** The end-of-mission summary of the outcome and of what the player learned.

**Tradecraft Manual:** The in-game reference, made up of a glossary that is always available and the concept cards the player has earned.

**GraphQL Kata:** An optional drill, outside the story, designed to develop proficiency with one piece of GraphQL syntax.

## 14. References

- [Atlassian — How to Create a Software Design Document](https://www.atlassian.com/work-management/knowledge-sharing/documentation/software-design-document)
- [GraphQL Specification](https://spec.graphql.org/)
- [GraphQL.js](https://graphql.org/graphql-js/)
- [CIA World Factbook Archive](https://www.cia.gov/the-world-factbook/)
- [Natural Earth](https://www.naturalearthdata.com/)

### Creative Influences

- *Where in the World Is Carmen Sandiego?* — Geographical investigation, educational gameplay, and whimsical criminal mysteries.
- Ian Fleming's early James Bond novels — International espionage, intelligence tradecraft, distinctive settings, and recurring adversaries.

WhereQL is an independent project and is not affiliated with or endorsed by the owners of these works.

---

*This document is intended to evolve alongside the project. Architectural details, technology selections, narrative systems, and content models should be refined through working prototypes rather than finalized prematurely. When a decision changes, the document should say what replaced it and why.*
