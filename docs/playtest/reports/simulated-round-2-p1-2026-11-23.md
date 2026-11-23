# Round 2 playtest · Web developer, new to GraphQL

## 1. Preflight

The header showed **Clearance 2**, and the assignments desk showed **2 of 10 cases resolved**. The Guest Register was tagged **Next in the story**. It had neither a completed nor an in-progress label. The two clearance 1 cases were marked completed independently. Orientation and Round 1 drills were outside this run.

## 2. Per-stage table

| Stage                                      |      Transmissions sent | New things, in my words                                                                                                                          | Controls I could not explain                       | Hints and solution                                   | Stamp and time                                | Notes                                                                                                                        |
| ------------------------------------------ | ----------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| The Guest Register · Angola                |                       1 | “I can pick a file in parentheses, then build out the JSON shape I want. Citing the bottom row can carry the rows that link it to the sighting.” | None used that I could not explain at the boundary | 0 hints, no solution opened                          | Travel approved, 22 of 26 hours               | Ruled out SGT-027 and SGT-034 free. SGT-031's supported draft cost 3 hours to file as a travel order.                        |
| The Guest Register · Tanzania              |                       1 | “An exact cover name is another lookup. I can go from that name to its sightings and its operative.”                                             | None used that I could not explain at the boundary | 0 hints, no solution opened                          | **IDENTIFIED**, 21 hours left                 | The debrief's reference used two different lookup fields in one request. Mine used one cover-name lookup with nested fields. |
| The Quiet Consignee · Peru                 |                       3 | “The shipment papers and the intake record can each have a field called consignee. A field check gives me a clue and keeps the draft open.”      | None used that I could not explain at the boundary | 0 hints, no solution opened. One 2-hour field check. | **HELD**, 13 of 18 hours. Clearance 3 earned. | The shipper citation ruled out Meridian Forwarding. I got the other director before the intake record.                       |
| Three Couriers · Tanzania                  | 2 attempts, 1 processed | “I need a different result key for each lookup when I reuse the same field with a different value. I can cite in the side-by-side table.”        | None used that I could not explain at the boundary | 0 hints, no solution opened                          | Travel approved, 19 of 23 hours               | One returned request, free. The clerk sent me to the Glossary. Two free rule-outs and 3 hours for travel.                    |
| Three Couriers · Zambia                    |                       1 | “The label trick also works for company. I can follow a company to its director and the director's organization.”                                | None used that I could not explain at the boundary | 0 hints, no solution opened                          | **PAYMENT STOPPED**, 18 hours left            | Side by side stayed selected. Ruled out Copperbelt and Beira.                                                                |
| Training · Two lookups in one transmission |                       1 | “Same idea, now on country. Capital is a field I can take from the starter.”                                                                     | None used that I could not explain at the boundary | 0 hints, no solution opened                          | **Passed**, untimed                           | Chile returned Santiago and Peru returned Lima, each under its own label.                                                    |

I read the reference comparisons shown on the completed case debriefs. I did not open a solution during an attempt.

## 3. Stage interviews

### The Guest Register · Angola

“I used a codename inside parentheses and quoted it to get one file. Then I asked for fields nested like my JSON. Transmit paid an hour. Documentation let me find the record names, and I had to open the separate entries. Cite put rows in the named lead's draft. The country dropdown set my answer, the status identified missing or contrary evidence, Rule out crossed a lead off for free, and Travel filed the supported order.”

“From memory, M. Calloway was both in SGT-031 and on the NIGHTJAR list. Zanzibar City was in Tanzania, and Tanzania had Swahili.” The draft agreed. It showed that the one languages citation included the sighting-to-city and city-to-country links as well as the language list.

### The Guest Register · Tanzania

“I changed from looking up a codename to looking up the exact cover name, including the title and its punctuation. I went from the cover name to both an operative and a sighting. Cite opened a draft for Dr. Lund and attached rows, Filed under chose my operative, and Submit deduction sent the supported answer.”

“From memory, the name appeared in a sighting in Zanzibar City and the operative row said MARBLE_HERON.” The receipts agreed and also named SGT-040 and showed the complete Dr. Lund sightings list. I left those details out of the memory answer.

### The Quiet Consignee · Peru

“I wrote the whole request with a blank editor. I could put a shipment and a company question in one outer block. The same word can appear on two records, with a blank consignee on the first and a named one on the other. The field check spent two hours on a dispatch pointing to intake and kept my director evidence. Cite attached the source, Director picked my answer, Rule out struck off Forwarding after I cited the shipper, and Submit sent two supported claims.”

“From memory, the intake record for VAL-0733 named Meridian Freight as consignee, and the company record named PEWTER_SWIFT as director.” The receipts agreed, and the intake identifier I didn't recall was INT-CAL-0733. The draft told me which claim lacked proof. The field check dispatch told me which record to ask for.

### Three Couriers · Tanzania

“I assumed three operative lookups would come back as three entries like an array. The clerk returned the attempt for free and pointed me to the Glossary. I put a different label and colon before each repeated field so each answer got its own key. The value in parentheses still picked the record. Side by side put a candidate in each column and let me cite. Cite attached an organization or a chain of location facts to a named draft. Rule out struck off leads with contradictions. I chose Zambia in the picker before Travel could move the case.”

“From memory, GREY_PETREL was in the Parallax Circle and was last seen in Lusaka in Zambia, whose border list contains Tanzania.” The receipts agreed. The location citation counted three linked rows from one click.

### Three Couriers · Zambia

“I reused the alias on company and picked my own labels. I asked the registration country for its languages and followed the director to their organization. Side by side stayed selected. Cite carried the connected facts into each company draft. Rule out struck off Copperbelt on language and Beira on organization. Submit was ready when Kafue had both claims supported. I didn't have another answer to pick.”

“From memory, Kafue was registered in Mozambique, whose list included Portuguese, and its director was in the Circle.” The receipts agreed and named MARBLE_HERON as the director, which I didn't recall on my first pass.

### Two lookups in one transmission

“I used the different-name trick on country. I had to identify which lookup field gets a country, what goes in parentheses, and what to request for the capital. The starter gives all three, and the instructions even give a country-specific alias example. Transmit ran a practice check for free. There was no draft or citation.”

## 4. Syntax ledger

| First use                | Pieces used                                                                                                                                                                  | Where I found them                                                                                                                                                                                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Guest Register, Angola   | `query`, outer braces, nested braces, `operative(codename: "NIGHTJAR")`, and bare `codename`                                                                                 | The starter had `query { operative(codename: "") { ... codename ... } }` and said “Whose file? Write the codename between the quotes.” The briefing supplied NIGHTJAR. Documentation's `city(name: "Lisbon")` example reinforced the parentheses, colon, quoted value, and nested result fields. |
| Guest Register, Angola   | `coverNames { name }`, `sightings { id note nameGiven { name } ... }`                                                                                                        | Documentation → Operative listed `coverNames` and `sightings` and said record lists need braces. CoverName listed the literal `name`. Sighting listed `id`, `note`, `nameGiven`, and `city`, and said which need braces.                                                                         |
| Guest Register, Angola   | `city { name country { name languages { name } } }`                                                                                                                          | Documentation → City listed `name` and `country`. Country listed `name` and `languages`. Language listed `name`.                                                                                                                                                                                 |
| Guest Register, Angola   | Schema `String!`, `ID`, and list brackets                                                                                                                                    | Documentation explained that a required text input goes in quotes, identifiers are also double-quoted, list brackets in the entry mean multiple records, and “You never type a ! in a query.” I didn't type schema punctuation into the editor.                                                  |
| Guest Register, Tanzania | `coverName(name: "Dr. Lund")` and `operative { codename }` inside it                                                                                                         | The starter showed `coverName(name: "")` and instructed me to use the text exactly as in the register. The earlier Documentation → CoverName entry listed `operative` and `sightings`.                                                                                                           |
| Quiet Consignee          | Two _different_ fields under one outer pair of braces, `shipment(id: "VAL-0733")` with `shipper` and `consignee`, and `company(name: "Meridian Forwarding")` with `director` | The Guest Register debrief showed `coverName` and `city` together and said “Two questions in one query are still a single transmission.” Documentation → Query supplied the two lookup names and their inputs. Shipment and Company supplied the requested record fields.                        |
| Quiet Consignee          | `intake { id consignee { name } }`                                                                                                                                           | The dispatch sent me to the depot's intake record. Documentation → Shipment listed `intake`, and IntakeRecord listed `id` and `consignee`.                                                                                                                                                       |
| Three Couriers, Tanzania | `organization { name }`, `lastKnownLocation { name country { name borders { name } } }`                                                                                      | All were in the case's SABLE_IBIS starter. I repeated the starter block with the other two codenames in the comment, expecting three entries.                                                                                                                                                    |
| Three Couriers, Tanzania | `sable: operative(...)`, `grey: operative(...)`, `tin: operative(...)`                                                                                                       | The returned-request note said to put an alias in front of each lookup. Glossary → alias showed `first: operative(codename: "NIGHTJAR")` and said the results come back under their aliases.                                                                                                     |
| Three Couriers, Zambia   | `copperbelt: company(...)` and other aliased companies, `registeredIn { name languages { name } }`, `director { codename organization { name } }`                            | The starter had `first: company(name: "Copperbelt Clay Works")`. The earlier Company entry listed `registeredIn` and `director`, Guest Register Documentation supplied the country/language fields, and the first couriers stage supplied `organization`.                                        |
| Kata                     | Aliased `country(name: "...") { name capital }`                                                                                                                              | Training supplied the entire unaliased Chile request, the `chile: country(name: "Chile")` example, and Peru as the second argument value. I chose `peru` for the second key.                                                                                                                     |

No unsupported syntax use identified. The attempted repeated unaliased field was a mistaken inference from the earlier example with two different fields. I learned the working syntax from the clerk and Glossary before I typed it. Fragments, variables, and other request syntax did not come up.

## 5. Points of confusion

1. **Where** · The Guest Register, Angola, Documentation. **What happened** · I had a filled-in lookup shape and still didn't know what to ask for. I paused over the number of linked record entries and had to keep track of which `name` belonged to which record. **What I did** · Opened Operative, then CoverName and Sighting, then City, Country and Language. **What would have helped** · Make each linked return type take me to its section, so I can follow Sighting → City → Country without rescanning the list.
2. **Where** · The Guest Register, Angola, SGT-027 draft. **What happened** · H. Brandt looked like a contradiction to me, but the name-only citation still said Needs evidence. **What I did** · Cited the complete NIGHTJAR cover-name list to prove what was absent. **What would have helped** · When the draft already holds a guest name, say it still needs the operative's complete cover-name list.
3. **Where** · The Guest Register, Angola, country picker. **What happened** · Citing the nested languages row did not itself set the country. An unset country was enough to flag SGT-034's contradiction, but a valid lead still needed an explicit choice. **What I did** · Chose Tanzania for SGT-031 after citing it. **What would have helped** · Put the named value from the evidence next to the picker, as the later couriers form does with Zambia.
4. **Where** · The Quiet Consignee, Freight draft and first Findings. **What happened** · The first request confirmed the missing shipping-paper consignee. The company lookup gave me a director, but the draft just asked me to prove that Freight receives the cargo. **What I did** · Selected the cited director, then spent 2 hours for a field check that identified the intake record. **What would have helped** · Label the blank finding “consignee on the shipping papers” and explicitly display that it is blank. The field check already supplied a concrete next record.
5. **Where** · Three Couriers, Tanzania, editor and returned request. **What happened** · I took “same transmission” to mean I could paste the same lookup field three times, expecting a list. The clerk rejected it free. **What I did** · Followed the clerk's note to Glossary, read the alias example and resent. **What would have helped** · Make “alias” in the clerk's note open that Glossary entry directly. The note's explanation about three entries with the same name was enough to explain the error.

## 6. Round 2 questions

### Plausible leads

- **SGT-027, Mombasa.** The report was filed under NIGHTJAR and its country listed Swahili. It gave H. Brandt, absent from the complete NIGHTJAR list of M. Calloway and E. Vasco.
- **SGT-034, Maputo.** It gave M. Calloway, an actual cover name. Mozambique's archived languages did not include Swahili.
- **The second Lund spelling.** The brief said a rushed reader might confuse two names. I never opened a separate draft or queried the look-alike. The exact signature “Dr. Lund” was sufficient and returned a Zanzibar City sighting and MARBLE_HERON. The debrief later gave the other spelling as D. Lund.
- **Meridian Forwarding.** It asked customs about the shipment and its name was similar to Freight's. VAL-0733 identified Forwarding as the shipper. The cited row explicitly contradicted the receiver claim.
- **SABLE_IBIS.** A member of the right group. Last seen in Moroni, Comoros, whose complete land-border list was empty.
- **TIN_FALCON.** Last seen in Nairobi, Kenya, whose list included Tanzania. The organization was Baltic Exchange Bureau.
- **Copperbelt Clay Works.** Its director belonged to the Circle. Its registration country was Zambia, whose archived languages lacked Portuguese.
- **Beira Tile Agency.** Registered in Mozambique, whose list included Portuguese. Its director TIN_FALCON belonged to the Baltic Exchange Bureau.

### Transfer to the kata

I used the aliases in the case first on operatives and then on companies, and used them again on a pair of country records without reopening the case. I knew a label changes the response key and the value in parentheses still chooses the record. I reused the starter's country lookup and capital field, provided the second country and supplied a distinct label. The kata passed on the first request, with Santiago and Lima under separate keys. Since the exercise supplied the alias shape again, this shows application with a prompt and does not establish unaided recall.

### Incomplete claims

All claims on the submitted leads eventually passed. At first the SGT-027 draft needed the cover list before the name could count as contrary evidence. A correct location or operative citation could still leave an answer picker empty. The clearest prompt was for GREY_PETREL: “The facts you cited show Zambia. Choose Zambia for ‘Country last seen in’ above.” The Freight draft only identified the missing receiver claim. The field check supplied “intake record for VAL-0733,” which gave me a concrete next lookup. The deliberately rejected drafts still had claims without evidence when I ruled them out.

## 7. At the end

The moments that stood out were the two sightings that each fit half the clues, the blank consignee becoming a real name on a different piece of paperwork, and recognizing the alias error as a duplicate JSON-key problem. The table made the two contrasting checks on each courier and payee quick to scan. I started copying block shapes when repeating queries, but the clerk's error made me explain the distinction between an argument and an alias. I could still explain which parts chose the record and which parts changed the response keys at the kata.

I'd play another case. I liked taking a plausible lead off the list for a specific reason, and the dispatches made the archives feel like part of the investigation. I would probably skim another opening if its examples were as easy to find as the starter here.

## 8. Caveats

This is a simulated web developer who knows JSON, with access to rendered accessibility text and editor readback. It cannot establish how a human would scan the page, find documentation visually, or struggle with manual typing and bracket or quote completion. My proximity to GraphQL may have made tracing record types, recognizing a response-key collision, or composing deeply nested fields in one pass faster than it would be for a new player. I found a screen source for every syntax piece before using it, with no recorded leak. The interviews were recorded before viewing the next stage, but I had just checked the submitted citations, so memory here is immediate recall rather than an independent delayed test.
