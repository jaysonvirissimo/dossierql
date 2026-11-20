# WhereQL — Software Design Document

**Status:** Draft
**Version:** 0.5
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
3. Read the results and compare leads. Every fact returned is recorded as evidence.
4. Pin relevant facts to the evidence board directly from the results or the ledger.
5. Submit a deduction, travel, or apply for a warrant, citing pinned evidence.
6. Receive the consequence: new intelligence, a dead end, or a resolution.
7. Repeat until the mission is resolved, then read the debrief.

### 3.2 Evidence

The player's conclusions must rest on what their queries returned.

The game records every fact that appears in a query result in an **evidence ledger**. A fact is a field value of an entity, or a relationship between two entities. A player can pin a fact directly from the result or from the ledger, then jump back from the pin to the response that contained it. A fact can appear in multiple responses and keeps its identity across queries.

Deduction, travel, and warrant forms present the claims the player must support in plain language. A stage can define several sufficient sets of facts for each claim. A claim is supported when its citations contain any one complete set. Extra citations are allowed. Facts in a set must refer to the lead under consideration. For example, a shipment's destination and the destination country's border must form a connected chain.

The form returns missing or unrelated citations for correction before spending time. If the player cites relevant facts that disprove a claim, the outcome names the claim and the conflicting fact. An absent entry can refute a claim about a list only when the player retrieved the complete list without an error. A deduction is accepted when the conclusion is correct and all claims are supported.

Every puzzle should depend on fictional intelligence data, such as shipments, aliases, and transactions, that no player can know in advance. Real geography then narrows the possibilities. For example, an intercepted shipment leads to a city, and the city's country must satisfy a geographical clue.

### 3.3 The Mission Clock

Each mission has a budget of hours. Actions spend it while the clock is active.

| Action | Provisional cost |
|---|---|
| Transmission (one executed query or mutation) | 1 hour |
| Travel | Several hours, depending on distance |
| Hint | 1 to 8 hours, rising with each step of the hint ladder |
| Solution reveal | More than all the hints together |
| Rejected warrant | Several hours |

The clock exists to teach GraphQL's central idea. One nested query costs the same as one flat query, so a player who asks for everything they need in a single transmission is rewarded.

The clock counts game hours only. The player may take as long as they like over any decision, and the cost of an action is shown before the player commits to it.

The clock must not discourage experimentation:

- Queries that fail validation are returned by the records clerk before transmission and cost nothing.
- Browsing schema documentation and the evidence ledger is free.
- Onboarding missions have generous budgets.
- Katas (Section 3.11) have no clock.

An action that uses the last available hour resolves before the clock expires. If an action costs more than the time remaining, show the shortfall and let the player choose to let the deadline pass.

In the first mission, the suspect gets away at the deadline and the player can continue the investigation untimed from their current stage. The game keeps their evidence, pins, transcripts, and editor draft. A late completion still requires a supported deduction and gets a different narrative outcome in the debrief. The player can also restart. In later missions, the deadline ends the attempt and the player can restart. The current stage's solution becomes free to view once the deadline passes in either case (Section 3.9).

There is no numeric score in the MVP. Actual costs and budgets will be set by playtesting.

### 3.4 Warrants

Missions that end with an arrest require a warrant. The player names an operative and cites evidence for each claim the warrant makes, such as an alias link or presence at the scene.

The bureaucracy returns missing or unrelated citations for correction. Once a warrant is submitted, a rejection costs time. Warrants are introduced after destination missions, once the player is comfortable gathering evidence.

### 3.5 Failure and Dead Ends

Failure should be entertaining and informative.

Give players a credible reason to investigate a wrong lead. At a stage with several leads, let players examine them in any order. Before travel, show the quoted cost and check that the citations address each required claim. A player who commits to a mistaken lead spends the quoted travel time and sees an in-character dead end. The player returns to the same stage with their evidence and can reconsider the lead.

A dead end should explain why that lead looked plausible and point to the claim the evidence undermines. The scene leaves the player to work out which lead to pursue next.

### 3.6 Unreliable Sources

Intelligence reports carry a source and a reliability grade. Later missions include reports that conflict, and the player resolves the conflict by corroborating one account against other data.

A mission with conflicting reports must contain enough corroborating data to settle the conflict in favor of a single answer.

### 3.7 Curriculum

Concepts are introduced in a fixed order. Each is tied to a clearance level and to a story situation that makes the concept the natural tool.

| Clearance | Concept | Story reason | Scope |
|---|---|---|---|
| 1 | Fields and nested selections | Compare shipment manifests and trace destinations to countries and their borders | MVP |
| 2 | Arguments | Pull one operative's file instead of the whole registry | MVP |
| 3 | Aliases | Call the same dossier field with two suspect IDs and compare the named results side by side | MVP |
| 4 | Fragments | Keep the same fields in a suspect's dossier and in nested dossiers for their associates by writing the selection once | MVP |
| 5 | Variables | Carry a query into a second city and change its input in the variables panel | MVP |
| 6 | Introspection | Explore a newly seized archive that has no documentation | Later |
| 7 | Unions and inline fragments | Read a case file whose records are of mixed kinds | Later |
| 8 | Pagination | Work through surveillance logs too long to request whole | Later |
| 9 | Directives | Request costly detail only when a standing query needs it | Later |
| 10 | Mutations | File travel orders and warrants through the terminal | Later |

Each mission declares the concept it teaches, the concepts it practises, and the concepts it requires. The course as a whole follows four rules:

- A mission teaches at most one new concept. If two concepts will not separate, a mission is missing.
- A mission may only require concepts taught at or below its clearance level.
- Every concept is practised in at least one mission after the one that teaches it.
- Each clearance level ends with an **assessment mission**. It teaches nothing new, starts with a blank editor, and uses a different case and data to see whether players can apply the concepts learned so far.

The curriculum governs what is taught and what a mission needs. It does not restrict what the terminal accepts: any valid GraphQL that the player's schema supports will execute at any time.

Give the target feature a visible payoff during the case. Aliases save a transmission, fragments save duplicate selections that would need to stay in sync, and variables let the player reuse the operation when the input changes. The assessment gives players a fresh reason to use the same technique. The game accepts any query that yields sufficient evidence.

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

Beyond the ladder there is a **solution reveal**, which shows the stage's reference solution. It is available at its stated cost while the clock is active and free after the deadline, even if the attempt has ended. In the first mission's untimed continuation, hints are also free.

The player should always know what help costs. Each hint is labelled with its position and purpose, such as "Hint 2 of 4: names the concept", and the price of the ladder and of the solution reveal is stated before the first hint is taken.

Hints carry technique, not reference material. Anything the player needs in order to reason, such as the schema documentation and the meaning of a term, is free and always available.

Each completed mission records how much help the player used during that attempt as its **completion mode**. The modes are independent, hinted, and solution-revealed. All three count toward promotion, including a completion after the first mission's deadline. The mission list shows the help used and whether the investigation finished after the deadline. The player can investigate again for a different result.

The interface should make GraphQL errors understandable. The original error is always shown unaltered, and the records clerk adds a plain-language annotation beneath it. An annotation says where to look and is worded as a suggestion. It never contains the text to type. Errors are a routine part of the work and should not be presented as failures.

### 3.10 Debrief

Every mission ends with a debrief containing:

- The narrative outcome, including what changed if the player resolved the case after the deadline.
- The player's transmissions beside the mission's reference solution. Highlight a concrete difference where it helps explain the concept, such as which repeated selections a fragment replaces or which input can change without editing the operation. A successful alternative is also worth showing.
- The real geographical fact the mission turned on.
- A concept card for the tradecraft manual when the player earns one.

The tradecraft manual has two parts. Its glossary defines every term the game uses and is available from the start, because a definition is reference material. Its concept cards are earned, one per concept, and summarize what the player has learned to do. Each teaching mission's debrief links to the next available case that practises that concept with new data.

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
- **Evidence reporting.** After executing an operation, the engine reports the facts contained in the result and their response paths. The game engine records those facts and links them to the transmission in the evidence ledger.
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

A mission declares what it teaches, what it practises, what it requires, and its time budget. An assessment mission teaches nothing and lists the concepts it combines under `practises`. A stage declares its clues, scaffold, hint ladder, forms of evidence for each claim, accepted solution, dead ends, and a reference solution. Each evidence set lists facts that must be cited together. In the example, `$shipment`, `$city`, and `$country` refer to the shipment and destination under consideration. The claim checks use those bindings for every lead.

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
      onExpiry: continue
    startingStage: lisbon

    debrief:
      onTime: |
        Your dispatch reaches Luanda in time to hold the shipment.
        The buyer's calling card is now in the case file.
      afterDeadline: |
        The tiles are traced to Luanda. By the time your dispatch
        arrives, the buyer has already collected the crate. The
        records clerk files the route for the next case.

    stages:
      lisbon:
        location: PT
        objective: Identify the shipment carrying the tiles and its destination.

        briefing: |
          A priceless collection of azulejos has vanished from a
          Lisbon museum. Three shipments declared as samples left the
          port that morning. Customs would appreciate a narrower list.

        clues:
          - text: >
              The museum registrar describes blue ceramic squares,
              14 centimetres across.
            constraint:
              manifest: Blue ceramic squares (14 cm)
          - text: >
              An intercepted dispatch says the truck will cross into
              Namibia directly from the country receiving the shipment.
            constraint:
              destinationCountry:
                borders: NA

        scaffold:
          level: guided
          starterQuery: |
            query {
              city(name: "Lisbon") {
                departingShipments {
                  id
                  manifest
                  # Where is each shipment going?
                }
              }
            }

        hints:
          nudge: >
            Some manifests fit the registrar's description. Which
            of those routes fits the intercepted dispatch?
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
          shipment: LIS-0417
          country: AO

        claims:
          - id: manifest
            prompt: The shipment matches the museum registrar's description.
            evidenceSets:
              - facts:
                  - entity: Shipment:$shipment
                    field: manifest
                    equals: Blue ceramic squares (14 cm)
          - id: route
            prompt: The shipment's destination country borders Namibia.
            evidenceSets:
              - facts:
                  - entity: Shipment:$shipment
                    field: destination
                    equals: City:$city
                  - entity: City:$city
                    field: country
                    equals: Country:$country
                  - entity: Country:$country
                    field: borders
                    includes: Country:NA

        deadEnds:
          ZA: |
            The Cape Town harbourmaster opens the crate with some
            ceremony. It contains blue slate, exactly the size on
            the manifest. The tiles in the museum were ceramic.
          CV: |
            The ceramic squares in Praia fit the description. The
            harbourmaster asks to see the truck that can drive from
            an island to the Namibian border.
          default: |
            Nobody here has seen any tiles. The agency has billed
            you for the flight.

        referenceSolution: |
          query {
            city(name: "Lisbon") {
              departingShipments {
                id
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

The countries receiving the Luanda and Cape Town shipments both border Namibia. The Luanda and Praia manifests fit the registrar's description. Only the Luanda shipment satisfies both clues. [Angola’s land borders](https://governo.gov.ao/angola/dados-sobre-o-pa%C3%ADs) · [Cape Town and South Africa’s borders](https://www.gov.za/about-sa/south-africas-provinces) · [Praia and the islands of Cabo Verde](https://www.aai.gov.cv/cabo-verd)

| Shipment | Destination | Manifest | Borders Namibia |
|---|---|---|---|
| LIS-0417 | Luanda, Angola | Blue ceramic squares (14 cm) | Yes |
| LIS-0486 | Cape Town, South Africa | Blue slate squares (14 cm) | Yes |
| LIS-0522 | Praia, Cabo Verde | Blue ceramic squares (14 cm) | No |

The starter query supplies the `name` argument, so the player only has to add nested selections. Arguments are taught at the next clearance level.

The content model should eventually support branching investigations, multiple acceptable solutions, variant pools (Section 3.12), and connections between missions.

Longer narrative content may use Markdown, either embedded in YAML or stored separately.

### 5.5 Data Validation

A build-time validation process should check:

- **Structure:** Mission definitions have the required fields.
- **References:** Geographical entities, operatives, organizations, stages, missions, and campaigns that are referred to all exist.
- **Reachability:** Every stage can be reached and every mission has a terminal outcome.
- **Uniqueness:** The machine-verifiable clues of a stage identify exactly one solution among the candidates the data offers. For the Azulejos opening, each clue must also leave at least one wrong lead plausible on its own. Where reports conflict, the corroborating data settles the conflict.
- **Evidence:** Every authored evidence set is retrievable at the mission's clearance. For each claim, the tests accept every complete set, allow extra citations, and reject incomplete sets or facts from unrelated leads unless the cited facts form another complete set.
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
- **Make wrong leads plausible.** A plausible wrong lead fits at least one clue. Give players a way to disqualify it from query results before traveling, and explain the mistake in its dead-end scene.
- **Write a fresh assessment case.** Change the evidence or relationships enough that a player has to decide which fields to retrieve. Keep the goal clear and leave the editor blank.
- **Run the queries before writing the text.** Briefings, clues, hints, and dead ends must describe what the engine actually returns. Text written from expectation is the most common source of broken missions.
- **Introduce a term before using it.** Otherwise link its glossary entry.
- **Say what to change.** A starter query marks the part the player is meant to complete.
- **Write for an intelligent player.** Copy is short and concrete. The cast may be dry, but there is no tutorial chatter and no motivational filler.

Missions are discovered from the content directory. There is no separate list of missions to keep in step with the files.

## 6. Interface Design

### 6.1 GraphQL Execution Interface

The application will expose a local execution interface to the editor and game engine.

It takes an operation, its variables, and the player's clearance level. It returns the standard GraphQL result together with the facts that result contains and their response paths.

Operations should support normal GraphQL functionality, including schema validation, variables, fragments, aliases, directives, and introspection, within the schema for the given clearance.

The implementation should preserve ordinary GraphQL result and error semantics. Error annotations are produced separately by the feedback system and never replace or reword the original errors.

### 6.2 Game Engine Interface

The game engine will receive player actions, update investigation state, and report outcomes.

Actions:

- Transmit a query. This spends time while the clock is active and adds facts to the evidence ledger.
- Pin or unpin evidence.
- Examine a dossier, report, or the schema documentation. This is free.
- Request a hint.
- View the stage's solution.
- Travel to a destination, citing pinned evidence for the lead.
- Submit a deduction, citing pinned evidence.
- Apply for a warrant, citing pinned evidence.
- Let the deadline pass, or restart the investigation.

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

It builds a schema for each clearance level from clearance annotations on the schema definition. After execution, it walks the result using the schema's type information and reports each entity field and relationship it contains as a fact, with its response path. It marks a returned list as complete only when the field returns the full collection without filtering, pagination, or errors affecting that list.

Potential considerations include query complexity limits, execution timeouts, and Web Workers to avoid blocking the interface.

### 7.3 Content System

Responsible for loading declarative missions, briefings, dialogue, hints, dead ends, and other narrative material, along with each mission's curriculum metadata and any variant pool.

The system should make it practical to add new missions without implementing new application logic.

### 7.4 Progress System

Responsible for recording completed missions, the help used, and whether completion was after the deadline. For investigations in progress, it records deadline state, the evidence ledger and pins, their source transmissions, and the editor's contents for each stage. It also stores the player's preferences.

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

**Mission Selection:** Available assignments, the clearance each requires, the concept each teaches, and campaign progress. For completed assignments, show the help used and whether the case was resolved after the deadline.

**Mission Briefing:** Classified narrative introduction, objectives, and initial intelligence.

**Intelligence Terminal:** GraphQL editor, schema documentation for the player's clearance, query results with pin controls, error annotations, hints, and current location. The clock shows remaining hours or that the investigation is continuing untimed.

**Evidence Board:** The evidence ledger and pinned facts, with links back to their query results. Deduction and warrant forms show the claims and their citations. Travel uses the same evidence form.

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

- **Unit tests:** GraphQL resolvers, mission transitions, evidence recording and source links, and claim evaluation. Verify that missing citations cost no time, committed dead ends spend the quoted cost, a final-hour action resolves before expiry, and a solution reveal is free after expiry.
- **Schema tests:** Each clearance level exposes exactly its intended types and fields, including through introspection. Classified records return partial data with errors.
- **Content tests:** The validation checks of Section 5.5, run against every mission. These recompute what a mission asserts from the data and do not trust the authored answer.
- **Integration tests:** Execute representative GraphQL operations against actual game data.
- **Persistence tests:** Saved data from an older format version, a changed mission, and unavailable storage are each handled as Section 7.4 describes.
- **End-to-end tests:** In the Azulejos case, commit to a wrong lead, read the feedback, correct the deduction, complete the mission, and reload to confirm that progress survived. In a separate run, let the deadline pass, reload, and check that the retained evidence and draft support a successful late completion with its own debrief.

Every authored mission must include a reference solution. Continuous integration plays each mission using its reference solution and fails if the mission cannot be completed within its clock.

The test suite gates deployment. A build that fails any test or validation check is not published.

### 10.1 Playtesting

Use automated tests to check solvability and browser-agent reviews to check what the game communicates on screen. Run both agent reviews before a mission ships.

- **Clean-room solve:** An agent that can only operate the page, starting from a verified empty save, solves the mission without taking a hint. For each step it lists the on-screen material that justified it. This answers one question: can the mission be solved from what the game shows?
- **Novice walkthrough:** An agent plays in the persona of the audience described in Section 1.2. It records numbered points of confusion, each with where it happened and what would have helped, and reports where it stopped understanding and began matching patterns. Every point is either fixed or logged with a reason, and the walkthrough is then run again.

The agents are given a self-contained prompt and no knowledge of how the game is built. A reviewer who knows the answer is not a fair test of what the game teaches.

Once the first mission is playable, observe a few people who know JSON and are new to GraphQL before expanding the campaign. Record by hand where they get stuck, whether they can explain how the two clues support their destination, and which moments they remember. Ask whether they would choose to play another case and why. Give each player a short follow-up case with different data and a blank editor. Observe whether they can write a nested selection and explain how its result supports the new deduction. Use these sessions to tune the deadline, citation feedback, and starter query before authoring the remaining clearance levels.

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
- Load *The Vanishing Azulejos* with several stages and a plausible wrong lead in the opening.
- Let players pin evidence from query results, trace it back to the source, and cite it against plain-language claims.
- Implement the mission clock, evidence feedback, destination selection, and dead ends. Support an untimed continuation and a free solution reveal after the deadline.
- Validate that the two clues together identify one shipment and that each clue alone leaves more than one. Run the mission's reference solution in tests.
- Introduce an intelligence briefing and basic dossier interface.
- Add the guided starter query and a basic debrief that explains the query and shows the on-time or late outcome.
- Persist progress, source transmissions, and editor drafts in versioned saves.
- Run end-to-end tests for recovering from a wrong deduction and finishing after the deadline.
- Observe beginners playing the mission and a short follow-up case with a blank editor, using the findings to refine the first mission.

**Success criterion:** A player can use GraphQL to compare plausible leads and solve a complete international mystery, including after the first mission's deadline. Beginner playtests show whether players can explain their deductions and use nested selections in a fresh case.

### Milestone 3 — Educational MVP

- Author teaching and assessment missions covering clearance levels 1 through 5, from nested selections to variables. Give each feature a visible payoff and test it again in a different case with a blank editor.
- Implement clearance, promotion, and clearance-scoped schemas.
- Add schema documentation, scaffolding throughout the course, the hint ladder, and error annotations. Make the solution reveal available in every mission.
- Add the orientation and the tradecraft manual with its glossary. Extend the debrief to compare the player's approach with the reference solution and point to a follow-up case.
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
2. **Evidence authoring:** How many independent sources should later missions offer for the same claim?
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

**Transmission:** One executed GraphQL operation. A transmission spends time while the mission clock is active.

**Mission Clock:** The budget of hours a mission allows, spent by transmissions, travel, hints, and mistakes.

**Evidence:** A fact that has appeared in one of the player's query results.

**Evidence Ledger:** The record of all evidence gathered during a mission.

**Deduction:** A conclusion the player submits, citing pinned evidence.

**Warrant:** An application to arrest a named operative, supported by cited evidence.

**Clearance:** The player's rank, which determines the missions available and the schema visible.

**Learning Objective:** The GraphQL concept a mission is designed to teach.

**Reference Solution:** An authored set of operations that solves a stage. It is used for testing, for the solution reveal, and for the debrief.

**Solution Reveal:** The step beyond the hint ladder, which shows the reference solution.

**Completion Mode:** The help used during an attempt that resolved the case, recorded as independent, hinted, or solution-revealed.

**Assessment Mission:** The mission that ends a clearance level. It starts with a blank editor and asks the player to apply familiar concepts to a fresh case.

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
