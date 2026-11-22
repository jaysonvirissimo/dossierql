# DossierQL — Software Design Document

**Status:** Draft
**Version:** 0.9
**Last updated:** November 22, 2026

## 1. Introduction and Overview

### 1.1 Purpose

DossierQL is a browser-based educational espionage game that teaches GraphQL through interactive geographical mysteries and intelligence investigations.

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
- Procedurally generated investigations, now or later. Every case is authored, so that its queries can be run before its text is written, its reference solution can be checked, and the mission can be playtested. Seeded variants of hand-authored missions (Section 3.12) are in scope after the MVP.
- Comprehensive coverage of every GraphQL feature. Subscriptions and schema authoring are out of scope.
- Combat, action sequences, or complex character movement.
- Real-time pressure. The mission clock counts game hours, and nothing in the game is timed against a real clock.
- Telemetry or analytics.

## 2. Creative Direction and Narrative Design

### 2.1 Setting and Atmosphere

DossierQL takes place in a fictional international intelligence agency whose style is drawn from the Cold War era of the 1950s and 1960s.

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

A campaign's arc can end in a **coda**: one short, untimed stage that follows the last case and is not counted among the cases (Section 5.4). The first campaign ends this way. The tiles are back in Lisbon, and the museum's registrar needs a signature on the receipt before the gallery can reopen. The player pulls the receipt and follows it through two sets of records. The Parallax Circle's payment orders and the crate's transfers lead back to one authorizing desk. The agency's own travel orders, the ones that sent the player from city to city, were issued by the same desk. The desk authorized the crate to leave Lisbon before the registrar reported it missing, and the record shows that the registrar objected.

The coda establishes that one fact and no more. It does not identify the adversary, and it leaves open who gave the desk that authority. The desk's reason is credible and insufficient: letting the crate go was the only way to bring the Circle's paper accounts into the open. The tiles were real and the registrar had something to lose. The coda ends at the museum, with the receipt's *Released by* box still empty. A later arc should end the same way, with an answer that makes the remaining question harder.

Because missions avoid dates (Section 2.1), the coda shows that one order came before another by the serial numbers of a register, not by a date.

All characters, agencies, organizations, and storylines will be original creations. References to the game's creative influences must not imply affiliation with the owners of the source franchises.

### 2.4 Recurring Cast

A small recurring cast gives the game's systems a voice.

- **The records clerk** runs the archive behind the terminal. The clerk annotates GraphQL errors, delivers hints, and returns malformed requests unprocessed. The clerk is weary and precise, never mocking. In the coda (Section 2.3) the clerk turns out to have countersigned and filed both sets of orders, as the functionary who processes whatever the desk sends down. The clerk did not write the orders and is not the adversary. The clerk goes on teaching afterward, so nothing in the story may give the player a reason to distrust a hint or an annotation.
- **The adversary** is a recurring figure in the campaign's criminal organization who leaves notes, narrowly escapes, and gives the player someone to pursue across missions. In the first campaign the adversary signs notes with the letter M. M's last note is what sends the player to the receipt. M is still at large and unidentified when the campaign ends.
- **The bureaucracy** grants clearance, approves or rejects warrants, and bills travel. It explains the game's rules in the form of regulations.

## 3. Game and Learning Design

This section describes how the game plays and how it teaches. Later sections describe the systems that support it.

### 3.1 Core Gameplay Loop

1. Receive a classified mission briefing.
2. Query the intelligence terminal.
3. Read the results and compare leads. Every fact returned is recorded as evidence.
4. Cite relevant findings from the results. Compare what each lead explains and what it leaves open.
5. Rule out a lead, submit a deduction, travel, or apply for a warrant using the evidence you gathered.
6. Read the dispatch or decision that follows, then follow the next lead.
7. Repeat until the mission is resolved, then read the debrief.

### 3.2 Evidence

The player's conclusions must rest on what their queries returned.

The game records every fact that appears in a query result in an **evidence ledger**. A fact is a field value of an entity, or a relationship between two entities. A fact can appear in multiple responses and keeps its identity across queries.

Players can cite a finding in the open draft directly from the results or the ledger. They can also pin evidence in the ledger to keep it at hand. Result rows offer Cite alone, so that the one action a case requires is the only one beside each finding. A single citation can carry a connected chain of facts. When the player cites a row from deep inside a response, the citation carries every fact on the path to that row that an evidence set of the stage can use for the citation's lead. One click therefore never leaves out the link between a finding and the record it was found under, such as the link between a sighting and the city where it was filed. A fact on the path that is evidence about a different lead is not carried, so that citing one lead's row never cites what the response says of another lead. The Cite control shows which lead's draft the citation will enter. A row beneath a lead enters that lead's draft. A row that is evidence about the lead whose draft is open enters the open draft wherever the row sits in the response. For example, a list of associates that a clue refers to enters the draft of whichever listed associate the player has open. In the Lisbon opening, **Cite cargo** attaches the manifest and **Cite route** attaches the shipment → city → country → border chain. Each fact in a citation remains inspectable and links back to its source response. The player chooses which findings to attach and can remove them.

Deduction, travel, and warrant forms present the claims the player must support in plain language. A stage defines at least two sufficient sets of facts for each claim, reached through different records, so that no claim depends on the player finding one particular field. A claim is supported when its citations contain any one complete set. Extra citations are allowed. Facts in a set must refer to the lead under consideration. For example, a shipment's destination and the destination country's border must form a connected chain.

The draft shows which claims the citations support and which still need evidence. Under each claim it lists the cited facts that count toward that claim. When a claim is partly supported, the draft says which of two things is wrong: the cited facts do not connect to each other, or they connect and a fact is still missing. Where the form also asks the player to choose a record, such as a destination country, the draft says so when the cited facts connect to each other and do not lead to the record chosen. The draft does not say which fact is missing, because that would give away the evidence route. Hints do that, at their price (Section 3.9). Unrelated citations receive feedback before any time is spent. A cited refutation identifies the claim and its conflicting evidence. An absent entry can refute a claim about a list only when the player retrieved the complete list without an error. A deduction is accepted when the conclusion is correct and all required claims are supported. Travel that advances the investigation meets the same standard. A field check can investigate a lead whose case is still incomplete (Section 3.5).

Every puzzle should depend on fictional intelligence data, such as shipments, aliases, and transactions, that no player can know in advance. Real geography then narrows the possibilities. For example, an intercepted shipment leads to a city, and the city's country must satisfy a geographical clue.

### 3.3 The Mission Clock

Each mission has a budget of hours. Actions spend it while the clock is active.

| Action | Provisional cost |
|---|---|
| Transmission (one executed query or mutation) | 1 hour |
| Travel or field check | Several hours, depending on distance |
| Hint | 1 to 8 hours, rising with each step of the hint ladder |
| Solution reveal | More than all the hints together |
| Rejected warrant | Several hours |

The clock exists to teach GraphQL's central idea. One nested query costs the same as one flat query, so a player who asks for everything they need in a single transmission is rewarded.

The clock counts game hours only. The player may take as long as they like over any decision, and the cost of an action is shown before the player commits to it. The briefing names the event the deadline represents, and the terminal counts down to it. In the Azulejos case, it reads “Buyer collects the crate in 6 hours” when six hours remain.

A mission's budget is computed, not chosen by hand. It follows the reference solution through every stage and adds three amounts: the hours the solution spends travelling, the hours it spends on transmissions multiplied by a factor, and the cost of one complete hint ladder. The total is rounded up to a whole hour.

| Mission | Factor |
|---|---|
| Teaching mission at clearance 1 or 2 | 4 |
| Assessment mission at clearance 3 or above | 2 |
| Any other mission | 2.5 |

Travel is counted once, because a journey cannot be made more or less economically, and multiplying it would hide the difference between one nested query and several flat ones. The factor is the room left for exploration. The hint ladder is included so that a player who climbs it at the hardest stage and solves the rest economically still finishes in time. Because the budget follows the reference solution, it stays correct when a mission changes.

The clock must not discourage experimentation:

- Queries that fail validation are returned by the records clerk before transmission and cost nothing.
- Browsing schema documentation and the evidence ledger, drafting citations, and ruling out a lead with retrieved evidence are free.
- Budgets leave room for exploration, most of all in the onboarding missions.
- Training drills (Section 3.14), katas (Section 3.11), and a campaign's coda (Section 2.3) have no clock.

An action that uses the last available hour resolves before the clock expires. If an action costs more than the time remaining, show the shortfall and let the player choose to let the deadline pass.

In the first mission, the buyer collects the crate at the deadline and the player can continue untimed from their current stage. The game keeps their evidence, pins, transcripts, drafts, and ruled-out leads. A late completion still requires a supported deduction. The debrief records who authorized the transfer and that the tiles have moved on. The player can also restart. In later missions, the deadline ends the attempt and the player can restart. The current stage's solution becomes free to view once the deadline passes in either case (Section 3.9).

A flat cost for each transmission leaves one habit unpriced, which is asking for far more than the case needs in a single request. Through the MVP, a small schema and a limit on nesting depth keep that habit harmless. After the MVP (Section 11), the records clerk also weighs each request.

**Request weight** is the number of records a request could return, computed from the request before it is transmitted. A list counts for the page size the request asks for, or for the list's declared maximum when it asks for none.

Weight arrives in two steps, so that the player has read the number before it constrains them:

- From clearance 6, every result states the weight of its request in `extensions`, and nothing depends on it.
- From clearance 8, the clerk refuses a request above the weight limit. Like a query that fails validation, it is returned before transmission and costs nothing. The refusal states the request's weight and the limit.

Weight is a limit and never a price. A transmission under the limit costs one hour whatever it weighs, so one nested query still costs the same as one flat query, and hours remain the only thing the player spends. Budgets are computed as before. The limit follows the clearance in force (Section 3.8), as the schema does, and every reference solution must fit under it (Section 5.5).

There is no numeric score in the MVP, and request weight does not become one. The costs and factors in the two tables, the weight limit, and the way weight is counted are provisional. Playtesting tunes those numbers and never the budget of an individual mission. The tuning waits for the sessions with beginners (Section 10.1). Hours left over by a player who already knows GraphQL do not show how much room a beginner needs.

### 3.4 Warrants

Missions that end with an arrest require a warrant. The player names an operative and cites evidence for each claim the warrant makes, such as an alias link or presence at the scene.

The bureaucracy returns missing or unrelated citations for correction. Once a warrant is submitted, a rejection costs time. Warrants are introduced after destination missions, once the player is comfortable gathering evidence. They arrive after the MVP (Section 11).

### 3.5 Failure and Dead Ends

Give players a credible reason to investigate a wrong lead and let them examine leads in any order. A player who cites a refutation can mark that lead **Ruled out** without spending mission hours. File a short dispatch that acknowledges what made the lead plausible and points to the fact that rules it out. Keep the lead and its citations available for review.

Before travel, show the cost and any claims that still need evidence. When a mission offers a **field check**, a player with at least one supported claim, at least one unverified claim, and no cited refutation can choose to spend the quoted travel hours on a provisional lead. The field check returns a dispatch and leaves the player at the same stage with their evidence intact. A wrong lead gets a dead-end dispatch that explains the gap. A viable lead can receive a provisional acknowledgement. These dispatches point back to the archive so the player can verify the lead with GraphQL.

### 3.6 Unreliable Sources

Intelligence reports carry a source and a reliability grade. Later missions include reports that conflict, and the player resolves the conflict by corroborating one account against other data.

A mission with conflicting reports must contain enough corroborating data to settle the conflict in favor of a single answer.

Conflicting reports arrive after the MVP (Section 11).

### 3.7 Curriculum

Concepts are introduced in a fixed order. Each is tied to a clearance level and to a story situation that makes the concept the natural tool.

| Clearance | Concept | Story reason | Scope |
|---|---|---|---|
| 1 | Fields and nested selections | Trace shipments to countries and borders, then find the signer of the order that matches a replacement label | MVP |
| 2 | Arguments | Pull one operative's file instead of the whole registry | MVP |
| 3 | Aliases | Call the same dossier field with two suspect IDs and compare the named results side by side | MVP |
| 4 | Fragments | Keep the same fields in a suspect's dossier and in nested dossiers for their associates by writing the selection once | MVP |
| 5 | Variables | Carry a query into a second city and change its input in the variables panel | MVP |
| 6 | Introspection | Explore a newly seized archive that has no documentation | Later |
| 7 | Unions and inline fragments | Read a case file whose records are of mixed kinds | Later |
| 8 | Pagination | Work through surveillance logs too heavy for the records clerk to release in one request | Later |
| 9 | Directives | Request costly detail only when a standing query needs it | Later |
| 10 | Mutations | File travel orders and warrants through the terminal | Later |

Exploring a schema is taught from the first mission, through the documentation panel. Writing introspection queries by hand waits for clearance 6, where an undocumented archive gives the player a reason to.

Request weight (Section 3.3) is not a concept of its own. It is the story reason for pagination. The weight limit comes into force at clearance 8, where the surveillance logs exceed it and paging is the tool that brings a request under it. Directives practise the same economy at clearance 9, where `@include` and `@skip` drop heavy detail from a standing query that does not need it.

Each mission declares the concept it teaches, the concepts it practises, and the concepts it requires. The course as a whole follows four rules:

- A mission teaches at most one new concept. If two concepts will not separate, a mission is missing.
- A mission may only require concepts taught at or below its clearance level.
- Every concept is practised in at least one mission after the one that teaches it.
- Each clearance level ends with an **assessment mission**. It teaches nothing new, starts with a blank editor, and uses a different case and data to see whether players can apply the concepts learned so far.

The curriculum governs what is taught and what a mission needs. It does not restrict what the terminal accepts: any valid GraphQL that the player's schema supports will execute at any time.

Give the target feature a visible payoff during the case. Aliases save a transmission, fragments save duplicate selections that would need to stay in sync, and variables let the player reuse the operation when the input changes. The assessment gives players a fresh reason to use the same technique. The game accepts any query that yields sufficient evidence.

### 3.8 Clearance and Progression

Clearance is the player's rank. It is one more than the highest level whose assessment mission the player has passed, so a new player holds clearance 1.

Clearance controls two things:

- **Mission availability.** The first two clearance levels form a short linear onboarding. After that, the player may choose any mission at or below their clearance. Assessment missions are the exception, as described below.
- **The visible schema.** Types and fields above the clearance in force are absent from the schema and from introspection. A beginner sees a small schema that grows with each promotion.

A player who already knows some GraphQL can skip ahead by **placement**. The assessment mission of any level can be attempted at any time, including during onboarding. Teaching missions above the player's clearance stay locked, so the order of the course still holds for anyone who follows it.

An assessment is passed in any completion mode (Section 3.9) when the player holds its clearance and has completed the teaching mission of its level. Any other attempt is a placement, and it is passed only if the player has never viewed a solution for that mission, in this attempt or an earlier one, because the player has not played the missions that teach its concepts. A pass by placement grants the concept cards for that level and the levels it skips, and makes their missions available.

A placement pass shows that the player solved the case. It does not show which technique they used, because the game accepts any query that yields sufficient evidence (Section 3.7). A player can pass the aliases assessment with three separate requests. When a placement is passed without the technique its level teaches, the debrief says so plainly and offers that level's kata (Section 3.11). The promotion stands.

The clearance in force during a mission is the higher of the player's clearance and the mission's, and the terminal uses the schema for it. An assessment attempted early therefore has every type and field it needs.

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

Each completed mission records how much help the player used during that attempt as its **completion mode**. The modes are independent, hinted, and solution-revealed. All three count as completing the mission, including a completion after the first mission's deadline, and all three pass an assessment that is not a placement (Section 3.8). The mission list shows the help used and whether the investigation finished after the deadline. The player can investigate again for a different result.

The interface should make GraphQL errors understandable. The original error is always shown unaltered, and the records clerk adds a plain-language annotation beneath it. An annotation says where to look and is worded as a suggestion. It never contains the text to type. Errors are a routine part of the work and should not be presented as failures.

### 3.10 Debrief

Every mission ends with a debrief containing:

- The narrative outcome, including what changed if the player resolved the case after the deadline.
- The player's transmissions beside the mission's reference solution. Highlight a concrete difference where it helps explain the concept, such as which repeated selections a fragment replaces or which input can change without editing the operation. A successful alternative is also worth showing.
- The real geographical fact the mission turned on.
- A concept card for the tradecraft manual when the player earns one.

When the debrief comments on the player's technique, it reads the parsed query, never the typed text, so that a comment or a string cannot count as use of a feature. It reads only the transmissions that supplied the facts the player cited. The comment describes what the player did and never changes whether the case is solved. Where the level has a kata, the debrief links to it.

The tradecraft manual has two parts. Its glossary defines every term the game uses and is available from the start, because a definition is reference material. Its concept cards are earned, one per concept, by completing the mission that teaches the concept or by placement (Section 3.8). They summarize what the player has learned to do. Each teaching mission's debrief links to the next available case that practises that concept with new data.

### 3.11 Katas

A GraphQL kata is an optional drill outside the story, offered in a training range with no clock and no narrative stakes.

A kata tests whether a technique transfers to records the player has not seen. It is passed by a transmission that returns the facts the kata expects and has the structure the kata asks for. Katas are the only place where the structure of a query decides a pass, for example to confirm that a fragment was used. Missions and training drills (Section 3.14) never judge structure. The debrief inspects structure only to describe it (Section 3.10).

A kata uses the drill screen (Section 3.14), with a variables panel and the schema of the clearance the kata belongs to. Passing one earns no clearance and no concept card.

Three katas arrive with 1.0 (Section 11), one for each technique that a case can be solved without:

- **Aliases:** combine two lookups into one transmission.
- **Fragments:** add a field in one place so that it appears on every record that shares the selection.
- **Variables:** reuse an operation for a different city by changing only the JSON input.

Katas for the other concepts arrive after 1.0. So do exercises that ask the player to predict a response before sending the request, which need an interaction the game does not yet have.

### 3.12 Replay

After the MVP, a mission may define a pool of variants, such as different culprits, routes, and shipments. The game selects one by seed when the mission starts.

Every variant is authored and validated in advance. This gives replay value and makes answers harder to share without requiring procedural generation.

### 3.13 Orientation

An optional orientation is offered before the first mission. It is one short page: what the terminal is, a query beside its result, what a transmission costs, that mistakes are free, and where the schema documentation and glossary are. It hands the player on to the training drills (Section 3.14), which teach by doing.

The orientation is never required and can be reopened at any time. It exists so that the first mission can teach GraphQL without also having to teach the interface.

### 3.14 Training drills

The training range opens with a short run of drills, offered to a new player before the first case. Each drill teaches one skill: asking for a field, opening a record, reading a list, following two links, and consulting the documentation. Together they take about five minutes.

A drill has a task of one short paragraph, a starter query, the terminal, and the response beside it. It has no clock, no leads, and no draft, and every transmission is free. A drill is passed by any transmission whose response holds the facts the drill expects, so the game still never judges the text of a query. A request that does not pass shows its response and one authored nudge.

Drills are optional and never lock a case. Passing them earns no clearance and no concept card. They exist so that the first case can teach casework to a player who has already seen that a query can be nested.

Two aids in the terminal serve the same purpose in every case. The editor suggests the fields that fit where the cursor is. The findings name, once for each kind of record, the links on it that the query did not open.

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
- **Evidence reporting.** While it executes an operation, the engine records the facts the operation returns and their response paths, and reports them with the result. The game engine records those facts and links them to the transmission in the evidence ledger.
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

Three constraints follow from static hosting and should be designed in from the start:

- **Linkable state.** Each mission, manual entry, and screen has its own route, so a reload returns the player to where they were and a link can point at a specific mission.
- **Bundle size.** The editor, the GraphQL tooling, and the world data are loaded on demand. The Vim keybindings are loaded only when the player has turned them on. The size of the initial bundle is a budget checked in continuous integration, so that a size warning never becomes a standing one.
- **Self-contained assets.** Every asset is served from the game's own origin, and nothing is requested from a third party at run time. Once a mission's data has loaded, finishing the mission needs no further requests. This keeps offline play cheap to add after the MVP.

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

The MVP ships a dataset that is wide and thin. It contains every sovereign state in the snapshot, each with its name, the name of its capital, continent, borders, languages, and currency. It contains only the cities that missions use, together with decoy cities, which is expected to come to between 60 and 100. Landmarks and trade relationships are added when a mission needs them.

The list of countries is complete so that a player cannot guess an answer from which countries are missing, and so that borders and languages work as clues anywhere in the world.

A versioned snapshot of geographical data will ensure puzzles remain deterministic. A script in the repository converts the source snapshot into the static JSON the game loads, and both the script and its output are kept in version control. The output records which snapshot it came from, and the game never reads the source at run time. A correction to the data is made in the script or in a file of overrides it reads, never by editing the output.

### 5.2 Intelligence Data

A complementary fictional dataset will represent the intelligence world.

Candidate entities include:

- Operative
- Alias
- Intelligence agency
- Criminal organization
- Incident or crime
- Shipment
- Customs inspection
- Company
- Financial transaction
- Sighting
- Intelligence report
- Case file

These entities should connect naturally to geographical data and to one another.

For example, an operative may have several aliases, belong to an organization, maintain known associates, and have a history of visiting particular countries. A shipment has an origin city, a destination city, a manifest, a consignee, and a customs inspection.

Intelligence reports carry a source and a reliability grade (Section 3.6). A case file gathers records of different kinds, such as reports, shipments, transactions, and sightings, which the schema exposes as a union.

The intelligence data grows mission by mission. Each mission adds the records its case needs, together with decoy records, so that the true lead is never the only one of its kind.

Every entity has a stable identifier so that evidence can refer to it.

The intelligence graph should support increasingly sophisticated investigations without requiring a fundamentally different GraphQL interface.

The coda (Section 2.3) adds the records its chain needs: the office that authorized an order, the agency's travel orders, a register serial number that puts orders in sequence, the registrar's objection, and the person who released a receipt, which is empty on the receipt for the tiles. The archive is fixed, so the travel orders describe the route the campaign's cases follow and not the journeys of a particular player. The new types and fields are visible at clearance 5, where a player may notice them in the schema documentation before the coda. Their names and descriptions are plain, so that the documentation does not announce what the coda reveals. Every earlier case must still validate after the records are added.

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

Each schema element is assigned a clearance level, and the schema served to the player contains only the elements at or below the clearance in force (Section 3.8).

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

A mission declares what it teaches, what it practises, what it requires, and the event its deadline represents. Its time budget is computed from its reference solution (Section 3.3). An assessment mission teaches nothing and lists the concepts it combines under `practises`. A stage declares its clues, scaffold, hint ladder, evidence sets, accepted solution, and a reference solution. It can also declare which leads can be ruled out, what evidence refutes them, and what dispatch a field check returns. Each evidence set lists facts that must be cited together, and each claim has at least two sets that support it. Records are written as `Type:identifier`. A name beginning with `$` is a binding, which stands for one record. The bindings named in a stage's `solution` describe the lead under consideration, such as `$shipment`. Within one evidence set or refutation, a binding stands for the same record wherever it appears. A binding that the solution does not name, such as `$inspection`, may be any record for which every fact in the set has been cited.

A clue's `constraint` is the machine-readable form of the clue. Each entry is a path of schema fields that starts from a binding, followed by the value the path must reach: a literal, a record, or another path. A path that passes through a list is satisfied when any member of the list matches. Validation evaluates the constraints against the data itself, not against the ledger, and tries every record of the right type for each binding the constraints use. Exactly one assignment may satisfy every constraint of the stage, and it must agree with the `solution` (Section 5.5). A part of the solution that no constraint binds, such as the signer in Luanda, must follow from the stage's evidence sets.

This example follows both stages of *The Vanishing Azulejos*.

    id: vanishing-azulejos
    title: The Vanishing Azulejos
    campaign: shadow-network
    clearance: 1
    teaches: nested-selections
    practises: []
    requires: []
    clock:
      countdown: Buyer collects the crate in {remaining}
      expired: Buyer has collected the crate
      onExpiry: continue
    startingStage: lisbon

    debrief:
      onTime: |
        Luanda holds the crate. The clerk files the transfer order
        with NIGHTJAR's name circled.
      afterDeadline: |
        The buyer has collected the crate. Your copy of the transfer
        order ties NIGHTJAR to the reroute.

    stages:
      lisbon:
        location: PT
        objective: Identify the shipment carrying the tiles and its destination.

        briefing: |
          A priceless collection of azulejos has vanished from a
          Lisbon museum. Three shipments declared as samples left the
          port that morning. Customs would appreciate a narrower list.
          Put a hold on the crate before the buyer collects it.

        clues:
          - text: >
              The museum registrar describes blue ceramic squares,
              14 centimetres across.
            constraint:
              $shipment.manifest: Blue ceramic squares (14 cm)
          - text: >
              An intercepted dispatch says the truck will cross into
              Namibia directly from the country receiving the shipment.
            constraint:
              $shipment.destination.country.borders: Country:NA

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
              - facts:
                  - entity: Shipment:$shipment
                    field: inspection
                    equals: Inspection:$inspection
                  - entity: Inspection:$inspection
                    field: finding
                    equals: Glazed ceramic tiles, blue, 14 cm
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
              - facts:
                  - entity: Shipment:$shipment
                    field: destination
                    equals: City:$city
                  - entity: City:$city
                    field: country
                    equals: Country:$country
                  - entity: Country:NA
                    field: borders
                    includes: Country:$country

        leadOutcomes:
          LIS-0486:
            refutation:
              claim: manifest
              facts:
                - entity: Shipment:$shipment
                  field: manifest
                  equals: Blue slate squares (14 cm)
            ruledOut: |
              Cape Town confirms the measurements. The harbourmaster
              offers to send a sample of the slate.
            fieldCheck: |
              The crate contains blue slate. The harbourmaster
              suggests consulting the manifest's description of the goods.
          LIS-0522:
            refutation:
              claim: route
              facts:
                - entity: Shipment:$shipment
                  field: destination
                  equals: City:$city
                - entity: City:$city
                  field: country
                  equals: Country:$country
                - entity: Country:$country
                  field: borders
                  excludes: Country:NA
            ruledOut: |
              The ceramic squares in Praia fit the description. The
              harbourmaster asks to see the truck that can drive from
              an island to the Namibian border.
            fieldCheck: |
              Praia confirms the size and material. The harbourmaster
              asks which land border the truck is meant to cross.
          LIS-0417:
            fieldCheck: |
              Luanda has opened a file on the shipment. The freight
              office asks for citations for the whole travel order.

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
        objective: Identify who authorized the crate's transfer to the replacement consignee.

        briefing: |
          The crate arrived under a replacement consignee label.
          Two transfer orders name different consignees and have
          different signatures. Find who signed the order that
          matches the label on the crate.

        clues:
          - text: >
              The depot logged the label attached to LIS-0417 on arrival.
            constraint:
              $shipment: Shipment:LIS-0417
          - text: >
              The transfer order must name the consignee on that label.
            constraint:
              $shipment.transferOrders: $order
              $order.consignee: $shipment.intake.consignee

        scaffold:
          level: partial
          starterQuery: |
            query {
              city(name: "Luanda") {
                # What did the depot record for the arriving shipments?
              }
            }

        hints:
          nudge: >
            Check who the depot says should receive the crate, then
            look for that same name on the two orders.
          concept: >
            Select fields inside both the intake record and the
            transfer orders. Follow the matching order to its signer.
          schema: >
            Look at City.arrivingShipments, Shipment.intake,
            Shipment.transferOrders, and TransferOrder.authorizedBy.
          skeleton: |
            arrivingShipments {
              id
              intake { consignee { name } }
              transferOrders { id consignee { name } authorizedBy { codename } }
            }

        solution:
          type: deduction
          shipment: LIS-0417
          order: LUA-012
          operative: NIGHTJAR

        claims:
          - id: matching-order
            prompt: This order names the consignee on the crate's replacement label.
            evidenceSets:
              - facts:
                  - entity: Shipment:$shipment
                    field: intake
                    equals: IntakeRecord:$intake
                  - entity: IntakeRecord:$intake
                    field: consignee
                    equals: Company:LUA-PARALLAX
                  - entity: Shipment:$shipment
                    field: transferOrders
                    includes: TransferOrder:$order
                  - entity: TransferOrder:$order
                    field: consignee
                    equals: Company:LUA-PARALLAX
              - facts:
                  - entity: Shipment:$shipment
                    field: unloadingReceipt
                    equals: UnloadingReceipt:$receipt
                  - entity: UnloadingReceipt:$receipt
                    field: labelConsignee
                    equals: Company:LUA-PARALLAX
                  - entity: Shipment:$shipment
                    field: transferOrders
                    includes: TransferOrder:$order
                  - entity: TransferOrder:$order
                    field: consignee
                    equals: Company:LUA-PARALLAX
          - id: authorizer
            prompt: This operative authorized the matching order.
            evidenceSets:
              - facts:
                  - entity: TransferOrder:$order
                    field: authorizedBy
                    equals: Operative:$operative
              - facts:
                  - entity: TransferOrder:$order
                    field: authorizationLog
                    equals: AuthorizationLog:$log
                  - entity: AuthorizationLog:$log
                    field: signedBy
                    equals: Operative:$operative

        referenceSolution: |
          query {
            city(name: "Luanda") {
              arrivingShipments {
                id
                intake { consignee { name } }
                transferOrders {
                  id
                  consignee { name }
                  authorizedBy { codename }
                }
              }
            }
          }

The countries receiving the Luanda and Cape Town shipments both border Namibia. The Luanda and Praia manifests fit the registrar's description. Only the Luanda shipment satisfies both clues. [Angola’s land borders](https://governo.gov.ao/angola/dados-sobre-o-pa%C3%ADs) · [Cape Town and South Africa’s borders](https://www.gov.za/about-sa/south-africas-provinces) · [Praia and the islands of Cabo Verde](https://www.aai.gov.cv/cabo-verd)

| Shipment | Destination | Manifest | Borders Namibia |
|---|---|---|---|
| LIS-0417 | Luanda, Angola | Blue ceramic squares (14 cm) | Yes |
| LIS-0486 | Cape Town, South Africa | Blue slate squares (14 cm) | Yes |
| LIS-0522 | Praia, Cabo Verde | Blue ceramic squares (14 cm) | No |

Each claim can be supported in two ways. The port inspector's finding describes the goods in different words from the manifest: slate for the Cape Town crate and glazed ceramic for the other two. Namibia's own list of borders confirms the route from the other side.

In Luanda, the intake record and the unloading receipt both give the consignee on the replacement label as Parallax Freight. Order LUA-012 names Parallax Freight and was signed by NIGHTJAR. The other order, LUA-011, names Lantern Export and was signed by COPPER_KITE. The order's signature and the authorization log both identify its signer. Both evidence paths are available at clearance 1.

Both starter queries supply the `name` argument. The Lisbon query guides the player to the missing destination selection. The Luanda query leaves the player to choose which shipment records and nested fields to retrieve. Arguments are taught at the next clearance level.

The content model should eventually support branching investigations, multiple acceptable solutions, variant pools (Section 3.12), and connections between missions.

A mission's `kind` is teaching, assessment, or coda. A coda has one stage and no clock. It grants no clearance and no concept card, and the count of resolved cases leaves it out. It becomes available when the last case of its campaign is resolved. Its claims meet the same standard as any other stage's, including two evidence sets for each claim.

A mission is a single YAML file. Its prose is written in YAML block scalars and may use a small inline subset of Markdown: emphasis, code, and links to glossary entries. Mission text is brief (Sections 5.6 and 5.7) and does not need files of its own.

### 5.5 Data Validation

A build-time validation process should check:

- **Structure:** Mission definitions have the required fields.
- **References:** Geographical entities, operatives, organizations, stages, missions, and campaigns that are referred to all exist.
- **World data:** Every border is recorded from both sides, and every city belongs to a country.
- **Reachability:** Every stage can be reached and every mission has a terminal outcome.
- Verify that the clues for each stage identify exactly one solution among the candidates in the data. For the Azulejos opening, each clue must also leave at least one wrong lead plausible on its own. In Luanda, only one order for the crate names the consignee on the logged label. Where reports conflict, the corroborating data settles the conflict.
- Verify that every claim has at least two supporting evidence sets and that no supporting set contains another. Each authored set must be retrievable at the mission's clearance. The tests accept complete sets with extra citations and reject incomplete sets or facts from unrelated leads unless the cited facts form another complete set.
- Verify that each authored refutation is retrievable at the mission's clearance and refutes the named claim for that lead. A field check must be reachable with a supported claim and an unverified claim, must charge the quoted cost, and must leave the stage open. A viable lead stays open after its field check.
- **Citations:** Every evidence set that the stage's reference solution retrieves can be assembled by Cite controls on its response, in the draft of the lead the set is about, and no Cite control leaves out a fact of the set that lies on the path to its row. The solvability and field-check steps cite through the same controls. This checks the citations the interface builds, not only the facts the engine accepts. A reference solution retrieves one set for each claim and need not retrieve the alternatives, so the check does not reach an alternative set that only a different query returns.
- **Solvability:** The reference solution executes without error and yields the required evidence. The time it spends sets the mission's budget (Section 3.3).
- **Request weight:** Every reference solution fits under the weight limit. In the mission that teaches pagination, the logs requested whole exceed the limit, and the reference solution pages through them under it.
- **Curriculum order:** A mission requires only concepts taught at or below its clearance, and its reference solution uses the concept it claims to teach.
- **Course shape:** The rules of Section 3.7 hold. Every taught concept is practised later, every clearance level ends with an assessment mission, and every mission file in the content directory is part of the course.
- **Starter queries:** A stage's starter query does not, unchanged, yield the required evidence.
- **Training drills:** Each drill's reference transmits without error at clearance 1 and returns the expected facts, and its starter query does not.
- **Hints:** Every stage has the complete hint ladder, and each schema pointer names types and fields that exist at the mission's clearance.
- **Terms:** GraphQL terms used in mission text are glossary entries, and are introduced at or below the mission's clearance. Drills are held to clearance 1, and a concept card to its own clearance.
- **Text references:** Entity names and identifiers quoted in mission text exist in the data.
- **Wording:** No player-facing text in the content directory contains a phrase that Section 5.7 rules out: a back-reference with no target, "name" used as a verb, or "object" for a record. The check covers missions, drills, concept cards, the glossary, and campaigns.
- **Glossary links:** Every link to a glossary entry points at an entry that exists.
- **Markup:** A field that the interface shows as plain text contains no inline Markdown.
- **Variants:** Where a mission defines variants, every variant passes all of the checks above.

Every check is an error that fails the build. A check that only prints a warning will eventually be ignored.

### 5.6 Authoring Rules

Validation cannot catch everything, so mission authors also follow these rules.

- **State the objective, not the method.** An objective says what to find. It never says which query to write or which GraphQL feature to use. Technique belongs in the hints, where the player chooses to see it.
- **Make wrong leads plausible.** A plausible wrong lead fits at least one clue. Give players a way to disqualify it from query results before traveling. Where the player can rule out the lead, use a short dispatch to acknowledge the deduction. Where a field check is available, write a dispatch that points the player toward the record that resolves the uncertainty.
- **Change the question as the case develops.** In a multi-stage teaching mission, have the next stage reveal something that calls for a new deduction with the same GraphQL concept. Name what will happen at the deadline in the briefing and in the clock.
- **Give every claim two routes.** The two evidence sets should pass through different records, so that a player who misses one field can still make the case. Prefer a second route through records the schema already has, such as a border seen from the other side. Add a record for the purpose only when none exists, because each one enlarges the schema a beginner has to read.
- **Write a fresh assessment case.** Change the evidence or relationships enough that a player has to decide which fields to retrieve. Keep the goal clear and leave the editor blank.
- **Run the queries before writing the text.** Briefings, clues, hints, and dead ends must describe what the engine actually returns. Text written from expectation is the most common source of broken missions.
- **Introduce a term before using it.** Otherwise link its glossary entry.
- **Say what to change.** A starter query marks the part the player is meant to complete.
- **Write for an intelligent player.** Copy is concrete and has no filler. The cast may be dry, but there is no tutorial chatter and no motivational talk. Leaving out filler does not mean leaving out steps: Section 5.7 says how to write a passage that a beginner can follow in one reading.

Missions are discovered from the content directory. There is no separate list of missions to keep in step with the files.

### 5.7 Writing for the Player

This section applies to every word a player can read: mission files, drills, concept cards, the glossary, the records clerk's notes, the documentation panel, and the labels on the interface.

The reader has seen JSON and has never written GraphQL (Section 1.2). They read a passage once, in order, while also looking at a query. They cannot ask what a sentence meant. Text that an author finds tidy is often text that this reader has to read twice, because the author already knows what each "it" refers to.

#### The rules

**1. Show the case, then give the rule.** Start with something the player can see in the query or the data. State the general rule after it, if the rule is needed at all.

- Before: "Name a field's result yourself. Two uses of the same field with different arguments need two aliases."
- After: "Ask for `operative` twice in one query and the two results collide, because both would come back as `operative`. Write a name of your own and a colon in front of each one, as in `first: operative(codename: "GREY_PETREL")`. Each result then comes back under the name you wrote. That name is an alias."

**2. Say what you are referring to.** A phrase such as "the same way", "as before", "the former", or "that type" sends the reader back to look for its target. Say the thing again. A pronoun is fine when its target is in the same sentence or the one before and nothing else could be meant.

- Before: "A field can hold a list of records. It is opened the same way."
- After: "Some fields hold a list of records instead of just one. You open a list with braces, the way you opened `country` in the last drill."

**3. Use one word for one thing, and one meaning for each word.** The table lists the words this game has settled on. "Name" matters most, because nearly every record has a field called `name`, and a sentence that also uses "name" to mean "ask for" or "identify" makes the player stop to work out which is meant.

| Write               | For                                                 | Do not write                                                           |
| ------------------- | --------------------------------------------------- | ---------------------------------------------------------------------- |
| name (noun only)    | the `name` field, or what something is called       | "name the fields", "the person to name", "naming", "a named selection" |
| ask for             | putting a field in a query                          | name, request, select, fetch                                           |
| identify            | deciding who or what the evidence points to         | name                                                                   |
| record              | one item the archive holds                          | object, entity, node                                                   |
| open                | writing braces after a field that holds a record    | expand, drill into, traverse                                           |
| transmit            | sending a query to the archive                      | run, execute, submit                                                   |
| braces, parentheses | `{ }` and `( )`                                     | brackets, curly brackets                                               |

A GraphQL term keeps its real name once the glossary has introduced it. Do not invent a friendlier synonym for "argument" or "fragment".

- Before: "The fields you name come back for every record in it. Name each country that `borders` Portugal."
- After: "The fields you put inside the braces come back once for each record in the list. Find the name of each country that borders Portugal."

**4. Say who does what.** Address the player as "you" and use the active voice. A passive sentence hides the one fact a beginner needs, which is whether they have to do something or the archive does it for them.

- Before: "The value is supplied in the variables panel."
- After: "You type the value in the variables panel, below the editor."

**5. Give one instruction at a time, and put the task last.** Explain first. End the passage with the thing the player is to do, in a sentence of its own.

**6. Do not trade clarity for brevity.** Cut filler, greetings, and encouragement. Do not cut the words that connect one step to the next. A passage of five plain sentences is better than two that have to be decoded.

- Before: "Define it once on the type, then spread it with three dots wherever that type appears."
- After: "Write the fields once, as a fragment on Operative. Then write three dots and the fragment's name in each place where the query opens an operative."

#### Voice

The cast keeps its voice (Sections 2.2 and 2.4). A dispatch from the harbourmaster or a line in a debrief may be dry, oblique, or funny, because the player is not being taught anything by it. A sentence that teaches, such as a drill task, a hint, a glossary definition, a concept card, or a clerk's note, follows the six rules exactly. A joke still has to say unambiguously who did what.

#### Markdown

Inline Markdown is rendered in some fields and shown as typed in the others. Use backticks only where they are rendered.

- Rendered: a stage's `briefing`, the `ruledOut` and `fieldCheck` dispatches, every `debrief` text, a glossary `definition`, a concept card's `summary`, and a drill's `task`, `nudge`, and `payoff`.
- Shown as typed: `objective`, clue text, all four hints, claim prompts, `resolved`, the clock texts, a concept card's `payoff`, and the mission and campaign `summary`.

#### What is checked

Validation (Section 5.5) fails the build on a short list of phrases that are almost never right: the back-references in rule 2, "name" as a verb, and "object" for a record. The list is in `src/content/style.ts`. It is kept short so that every finding is a real fault. Add a phrase when a review finds one that keeps coming back.

The check does not make a passage clear. Rules 1, 4, 5, and 6 depend on judgment, and so does the text written inside interface components, which validation does not read. The novice walkthrough (Section 10.1) is the test for those: a reader who does not know the answer reports each place they had to read twice.

## 6. Interface Design

### 6.1 GraphQL Execution Interface

The application will expose a local execution interface to the editor and game engine.

It takes an operation, its variables, and the clearance level in force (Section 3.8). It returns the standard GraphQL result together with the facts that result contains and their response paths.

Once request weight is implemented (Section 3.3), the result's `extensions` carry the weight from clearance 6. From clearance 8, a request above the limit is refused before execution with an ordinary GraphQL error that states the weight and the limit.

Operations should support normal GraphQL functionality, including schema validation, variables, fragments, aliases, directives, and introspection, within the schema for the given clearance.

The implementation should preserve ordinary GraphQL result and error semantics. Error annotations are produced separately by the feedback system and never replace or reword the original errors.

### 6.2 Game Engine Interface

The game engine will receive player actions, update investigation state, and report outcomes.

Actions:

- Transmit a query. This spends time while the clock is active and adds facts to the evidence ledger.
- Pin or unpin evidence.
- Add or remove a citation in the draft for a particular lead.
- Rule out a lead by citing its refutation. This is free.
- Examine a dossier, report, or the schema documentation. This is free.
- Request a hint.
- View the stage's solution.
- Travel to a destination with fully supported claims, or order a field check where the mission offers one.
- Submit a deduction with citations.
- Apply for a warrant with citations.
- Let the deadline pass, or restart the investigation.

Travel and deductions are available as controls in the interface from the first mission, and warrants from the first mission that ends in an arrest. Once the player reaches the clearance level that teaches mutations, the same actions can also be performed through the terminal, and missions at that level ask for the paperwork to be filed that way. Both routes call the same engine actions.

**Query validation and puzzle validation must remain distinct.** A syntactically valid query does not necessarily solve a puzzle, and multiple different queries may support the same correct deduction.

Missions evaluate the player's conclusion and the evidence cited for it. They never require an exact query string. Only katas judge a query's abstract syntax tree (Section 3.11). The debrief reads it to describe the player's technique and for nothing else (Section 3.10).

## 7. Component Design

### 7.1 Investigation Engine

Responsible for mission progression, the evidence ledger, the mission clock, travel and field checks, evaluating refutations, deductions, and warrants, and success or failure conditions.

Each mission may be modeled as a small state machine whose transitions depend on player decisions.

Campaign-level state may track recurring suspects, discoveries, or narrative developments across multiple missions.

### 7.2 GraphQL Runtime

Responsible for executing user-authored operations against local geographical and intelligence data.

It builds a schema for each clearance level from clearance annotations on the schema definition. Facts are recorded while the operation executes, not recovered from the result afterwards. For each field it resolves, the runtime notes the record the field belongs to, the field, its arguments, the value or records returned, and the response path. Identity comes from the record being resolved and not from the fields the player selected, so a fact is recognized whether or not the query asks for an identifier. An alias changes the response path and leaves the fact unchanged. It marks a returned list as complete only when the field returns the full collection without filtering, pagination, or errors affecting that list.

The runtime rejects operations that nest too deeply. After the MVP it also computes request weight from the operation and its variables before execution and enforces the weight limit for the clearance in force (Section 3.3). The limit therefore serves as the runtime's complexity limit as well as a lesson.

Potential considerations include execution timeouts and Web Workers to avoid blocking the interface.

### 7.3 Content System

Responsible for loading declarative missions, briefings, deadline copy, dialogue, hints, and lead outcomes, along with each mission's curriculum metadata and any variant pool.

The system should make it practical to add new missions without implementing new application logic.

### 7.4 Progress System

Responsible for recording completed missions, the help used, and whether completion was after the deadline. For investigations in progress, it records deadline state, the evidence ledger and pins, source transmissions, and each stage's editor draft, citation drafts, and ruled-out leads. It also stores the player's preferences.

Persistence should work without registration or a network connection. The following rules keep saved progress trustworthy as the game changes:

- All storage access goes through one adapter. If storage is unavailable, the game remains playable and simply does not remember.
- Saved data carries a format version. An investigation in progress also records the version of its mission's content. If the mission has since changed, the investigation restarts instead of loading state that no longer fits.
- The system stores what happened, in order, such as which missions were completed and how, and which solutions were viewed. Clearance, concepts learned, and the earned concept cards are derived by replaying that record under the rules of Section 3.8. No rank is stored, so a change to the curriculum needs no migration.
- Preferences are global and stored apart from progress. Resetting progress keeps preferences and asks for confirmation first. The Vim keybindings switch (Section 8.2) is one of them. Its saved value is read before the editor opens, so the editor starts in the mode the player last chose.

After the MVP, the player can export their progress as a file and import it again. Import checks the format version, shows what the file contains, and asks before replacing the current progress. Export is the player's only protection against a cleared browser, and it needs no account.

### 7.5 Feedback System

Responsible for everything the game says about the player's GraphQL:

- Annotating validation and execution errors in the records clerk's voice.
- Annotating a request refused for its weight, naming the selection that weighs the most.
- Serving the hint ladder and the solution reveal, stating their cost in advance, and charging it.
- Assembling the debrief, including the comparison with the reference solution.

## 8. User Interface Design

### 8.1 Visual Direction

Set a dark navy terminal into a mid-century paper case file. Briefings, query findings, and drafts sit on warm paper with fine rule lines. Use an editorial serif for case titles, a legible sans serif for reading and controls, and a crisp monospace for code and short clerk annotations.

Give each case one motif drawn from its subject. A strip of cobalt tilework marks the Azulejos briefing and returns on the debrief. Reserve rust-red ink for decision stamps. Stamp the Azulejos debrief **HOLD ISSUED** when the player secures the crate and **COLLECTED** when the buyer gets there first. Maps and dossier material can use period cartography and printing styles while showing the present-day geography.

- Query text is at least as legible as the surrounding prose. Keep the editor's modern input, focus, and error behavior.
- Put hints, the manual, and other help alongside the working area. At narrower widths the layout reflows without covering the editor or its results.
- Pair status color with a text label. Make clues and travel information available as text.
- Support keyboard play throughout, honor reduced-motion preferences, and keep the working layout usable at a window width of 1024 pixels.

### 8.2 Primary Screens

The screens support the gameplay loop described in Section 3.1.

**Orientation:** The optional introduction to the terminal and its tools (Section 3.13).

**Mission Selection:** Available assignments, the clearance each requires, the concept each teaches, and campaign progress. For completed assignments, show the help used and whether the case was resolved after the deadline. An assessment that the player would attempt as a placement is marked as one. One assignment is emphasized: the next case in the story. Placements are grouped under a single entry, so that a new player sees one way forward and a returning player can still skip ahead. A campaign's coda appears once its last case is resolved.

**Mission Briefing:** Classified narrative introduction, objectives, and initial intelligence.

The **Intelligence Terminal** shows the editor and the latest results side by side, with the objective, current location, and deadline event in view. Players can switch between leads, inspect the response, and attach a finding to the open draft. When a response holds several records of one type, such as three dossiers fetched under aliases, the findings can show them in columns with one row for each field, and a field that a record lacks stays visibly blank. The view arranges what the player retrieved. It never marks which record fits a clue, because that comparison is the player's work. Each response is labelled with the variables it was sent with. Keep raw GraphQL results, schema documentation for the clearance in force, error annotations, and hints available. After expiry, the clock shows what happened and whether the investigation is continuing untimed.

The terminal offers optional **Vim keybindings** through a labelled switch beside the editor. The switch is off by default, and the player can change it at any time without losing the editor's text. It applies to every code editor in the game, including the variables panel. While it is on, the editor shows the current Vim mode as text. The choice is a preference (Section 7.4), so it holds from one stage, mission, and visit to the next whether it was left on or off, until the player changes it. The transmit shortcut works in every Vim mode, and a keyboard user can always move focus out of the editor.

The **Evidence Board** holds the evidence ledger and pinned facts, with links back to their query results. The travel, deduction, and warrant drafts show plain-language claims and their citations. Keep the active draft beside the terminal results, and keep each lead's citations separate when switching between leads. Ruled-out leads remain available for review.

**World Map:** Visualizes geographical locations and supports travel decisions, showing the time each journey would cost.

**Operative Dossiers:** Displays known suspects, aliases, and associations. A dossier shows only what the player's queries have retrieved.

**Debrief:** Displays the outcome, the comparison with the reference solution, the geographical fact, and the new concept card.

**Tradecraft Manual:** The glossary and the concept cards the player has earned, available for reference at any time.

**Training Range:** The optional training drills (Section 3.14) and the katas (Section 3.11).

## 9. Assumptions, Dependencies, and Constraints

- GitHub Pages can serve all required application assets.
- Geographical and intelligence data can be bundled in a reasonably sized static distribution.
- GraphQL.js provides the required client-side execution functionality, including building a reduced schema for each clearance level.
- Source datasets and assets must be checked for licensing and attribution requirements.
- The MVP needs a connection to load and has no service worker. Its assets are self-contained (Section 4.3), so offline play can be added later without redesign.
- Because game logic and answers reside client-side, determined players can inspect them. Preventing cheating is not a primary objective. The evidence requirement is a learning aid, not a security measure.
- Present-day geography in a period-styled setting is intentional (Section 2.1).
- Accessibility and keyboard navigation should be considered throughout development.
- Agent-run playtests (Section 10.1) have limits. An agent that solves a mission shows that the material on screen is sufficient. It does not show that a beginner will find it, or how long that takes.
- Fictional intelligence content should remain sufficiently distinct from existing protected characters, organizations, and stories.

## 10. Testing Strategy

Testing should prioritize deterministic game behavior and content correctness.

Suggested coverage:

- **Unit tests** cover GraphQL resolvers, mission transitions, evidence recording and source links, and claim evaluation. Verify that a grouped citation attaches only retrieved facts with their source paths. Check that reviewing a draft or ruling out a lead costs no time, that list refutations require complete results, and that a confirmed field check spends the quoted cost without advancing the stage. Verify that a final-hour action resolves before expiry, a solution reveal is free after expiry, and clearance is derived correctly from completions, including placement with the solution reveal, without it, and after a reveal in an earlier attempt.
- **Schema tests:** Each clearance level exposes exactly its intended types and fields, including through introspection. Classified records return partial data with errors. A placement attempt runs against the schema of the clearance in force. Once request weight is implemented, weight is reported from clearance 6 and enforced from clearance 8, a refused request spends no time and records no facts, and a request under the limit costs one hour whatever it weighs.
- **Content tests:** The validation checks of Section 5.5, run against every mission. These recompute what a mission asserts from the data and do not trust the authored answer.
- **Integration tests:** Execute representative GraphQL operations against actual game data.
- **Persistence tests:** Saved data from an older format version, a changed mission, and unavailable storage are each handled as Section 7.4 describes. The Vim keybindings preference survives a reload, a change of mission, and a progress reset, both when on and when off.
- **End-to-end tests** play the Azulejos case with the editor, results, and draft accessible by keyboard at 1024 pixels. Cite findings directly from a response and switch leads. Verify that drafts stay attached to the right shipments and that each cited fact links to its source. Rule out one wrong lead for free, confirm a field check on a different lead with an unverified claim, then reach Luanda with a complete travel order. Reload and confirm that the drafts and lead history survived. Use the replacement label to identify the signer and hold the crate. In a separate run, let the buyer collect the crate, reload, and use the retained evidence and drafts to finish with the late debrief.

Every authored mission must include a reference solution. Continuous integration plays each mission using its reference solution, computes the mission's budget from the time spent, and fails if the mission cannot be completed.

The test suite gates deployment. A build that fails any test or validation check is not published. The build also fails if the site to be published refers to any other origin.

### 10.1 Playtesting

Use automated tests to check solvability and browser-agent reviews to check what the game communicates on screen. Run both agent reviews before a mission ships.

- **Clean-room solve:** An agent that can only operate the page, starting from a save verified to hold only the completions that give the clearance the mission needs, solves the mission without taking a hint. For each step it lists the on-screen material that justified it. This answers one question: can the mission be solved from what the game shows?
- **Novice walkthrough:** An agent plays in the persona of the audience described in Section 1.2. It records numbered points of confusion, each with where it happened and what would have helped, and reports where it stopped understanding and began matching patterns. Every point is either fixed or logged with a reason, and the walkthrough is then run again.

The agents are given a self-contained prompt and no knowledge of how the game is built. A reviewer who knows the answer is not a fair test of what the game teaches.

Once the first mission is playable, observe a few people who know JSON and are new to GraphQL before expanding the campaign. Watch whether they can attach evidence while comparing shipments and explain both why a wrong lead looked plausible and what ruled it out. When they reach Luanda, see whether the replacement label makes them want to send another query and whether they can explain how they identified the signer. Ask which moments they remember and whether they would choose to play another case. Give each player a short follow-up case with different data and a blank editor. Observe whether they can write a nested selection and explain how its result supports the new deduction. Use these sessions to tune the clock's costs and factors, citation feedback, and starter queries before authoring the remaining clearance levels.

Before 1.0, repeat the sessions on two cases, *The Vanishing Azulejos* and *The Guest Register*. Each session has two parts. During the case, ask the player to explain why they ruled out a lead and which cited facts support each claim. Afterward, give them the kata for a technique they used and watch whether they can apply it to records they have not seen. The first part tests the detective work and the second tests whether the lesson transfers. These sessions also decide whether the draft should say more about an incomplete claim than Section 3.2 allows.

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
- Load both stages of *The Vanishing Azulejos*. Compare plausible shipments in Lisbon, then identify who signed the transfer order that matches the replacement label in Luanda.
- Build the first case file with the navy editor beside paper results and the active draft. Use the tilework motif in the briefing and debrief, and stamp the outcome.
- Let players cite a finding directly into the active draft, and pin a fact in the ledger for later. Make grouped citations inspectable and keep links to the individual source facts.
- Implement the mission clock with a budget computed from the reference solution and a countdown to the buyer's pickup. Support free lead eliminations, quoted field checks on provisional leads, supported travel, and an untimed continuation with a free solution reveal after expiry.
- Validate that the opening clues together identify one shipment and that each clue alone leaves more than one. Verify that the replacement label matches one transfer order, that each claim has two supporting evidence sets, and that every authored refutation is retrievable. Run the full reference solution in tests.
- Add the schema documentation panel and the first mission's hint ladder.
- Add a basic dossier interface, the guided Lisbon query, the partial Luanda query, and a debrief that explains the query and shows the on-time or late outcome.
- Persist progress, source transmissions, ruled-out leads, and citation and editor drafts in versioned saves.
- Run end-to-end tests for ruling out leads, recovering from a field check, identifying the signer, and finishing after the deadline.
- Observe beginners playing the mission and a short follow-up case with a blank editor, using the findings to refine the first mission.

To complete this milestone, a player must be able to compare and cite query findings from the same screen, rule out a plausible lead, and solve the Luanda deduction on time or after the buyer collects the crate. Beginner playtests show whether players can explain the clues they used, whether the Luanda twist prompts another query, and whether they can use nested selections in a fresh case.

### Milestone 3 — Progression and Onboarding

- Author the remaining missions for clearance levels 1 and 2: the level 1 assessment, the teaching mission for arguments, and the level 2 assessment.
- Implement clearance, promotion, placement by assessment, and clearance-scoped schemas.
- Add the scaffold levels and error annotations, and extend schema documentation, the hint ladder, and the solution reveal to every mission.
- Add the orientation and the tradecraft manual with its glossary and concept cards. Extend the debrief to compare the player's approach with the reference solution and point to a follow-up case.
- Run the full set of content validation checks automatically, including course shape.
- Run the clean-room solve and the novice walkthrough on every mission, and act on what they find.

**Success criterion:** A beginner can finish the onboarding and be promoted to clearance 3, and a player who already knows GraphQL can reach the same clearance by placement.

### Milestone 4 — Educational MVP

- Author teaching and assessment missions for clearance levels 3 through 5, from aliases to variables. Give each feature a visible payoff and test it again in a different case with a blank editor.
- Expand the world data to every country.
- Incorporate a world map and extend the case file design across the curriculum.
- Introduce the recurring cast and a simple campaign.
- Add the optional Vim keybindings switch to the terminal and remember the player's choice.
- Run both agent playtests on every new mission, and act on what they find.

**Success criterion:** A beginner can learn several fundamental GraphQL concepts through an engaging, self-directed espionage adventure.

### Milestone 5 — 1.0: Evidence the Player Can Follow

This milestone finishes clearance levels 1 through 5. It adds no clearance level. Its tasks are in priority order.

- Make a citation carry every fact on its path that an evidence set can use (Section 3.2), and test the code that builds citations. Add the validation check that every evidence set can be assembled from Cite controls (Section 5.5).
- Show under each claim the cited facts that count toward it, show on the Cite control which lead's draft it feeds, and distinguish facts that do not connect from a fact that is missing.
- Show records of one type in columns in the findings, starting with the three dossiers of *Three Couriers*.
- Replace the debrief's text matching with a reading of the parsed query, limited to the transmissions that supplied cited facts. State plainly when a placement was passed without its level's technique.
- Add the katas for aliases, fragments, and variables to the training range, with a variables panel and a clearance for each kata.
- Author the coda of the first campaign, with its records, and add the coda kind and its untimed stage to the engine.
- Emphasize the next story case on the assignments desk and group the placements under one entry.
- Use a country with several borders in the drills that read a list. State in the schema documentation where a player does type a `!`. Label each response with its variables.
- Add the Vim keybindings switch, which Milestone 4 lists and did not deliver.
- Run both agent playtests on the coda and on every changed case, then hold the sessions with beginners (Section 10.1) and tune the clock from them.

**Success criterion:** A beginner can say which cited facts support each claim, and can use a case's technique on records they have not seen.

### After 1.0

Where this document says that a feature arrives after the MVP, and Milestone 5 does not list it, the feature arrives after 1.0.

- Clearance levels 6 through 10, from introspection to mutations. The adversary is identified in these levels and not before.
- Request weight, reported with the clearance 6 missions and limited with the clearance 8 missions that teach pagination.
- Warrants and missions that end in an arrest.
- Conflicting reports and source reliability.
- Game actions as mutations.
- Seeded mission variants.
- Katas for the remaining concepts, and exercises that ask the player to predict a response.
- A prompt for an incomplete claim that says what kind of fact is missing, if the sessions with beginners show that the draft needs one.
- Branching investigations, including one deadline that forces a choice between two leads. The clock keeps its single purpose until then (Section 3.3).
- An untimed continuation after the deadline in cases other than the first.
- Offline play through a service worker, with a prompt when a new version is available.
- Export and import of saved progress.

## 12. Glossary

**Campaign:** A sequence of related missions forming a larger narrative.

**Mission:** A complete intelligence investigation comprising one or more stages.

**Stage:** An investigation objective within a mission.

**Clue:** Information used to narrow possible solutions.

**World Data:** The factual geographical dataset exposed through GraphQL.

**Intelligence Data:** Fictional entities and relationships used to construct espionage mysteries.

**Game State:** The player's current investigation, discoveries, decisions, and progress.

**Transmission:** One executed GraphQL operation. A transmission spends time while the mission clock is active.

The **Mission Clock** counts the game hours until the deadline event. Its budget comes from the reference solution, and transmissions, travel, field checks, and other paid actions spend it.

**Request Weight:** The number of records a request could return, computed before transmission. From clearance 8 the records clerk refuses a request above the weight limit, at no cost in hours.

**Evidence:** A fact that has appeared in one of the player's query results.

**Evidence Ledger:** The record of all evidence gathered during a mission.

**Evidence Set:** A group of facts that together support a claim. Every claim has at least two.

**Citation** links one or more retrieved facts to a claim in a draft.

**Refutation** is a set of retrieved facts that disprove a claim for a particular lead.

**Field Check** is a paid investigation of a provisional lead that returns a dispatch while the stage stays open.

A **Deduction** is a conclusion the player submits with citations.

**Warrant:** An application to arrest a named operative, supported by cited evidence.

**Clearance:** The player's rank, earned by passing assessment missions. It determines the missions available and the schema visible.

**Learning Objective:** The GraphQL concept a mission is designed to teach.

**Reference Solution:** An authored set of operations that solves a stage. It is used for testing, for the solution reveal, and for the debrief.

**Solution Reveal:** The step beyond the hint ladder, which shows the reference solution.

**Completion Mode:** The help used during an attempt that resolved the case, recorded as independent, hinted, or solution-revealed.

**Assessment Mission:** The mission that ends a clearance level. It starts with a blank editor and asks the player to apply familiar concepts to a fresh case.

**Placement:** Attempting an assessment mission without having played the missions that lead to it. A pass by a player who has never viewed that mission's solution promotes the player past that level.

**Clearance in Force:** The higher of the player's clearance and the clearance of the mission being played. It decides the schema the terminal uses.

**Orientation:** The optional introduction to the terminal offered before the first mission.

**Clean-Room Solve:** A playtest in which an agent solves a mission using only what the game shows, without hints.

**Debrief:** The end-of-mission summary of the outcome and of what the player learned.

**Tradecraft Manual:** The in-game reference, made up of a glossary that is always available and the concept cards the player has earned.

**GraphQL Kata:** An optional drill, outside the story, designed to develop proficiency with one piece of GraphQL syntax. A kata is passed by a query with the right structure that returns the right facts.

**Coda:** One short, untimed stage that ends a campaign's arc. It follows the last case and is not counted among the cases.

**Training Drill:** A short, untimed exercise offered before the first case, passed by retrieving the facts it asks for.

## 13. References

- [Atlassian — How to Create a Software Design Document](https://www.atlassian.com/work-management/knowledge-sharing/documentation/software-design-document)
- [GraphQL Specification](https://spec.graphql.org/)
- [GraphQL.js](https://graphql.org/graphql-js/)
- [CIA World Factbook Archive](https://www.cia.gov/the-world-factbook/)
- [Natural Earth](https://www.naturalearthdata.com/)

### Creative Influences

- *Where in the World Is Carmen Sandiego?* — Geographical investigation, educational gameplay, and whimsical criminal mysteries.
- Ian Fleming's early James Bond novels — International espionage, intelligence tradecraft, distinctive settings, and recurring adversaries.
- G. K. Chesterton, *The Man Who Was Thursday* — Unmaskings that deepen the mystery they appear to solve.

DossierQL is an independent project and is not affiliated with or endorsed by the owners of these works.

---

*This document is intended to evolve alongside the project. Architectural details, technology selections, narrative systems, and content models should be refined through working prototypes rather than finalized prematurely.*
