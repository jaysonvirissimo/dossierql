# Novice walkthrough · The Receipt · 2026-11-23

I solved The Receipt in 2 transmissions with no hints and without viewing the solution. The case is now marked **Completed independently**. I didn't open the Orientation: this player has finished every earlier case.

## 1. Preflight

- The top right shows **Clearance 6**, as expected.
- The Receipt was marked **"Next in the story"**, not completed or in progress. Preflight passed.
- One oddity: the desk said "1 of 10 cases resolved", and only The Registrar's Return showed as completed. That doesn't match a player who has played every earlier case.

## 2. Per-case table

| Case        | Solved | Transmissions        | Hints | Solution viewed | Hours left                          | Completion mode         |
| ----------- | ------ | -------------------- | ----- | --------------- | ----------------------------------- | ----------------------- |
| The Receipt | Yes    | 2 (reference uses 1) | 0     | No              | Not shown ("Nothing here is timed") | Completed independently |

## 3. Points of confusion

1. **The editor's automatic bracket closing**
   - **Where:** The Receipt, first query, the query editor.
   - **What happened:** I typed the query over several lines with my own closing braces. The editor had already added closers, so three extra `}` lines ended up at the end. Inside one line, typing `}` replaced the added closer, but pressing Enter pushed the added closers down instead.
   - **What I did:** I tried to delete them with keys, but the tool wouldn't accept the key names I used. So I retyped the whole query on one line, which came out clean.
   - **What would have helped:** When you press Enter, the editor shouldn't push its own closer below your text, or it should skip it when you type `}`. A visible warning about unmatched braces before sending would also help.
2. **The register paragraph in the briefing**
   - **Where:** The Receipt, briefing, Case tab.
   - **What happened:** The paragraph about registers and serial numbers ("the office that cleared the order, and the office the report was sent to…") was hard to follow on first read. It only made sense once I saw the third claim in the Deduction panel.
   - **What I did:** I read on and used the claim to make sense of it.
   - **What would have helped:** Say plainly what to compare: "You will compare two serial numbers in one office's register."
3. **Citing a fact spread across sibling rows**
   - **Where:** The Receipt, results for transmission 2, Cite buttons.
   - **What happened:** The help text says a citation includes "the rows it is nested under". Citing "issued by" doesn't include its siblings "from Lisbon" and "to Luanda", so I wasn't sure one citation would cover the travel-order claim.
   - **What I did:** I cited from, to and issued by separately, and the claim was accepted.
   - **What would have helped:** One example sentence, such as "To prove a travel order went from A to B, cite both rows."
4. **My first Cite click did nothing**
   - **Where:** The Receipt, results panel, the first Cite button after I chose the lead.
   - **What happened:** The click timed out and nothing was cited. Choosing the lead seemed to redraw the result list.
   - **What I did:** I clicked again and it worked.
   - **What would have helped:** Keep the buttons in place when a lead is chosen. This may be a quirk of my tools rather than the game.
5. **Desk progress count**
   - **Where:** Assignments page, the progress line.
   - **What happened:** After I finished, two cases showed "Completed independently", but the line still said "1 of 10 cases resolved".
   - **What I did:** Nothing.
   - **What would have helped:** The count should match the completed markers, or say what it counts.
6. **The case's clue about the two Luanda transfer orders**
   - **Where:** The Receipt, clues and Deduction panel.
   - **What happened:** The clues mention two Luanda transfer orders, and the debrief's reference solution fetches them. But the payment to Kafue Ceramics Trust satisfied the "Parallax Circle" claim on its own. Nothing tells you that you need only one of the two.
   - **What I did:** I used the payment and never fetched the transfer orders.
   - **What would have helped:** None needed. The word "or" in the claim covers it, but it's easy to miss.

## 4. Pattern-matching

There was very little. Every field I used came straight from the type entries in the Documentation tab. I did ask for two lists in one request (`travelOrders` and `paymentOrders`) without having checked whether that's allowed; it worked.

## 5. What the game taught (in the player's words)

"Nothing new. This was a review of nested selections: start at `receipt`, open `releaseOrder`, then its `registerEntry`, and ask for `serial`. Some fields hand you a record, so you need braces. Others hand you a value, so you don't. The debrief added one thing: you can fold everything into one request, including going back up from an entry to its office's `register`. I also learned that `query` at the start is optional."

## 6. What I remember

- The twist stood out: my own office, Fourth Desk, let the tiles go (entry 4126) before the museum reported them missing (entry 4128). It also issued all of my travel orders.
- The debrief added entry 4127, the museum registrar's overruled objection, which I hadn't fetched. The "Released by" box stays empty, which is a strong ending.
- The debrief says the campaign ends here, so there's no next case. This player would come back for another campaign, and might first try "Investigate again" to fit everything into one transmission.

## 7. Caveats

- I played only one case, a short coda with no new GraphQL concept, so this run says little about how well the game teaches.
- No hints or solution were opened, so I haven't checked their content or cost.
- No time was spent, so I couldn't test the hours mechanic.
- The bracket trouble and the failed first click may partly come from my automation tools rather than the game.
- The persona's "memory" of earlier cases is assumed. The desk didn't show those cases as completed.

---

## Rerun on the revised build

I solved The Receipt in 2 transmissions, with no hints and without viewing the solution. The answer was Fourth Desk.

### 1. Preflight

- The top right showed **Clearance 6**.
- The Receipt was marked "Next in the story", not completed or in progress. The check passed.
- Two things looked wrong before I started. The desk said "1 of 10 cases resolved", and only The Registrar's Return was marked completed. That doesn't fit this player having played every earlier case.

### 2. Per-case table

| Case        | Solved            | Transmissions                      | Hints | Solution viewed | Hours left                                        | Completion mode           |
| ----------- | ----------------- | ---------------------------------- | ----- | --------------- | ------------------------------------------------- | ------------------------- |
| The Receipt | Yes (Fourth Desk) | 2 (the game's own solution uses 1) | 0     | No              | None shown; the case says "Nothing here is timed" | "Completed independently" |

### 3. Points of confusion

1. **Briefing paragraph (Case tab).**
   - **What happened:** "In one register, the entry with the lower serial number came first. Compare the two entries in the same office's register" reads like a riddle. I didn't know which two entries, which office, or what I was meant to conclude.
   - **What I did:** The third claim in the Deduction panel said it plainly, so I worked from that.
   - **What would have helped:** Use the claim's wording in the briefing, e.g. "Check whether the release order was entered before the loss report, in the same office's register."
2. **Claims panel, after my first citations.**
   - **What happened:** The travel-order claim listed my register-entry citations under "count toward this claim", with "needs at least one more fact that connects to them". Those facts have nothing to do with travel orders, so it looked like I was on the right track for that claim when I wasn't.
   - **What I did:** I ignored it and ran a separate query for travel orders.
   - **What would have helped:** Only list facts that are actually relevant to the claim, or say "none of your cited facts are about a travel order yet".
3. **Citing rows that sit side by side (Findings).**
   - **What happened:** To prove claim 3 I had to cite each serial number and each office name separately, four clicks. The rule is explained ("If the facts you need sit beside each other, cite each row"), but I only understood it after reading the "3 facts / 2 facts" counts in the draft.
   - **What would have helped:** A "Cite this record" button that cites every field of one record at once.
4. **Assignments desk after solving.**
   - **What happened:** It still said "1 of 10 cases resolved" with two cases marked completed. The Vanishing Azulejos now shows "Next in the story", even though the debrief says "The Shadow Network ends here."
   - **What would have helped:** Update the count, and don't send the player back to case 1 as if it were the next step.
5. **Fields I hadn't seen yet.**
   - **What happened:** I guessed that Office and City records have a `name` field without opening their documentation entries. The guess worked. The debrief's solution uses `register` on an office and `shipment { transferOrders }`, which I never looked at. I had never seen a list inside a record before.
   - **What would have helped:** None of this blocked me, so no change is needed. This player would just have liked to know that `register` existed.

### 4. Pattern-matching

I didn't hit a point where understanding broke down. The starter comments plus the documentation ("Returns one … record, so this field needs braces") were enough to build the nested query on purpose. The one guess was assuming every record has a `name` field. I was copying a habit from earlier cases there, not reasoning from anything this case showed me.

### 5. What the game taught

"This case didn't teach a new feature. It made me use what I already had on a real chain of records: receipt → order → register entry → office, each needing its own braces. The debrief showed I could have asked for the receipt and the travel orders in one request, side by side. I didn't know you could put two unrelated starting fields in one query; I just tried it on my second transmission and it worked. The debrief confirmed it."

### 6. What I remember

- The twist landed well. My own office released the tiles before the museum reported them missing, and the box marked "Released by" is still empty.
- The serial numbers 4126 < 4128 were a satisfying piece of evidence. The debrief explaining that the overruled objection was entry 4127 was a nice touch.
- With the campaign over, this player would probably try the Skip ahead assessments or retry an earlier case to get the transmission count down. They wouldn't start the campaign again.

### 7. Caveats

- This was one short run that took two transmissions. It doesn't test how the game handles errors or wrong guesses, or the Hints tab, the solution view, the Map, the Dossiers or the Glossary.
- I didn't read the Orientation.
- I played this person reading carefully, but the AI underneath already knows GraphQL, so this run can't fully show how readable it is to someone who doesn't.
- Nothing about time or hours could be checked, because this case isn't timed.

---

## Final wording check

I solved The Receipt in 2 transmissions, with no hints and no solution viewed. Two things on the Assignments page look wrong: the resolved-cases counter never went up, and the earlier cases this person supposedly played aren't marked completed.

### 1. Preflight

- The top right shows **Clearance 6**, as expected.
- The Receipt (Clearance 5 · Coda) was marked **"Next in the story"**, not completed or in progress. Preflight passed.
- Two oddities on the page:
  - The header said **"1 of 10 cases resolved."** The only case marked completed was The Registrar's Return ("Completed independently"). The four teaching cases this person has supposedly played had no completion mark.
  - The Training Range showed "0 of 3 katas passed."

### 2. Per-case table

| Case        | Solved                  | Transmissions            | Hints | Solution viewed | Hours left                                       | Completion mode recorded                                                                      |
| ----------- | ----------------------- | ------------------------ | ----- | --------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| The Receipt | Yes (lead: Fourth Desk) | 2 (the reference uses 1) | 0     | No              | Not shown; the case says "Nothing here is timed" | "Completed independently" (the debrief says "resolved the case independently, with no hints") |

After I finished, the header still said **"1 of 10 cases resolved"**, even though two cases are now marked completed. "Next in the story" also jumped back to The Vanishing Azulejos.

### 3. Points of confusion

1. **Where:** Briefing, Case panel.
   - **What happened:** The prose ends with a task: "Check whether the release order came before the loss report." The Objective asks a different question: "Identify the office…". The last paragraph then repeats the Objective. It wasn't clear which one I was answering.
   - **What I did:** I went by the Deduction panel's three claims, which cover both.
   - **What would have helped:** Say in one line that the serial check is one of three things to prove about the office.
2. **Where:** Initial intelligence, the Luanda clue.
   - **What happened:** The clue says two transfer orders were written for the crate in Luanda, and the first claim mentions the transfer to Parallax Freight. The release order I opened went to Tagus Sample Agency, not Parallax Freight. I couldn't tell whether I was meant to find the Luanda transfers.
   - **What I did:** I proved that claim with the Kafue payment instead. The reference solution reaches the transfers through `shipment { transferOrders }`. That field isn't in the Receipt or TransferOrder entries I opened, and I'd have had to open the Shipment entry to find it.
   - **What would have helped:** Have the clue say how to reach the Luanda transfer orders from the receipt.
3. **Where:** Deduction draft, after my first citation.
   - **What happened:** One citation about the release order's register entry showed up under all three claims, including "issued the travel order Lisbon→Luanda." It made me think I had cited the wrong thing.
   - **What I did:** I ignored it.
   - **What would have helped:** Only list a fact under a claim when it is relevant to that claim.
4. **Where:** Deduction draft, the serial claim.
   - **What happened:** After I cited both serials, the panel said "The facts listed here do not connect to each other." I had to cite the loss report's office as well before the claim became "Supported." The rule (each fact must point to a record another fact points to) is hard to follow.
   - **What I did:** I guessed my way through.
   - **What would have helped:** Name the missing link, for example: "nothing yet shows that entry fd-4128 is in Fourth Desk's register."
5. **Where:** Debrief, reference section.
   - **What happened:** It says "The word `query` at the start of a request is optional." This is the first time the game has said so, and it's buried in a footnote.
   - **What I did:** Nothing.
   - **What would have helped:** Teach it where queries are first introduced, or leave it out.
6. **Where:** Debrief, reference section.
   - **What happened:** The reference opens `register` on the office, which is where the overruled objection (entry 4127) turns up. I never saw that field, because I didn't expand the Office entry. My Findings did show "Not yet opened on this office: city, register," but I didn't take it as a hint. The payoff of the story sits in a field the case never points you to.
   - **What I did:** I only learned about it from the debrief.
   - **What would have helped:** Make the "Not yet opened" lists stand out more, or have a clue mention the register.
7. **Where:** Assignments page, before and after the case.
   - **What happened:** The resolved-cases counter didn't change after I finished. The earlier cases also show no completion mark. See the Preflight section.

### 4. Pattern-matching

There was no real point where I stopped understanding the GraphQL. The query was nesting and listing fields, which the first case taught, plus two top-level fields in one request. The citation system is where I started matching patterns. I cited each leaf row plus its "office → name" row until the label turned to "Supported," without fully understanding why the serial claim needed the extra office citation.

### 5. What the game taught (in this person's words)

The Receipt doesn't teach anything new; it's a coda. It made me use what I already had: start from one record, follow fields that point to other records by putting braces after them, and ask for several unrelated lists in one request. It also showed that one request can do the whole job. The aside that `query` is optional is new, but it's taught only in passing.

### 6. What I remember

- The reveal stood out: every travel order, Lisbon to Lisbon, was issued by Fourth Desk, my own office. It cleared the release of the tiles and then logged the museum's loss report two entries later.
- The "UNSIGNED" ending landed. So did the overruled objection at entry 4127, though I only read about it in the debrief and never found it myself.
- "The Shadow Network ends here." This person would probably not start another case right away, since the story is over. They might go back to find the register entry they missed, or try the training katas.

### 7. Caveats

- This is one run of one case. The other cases weren't played, so what this person "remembers" from them comes only from the role description.
- I read the documentation entries before writing anything, so my first query worked. A less careful player might have needed more transmissions.
- I guessed that the office record has a `name` field without opening the Office entry. It worked, but that was luck.
- I never opened the Hints, Evidence, Dossiers, Map or Glossary tabs, so I can't say how good they are or what hints cost.
- The case wasn't timed, so there were no hours to report.

---

## Fresh briefing reader

I opened The Receipt from the Assignments desk and read the briefing. I stopped there: I didn't open the terminal, write a query or look at a solution.

**What the case asks me to decide:** Which office cleared the crate's orders and also issued my travel orders. Four clues all point at that one office:

- It cleared one of the two Luanda transfer orders for crate LIS-0417.
- It cleared GREY_PETREL's payment to Kafue Ceramics Trust.
- It issued my travel order from Lisbon to Luanda.
- Receipt RCT-0417 points to two records: the order that released the tiles from the museum, and the museum registrar's loss report. Each one is filed in some office's register.

Part of my answer also has to be about timing: that office filed the release order before the loss report.

**What the serial numbers tell me:** Each office numbers its own register entries in the order it files them. So within one register, a lower number means an earlier entry. The numbers don't give dates, and comparing numbers from two different offices' registers wouldn't mean anything.

**How comparing them helps:** If the release order and the loss report are both in the same office's register, I can compare their two numbers. If the release order's number is lower, that office released the tiles before the loss was reported. That supports the timing claim and shows the office acted first. If the two records are in different registers, comparing the numbers proves nothing about which came first.

**Lines I had to reread:**

- _"The release order came before the loss report in that office's register."_ Just before this, the briefing talks about "the office that cleared the order" and "the office that received the report" as if they could be two different offices. Then it says "that office's register," which means one office. It took me a second read to see that the claim depends on both records being in the same office's register.
- _"When you compare two entries in the same register, the lower serial number marks the earlier entry."_ I reread this for the words "in the same register." That's the condition that makes the comparison valid.
