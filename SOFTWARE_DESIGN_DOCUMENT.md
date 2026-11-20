# WhereQL — Software Design Document

**Status:** Draft
**Version:** 0.2
**Last updated:** November 20, 2026

## 1. Introduction and Overview

### 1.1 Purpose

WhereQL (working title) is a browser-based educational espionage game that teaches GraphQL through interactive geographical mysteries and intelligence investigations.

Inspired by the globe-trotting educational gameplay of *Where in the World Is Carmen Sandiego?* and the early espionage novels of Ian Fleming, the game combines real-world geography, fictional international conspiracies, and a distinctive Cold War intelligence aesthetic.

Players assume the role of intelligence operatives investigating crimes, tracking suspects, and uncovering clandestine organizations. Their primary investigative tool is a GraphQL-powered intelligence terminal.

The game should make learning GraphQL feel like conducting an international intelligence operation rather than completing conventional programming exercises.

### 1.2 Goals

- Teach GraphQL progressively, from basic queries to advanced features such as variables, fragments, and nested relationships.
- Encourage exploration, deduction, and independent problem-solving rather than reproducing predetermined queries.
- Incorporate real geographical facts, providing incidental geography education.
- Create a memorable atmosphere inspired by mid-20th-century espionage fiction, balancing intrigue with understated humor.
- Operate entirely client-side, with static hosting through GitHub Pages.
- Support easily authored, version-controlled missions that can be added without modifying application code.
- Remain approachable for beginners while offering interesting challenges for experienced developers.

### 1.3 Non-Goals

At least initially, the project will not require:

- User accounts, authentication, or multiplayer functionality.
- A backend API, hosted database, or server-side GraphQL execution.
- Real-time geographical or economic data.
- Sophisticated procedural mystery generation.
- Comprehensive coverage of every GraphQL feature.
- Combat, action sequences, or complex character movement.

## 2. Creative Direction and Narrative Design

### 2.1 Setting and Atmosphere

WhereQL takes place in a fictional international intelligence agency, drawing stylistic inspiration from the Cold War era of the 1950s and 1960s.

Its visual and narrative vocabulary includes classified dossiers, intelligence briefings, vintage cartography, diplomatic intrigue, coded messages, secret organizations, and international travel.

The aesthetic should evoke the early Ian Fleming novels rather than the gadget-heavy spectacle of later spy films.

The setting need not be historically literal. A deliberately anachronistic GraphQL intelligence terminal can coexist with typewriters, rotary telephones, and mid-century office furnishings.

### 2.2 Tone

The narrative should balance three qualities:

- **Espionage intrigue:** Missions involve genuine mysteries, conflicting evidence, hidden relationships, and consequential deductions.
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

## 3. System Architecture

### 3.1 Overview

The application will be a static web application bundling a GraphQL execution engine, geographical and fictional intelligence data, and declarative game content.

All query execution and game-state management will occur within the player's browser.

Major subsystems:

1. **Game UI:** Displays briefings, dossiers, clues, maps, query results, and investigation progress.
2. **GraphQL Engine:** Parses, validates, and executes genuine GraphQL queries against local data.
3. **World Data:** Provides factual geographical entities and relationships.
4. **Intelligence Data:** Provides fictional operatives, organizations, incidents, and other investigative entities.
5. **Game Engine:** Manages missions, stages, player decisions, and completion conditions.
6. **Content Loader:** Loads and validates declarative mission definitions.
7. **Persistence:** Stores local game progress.

The GraphQL engine should remain independent of game presentation so the same schema can support different missions and game mechanics.

### 3.2 Technology Considerations

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
| Progress storage | localStorage or IndexedDB |
| Hosting | GitHub Pages |

These are initial preferences, not final implementation decisions.

## 4. Data Design

### 4.1 World Data

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

### 4.2 Intelligence Data

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
- Intelligence report

These entities should connect naturally to geographical data and to one another.

For example, an operative may have several aliases, belong to an organization, maintain known associates, and have a history of visiting particular countries.

The intelligence graph should support increasingly sophisticated investigations without requiring a fundamentally different GraphQL interface.

### 4.3 GraphQL Schema

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

Schema design should balance educational usefulness, realism, discoverability, and implementation simplicity.

The schema will evolve as new missions introduce additional entities, relationships, and GraphQL features.

### 4.4 Mission Definitions

Missions should be declarative and stored as human-readable YAML files in version control.

Each mission contains one or more stages. A stage represents an investigation objective, usually associated with a location.

Illustrative structure:

    id: vanishing-azulejos
    title: The Vanishing Azulejos
    difficulty: beginner
    campaign: shadow-network
    startingStage: lisbon

    stages:
      lisbon:
        location: PT
        objective: Find the thief's destination.

        briefing: |
          A priceless collection of Portuguese
          tiles has disappeared from Lisbon.

        clues:
          - The suspect speaks Portuguese.
          - The destination is in Africa.

        hints:
          - Investigate countries and languages.

        solution:
          type: destination
          country: AO

        next: luanda

The content model should eventually support branching investigations, multiple acceptable solutions, optional GraphQL learning objectives, and connections between missions.

Longer narrative content may use Markdown, either embedded in YAML or stored separately.

### 4.5 Data Validation

A build-time validation process should check:

- Mission definition structure and required fields.
- References to geographical entities, operatives, organizations, and stages.
- Reachability of stages and existence of terminal outcomes.
- Consistency between clues and expected solutions, where clues are machine-verifiable.
- Valid references between missions and campaigns.

## 5. Interface Design

### 5.1 GraphQL Execution Interface

The application will expose a local query-execution interface to the editor and game engine.

Queries should support normal GraphQL functionality, including schema validation, variables, fragments, aliases, and introspection.

The implementation should preserve ordinary GraphQL result and error semantics.

### 5.2 Game Engine Interface

The game engine will receive player actions, update investigation state, and report outcomes.

Typical actions include:

- Execute an intelligence query.
- Examine a dossier or report.
- Request a hint.
- Select a travel destination.
- Identify an operative.
- Submit a deduction or request an arrest warrant.

**Query validation and puzzle validation must remain distinct.** A syntactically valid query does not necessarily solve a puzzle, and multiple different queries may support the same correct deduction.

Missions should generally evaluate the player's conclusions rather than require an exact query string. Explicit GraphQL syntax challenges may optionally inspect the query's abstract syntax tree.

## 6. Component Design

### 6.1 Investigation Engine

Responsible for mission progression, clue availability, travel decisions, and success or failure conditions.

Each mission may be modeled as a small state machine whose transitions depend on player decisions.

Campaign-level state may track recurring suspects, discoveries, or narrative developments across multiple missions.

### 6.2 GraphQL Runtime

Responsible for executing user-authored queries against local geographical and intelligence data.

Potential considerations include query complexity limits, execution timeouts, and Web Workers to avoid blocking the interface.

### 6.3 Content System

Responsible for loading declarative missions, briefings, dialogue, and other narrative material.

The system should make it practical to add new missions without implementing new application logic.

### 6.4 Progress System

Responsible for recording completed missions, current investigations, and potentially achievements, agent ranks, or scores.

Persistence should work without registration or a network connection.

## 7. User Interface Design

### 7.1 Visual Direction

The interface should evoke a mid-century intelligence headquarters adapted to a modern browser.

Potential visual elements include:

- Classified document folders and stamped case files.
- Vintage maps, travel posters, and geographical illustrations.
- Typewriter-inspired typography for narrative elements.
- Monochrome or restrained-color intelligence terminals.
- Passport stamps, dossier photographs, and agency insignia.

The actual GraphQL editor should prioritize modern usability, readability, and accessibility over strict historical authenticity.

Visual embellishments should support immersion without obstructing query composition or investigation.

### 7.2 Core Gameplay Loop

1. Receive a classified mission briefing.
2. Examine available clues and intelligence reports.
3. Investigate using GraphQL queries.
4. Interpret the returned data.
5. Make a deduction or travel decision.
6. Receive additional intelligence or consequences.
7. Repeat until the mission is resolved.

### 7.3 Primary Screens

**Mission Selection:** Available assignments, difficulty levels, agent rank, and campaign progress.

**Mission Briefing:** Classified narrative introduction, objectives, and initial intelligence.

**Intelligence Terminal:** GraphQL editor, schema documentation, query results, clues, and current location.

**World Map:** Visualizes geographical locations and supports travel decisions.

**Operative Dossiers:** Displays known suspects, aliases, associations, and collected evidence.

**Mission Resolution:** Displays the outcome, narrative consequences, and learning achievements.

### 7.4 Educational Experience

The game should gradually introduce more advanced GraphQL concepts while preserving player agency.

Hints should provide progressively greater assistance without immediately revealing solutions.

The interface should make GraphQL errors understandable and encourage experimentation.

Potential future features include query history, schema exploration, query efficiency scoring, optional tutorials, and agent promotions.

## 8. Assumptions, Dependencies, and Constraints

- GitHub Pages can serve all required application assets.
- Geographical and intelligence data can be bundled in a reasonably sized static distribution.
- GraphQL.js provides the required client-side execution functionality.
- Source datasets and assets must be checked for licensing and attribution requirements.
- The application should work offline after its required assets have been cached, if offline support is implemented.
- Because game logic and answers reside client-side, determined players can inspect them. Preventing cheating is not a primary objective.
- Accessibility and keyboard navigation should be considered throughout development.
- Fictional intelligence content should remain sufficiently distinct from existing protected characters, organizations, and stories.

## 9. Testing Strategy

Testing should prioritize deterministic game behavior and content correctness.

Suggested coverage:

- **Unit tests:** GraphQL resolvers, mission transitions, and solution validation.
- **Content tests:** Schema validation, references, mission integrity, and campaign relationships.
- **Integration tests:** Execute representative GraphQL queries against actual game data.
- **End-to-end tests:** Complete an investigation through the browser UI.

Every authored mission should ideally include a test demonstrating that it can be solved using the available data.

## 10. Initial Development Milestones

### Milestone 1 — Technical Prototype

- Render a basic GraphQL editor.
- Execute real queries locally.
- Load a small geographical dataset.
- Display results and errors.

**Success criterion:** A player can query geographical data without a backend.

### Milestone 2 — First Playable Mission

- Implement a mission definition format.
- Load one espionage-themed investigation with several stages.
- Support clues, destination selection, and completion.
- Introduce an intelligence briefing and basic dossier interface.
- Persist basic progress.

**Success criterion:** A player can solve a complete international mystery using GraphQL.

### Milestone 3 — Educational MVP

- Introduce progressively harder missions.
- Add schema documentation and contextual hints.
- Incorporate a world map and Cold War–inspired visual design.
- Introduce recurring characters or a simple campaign.
- Add automated mission validation.
- Deploy publicly through GitHub Pages.

**Success criterion:** A beginner can learn several fundamental GraphQL concepts through an engaging, self-directed espionage adventure.

## 11. Open Questions

The following decisions are intentionally deferred:

1. **Audience:** Should the game assume prior programming experience, or teach GraphQL to complete beginners?
2. **Setting:** Should the fictional world explicitly take place during the Cold War, or use a deliberately anachronistic, timeless espionage setting?
3. **Progression:** Should missions follow a fixed sequence, or can players choose freely?
4. **Game mechanics:** Should time, travel costs, incorrect guesses, or query efficiency affect scoring?
5. **Query requirements:** How much should exercises constrain GraphQL syntax versus evaluate deductions?
6. **Data scope:** What is the smallest geographical and intelligence dataset capable of supporting compelling mysteries?
7. **Narrative format:** Should missions use YAML exclusively, or combine YAML with Markdown?
8. **Replayability:** Should later versions support procedurally generated investigations?
9. **Offline support:** Is full offline functionality an MVP requirement or a later enhancement?

## 12. Glossary

**Campaign:** A sequence of related missions forming a larger narrative.

**Mission:** A complete intelligence investigation comprising one or more stages.

**Stage:** An investigation objective within a mission.

**Clue:** Information used to narrow possible solutions.

**World Data:** The factual geographical dataset exposed through GraphQL.

**Intelligence Data:** Fictional entities and relationships used to construct espionage mysteries.

**Game State:** The player's current investigation, discoveries, decisions, and progress.

**GraphQL Kata:** An educational exercise designed to develop GraphQL proficiency.

## 13. References

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

*This document is intended to evolve alongside the project. Architectural details, technology selections, narrative systems, and content models should be refined through working prototypes rather than finalized prematurely.*
