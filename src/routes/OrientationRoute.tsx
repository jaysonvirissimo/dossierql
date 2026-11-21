import { useEffect } from "react";
import { useGame } from "../app/GameProvider.tsx";
import { href } from "./parseRoute.ts";

/**
 * The optional introduction to the terminal (SDD 3.13). It is never
 * required and can be reopened at any time.
 */
export function OrientationRoute() {
  const { course, preferences, setPreferences } = useGame();
  const first = course.missions[0];

  useEffect(() => {
    if (!preferences.orientationSeen) {
      setPreferences({ ...preferences, orientationSeen: true });
    }
  }, [preferences, setPreferences]);

  return (
    <main className="page">
      <article className="paper sheet">
        <div className="sheet__body orientation">
          <p className="label">Optional · reopen at any time</p>
          <h1>Orientation</h1>
          <p>
            You are an analyst. Your desk has one instrument that matters: a
            terminal connected to the agency's archive. Everything you conclude
            has to rest on what the archive returned to you.
          </p>

          <h2>The terminal</h2>
          <p>
            You type a request, called a{" "}
            <a href={href({ name: "manual", entryId: "query" })}>query</a>, and
            transmit it. A query lists the pieces of information you want, in
            the shape you want them back. The archive answers in exactly that
            shape.
          </p>
          <div className="orientation__pair">
            <figure>
              <figcaption className="label">A query</figcaption>
              <pre className="code">{`query {
  city(name: "Lisbon") {
    name
    country {
      name
    }
  }
}`}</pre>
            </figure>
            <figure>
              <figcaption className="label">Its result</figcaption>
              <pre className="code code--paper">{`{
  "data": {
    "city": {
      "name": "Lisbon",
      "country": {
        "name": "Portugal"
      }
    }
  }
}`}</pre>
            </figure>
          </div>

          <h2>Reading a result</h2>
          <p>
            The result has the same names and the same nesting as the query. The
            results panel shows it twice: as findings you can cite, and as the
            raw response. If part of a request cannot be answered, the result
            says so in a list of errors. The original error is always shown, and
            the records clerk adds a note beneath it suggesting where to look.
            Errors are routine. Nobody is keeping count.
          </p>

          <h2>What a transmission costs</h2>
          <p>
            Each case has a budget of hours. One transmission costs one hour,
            whether it asks for one thing or for everything, so a query that
            gathers all you need at once is the cheapest. A request the clerk
            cannot read is returned without being sent and costs nothing. Travel
            and hints cost more, and the price is always shown first. A journey
            is priced by distance. The clock counts game hours only. Take as
            long as you like.
          </p>

          <h2>Evidence, drafts and citations</h2>
          <p>
            Every fact a result contains is recorded as evidence. To travel or
            to submit a deduction you fill in a draft: it lists the claims you
            must support, and you cite findings for each, straight from the
            results. The draft shows which claims your citations support. A
            finding that contradicts a claim lets you rule a lead out, free.
            Where a lead is only half made, some cases offer a field check: it
            costs the journey, returns a dispatch about that lead, and leaves
            the case open.
          </p>

          <h2>Where to look things up</h2>
          <p>
            The Documentation tab beside the terminal lists every kind of record
            the archive holds and what each contains. It is produced by asking
            the archive's{" "}
            <a href={href({ name: "manual", entryId: "schema" })}>schema</a> to
            describe itself, which is something you will later learn to do by
            hand. The glossary defines every term, in the Glossary tab and in
            the <a href={href({ name: "manual" })}>tradecraft manual</a>. Both
            are free and always open.
          </p>

          <p className="briefing__go">
            {first && (
              <a
                className="button button--primary"
                href={href({ name: "mission", missionId: first.id })}
              >
                Open the first case
              </a>
            )}{" "}
            <a className="button" href={href({ name: "home" })}>
              Back to assignments
            </a>
          </p>
        </div>
      </article>
    </main>
  );
}
