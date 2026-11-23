# Fresh reader · The Quiet Consignee clerk note · 2026-11-23

The clerk sent back my first query, so I followed its note and retried with one company, which got an answer.

**What I tried first:** I asked for both companies from the briefing, Meridian Forwarding and Meridian Freight, by putting the `company(name: …)` lookup in the query twice. The clerk returned it unprocessed and charged no time.

**What the note said went wrong:** I used the same field, `company`, twice with different names. Both answers would come back under the same key, `company`, in the response, so they'd clash. It's like a JSON object that can't have two values under one key. The note told me to ask for `company` once per transmission: keep one lookup in this query and send the other on its own.

**What I changed:** I removed the Meridian Freight lookup and sent only `query { company(name: "Meridian Forwarding") { name } }`. That worked and cost 1 hour, leaving 17 of 18. The response gave the name "Meridian Forwarding" and listed fields I haven't asked for yet: `registeredIn`, `director` and `shipments`.

The raw error message gave a different fix from the note. It said to "use different aliases" to get both in one query. That fits with aliases being taught at clearance 3, but I went with the note. I didn't send the Meridian Freight lookup, because I stopped once I had a response.
