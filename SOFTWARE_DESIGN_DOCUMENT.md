# DossierQL — Software Design Document

**Status:** Draft
**Version:** 0.11
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
- Teach GraphQL progressively. Each mission introduces or practises a named concept, from basic selections to mutations and subscriptions.
- Introduce the game a little at a time as well. A player never has to learn several GraphQL ideas or several parts of the casework in one sitting (Section 3.15).
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
- Schema authoring. The game teaches every part of the GraphQL specification that writing an operation uses (Section 3.7), subscriptions included, and none of the parts that define a schema. A subscription delivers its events as game hours pass, never on a real clock.
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

The second campaign, *The Fourth Desk*, starts at clearance 6, where the coda left the question. The bureaucracy has sealed a cabinet that the Fourth Desk kept outside the agency's registry, and the player is to read it. Nobody at the agency documented the cabinet, which is the story reason for introspection (Section 3.7). Its first case shows that the Fourth Desk did not write the instruction to let the tiles go. It carried out a minute written by the First Desk, which countersigns nothing, and it held the docket's papers for GILT_MAGPIE, the Parallax Circle's own handler. The assessment follows the copy of the minute to a book that Lusaka Exchange Control kept apart from its register. The answer moves the question one desk further up and makes it harder: the campaign does not yet say who at the First Desk wrote the minute, and M is not identified at clearance 6.

At clearance 7 the inquiry reads a file of mixed papers on the minute: telegrams, memoranda, and minutes that share one filing stamp. That is the story reason for interfaces. *The Valparaíso Draft* shows that the First Desk did not write the minute either. Tomás Eyzaguirre, the second secretary at Valparaíso Station, drafted it to an instruction that reached the station by telegram, and the First Desk copied it out under its own serial. The assessment, *The Station File*, follows that telegram to the agency's Cipher Room in Lisbon. The Cipher Room sends whatever is handed in at its counter, and its register records no name for the person who handed in the instruction. The answer identifies the drafter and the channel, and leaves open who wrote the instruction. An unsigned memorandum at the First Desk, which orders the draft copied out and sent back under seal, is the remaining lead.

At clearance 8 the inquiry reads the agency's intercept logs for the hours in which the instruction was handed in. A log records whatever its post heard or saw: vessels on the harbour radio, companies, watchers' sightings, telegrams copied off the wire, and passes shown at a door. Those kinds of record have nothing in common, which is the story reason for unions. *The Listening Post* shows who handed in the instruction. GILT_MAGPIE, the Parallax Circle's handler, came ashore at the river quay from the *Santa Luzia*, a vessel from Luanda that a Circle agency had hired, and he walked up to the Cipher Room's counter. The assessment, *The Door Watch*, asks how he got into the building. He showed a pass that the First Desk issued in his own cover name, and nobody signed it. The answer brings the Circle inside the agency's door and makes the question harder: every paper in the chain now leads back to the First Desk, and no officer's name is on any of them. M is not identified at clearance 8.

At clearance 9 the inquiry reads the watch books that counter-intelligence keeps at the posts inside the agency's own building in Lisbon. A book holds an entry for everything its watcher saw, most of it routine, and each book holds more entries than the records clerk will copy out in one request, which is the story reason for pagination. *The Corridor Book* reads the book of the First Desk's corridor and the book of the pass desk. Duarte Sequeira, private secretary at the First Desk, stood in at the pass desk and made out pass PS-0471 while the pass clerk was called away to a telephone call that nobody had made. He let the pass's holder into the corridor while the private office had the duty officer away on an errand, took him to the inner room of the First Desk, and brought him out again. The entry that says who opened the door of the inner room is classified above clearance 9. The assessment, *The Cipher Counter*, reads the book of the Cipher Room's counter and finds that Sequeira kept the counter, again in place of a clerk called away, when GILT_MAGPIE handed in the instruction. Every paper in the chain now has an officer's name near it, and the question becomes whom a private secretary works for. M is not identified at clearance 9.

At clearance 10 the entries that clearance 9 withheld come back, and the inquiry reads the files of the First Desk's private office. Each paper in a file carries a minute sheet, the remarks that officers wrote on it, and a minute sheet is heavy. The registry reads a file with a standing query, one operation that it sends again with new variables, and the query can ask for every subject in a file or for the minute sheet of a few papers, but not for both at once. That is the story reason for directives. *The Inner Room* reads the private office's day file. Joaquim Teles, head of the First Desk, was in Luanda and had left his inner room locked. Duarte Sequeira lent it for the afternoon under a standing instruction that Teresa Valente had brought to the private office by hand, with two more: one for the pass desk and one for the Cipher Room's counter, each for an hour when its clerk is called away. She drew the key, waited in the inner room, and opened the door to GILT_MAGPIE herself. She is secretary to the Standing Committee, an office above the desks, and none of its instructions was entered in a register. The assessment, *The Envelope Book*, reads the Cipher Room counter's book of envelopes left to be called for. The envelope that the First Desk left at the counter was called for by Rui Fontes, the Committee's messenger, for the chair of the Standing Committee. The answer moves the question one office up and makes it harder: no paper the inquiry holds gives the chair's name. M is not identified at clearance 10.

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

Players can cite a finding in the open draft directly from the results or the ledger. They can also pin evidence in the ledger to keep it at hand. Result rows offer Cite alone, so that the one action a case requires is the only one beside each finding. A single citation can carry a connected chain of facts. When the player cites a row from deep inside a response, the citation starts at the first fact on the path that can support a claim for that lead. If the path contains no supporting fact, the citation can start at a fact that contradicts a claim for the lead. The citation includes the rest of the path down to the row the player cited. When a lead is ruled out because a list does not contain something, the player cites the whole list, because a row inside the list cannot show what is missing from it. One click therefore never leaves out the link between a finding and the record it was found under, such as the link between a sighting and the city where it was filed. A fact on the path that is evidence about a different lead is not carried, so that citing one lead's row never cites what the response says of another lead. The Cite control shows which lead's draft the citation will enter. A row beneath a lead enters that lead's draft. A row that is evidence about the lead whose draft is open enters the open draft wherever the row sits in the response. For example, a list of associates that a clue refers to enters the draft of whichever listed associate the player has open. A row that is neither beneath a lead nor evidence about one, such as the name of a country, enters the open draft too. The control does not say whether such a row bears on a claim, because that would show the player which rows are evidence. The draft says so once the row is cited. A row whose field returned nothing offers no Cite, because no claim can rest on a missing value. The control is labelled with the row's own fields, from the record the row sits in, so that rows of the same shape read the same. The facts the citation carries are listed once it is cited. A lead is named by what the player's queries returned about it, such as its name or codename. A lead that no query has identified yet is numbered among the leads of its type, as in "operative 1, not yet identified". The archive's filing key is never shown. In the Lisbon opening, **Cite cargo** attaches the manifest and **Cite route** attaches the shipment → city → country → border chain. Each fact in a citation remains inspectable and links back to its source response. The player chooses which findings to attach and can remove them.

Deduction, travel, and warrant forms present the claims the player must support in plain language. A stage defines at least two sufficient sets of facts for each claim, reached through different records, so that no claim depends on the player finding one particular field. A claim is supported when its citations contain any one complete set. Extra citations are allowed. Facts in a set must refer to the lead under consideration. For example, a shipment's destination and the destination country's border must form a connected chain.

The draft shows which claims the citations support and which still need evidence. Under each claim it lists the cited facts that count toward that claim. When a claim is partly supported, the draft says which of two things is wrong: the cited facts do not connect to each other, or they connect and a fact is still missing. Where the form also asks the player to choose a record, such as a destination country, the draft says so when the cited facts connect to each other and do not lead to the record chosen. When the player has not yet made that choice and the cited facts already complete an evidence set, the claim reads "Needs a choice" rather than "Needs evidence". The draft then says which record the facts show and offers a button that chooses it. The facts are the player's own, so this gives nothing away. If they show a wrong record, the button chooses that record, and submitting is refused as usual. The draft does not say which fact is missing, because that would give away the evidence route. Hints do that, at their price (Section 3.9). Unrelated citations receive feedback before any time is spent. A cited refutation identifies the claim and its conflicting evidence. An absent entry can refute a claim about a list only when the player retrieved the complete list without an error. A deduction is accepted when the conclusion is correct and all required claims are supported. Travel that advances the investigation meets the same standard. A field check can investigate a lead whose case is still incomplete (Section 3.5).

Every puzzle should depend on fictional intelligence data, such as shipments, aliases, and transactions, that no player can know in advance. Real geography then narrows the possibilities. For example, an intercepted shipment leads to a city, and the city's country must satisfy a geographical clue.

### 3.3 The Mission Clock

Each mission after the first has a budget of hours. Actions spend it while the clock is active.

| Action | Provisional cost |
|---|---|
| Transmission (one executed query or mutation, or one subscription opened) | 1 hour |
| Travel or field check | Several hours, depending on distance |
| Hint | 1 to 8 hours, rising with each step of the hint ladder |
| Solution reveal | More than all the hints together |
| Rejected warrant | Several hours |

The clock exists to teach GraphQL's central idea. One nested query costs the same as one flat query, so a player who asks for everything they need in a single transmission is rewarded.

The clock counts game hours only. The player may take as long as they like over any decision, and the cost of an action is shown before the player commits to it. The briefing names the event the deadline represents, and the terminal counts down to it. In *The Borrowed Chronometer*, it reads “Buyer's steamer sails in 6 hours” when six hours remain.

The first case, *The Vanishing Azulejos*, has no clock. Its hints and its solution reveal cost nothing, and nothing in it is priced in hours. The clock is a casework mechanic like any other (Section 3.15), and a player who is writing their first nested query should not also be learning to budget. The clock arrives in the second case, whose briefing explains it: what a transmission costs, what the deadline is, and that a request the clerk returns costs nothing.

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
- The first case, training drills (Section 3.14), katas (Section 3.11), and a campaign's coda (Section 2.3) have no clock.

An action that uses the last available hour resolves before the clock expires. If an action costs more than the time remaining, show the shortfall and let the player choose to let the deadline pass.

In a case with a clock, the deadline ends the attempt and the player can restart. The current stage's solution becomes free to view once the deadline passes (Section 3.9). No case in 1.0 continues untimed after its deadline. The engine can do so, and a later case may use it (Section 11).

A flat cost for each transmission leaves one habit unpriced, which is asking for far more than the case needs in a single request. Through the MVP, a small schema and a limit on nesting depth keep that habit harmless. After the MVP (Section 11), the records clerk also weighs each request.

**Request weight** is the number of records a request could return, computed from the request before it is transmitted. A list counts for the page size the request asks for, or for the list's declared maximum when it asks for none.

Each record is counted with everything asked for inside it, so a list of ten records, each with one record nested inside it, weighs twenty. A list's declared maximum is the longest that list is on any record in the archive, and a list at the top level of the schema counts for every record of its type. The archive is fixed, so the maximum is as much as the list can ever return. Values, introspection, and `__typename` weigh nothing, because they return no records. A fragment counts where it is spread. No list takes a page size before clearance 9. A page (Section 5.3) is not a record and weighs nothing: the records on it count for the page size, or for the list's maximum when the request gives none, and a page size above the maximum counts for the maximum. A selection that `@skip` or `@include` leaves out weighs nothing. The clerk reads a directive's condition from the request, from the variables sent with it, or from the variable's default, and counts a selection whose condition it cannot read.

Weight arrives in two steps, so that the player has read the number before it constrains them:

- From clearance 6, every result states the weight of its request in `extensions`, and nothing depends on it.
- From clearance 9, the clerk refuses a request above the weight limit, which is 200. Like a query that fails validation, it is returned before transmission and costs nothing. The refusal states the request's weight and the limit, and the label on every result from clearance 9 states the limit beside the weight.

Weight is a limit and never a price. A transmission under the limit costs one hour whatever it weighs, so one nested query still costs the same as one flat query, and hours remain the only thing the player spends. Budgets are computed as before. The limit follows the clearance in force (Section 3.8), as the schema does, and every reference solution must fit under it (Section 5.5).

There is no numeric score in the MVP, and request weight does not become one. The costs and factors in the two tables, the weight limit, and the way weight is counted are provisional. Playtesting tunes those numbers and never the budget of an individual mission. The tuning waits for the sessions with beginners (Section 10.1). Hours left over by a player who already knows GraphQL do not show how much room a beginner needs.

### 3.4 Warrants

Missions that end with an arrest require a warrant. The player names an operative and cites evidence for each claim the warrant makes, such as an alias link or presence at the scene.

The bureaucracy returns missing or unrelated citations for correction. Once a warrant is submitted, a rejection costs time. Warrants are introduced after destination missions, once the player is comfortable gathering evidence. They arrive after the MVP (Section 11).

### 3.5 Failure and Dead Ends

Give players a credible reason to investigate a wrong lead and let them examine leads in any order. A player who cites a refutation can mark that lead **Ruled out** without spending mission hours. File a short dispatch that acknowledges what made the lead plausible and points to the fact that rules it out. Keep the lead and its citations available for review.

Before travel, show the cost and any claims that still need evidence. When a mission offers a **field check**, a player with at least one supported claim, at least one claim that still needs evidence, and no cited refutation can choose to spend the quoted travel hours on a provisional lead. A claim with complete citations and an empty answer box needs a form choice. Once the draft has all its evidence, show the required choices and withhold the field check. The field check returns a dispatch and leaves the player at the same stage with their evidence intact. A wrong lead gets a dead-end dispatch that explains the gap. A viable lead can receive a provisional acknowledgement. These dispatches point back to the archive so the player can verify the lead with GraphQL.

Ruling out and field checks are casework mechanics, and each arrives in its own case (Section 3.15). Ruling out first appears in *The Guest Register* and field checks in *The Quiet Consignee*. A case before those does not author a refutation or a field check, and its wrong leads are simply leads whose claims cannot be supported.

### 3.6 Unreliable Sources

Intelligence reports carry a source and a reliability grade. Later missions include reports that conflict, and the player resolves the conflict by corroborating one account against other data.

A mission with conflicting reports must contain enough corroborating data to settle the conflict in favor of a single answer.

Conflicting reports arrive after the MVP (Section 11).

### 3.7 Curriculum

Concepts are introduced in a fixed order. Each is tied to a clearance level and to a story situation that makes the concept the natural tool.

| Clearance | Concept | Story reason | Scope |
|---|---|---|---|
| 1 | Fields and nested selections | Read three manifests, then trace shipments to countries and borders, then find the signer of the order that matches a replacement label | MVP |
| 2 | Arguments | Pull one operative's file instead of the whole registry | MVP |
| 3 | Aliases | Call the same dossier field with two suspect IDs and compare the named results side by side | MVP |
| 4 | Fragments | Keep the same fields in a suspect's dossier and in nested dossiers for their associates by writing the selection once | MVP |
| 5 | Variables | Carry a query into a second city and change its input in the variables panel | MVP |
| 6 | Introspection | Explore a newly seized archive that has no documentation | Later |
| 7 | Interfaces and inline fragments | Read a case file whose documents are of different kinds but share a filing stamp | Later |
| 8 | Unions | Read an intercept log whose entries are unrelated kinds of record | Later |
| 9 | Pagination | Work through surveillance logs too heavy for the records clerk to release in one request | Later |
| 10 | Directives | Request costly detail only when a standing query needs it | Later |
| 11 | Mutations | File travel orders and expense claims through the terminal | Later |
| 12 | Input objects | Apply for a warrant on the bureaucracy's form | Later |
| 13 | Subscriptions | Keep a standing watch on a port, whose events arrive as game hours pass | Later |

Exploring a schema is taught from the first mission, through the documentation panel. Writing introspection queries by hand waits for clearance 6, where an undocumented archive gives the player a reason to.

Request weight (Section 3.3) is not a concept of its own. It is the story reason for pagination. The weight limit comes into force at clearance 9, where the surveillance logs exceed it and paging is the tool that brings a request under it. Directives practise the same economy at clearance 10, where `@include` and `@skip` drop heavy detail from a standing query that does not need it.

Each mission declares the concept it teaches, the concepts it practises, and the concepts it requires. The course as a whole follows four rules:

- A mission teaches at most one new concept. If two concepts will not separate, a mission is missing.
- A mission may only require concepts taught at or below its clearance level.
- Every concept is practised in at least one mission after the one that teaches it.
- Each clearance level ends with an **assessment mission**. It teaches no GraphQL concept, starts with a blank editor, and uses a different case and data to see whether players can apply the concepts learned so far.

These rules govern GraphQL concepts. Section 3.15 sets the matching limit on how much of the casework a stage or a mission may introduce.

#### Steps

Much of the language is smaller than a concept: a number written as an argument, a variable with a default value, a field marked deprecated. Each of these is a **step**. A step is introduced in one stage of a teaching mission, and that stage introduces nothing else: neither the mission's concept nor another step (Section 3.15). A later mission practises the step, as one practises a concept. A step has no level, no concept card, and no kata of its own, and an assessment introduces none.

The stage that introduces a step gives the player the reason to take it, as the stage that introduces a mechanic does. A page size arrives where the logs are too long to read whole. An enum arrives where a search has to be narrowed to one kind of record.

#### Coverage of the specification

A player who finishes the game has written or read every part of the GraphQL specification that writing an operation uses, as of its September 2026 edition. The parts that define a schema are not taught (Section 1.4), and neither are proposals that the specification does not include, such as `@defer` and `@stream`.

Clearances 1 to 5 are complete in 1.0 and keep their missions. They cover these parts of the language:

| Clearance | Covered |
|---|---|
| 1 | Fields, nested selections, and lists in a result. Comments, in the first case's starter. The rule that a field returning a record needs braces and a field returning a value takes none, and how to read type notation and `!` (the documentation panel). An error shown as the archive sent it, with the clerk's note beneath |
| 2 | Arguments, with text and ID values. Required and optional arguments, shown by `!` in the documentation panel |
| 3 | Aliases. The error for two fields that would share a name in the response, explained by the clerk. Partial results, with an error's `path` |
| 4 | Named fragments, spread in several places, with a type condition on an object type |
| 5 | Variables, declared with the type the documentation gives the argument. Operation names and the `query` keyword |

Three parts that belong at clearance 1 are covered by one sentence each rather than by a stage. Commas between fields are allowed and ignored (the first drill). The word `query` may be left out of a request that starts with a brace (the glossary entry for a query). A result lists its fields in the order the query asked for them (the glossary entry for a result).

From clearance 6, each teaching mission introduces its concept in its first stage and at most one step in each later stage. The cells name what each stage introduces.

| Clearance | Stage 1: the concept | Stage 2 | Stage 3 | Stage 4 |
|---|---|---|---|---|
| 6 | Introspection: `__schema { types { name fields { name } } }`, and reading the schema's root type, `Query`, among the types it lists | `__type(name:)`, with its fields and their descriptions | Reading a type through introspection: its kind, `ofType` through lists and `!`, and scalars, including a custom scalar | `__typename`, on records the archive hands over without a label |
| 7 | An interface: asking for the fields that every kind of document shares | An inline fragment, `... on Telegram { text }`, for the fields of one kind | An argument on a field inside the query, as in `documents(city: "Valparaíso")` | A true-or-false value, as in `documents(sealed: true)` |
| 8 | A union: every field inside an inline fragment, and `__typename` to tell the entries apart | An enum value, written without quotes, as in `entries(kind: VESSEL)` | A list value, as in `entries(kinds: [VESSEL, COMPANY])`. The debrief adds that a single value is accepted where a list is expected | A named fragment for one member of the union, spread inside its selection |
| 9 | A page size, as in `entries(first: 10)`, the first number the player writes | Cursors: `pageInfo { hasNextPage endCursor }`, then `after:` | A variable that may be left out, such as `$after: String` on the first page, and `null` as a value | How `null` travels upward: a classified entry in a list whose entries may not be null blanks the whole list, and the error says why |
| 10 | `@include(if: $detail)` | `@skip` | A directive on a group of fields: an inline fragment with no type condition, or a fragment spread | A fragment that spreads another fragment |
| 11 | A mutation with simple arguments, which returns a receipt for the paperwork | Several mutation fields in one request, which run in the order written, each under an alias | A decimal number, as in an expense claim's `amount: 412.5` | None |
| 12 | An input object, as in `requestWarrant(input: { … })` | A block string, `"""…"""`, for a sworn statement, with escapes in ordinary strings | A variable with a default value, as in `$urgency: Urgency = ROUTINE` | An input object that takes exactly one of its fields, marked `@oneOf`, where a warrant names either an operative or a company |
| 13 | A subscription, with its single top-level field | Several operations in one document, and choosing which one to transmit | Deprecation: an old polling field marked `@deprecated` in favour of the subscription, and `includeDeprecated: true` in introspection | None |

A stage declares the step it introduces with the key `step`. The steps are listed, with the clearance of each, in `src/content/steps.ts`, beside the code that recognises each step in a parsed request.

Each step comes after what it depends on. The true-or-false value at clearance 7 comes before the directive that takes one at clearance 10. Arguments inside a query come before the page size, and enums before the enum default at clearance 12.

Some uses need nothing new and are practised rather than introduced: a variable whose type is a list or an input type, an input object sent as a variable, and fragments and `__typename` on interfaces and unions. Declaring such a variable follows the rule of clearance 5, which copies the type from the documentation.

The records clerk explains, at the level of the construct, the rules of the specification that a request can break without the player meaning to: a variable or fragment that is never used, a fragment spread that can never apply, two operations with the same name, and a subscription with more than one top-level field (Section 7.5).

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

A campaign's coda (Section 2.3) is neither a teaching mission nor an assessment. It stays hidden until the last case of its campaign is resolved, in any mode and by any route, placement included. Completing it grants no clearance and no concept card.

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

Beyond the ladder there is a **solution reveal**, which shows the stage's reference solution. It is available at its stated cost while the clock is active and free after the deadline, even if the attempt has ended. In the first case, which has no clock (Section 3.3), every hint and the solution reveal are free. They are still recorded in the completion mode.

The player should always know what help costs. Each hint is labelled with its position and purpose, such as "Hint 2 of 4: names the concept", and the price of the ladder and of the solution reveal is stated before the first hint is taken.

Hints carry technique, not reference material. Anything the player needs in order to reason, such as the schema documentation and the meaning of a term, is free and always available.

Each completed mission records how much help the player used during that attempt as its **completion mode**. The modes are independent, hinted, and solution-revealed. All three count as completing the mission, and all three pass an assessment that is not a placement (Section 3.8). The mission list shows the help used. The player can investigate again for a different result.

The interface should make GraphQL errors understandable. The original error is always shown unaltered, and the records clerk adds a plain-language annotation beneath it. An annotation says where to look and is worded as a suggestion. For a repeated field that would give two answers the same response name, the clerk suggests separate transmissions until the glossary opens the alias entry. After that, the clerk can point to aliases. The annotation never contains the text to type. Errors are a routine part of the work and should not be presented as failures.

### 3.10 Debrief

Every mission ends with a debrief containing:

- The narrative outcome.
- The player's transmissions beside the mission's reference solution. Highlight a concrete difference where it helps explain the concept, such as which repeated selections a fragment replaces or which input can change without editing the operation. A successful alternative is also worth showing.
- The real geographical fact the mission turned on.
- A concept card for the tradecraft manual when the player earns one.

When the debrief comments on the player's technique, it reads the parsed query, never the typed text, so that a comment or a string cannot count as use of a feature. It reads only the transmissions that supplied the facts the player cited, in any draft, and a single one of them that shows the technique is enough. The level of a teaching case is the concept it teaches, and the level of an assessment is the concept card of its clearance. The reading is looser than a kata's check, because it describes and does not judge: an alias counts as in the kata, any fragment spread in two places counts, and one argument taken from a variable counts beside literal ones. When none of the transmissions shows the technique, the debrief says so with the note of the level's kata, or with its placement note after a placement pass, which ends by saying that the promotion stands. The comment describes what the player did and never changes whether the case is solved. Where the level has a kata and the player holds its clearance, the debrief links to it.

The tradecraft manual has two parts. Its glossary defines every term the game uses and is available from the start, because a definition is reference material. Its concept cards are earned, one per concept, by completing the mission that teaches the concept or by placement (Section 3.8). They summarize what the player has learned to do. Each teaching mission's debrief links to the next available case that practises that concept with new data.

### 3.11 Katas

A GraphQL kata is an optional drill outside the story, offered in a training range with no clock and no narrative stakes.

A kata tests whether a technique transfers to records the player has not seen. It is passed by a transmission that returns the facts the kata expects and has the structure the kata asks for. Katas are the only place where the structure of a query decides a pass, for example to confirm that a fragment was used. Missions and training drills (Section 3.14) never judge structure. The debrief inspects structure only to describe it (Section 3.10).

A kata uses the drill screen (Section 3.14) with the schema of the clearance the kata belongs to. The variables kata adds a variables panel, and its response is labelled with the variables it was sent with when the request declares one. Passing one earns no clearance and no concept card.

A kata opens when the player holds its clearance, which is the clearance of the concept card it practises. Until then the training range lists it only by that clearance, because its title may use a term the player has not met. The structure check reads the parsed request, never its text, so a comment or a string does not count:

- **Aliases:** one selection asks for the same field more than once, under different aliases. Asking for every country at once returns the facts and does not pass.
- **Fragments:** a fragment that asks for the kata's field is spread in two or more places. Writing the field beside each spread does not pass.
- **Variables:** the request declares a variable and takes every argument from a variable. Typing the city into the query does not pass.

When the response holds the facts and the request lacks the structure, the kata says so with a nudge of its own, separate from the nudge for a response that lacks the facts.

Three katas arrive with 1.0 (Section 11), one for each technique that a case can be solved without:

- **Aliases:** combine two lookups into one transmission.
- **Fragments:** add a field in one place so that it appears on every record that shares the selection.
- **Variables:** reuse an operation for a different city by changing only the JSON input.

Katas for the other concepts arrive after 1.0, one for each concept of Section 3.7. A step has no kata. Introspection's kata waits for a design of its own: a kata is passed by one transmission that returns the expected facts, and an introspection result holds no facts, because it describes the archive and not its records. Until that kata exists, the debrief of a clearance 6 case makes no technique note. So do exercises that ask the player to predict a response before sending the request, which need an interaction the game does not yet have.

### 3.12 Replay

After the MVP, a mission may define a pool of variants, such as different culprits, routes, and shipments. The game selects one by seed when the mission starts.

Every variant is authored and validated in advance. This gives replay value and makes answers harder to share without requiring procedural generation.

### 3.13 Orientation

An optional orientation is offered before the first mission. It is one short page: what the terminal is, a query beside its result, that a request the clerk cannot read is returned without penalty, and where the schema documentation and glossary are. It does not explain the clock, which the player first meets in the second case (Section 3.3). It hands the player on to the training drills (Section 3.14), which teach by doing.

The orientation is never required and can be reopened at any time. It exists so that the first mission can teach GraphQL without also having to teach the interface.

### 3.14 Training drills

The training range opens with a short run of drills, offered to a new player before the first case. Each drill teaches one skill: asking for a field, opening a record, reading a list, following two links, following a chain of three links, and consulting the documentation. Together they take about six minutes. The chain drill is there so that the deepest query of the first case is one level deeper than something the player has already written, and no more (Section 3.15).

A drill has a task of one short paragraph, a starter query, the terminal, and the response beside it. It has no clock, no leads, and no draft, and every transmission is free. A drill is passed by any transmission whose response holds the facts the drill expects, so the game still never judges the text of a query. A request that does not pass shows its response and one authored nudge.

Drills are optional and never lock a case. Passing them earns no clearance and no concept card. They exist so that the first case can teach casework to a player who has already seen that a query can be nested.

Two aids in the terminal serve the same purpose in every case. The editor suggests the fields that fit where the cursor is. The findings name, once for each kind of record, the links on it that the query did not open.

### 3.15 Pacing

A player learns two things in this game: GraphQL, and the casework that the game wraps around it. Each is taught a little at a time. The curriculum (Section 3.7) limits a mission to one new GraphQL concept. This section sets the matching limit on casework, and on how much of either a single stage may ask for.

A **casework mechanic** is a part of the game that the player has to learn in order to act: what a control does, what it costs, and when to use it. The table lists the mechanics of 1.0 and where a player who follows the course first meets each one.

| Casework mechanic | What the player meets | First appears |
|---|---|---|
| Citing | A lead, one claim, and citing a finding into the form | *The Vanishing Azulejos*, stage 1 |
| Travel order | Two claims on one form, choosing the destination, and travelling | *The Vanishing Azulejos*, stage 3 |
| Deduction over several records | A form that asks the player to identify more than one record | *The Vanishing Azulejos*, stage 4 |
| The clock | Hours, a deadline, and a price on hints and on the solution reveal | *The Borrowed Chronometer* |
| Ruling out | Citing a fact that contradicts a claim, and marking the lead ruled out | *The Guest Register* |
| Field check | Spending hours to test a lead whose case is incomplete | *The Quiet Consignee* |

The course follows these rules:

- A stage introduces at most one GraphQL step and at most one casework mechanic. A GraphQL step is a new concept, a step of Section 3.7, or one more level of nesting than the player has written before.
- A mission introduces at most one GraphQL concept (Section 3.7). After the first case, a mission introduces at most one casework mechanic.
- The first case is the one exception to the limit on mechanics, because casework has to start somewhere. It introduces three, each in a short stage of its own.
- A stage uses a mechanic only if that stage or an earlier one in the course introduces it. A case before *The Guest Register* therefore authors no refutation, and a case before *The Quiet Consignee* offers no field check.
- The stage that introduces a mechanic gives the player a reason to use it. A player who writes the query the briefing leads to should find themselves where the mechanic applies. In *The Quiet Consignee* the shipping papers leave the consignee blank. A player who looks up a company by its name can cite who directs it, but cannot yet show that it is to receive the cases, and that is when the form offers a field check. The check's dispatch points to the depot's intake record, which settles the claim.
- A mechanic that arrives after 1.0, such as warrants, takes a row in the table and a case of its own.

From clearance 3 onward, every mechanic of 1.0 is in play and a case introduces its GraphQL concept alone. From clearance 6, a teaching mission introduces its concept in its first stage and at most one step in each later stage (Section 3.7), and it has at most four stages.

A player who skips ahead by placement (Section 3.8) meets every mechanic of the case they chose at once. That is their choice, and the assessment's briefing still explains the clock.

*The Vanishing Azulejos* is laid out to follow these rules. It has four stages and no clock.

| Stage | Objective | New GraphQL step | New casework mechanic |
|---|---|---|---|
| 1. Lisbon, the manifests | Identify the crate that cannot be the tiles. One of the three manifests describes slate. | None. The query asks for a field on each record in a list, as the drills did. | Citing |
| 2. Lisbon, the routes | Identify the ceramic crate going to a country that does not border Namibia. One of the two ceramic shipments is bound for an island. | Nested selections: from a shipment to its destination, that city's country, and that country's borders | None |
| 3. Lisbon, the travel order | Send the hold to the country that receives the remaining crate. | None. The evidence is already in the ledger. | Travel order |
| 4. Luanda | Identify who signed the transfer order that matches the replacement label. | Two records opened side by side under one shipment | Deduction over several records |

Stages 1 to 3 take place at one desk in Lisbon. Stages in the same country share their results: the responses stay in the results panel when the next stage opens, and a lead can be opened from any of them. This is what lets stage 3 be completed with no new query. A form that is accepted without a journey is acknowledged with a dispatch marked as accepted, and the results panel is cleared only when the player travels.

Stages 1 and 2 each ask for one claim about one crate, so the player's first two forms hold a single claim. The two crates set aside in those stages are not ruled out with the ruling-out mechanic, which does not exist yet for this player. Each is the answer to its own stage.

Validation enforces the rules about mechanics (Section 5.5). It cannot measure whether a query is one step harder than the last, so the rule about nesting is an authoring rule (Section 5.6), and the novice walkthrough (Section 10.1) reports where a stage asked for too much.

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
- **Bundle size.** The editor, the GraphQL tooling, and the world data are loaded on demand. The Vim keybindings are loaded only when the player has turned them on. The size of the initial bundle is a budget checked in continuous integration, so that a size warning never becomes a standing one. The first screen loads every mission file, so each clearance adds about 5 kB to the initial bundle. The budget is 140 kB from clearance 10. Before clearance 13, the stages of a mission should load on demand with the workspace, leaving only what the assignments desk shows in the initial bundle.
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

The coda (Section 2.3) adds the records its chain needs: the office that authorized an order, the agency's travel orders, a register serial number that puts orders in sequence, the registrar's objection, and the person who released a receipt, which is empty on the receipt for the tiles. The archive is fixed, so the travel orders describe the route the campaign's cases follow and not the journeys of a particular player. In *The Receipt*, an office keeps a register whose entries carry a serial number and a note. Travel orders, payment orders, and the crate's transfer orders each have an office that cleared or issued them and an entry in that office's register, so the office can be reached by two routes, as a transfer order's signer can (Section 5.4). A receipt leads to the order that released the goods and to the register entry of the report that they were missing. Two decoy offices in Luanda and Lusaka cleared other orders for the crate and for the payments in Lusaka. The new types and fields are visible at clearance 5, where a player may notice them in the schema documentation before the coda. Their names and descriptions are plain, so that the documentation does not announce what the coda reveals. Every earlier case must still validate after the records are added.

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

At clearance 11, game actions become available as mutations, and from clearance 12 a warrant is applied for with an input object. An illustrative warrant application:

    mutation {
      requestWarrant(input: {
        operative: "SCARLET_FOX"
        evidence: ["EV-0031", "EV-0044"]
      }) {
        approved
        reasons
      }
    }

The levels after 1.0 need these schema features, each at the clearance of the step or concept that uses it (Section 3.7): fields that take arguments inside a query, including a true-or-false argument; a `Document` interface with several kinds of document; a union returned by a search; enums, and arguments that take a list; a custom scalar, which is `DeskSerial` at clearance 6; paginated logs whose entries may not be null, with classified entries among them; input types, one of them marked `@oneOf`; a mutation root; a subscription root; and a polling field marked `@deprecated` in favour of a subscription.

From clearance 7, a case file holds documents of several kinds. `Query.caseFile(reference:)` returns a `CaseFile`, whose field `documents` returns the interface `Document`. `Telegram`, `Memorandum`, and `Minute` implement it. `Document` lists the filing stamp that every kind shares: `reference`, `title`, `stamp`, `city`, and `sealed`. Each kind adds fields of its own, which a query reaches through an inline fragment. The field `documents` takes two arguments, `city: String` and `sealed: Boolean = false`, so it is the first field inside a query that takes arguments. A city matches by its name or its identifier, without regard to case or accents. A sealed document is listed only when the request asks for `sealed: true`, and that request lists only the sealed documents. A record reached through an interface keeps the type it was filed as, so a fact about it belongs to that type, such as `Telegram:TEL-0089`. The documentation panel lists an interface beside the object types, with the kinds that implement it, and shows an argument's default value.

From clearance 8, an intercept log holds entries of unrelated kinds. `Query.interceptLog(reference:)` returns an `InterceptLog`, whose field `entries` returns the union `Intercept`. A `Vessel`, a `Company`, a `Sighting`, a `Telegram`, or a `Pass` can be an entry, and `Intercept` lists no fields of its own, so a query asks for every field but `__typename` inside an inline fragment or a fragment on one kind. The field `entries` takes two arguments: `kind: InterceptKind`, which takes one value of the enum `InterceptKind`, and `kinds: [InterceptKind!]`, which takes a list of values. The arguments `kind` and `kinds`, on a field that returns an interface or a union, match a record by the type it was filed as, written as an enum value: a `Vessel` matches `VESSEL`. A single value given where a list is expected is read as a list of one, as the specification requires. A vessel has an owner and may have a company that hired it (`charteredBy`, with `Company.charters` as its inverse). A sighting may give the vessel the person came ashore from and the pass the person showed at a door. The documentation panel lists a union with its kinds and an example inline fragment, and an enum with its values and an example argument. Enum values may appear in mission text, where the check on identifiers (Section 5.5) accepts them as it accepts record ids.

From clearance 9, a watch book is read in pages. `Query.watchBook(reference:)` returns a `WatchBook`, whose field `entries(first: Int, after: String)` returns a `WatchPage`. A page has two fields: `nodes: [WatchEntry!]`, the entries on the page, and `pageInfo`, a `PageInfo` with `hasNextPage` and `endCursor`. The engine recognises a page by its shape, an object type with the fields `nodes` and `pageInfo`, and needs no directive for it. `first` is the page size and `after` starts the page after the entry whose cursor it gives. An entry's cursor is its `reference`, such as `COR-0150`, so mission text can quote a cursor and the check on identifiers (Section 5.5) covers it. Without `first`, the page runs to the end of the list. A cursor the list does not hold is an error, and a page size below zero is an error. A page is not a record. It has no identity of its own and records no fact, and the records on it are a fact about the list on the record that holds them, as `WatchBook:WB-0112.entries`. That list fact is complete only when the page holds the whole list. Read as data, by the store and by validation, the field is the list itself.

From clearance 9, a whole record can be classified. An intelligence record marked `withheld: 10` stands in a list as an error, "WatchEntry COR-0202 is classified above your clearance." Because the entries of `nodes` may not be null, the error blanks the whole of `nodes`, and the null stops there, because `nodes` itself may be null. `pageInfo` still comes back, so the player can start the next page after the classified entry.

From clearance 10, a file of papers holds the papers that one office filed. `Query.paperFile(reference:)` returns a `PaperFile`, whose field `papers(first: Int, after: String)` returns a `PaperPage`, read in pages as a watch book is. A paper's cursor is its `reference`. A `Paper` has a `minuteSheet`, a list of `Endorsement` records, each with the officer who wrote it, and `enclosures`, the papers pinned to it, each with a minute sheet of its own. The minute sheets are the heavy part of a paper. A request that asks for them on every paper in a file is over the weight limit, and the same request with the minute sheets left out by a directive is well under it. From clearance 10 the documentation panel lists `@include` and `@skip` after the types, with the type of `if`. The other directives of the specification wait for the clearances that teach them.

From clearance 6, part of the archive is **undocumented**. An internal directive, `@undocumented`, marks a type or a field that the documentation panel leaves out. Like `@clearance`, it is removed before the schema is served. The seized records of clearance 6 are reached through two fields of `Query`, `cabinet` and `exchangeBook`, that the panel does not list, and their types are not listed either. The schema still holds a description of every one of them, written in the filing language of the office that kept the records. Introspection returns those descriptions, so an undocumented type is fully described to a player who asks the archive. From clearance 6 the panel says that seized records are not listed, and points to the glossary entry for introspection. A clerk's note on a field that an undocumented type lacks points there as well, and not to the panel.

Schema design should balance educational usefulness, realism, discoverability, and implementation simplicity.

The schema will evolve as new missions introduce additional entities, relationships, and GraphQL features.

### 5.4 Mission Definitions

Missions should be declarative and stored as human-readable YAML files in version control.

Each mission contains one or more stages. A stage represents an investigation objective, usually associated with a location.

A mission declares what it teaches, what it practises, what it requires, and the event its deadline represents. Its time budget is computed from its reference solution (Section 3.3). An assessment mission teaches nothing and lists the concepts it combines under `practises`. A stage declares its clues, scaffold, hint ladder, evidence sets, accepted solution, and a reference solution. It can also declare which leads can be ruled out, what evidence refutes them, and what dispatch a field check returns. A stage that introduces a casework mechanic declares it under `introduces`, with one of the mechanics of Section 3.15. A stage that introduces a step of Section 3.7 declares it under `step`. A mission with no `clock` entry is untimed. A stage whose evidence is already in the ledger, such as the travel order of the first case, has an empty list as its reference solution and asks for no new query. Each evidence set lists facts that must be cited together, and each claim has at least two sets that support it. Records are written as `Type:identifier`. A name beginning with `$` is a binding, which stands for one record. The bindings named in a stage's `solution` describe the lead under consideration, such as `$shipment`. Within one evidence set or refutation, a binding stands for the same record wherever it appears. A binding that the solution does not name, such as `$inspection`, may be any record for which every fact in the set has been cited.

A clue's `constraint` is the machine-readable form of the clue. Each entry is a path of schema fields that starts from a binding, followed by the value the path must reach: a literal, a record, or another path. A path that passes through a list is satisfied when any member of the list matches. A path written with `!` after it must not reach the value, so `$shipment.manifest!` followed by a description selects the shipments whose manifest says something else. The first case uses this form for the two crates it sets aside, each of which is identified by the clue it fails. Validation evaluates the constraints against the data itself, not against the ledger, and tries every record of the right type for each binding the constraints use. Exactly one assignment may satisfy every constraint of the stage, and it must agree with the `solution` (Section 5.5). A part of the solution that no constraint binds, such as the signer in Luanda, must follow from the stage's evidence sets.

This example is *The Vanishing Azulejos* as Section 3.15 lays it out, with four stages and no clock.

    id: vanishing-azulejos
    title: The Vanishing Azulejos
    campaign: shadow-network
    order: 1
    clearance: 1
    kind: teaching
    teaches: nested-selections
    practises: []
    requires: []
    summary: >
      A museum's tiles left Lisbon in a crate marked as samples. Three crates
      fit that description, and customs can hold one.
    motif: tilework
    startingStage: manifests

    debrief:
      onTime: |
        Luanda holds the crate. The clerk files the transfer order
        with NIGHTJAR's name circled.
      stampOnTime: HOLD ISSUED
      comparison: >
        The first query in Lisbon asked for one field, `manifest`, on each
        shipment in a list. The reference solution for the second question
        opens each shipment's destination, then that city's country, then that
        country's borders, all in one request. Each pair of braces follows a
        link to the next record, and the whole route comes back in a single
        transmission. The travel order needed no query, because both of its
        claims rest on facts those two responses had already returned. In
        Luanda, the reference solution nests again. Inside each arriving
        shipment it opens the depot's intake record and both transfer orders,
        and inside each order it opens the operative who signed it. The label
        and the two orders come back side by side.
      geography: >
        Angola borders Namibia along the Cunene and Okavango rivers. Cabo
        Verde is an archipelago in the Atlantic and has no land border at all.

    stages:
      manifests:
        location: PT
        introduces: citing
        objective: Identify the shipment whose contents cannot be the tiles.

        briefing: |
          A priceless collection of azulejos, the painted tiles of
          Portugal, has vanished from a Lisbon museum. Three shipments
          declared as samples left the port that morning. Customs
          cannot hold all three, and asks you to set aside one crate
          at a time. Start with any crate that does not hold tiles.

          The Deduction form makes a claim about one shipment. The
          shipment you make the claim about is your lead. In Results,
          find the row that proves the claim. Press Cite beside that
          row. When the button shows a shipment's ID, Cite opens that
          shipment's draft and adds the fact as a [citation](glossary:citation).
          When the claim shows Supported, press Submit deduction.

        clues:
          - text: >
              All three shipments left from Lisbon.
            constraint:
              $shipment.origin: City:lisbon
          - text: >
              The museum registrar says the tiles are ceramic: blue squares,
              14 centimetres across.
            constraint:
              $shipment.manifest!: Blue ceramic squares (14 cm)

        scaffold:
          level: guided
          starterQuery: |
            query {
              city(name: "Lisbon") {
                departingShipments {
                  id
                  # This query is unfinished. Add the field that says what
                  # each shipment contains. The Documentation tab lists the
                  # fields a shipment has.
                }
              }
            }

        hints:
          nudge: >
            One of the three crates holds something that is not ceramic.
            Find what the papers for each shipment say is inside it.
          concept: >
            The query already asks for the id of every shipment that left
            Lisbon. A field written inside the braces after
            departingShipments comes back once for each shipment in the
            list. Add the field for a shipment's contents on a line of its
            own, under id.
          schema: >
            Look at Shipment.manifest.
          skeleton: |
            departingShipments { id manifest }

        solution:
          type: deduction
          shipment: LIS-0486
        labels:
          shipment: Shipment

        claims:
          - id: not-ceramic
            prompt: The contents of this shipment are not ceramic.
            evidenceSets:
              - facts:
                  - entity: Shipment:$shipment
                    field: manifest
                    equals: Blue slate squares (14 cm)
              - facts:
                  - entity: Shipment:$shipment
                    field: inspection
                    equals: Inspection:$inspection
                  - entity: Inspection:$inspection
                    field: finding
                    equals: Slate tiles, blue-grey, 14 cm

        resolved: |
          Deduction accepted. The port expecting that crate will be
          told it is slate. The harbourmaster there offers to send a
          sample.

        referenceSolution: |
          query {
            city(name: "Lisbon") {
              departingShipments {
                id
                manifest
              }
            }
          }

        next: routes

      routes:
        location: PT
        objective: Identify the ceramic shipment going to a country that does not border Namibia.

        briefing: |
          Two crates of blue ceramic squares are left. An intercepted
          dispatch says a truck will carry the tiles into Namibia
          directly from the country that receives them. The tiles are
          therefore going to a country that shares a land border with
          Namibia. One of the two crates is going somewhere that
          shares no such border. Set that crate aside.

          Use the manifests to find the two ceramic shipments. The
          claim on this form is about the border, so cite the route
          evidence for the shipment you set aside.

        clues:
          - text: >
              Two shipments from Lisbon list blue ceramic squares, 14
              centimetres across.
            constraint:
              $shipment.origin: City:lisbon
              $shipment.manifest: Blue ceramic squares (14 cm)
          - text: >
              An intercepted dispatch says the truck will cross into
              Namibia directly from the country receiving the tiles.
            constraint:
              $shipment.destination.country.borders!: Country:NA

        scaffold:
          level: guided
          starterQuery: |
            query {
              city(name: "Lisbon") {
                departingShipments {
                  id
                  manifest
                  # This query is unfinished. Add the field that says
                  # where each shipment is going. The Documentation tab
                  # lists the fields a shipment has.
                }
              }
            }

        hints:
          nudge: >
            For each of the two ceramic shipments, find the country it is
            going to. Then find the countries that share a border with that
            country. One of the two countries has no border with Namibia.
            A country with no land borders comes back with an empty list,
            and you can cite an empty list like any other row.
          concept: >
            A shipment's destination is a record, not a single value. A
            field that holds a record needs braces after it, with the
            fields you want from that record inside the braces. The fields
            inside one pair of braces are called a selection.
          schema: >
            Look at Shipment.destination, City.country, and
            Country.borders.
          skeleton: |
            destination { name country { name borders { name } } }

        solution:
          type: deduction
          shipment: LIS-0522
        labels:
          shipment: Shipment

        claims:
          - id: no-road
            prompt: The country receiving this shipment has no land border with Namibia.
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
                    excludes: Country:NA
              - facts:
                  - entity: Shipment:$shipment
                    field: destination
                    equals: City:$city
                  - entity: City:$city
                    field: country
                    equals: Country:$country
                  - entity: Country:NA
                    field: borders
                    excludes: Country:$country

        resolved: |
          Deduction accepted. Praia's harbourmaster asks to see the
          truck that can drive from an island to the Namibian border.

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

        next: travel-order

      travel-order:
        location: PT
        introduces: travel-order
        objective: Identify the shipment carrying the tiles and the country receiving it.

        briefing: |
          One crate is left, and customs will send you after it. The
          Travel order makes two claims about that shipment. One claim
          is about the contents and one is about the route. Your
          earlier responses in Results already hold the evidence for both.

          Cite the facts about the remaining shipment. The form matches
          each citation to the claim it supports. Choose the receiving
          country to record your answer. When both claims show Supported,
          press Travel.

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
              $shipment.destination.country: $country

        scaffold:
          level: guided
          carryOver: true

        hints:
          nudge: >
            You have set two crates aside: the slate, and the ceramic crate
            going to an island. The crate that is left is the lead for this
            travel order.
          concept: >
            This stage needs no new query. Your last response is still in
            the Results panel. Find the remaining shipment in it. Press Cite
            on that shipment's manifest row for the first claim. Then find
            the borders row under that shipment's destination and country,
            and press Cite on the borders row for the second claim.
          schema: >
            The facts came from Shipment.manifest, Shipment.destination,
            City.country, and Country.borders.
          skeleton: |
            Rows to cite under the remaining shipment:
            manifest
            destination, then country, then borders

        solution:
          type: destination
          shipment: LIS-0417
          country: AO
        labels:
          shipment: Shipment
          country: Country receiving the shipment

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

        resolved: |
          Travel order approved. You land in Luanda as the depot
          finishes logging the morning's arrivals.

        referenceSolution: []

        next: luanda

      luanda:
        location: AO
        introduces: deduction
        objective: Identify who authorized the crate's transfer to the replacement consignee.

        briefing: |
          Someone has relabelled the crate. The replacement label gives
          a new consignee, which is the company that is to receive it.
          Two transfer orders give different consignees and carry
          different signatures. Find who signed the order that
          matches the label on the crate.

          This deduction is about more than one record. The form asks
          you to choose three: the transfer order, the shipment the
          order is for, and the operative who authorized the order.

        clues:
          - text: >
              The depot's intake record gives the label attached to LIS-0417 on arrival.
            constraint:
              $shipment: Shipment:LIS-0417
          - text: >
              The transfer order must give the same consignee as that label.
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
            First find who the depot says should receive the crate. Then
            look for the same company on the two transfer orders.
          concept: >
            Each arriving shipment holds an intake record and a list of
            transfer orders. Open both with braces, and ask for the
            consignee inside each. Then, inside the transfer orders, open
            the field that says who authorized the order.
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
          order: LUA-012
          shipment: LIS-0417
          operative: NIGHTJAR
        labels:
          order: Transfer order
          shipment: For shipment
          operative: Authorized by

        claims:
          - id: matching-order
            prompt: This order gives the same consignee as the crate's replacement label.
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

        resolved: |
          Deduction accepted. The depot holds the crate against
          order LUA-012.

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

The first stage asks for the crate that is not ceramic, which is LIS-0486. The second asks for the ceramic crate going to a country that does not border Namibia, which is LIS-0522. Each of these crates is the answer to its own stage, so neither stage authors a refutation, and the player meets ruling out for the first time in *The Guest Register*. The third stage asks for the crate that is left. It sends no query: its two claims rest on the manifest and the route that the first two stages retrieved.

Each claim can be supported in two ways. The port inspector's finding describes the goods in different words from the manifest: slate for the Cape Town crate and glazed ceramic for the other two. Namibia's own list of borders confirms the route from the other side, and shows from the other side that Cabo Verde is not on it.

In Luanda, the intake record and the unloading receipt both give the consignee on the replacement label as Parallax Freight. Order LUA-012 gives Parallax Freight and was signed by NIGHTJAR. The other order, LUA-011, gives Lantern Export and was signed by COPPER_KITE. The order's signature and the authorization log both identify its signer. Both evidence paths are available at clearance 1.

Every starter query supplies the `name` argument. The first Lisbon query leaves out the `manifest` field, and the second leaves out the destination selection. The Luanda query leaves the player to choose which shipment records and nested fields to retrieve. Arguments are taught at the next clearance level.

The content model should eventually support branching investigations, multiple acceptable solutions, variant pools (Section 3.12), and connections between missions.

A mission's `kind` is teaching, assessment, or coda. A coda has one stage and no clock. It grants no clearance and no concept card, and the count of resolved cases leaves it out. It becomes available when the last case of its campaign is resolved. It is the last mission of its campaign, at the clearance of the campaign's last case, and it introduces no casework mechanic. A campaign has at most one. Its claims meet the same standard as any other stage's, including two evidence sets for each claim.

A mission is a single YAML file. Its prose is written in YAML block scalars and may use a small inline subset of Markdown: emphasis, code, and links to glossary entries. Mission text is brief (Sections 5.6 and 5.7) and does not need files of its own.

### 5.5 Data Validation

A build-time validation process should check:

- **Structure:** Mission definitions have the required fields.
- **References:** Geographical entities, operatives, organizations, stages, missions, and campaigns that are referred to all exist.
- **World data:** Every border is recorded from both sides, and every city belongs to a country.
- **Reachability:** Every stage can be reached and every mission has a terminal outcome.
- Verify that the clues for each stage identify exactly one solution among the candidates in the data. Where a stage has wrong leads that can be ruled out, each clue must also leave at least one wrong lead plausible on its own. In Luanda, only one order for the crate names the consignee on the logged label. Where reports conflict, the corroborating data settles the conflict.
- Verify that every claim has at least two supporting evidence sets and that no supporting set contains another. Each authored set must be retrievable at the mission's clearance. The tests accept complete sets with extra citations and reject incomplete sets or facts from unrelated leads unless the cited facts form another complete set.
- Verify that each authored refutation is retrievable at the mission's clearance and refutes the named claim for that lead. A field check must be reachable with a supported claim and an unverified claim, must charge the quoted cost, and must leave the stage open. A viable lead stays open after its field check.
- **Citations:** Every evidence set that the stage's reference solution retrieves can be assembled by Cite controls on its response, in the draft of the lead the set is about, and no Cite control leaves out a fact of the set that lies on the path to its row. The same holds for each lead's refutation, in that lead's draft, when the reference solution retrieves it. A row beneath a fact of the refutation must carry that fact, unless the row is evidence for a claim and its citation is built for that claim (Section 3.2). The solvability and field-check steps cite through the same controls. This checks the citations the interface builds, not only the facts the engine accepts. A reference solution retrieves one set for each claim and need not retrieve the alternatives, so the check does not reach an alternative set that only a different query returns.
- **Pacing:** The rules of Section 3.15 hold. Validation works out which mechanics a stage uses from what the stage authors: a clock on its mission, a refutation, a field check, a travel solution, and a deduction that identifies more than one record. Every stage uses citing. It fails when a stage uses a mechanic that neither it nor an earlier stage in the course introduces, when a mission after the first introduces more than one, when two stages introduce the same mechanic, and when a stage declares a mechanic it does not use. The format gives a stage one `introduces` entry, so a stage cannot introduce two.
- **Solvability:** The reference solution executes without error and yields the required evidence. A record classified above the mission's clearance is a partial result the case is written around (Section 3.8), and its error is not counted as one. The time it spends sets the mission's budget (Section 3.3).
- **Request weight:** Every reference solution fits under the weight limit. In the mission that teaches pagination, the logs requested whole exceed the limit, and the reference solution pages through them under it. In the mission that teaches directives, at least one request of the reference solution would exceed the limit with its `@include` and `@skip` taken out.
- **Curriculum order:** A mission requires only concepts taught at or below its clearance, and its reference solution uses the concept it claims to teach. A reference solution uses interfaces when it opens a field that returns an interface, and unions when it opens a field that returns a union, and it must then declare the concept.
- **Steps:** From clearance 6, each stage declares the step of Section 3.7 it introduces, if any. A stage introduces at most one step or concept, so the first stage of a teaching mission, which introduces the concept, declares none. The step is one the coverage table lists at the mission's clearance, only a teaching mission introduces one, the stage's reference solution uses it, a later mission's reference solution practises it, and no reference solution uses it before the stage that introduces it. Mission text uses the step's glossary term only from its clearance. Validation recognises a step from the parsed reference solution, never from its text. One step shows only in a response: a null that travels up from a classified entry is recognised from what the archive returns to the reference solution. A teaching mission from clearance 6 has at most four stages.
- **Course shape:** The rules of Section 3.7 hold. Every taught concept is practised later, every clearance level ends with an assessment mission, and every mission file in the content directory is part of the course. A coda is left out of these rules about levels and out of the check that the course order promotes the player to each mission's clearance. It has one stage, no clock, teaches nothing, introduces no mechanic, and is the only coda and the last mission of its campaign, at the clearance of the campaign's last case.
- **Starter queries:** A stage's starter query does not, unchanged, yield the required evidence.
- **Training drills:** Each drill's reference transmits without error at clearance 1 and returns the expected facts, and its starter query does not.
- **Katas:** Each kata's clearance is that of its concept's card. Its reference, sent with its reference variables, transmits without error at that clearance, returns the expected facts, and has the structure of the kata's technique (Section 3.11). Its starter, sent with its starting variables, does not pass. Every case at a kata's level has a reference solution that shows the kata's technique as the debrief reads it (Section 3.10), so the debrief never faults a player for doing what the reference does.
- **Hints:** Every stage has the complete hint ladder, and each schema pointer names types and fields that exist at the mission's clearance.
- **Terms:** GraphQL terms used in mission text are glossary entries, and are introduced at or below the mission's clearance. Drills are held to clearance 1, and a kata and a concept card to their own clearance.
- **Text references:** Entity names and identifiers quoted in mission text exist in the data.
- **Wording:** No player-facing text in the content directory contains a phrase that Section 5.7 rules out: a back-reference with no target, "name" used as a verb, or "object" for a record. The check covers missions, drills, concept cards, the glossary, and campaigns.
- **Glossary links:** Every link to a glossary entry points at an entry that exists.
- **Markup:** A field that the interface shows as plain text contains no inline Markdown.
- **Variants:** Where a mission defines variants, every variant passes all of the checks above.

Every check is an error that fails the build. A check that only prints a warning will eventually be ignored.

### 5.6 Authoring Rules

Validation cannot catch everything, so mission authors also follow these rules.

- **State the objective, not the method.** An objective says what to find. It never says which query to write or which GraphQL feature to use. Technique belongs in the hints, where the player chooses to see it.
- **Add one thing at a time.** Before writing a stage, list what its player has not done before: each GraphQL step and each casework mechanic (Section 3.15). If the list has two GraphQL steps or two mechanics, split the stage. Keep a stage's reference solution to about one level of nesting deeper than the deepest query the course has asked for so far, counting the drills.
- **Make wrong leads plausible.** Once ruling out has been introduced (Section 3.15), a plausible wrong lead fits at least one clue. Give players a way to disqualify it from query results before traveling. Where the player can rule out the lead, use a short dispatch to acknowledge the deduction. Where a field check is available, write a dispatch that points the player toward the record that resolves the uncertainty.
- **Change the question as the case develops.** In a multi-stage teaching mission, have the next stage reveal something that calls for a new deduction with the same GraphQL concept. Name what will happen at the deadline in the briefing and in the clock.
- **Give every claim two routes.** The two evidence sets should pass through different records, so that a player who misses one field can still make the case. Prefer a second route through records the schema already has, such as a border seen from the other side. Add a record for the purpose only when none exists, because each one enlarges the schema a beginner has to read.
- **Write a fresh assessment case.** Change the evidence or relationships enough that a player has to decide which fields to retrieve. Keep the goal clear and leave the editor blank.
- **Say which record settles a contents claim.** A claim about what a shipment holds accepts the shipping papers (`manifest`) or the inspector's finding, whichever shows it. When the papers cannot tell the candidates apart, the clue says so, so that the player knows why the inspection is needed in that case and was not in an earlier one.
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

- Rendered: a stage's `briefing`, the `ruledOut` and `fieldCheck` dispatches, every `debrief` text, a glossary `definition`, a concept card's `summary`, a drill's `task`, `nudge`, and `payoff`, and a kata's `task`, `nudge`, `structureNudge`, `payoff`, and the `unused` and `placement` notes of its `debrief`.
- Shown as typed: `objective`, clue text, all four hints, claim prompts, `resolved`, the clock texts, a concept card's `payoff`, and the mission and campaign `summary`.

#### What is checked

Validation (Section 5.5) fails the build on a short list of phrases that are almost never right: the back-references in rule 2, "name" as a verb, and "object" for a record. The list is in `src/content/style.ts`. It is kept short so that every finding is a real fault. Add a phrase when a review finds one that keeps coming back.

The check does not make a passage clear. Rules 1, 4, 5, and 6 depend on judgment, and so does the text written inside interface components, which validation does not read. The novice walkthrough (Section 10.1) is the test for those: a reader who does not know the answer reports each place they had to read twice.

## 6. Interface Design

### 6.1 GraphQL Execution Interface

The application will expose a local execution interface to the editor and game engine.

It takes an operation, its variables, and the clearance level in force (Section 3.8). It returns the standard GraphQL result together with the facts that result contains and their response paths.

Once request weight is implemented (Section 3.3), the result's `extensions` carry the weight from clearance 6. From clearance 9, a request above the limit is refused before execution with an ordinary GraphQL error that states the weight and the limit.

Operations should support normal GraphQL functionality, including schema validation, variables, fragments, aliases, directives, and introspection, within the schema for the given clearance.

A document may hold several operations. From clearance 13 the terminal lets the player choose which one to transmit, and sends its name as the operation to run.

A subscription runs locally, as a stream of events that the game clock drives. Opening it is one transmission. While it is open, each event that the case's data schedules for an hour that has passed is delivered as a result and adds its facts to the ledger. No event is delivered on a real-time clock.

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
- Open a standing watch, which is a subscription, or close it. Opening one is a transmission.
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

- Annotating validation and execution errors in the records clerk's voice, including the rules of the specification that a request can break unintentionally (Section 3.7). A note names a technique only from the clearance at which the glossary introduces it.
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

**Mission Selection:** Available assignments, the clearance each requires, the concept each teaches, and campaign progress. For completed assignments, show the help used. An assessment that the player would attempt as a placement is marked as one. One assignment is emphasized: the next case in the story. It is the first case in course order that the player has not completed, can open, and would not attempt as a placement. A case at or above the player's clearance comes before an earlier one, so a player promoted by placement is pointed at their new level and not back at the first case. Placements are grouped under a single entry, closed until the player opens it, so that a new player sees one way forward and a returning player can still skip ahead. A placement already in progress stays with its level, where the player can see it, and a completed placement returns to its level. A campaign's coda appears once its last case is resolved. Until then it is not shown at all, not even as locked, and its address answers as if nothing were filed there, so that its title gives nothing away. The count of resolved cases leaves it out. Once it appears, it is the assignment emphasized.

**Mission Briefing:** Classified narrative introduction, objectives, and initial intelligence.

The **Intelligence Terminal** shows the editor and the latest results side by side, with the objective, current location, and deadline event in view. Players can switch between leads, inspect the response, and attach a finding to the open draft. When a response holds several records of one type, such as three dossiers fetched under aliases or the shipments in a list, a Side by side tab beside the findings shows them in columns with one row for each field, and a field that a record lacks stays visibly blank and shaded. A cell is cited as the matching row of the findings is, into the same draft. Records fit in columns when each field holds a single value, a short list that reads on one line, a nested record, or a list of exactly one record; a list of several records stays stacked, and that list can itself be shown in columns. The findings say when a response has a Side by side view. The view arranges what the player retrieved. It never marks which record fits a clue, because that comparison is the player's work. Each response is labelled, above its tabs, with the variables it was sent with, and a response sent with none has no label. From clearance 6, a second label states the request's weight (Section 3.3), and the raw response shows it under `extensions`. An introspection result has a compact view of its own. It holds no facts and offers no Cite, and it says so. A long list of types is folded to one line a type, with the number of its fields, and each field takes one line with its type. A type reference reads layer by layer, outermost first, as in `NON_NULL → LIST → NON_NULL → OBJECT TransferOrder`, so that the layers stay the player's to read. A record that a query asked only for its `__typename` is headed by that type. The same error made in several places is shown once, with every place it was made. When the clerk returns a request unprocessed, the results say that the findings beneath are from the last transmission the archive answered, and not from the returned request. Above the clues of each stage, a sentence says that each clue is a fact about the record the stage asks the player to identify. Keep raw GraphQL results, schema documentation for the clearance in force, error annotations, and hints available. After expiry, the clock shows what happened and whether the investigation is continuing untimed.

The terminal offers optional **Vim keybindings** through a labelled switch beside the editor. The switch is off by default; the same switch is in Settings. The player can change it at any time without losing the editor's text. It applies to every code editor in the game, including the variables panel, which is a code editor like the query editor and also transmits with the shortcut. While it is on, the editor shows the current Vim mode as text. The choice is a preference (Section 7.4), so it holds from one stage, mission, and visit to the next whether it was left on or off, until the player changes it. The transmit shortcut works in every Vim mode, and a keyboard user can always move focus out of the editor. The editor closes each brace, parenthesis, and quotation mark as it is opened. A player who types a closing brace on its own line, when every brace is already closed, steps over the brace the editor added, and the blank line is removed. Suggestions appear as the player types, and none is chosen until the player picks one, so Enter always starts a new line. The clerk's note on a closing brace too many says that the editor adds closing braces.

The **Evidence Board** holds the evidence ledger and pinned facts, with links back to their query results. The travel, deduction, and warrant drafts show plain-language claims and their citations. Keep the active draft beside the terminal results, and keep each lead's citations separate when switching between leads. Ruled-out leads remain available for review.

**World Map:** Visualizes geographical locations and supports travel decisions, showing the time each journey would cost.

**Operative Dossiers:** Displays known suspects, aliases, and associations. A dossier shows only what the player's queries have retrieved.

**Debrief:** Displays the outcome, the comparison with the reference solution, the geographical fact, and the new concept card. A coda's debrief shows no promotion and no card. It says that the campaign ends there, and offers the training range beside the assignments desk.

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
- **Schema tests:** Each clearance level exposes exactly its intended types and fields, including through introspection. Classified records return partial data with errors. A placement attempt runs against the schema of the clearance in force. Once request weight is implemented, weight is reported from clearance 6 and enforced from clearance 9, a refused request spends no time and records no facts, and a request under the limit costs one hour whatever it weighs.
- **Content tests:** The validation checks of Section 5.5, run against every mission. These recompute what a mission asserts from the data and do not trust the authored answer.
- **Integration tests:** Execute representative GraphQL operations against actual game data.
- **Persistence tests:** Saved data from an older format version, a changed mission, and unavailable storage are each handled as Section 7.4 describes. The Vim keybindings preference survives a reload, a change of mission, and a progress reset, both when on and when off.
- **End-to-end tests** play the Azulejos case with the editor, results, and draft accessible by keyboard at 1024 pixels. Cite one finding for the first stage's single claim, then cite a nested row for the second stage and verify that the claim lists the facts the citation carried and that each links to its source. Complete the travel order from evidence already in the ledger and reach Luanda. Reload and confirm that the stage, the evidence, and the drafts survived. Use the replacement label to identify the signer. Verify that no clock is shown and that a hint costs nothing. A second test plays a later case with a clock: rule out one wrong lead for free, confirm a field check on a different lead with an unverified claim, and let a deadline end an attempt.

Every authored mission must include a reference solution. Continuous integration plays each mission using its reference solution, computes the mission's budget from the time spent, and fails if the mission cannot be completed.

The test suite gates deployment. A build that fails any test or validation check is not published. The build also fails if the site to be published refers to any other origin. The one exception is the footer's link to the game's source repository, which the browser requests only when the player follows it.

### 10.1 Playtesting

Use automated tests to check solvability and browser-agent reviews to check what the game communicates on screen. Run both agent reviews before a mission ships.

- **Clean-room solve:** An agent that can only operate the page, starting from a save verified to hold only the completions that give the clearance the mission needs, solves the mission without taking a hint. For each step it lists the on-screen material that justified it. This answers one question: can the mission be solved from what the game shows?
- **Novice walkthrough:** An agent plays in the persona of the audience described in Section 1.2. It records numbered points of confusion, each with where it happened and what would have helped, and reports where it stopped understanding and began matching patterns. Every point is either fixed or logged with a reason, and the walkthrough is then run again.

The agents are given a self-contained prompt and no knowledge of how the game is built. A reviewer who knows the answer is not a fair test of what the game teaches.

Once the first mission is playable, observe a few people who know JSON and are new to GraphQL before expanding the campaign. Watch whether they can attach evidence while comparing shipments and explain both why a wrong lead looked plausible and what ruled it out. When they reach Luanda, see whether the replacement label makes them want to send another query and whether they can explain how they identified the signer. Ask which moments they remember and whether they would choose to play another case. Give each player a short follow-up case with different data and a blank editor. Observe whether they can write a nested selection and explain how its result supports the new deduction. Use these sessions to tune the clock's costs and factors, citation feedback, and starter queries before authoring the remaining clearance levels.

Before 1.0, repeat the sessions in two rounds. The first round is held as soon as the opening has been re-laid to Section 3.15, and before the katas and the coda are built, because its result decides whether the opening needs more work. Each player starts from the drills and plays *The Vanishing Azulejos* and *The Borrowed Chronometer*. After each stage, ask what was new in it. A stage has asked for too much when the player meets more than one new GraphQL step or more than one new casework mechanic in it (Section 3.15), or cannot say what a control was for. Other new things the player lists, such as a record, a phrase, or a panel, are notes on how much the stage asks the player to hold at once. Ask the player to say which cited facts support each claim. In the second case, watch whether the clock changes how they write a query or only makes them anxious.

The second round is held when the katas exist, on *The Guest Register* and one case at clearance 3 or above. During the case, ask the player to explain why they ruled out a lead. Afterward, give them the kata for a technique they used and watch whether they can apply it to records they have not seen. The first round tests the ramp and the detective work, and the second tests whether the lesson transfers. These sessions also decide whether the draft should say more about an incomplete claim than Section 3.2 allows, and they tune the clock (Section 3.3).

The project has no access to beginners, so both rounds are held as simulated sessions (`docs/playtest/simulated-sessions.md`). In each session, an agent plays a persona from Section 1.2 and interviews itself at each stage boundary, using the questions above. Each persona plays in a fresh context. A model already knows GraphQL, so the agent records where on screen it learned each piece of syntax. A piece it cannot trace to the screen is a finding against the game. A simulated session is weaker evidence than a person, and it measures transmissions rather than minutes. Simulated sessions do not tune the clock, because the agent already knows GraphQL (Section 3.3). The costs and factors stay as they are, and stay provisional, until sessions with people are held. A round is run again after the work its findings call for. Sessions with people replace the simulations if beginners become available.

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

This milestone finishes clearance levels 1 through 5. It adds no clearance level. Its tasks are in priority order. The order puts the opening of the game first: a beginner who is lost in the first case does not reach anything built after it. The first six tasks, the columns in the findings, the debrief's reading of the parsed query, the katas, the coda, the variables label, and the Vim keybindings switch are built. Both rounds of sessions were held as simulated sessions on 2026-11-23 (Section 10.1), then held again on the revised build with a fourth persona. The agent playtests have been run on the coda and on every case changed since the first round, and their findings were acted on. Still open are sessions with people, if any become available, the tuning of the clock, which waits for those sessions (Sections 3.3 and 10.1), and the findings that the reports in `docs/playtest/reports/` log for observation with people.

- Make a citation carry every fact on its path that an evidence set can use (Section 3.2), and test the code that builds citations. Add the validation check that every evidence set can be assembled from Cite controls (Section 5.5).
- Show under each claim the cited facts that count toward it, show on the Cite control which lead's draft it feeds, and distinguish facts that do not connect from a fact that is missing.
- Add the `introduces` declaration to stages and the Pacing validation check (Sections 3.15 and 5.5). Let a mission have no clock.
- Re-author *The Vanishing Azulejos* as four untimed stages (Section 3.15). Introduce the clock in the briefing of *The Borrowed Chronometer*, ruling out in *The Guest Register*, and field checks in *The Quiet Consignee*, and remove each mechanic from the cases that come before its introduction. Update the orientation, the end-to-end tests, and the example in Section 5.4.
- Add the drill that follows a chain of three links, and use a country with several borders in the drills that read a list.
- Emphasize the next story case on the assignments desk and group the placements under one entry.
- Run both agent playtests on every changed case, then hold the first round of sessions with beginners (Section 10.1). Rework the opening from what they show before going on.
- Show records of one type in columns in the findings, starting with the three dossiers of *Three Couriers*.
- Replace the debrief's text matching with a reading of the parsed query, limited to the transmissions that supplied cited facts. State plainly when a placement was passed without its level's technique.
- Add the katas for aliases, fragments, and variables to the training range, with a variables panel and a clearance for each kata.
- Author the coda of the first campaign, with its records, and add the coda kind and its untimed stage to the engine.
- State in the schema documentation where a player does type a `!`. Label each response with its variables.
- Add the Vim keybindings switch, which Milestone 4 lists and did not deliver.
- Run both agent playtests on the coda and on every case changed since the first round, then hold the second round of sessions with beginners and tune the clock from both rounds.

**Success criterion:** A beginner meets no more than one new GraphQL step and one new casework mechanic in any stage, can say which cited facts support each claim, and can use a case's technique on records they have not seen.

### Milestone 6 — Clearance 6: Introspection

This milestone opens the second campaign, *The Fourth Desk*, and adds the first clearance level after 1.0. It builds what every later level needs as well: the validation of steps and the reporting of request weight. Every task is built. The agent playtests were run on both cases on 2026-11-23. Their findings were fixed or logged in `docs/playtest/reports/clearance-6-2026-11-23.md`, and the novice walkthrough of the teaching case was run again on the fixed build. Introspection has no kata yet (Section 3.11).

- Add the validation of steps (Section 5.5), with the `step` key on stages and the list of steps in `src/content/steps.ts`.
- Report request weight in `extensions` from clearance 6, and label each response with it (Section 3.3).
- Add the clearance 6 schema: the Fourth Desk's cabinet, the book of Lusaka Exchange Control, and the custom scalar `DeskSerial`. Mark them `@undocumented`, so that only introspection describes them (Section 5.3).
- Add the concept card for introspection, and glossary entries for introspection, scalars, and request weight.
- Author the teaching mission, *The Sealed Cabinet*, in four stages that follow the coverage table, and the assessment, *The Exchange Book*.
- Head the assignments desk with the campaign of the next case, and mark where a new campaign begins.
- Run both agent playtests on the two new cases, and act on what they find.

**Success criterion:** A player who has never written introspection can identify a field the documentation does not list, tell two fields apart by their descriptions, read a type through `ofType`, and use `__typename`, each in a stage that introduces nothing else.

### Milestone 7 — Clearance 7: Interfaces

This milestone adds the second level of *The Fourth Desk*. It builds the engine's support for abstract types, which unions at clearance 8 also need, and the first field inside a query that takes arguments.

- Resolve a field that returns an interface: the store looks a record up through every type that implements the interface, and the executor answers each record as the type it was filed as.
- Filter a list inside a query by its arguments: a city by its name, and a true-or-false argument with a default (Section 5.3).
- Count an interface and its inline fragments in request weight.
- List interfaces in the documentation panel, with the kinds that implement them, and show argument defaults.
- Add clerk's notes for a field that only one kind of record has and for an inline fragment that can never apply.
- Add the steps `inline-fragment`, `field-argument`, and `boolean-value` to `src/content/steps.ts`.
- Add the clearance 7 schema: `CaseFile`, the interface `Document` with `Telegram`, `Memorandum`, and `Minute`, and `Officer`.
- Add the concept card for interfaces, and glossary entries for an interface and an inline fragment.
- Author the teaching mission, *The Valparaíso Draft*, in four stages that follow the coverage table, and the assessment, *The Station File*.
- Run both agent playtests on the two new cases, and act on what they find.

Interfaces have no kata yet (Section 3.11).

**Success criterion:** A player who has never read an interface can ask a mixed list for its shared fields, ask one kind for its own fields with an inline fragment, narrow a list with an argument inside the query, and ask for sealed records with `true`, each in a stage that introduces nothing else.

### Milestone 8 — Clearance 8: Unions

This milestone adds the third level of *The Fourth Desk*. It completes the engine's support for abstract types with unions, and adds the first enum and the first list value a player writes. Every task is built. The agent playtests were run on both cases on 2026-11-23. Their findings were fixed or logged in `docs/playtest/reports/clearance-8-2026-11-23.md`, and the novice walkthrough of the teaching case was run again on the fixed build.

- Hide a union or an enum above the clearance in force, as for an object type, and leave a union's kinds out of the union when they are hidden.
- Filter a list of an interface or a union by `kind` and `kinds`, which match a record by the type it was filed as (Section 5.3).
- Count a union and its inline fragments and fragment spreads in request weight.
- List unions in the documentation panel with their kinds and an example inline fragment, and enums with their values and an example argument.
- Add clerk's notes for a field asked for directly on a union, an enum value in quotation marks, a list given to an argument that takes one value, and a value that the enum does not have.
- Add the steps `enum-value`, `list-value`, and `union-fragment` to `src/content/steps.ts`.
- Add the clearance 8 schema: `InterceptLog`, the union `Intercept`, the enum `InterceptKind`, `Vessel`, `Pass`, and the fields `Company.charters`, `Sighting.vessel`, and `Sighting.pass`.
- Add the concept card for unions, and glossary entries for a union and an enum.
- Author the teaching mission, *The Listening Post*, in four stages that follow the coverage table, and the assessment, *The Door Watch*.
- Run both agent playtests on the two new cases, and act on what they find.

Unions have no kata yet (Section 3.11).

**Success criterion:** A player who has never read a union can ask a mixed list for the fields of each kind with inline fragments and `__typename`, narrow it with an enum value, then with a list of values, and spread a fragment on one kind inside it, each in a stage that introduces nothing else.

### Milestone 9 — Clearance 9: Pagination

This milestone adds the fourth level of *The Fourth Desk*. It reads lists in pages, puts the weight limit into force, and adds the first record classified as a whole. Every task is built. The agent playtests were run on both cases on 2026-11-23. Their findings were fixed or logged in `docs/playtest/reports/clearance-9-2026-11-23.md`, and the novice walkthrough of the teaching case was run again on the fixed build.

- Cut a page from a record's list with `first` and `after`. A page has `nodes` and `pageInfo`, is recognised by that shape, records no fact, and weighs nothing (Sections 3.3 and 5.3).
- Count a list for the page size it asks for, written in the query or as a variable.
- Refuse a request over the weight limit, 200, from clearance 9, before transmission and at no cost. State the limit beside the weight on each result.
- Withhold a whole record above a clearance. In a list whose entries may not be null, the withheld record blanks the list.
- Add the checks on request weight and the step recognised from a response (Section 5.5).
- Add clerk's notes for a request over the limit, a classified entry that blanks a list, a cursor the list does not hold, a page size below zero, and `null` given where a value may not be null.
- Add the steps `cursor`, `optional-variable`, and `null-propagation` to `src/content/steps.ts`.
- Add the clearance 9 schema: `WatchBook`, `WatchPage`, `PageInfo`, `WatchEntry`, and `Query.watchBook`.
- Head a record in the findings by its `reference` or `number` when it has no name.
- Add the concept card for pagination, and glossary entries for pagination and a cursor.
- Author the teaching mission, *The Corridor Book*, in four stages that follow the coverage table, and the assessment, *The Cipher Counter*.
- Run both agent playtests on the two new cases, and act on what they find.

Pagination has no kata yet (Section 3.11).

**Success criterion:** A player who has never paged through a list can bring a request under the weight limit with a page size, follow `endCursor` to the next page, reuse one operation for every page through a variable that may be left out, and read on past a page that a classified entry blanked, each in a stage that introduces nothing else.

### Milestone 10 — Clearance 10: Directives

This milestone adds the fifth level of *The Fourth Desk*. It teaches `@include` and `@skip`, which leave heavy detail out of a standing query, and lets the clerk's weight follow them. Every task is built. The agent playtests were run on both cases on 2026-11-23. Their findings were fixed or logged in `docs/playtest/reports/clearance-10-2026-11-23.md`, and the novice walkthrough of the teaching case was run again on the fixed build.

- Leave out of request weight a selection that `@skip` or `@include` leaves out, on a field, an inline fragment, or a fragment spread, with the condition read from the request, its variables, or a variable's default (Section 3.3).
- Add the check that the mission teaching directives has a request that would exceed the limit without its directives (Section 5.5).
- List `@include` and `@skip` in the documentation panel from clearance 10.
- Add clerk's notes for an unknown directive, a directive in a place it cannot stand, a directive written twice, a missing or unknown argument on a directive, a quoted `true`, a variable that may be left out where a value may not, and a required variable that came with no value.
- Add the steps `skip-directive`, `directive-on-fragment`, and `nested-fragment` to `src/content/steps.ts`. *The Paymaster*'s reference solution spread one fragment inside another, which the coverage table puts at clearance 10, and now spreads one fragment in each place.
- Add the clearance 10 schema: `PaperFile`, `PaperPage`, `Paper`, `Endorsement`, and `Query.paperFile`.
- Add the concept card for directives, and the glossary entry for a directive.
- Raise the budget of the initial bundle to 140 kB, which the mission files of clearance 10 exceeded at 130 (Section 4.3).
- Author the teaching mission, *The Inner Room*, in four stages that follow the coverage table, and the assessment, *The Envelope Book*.
- Run both agent playtests on the two new cases, and act on what they find.

Directives have no kata yet (Section 3.11).

**Success criterion:** A player who has never written a directive can bring a standing query under the weight limit with `@include` and a variable, use `@skip` where the variable says what to leave out, put one directive on a group of fields, and spread a fragment inside another, each in a stage that introduces nothing else.

### After 1.0

Where this document says that a feature arrives after the MVP, and Milestones 5 to 10 do not list it, the feature arrives after 1.0.

- Clearance levels 11 through 13, from mutations to subscriptions, with the steps of Section 3.7. The adversary is identified in these levels and not before.
- A kata for introspection, whose pass does not rest on facts (Section 3.11).
- Load the stages of a mission on demand with the workspace, before clearance 13 (Section 4.3).
- Warrants and missions that end in an arrest.
- Conflicting reports and source reliability.
- Game actions as mutations.
- Seeded mission variants.
- Katas for the remaining concepts, and exercises that ask the player to predict a response.
- A prompt for an incomplete claim that says what kind of fact is missing, if the sessions with beginners show that the draft needs one.
- Branching investigations, including one deadline that forces a choice between two leads. The clock keeps its single purpose until then (Section 3.3).
- An untimed continuation after the deadline, for a case whose story can survive its deadline. No case in 1.0 has one (Section 3.3).
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

**Request Weight:** The number of records a request could return, computed before transmission. From clearance 9 the records clerk refuses a request above the weight limit, at no cost in hours.

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

**Concept:** A part of GraphQL that has its own clearance level, teaching mission, assessment, concept card, and kata (Section 3.7).

**Step:** A part of GraphQL smaller than a concept, such as a number written as an argument. It is introduced alone, in one stage of a teaching mission, and practised later (Section 3.7).

**Introspection:** Asking the archive to describe its own schema, through `__schema`, `__type`, and `__typename`. Its results describe the archive and hold no evidence.

**Scalar:** A type that holds a single value. An archive may define its own, such as `DeskSerial`.

**Undocumented:** Said of a type or field that the documentation panel leaves out, so that only introspection describes it (Section 5.3).

**Interface:** A type that names fields several kinds of record share. A query asks for those fields directly and for the rest in an inline fragment.

**Inline fragment:** Three dots, `on`, a type's name, and a selection, written inside a field that returns an interface or a union. Its fields come back only for records of that type.

**Union:** A type whose value is one of several unrelated kinds of record. Every field is asked for in an inline fragment.

**Enum:** A type whose values are a fixed list of names, written without quotes.

**Input Object:** A group of named values passed as one argument, written in braces.

**Directive:** An instruction written after `@`, such as `@include`, that changes how part of a request is executed.

**Mutation:** An operation that changes the archive, such as filing a travel order.

**Subscription:** An operation that stays open and delivers a result for each event. In the game, events arrive as game hours pass.

**Cursor:** A marker in a paginated list that says where the next page begins.

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

**Casework Mechanic:** A part of the game that the player has to learn in order to act, such as citing, the clock, or ruling out. Each is introduced in a stage of its own (Section 3.15).

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
