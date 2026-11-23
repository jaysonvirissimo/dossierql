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
          <p>
            In the query below, <code>country(name: "Chile")</code> asks for one
            record. The part in parentheses says which record: the country whose
            name is Chile. The braces after it hold the pieces of information
            you want from that country, here its name and its capital.
          </p>
          <div className="orientation__pair">
            <figure>
              <figcaption className="label">A query</figcaption>
              <pre className="code">{`query {
  country(name: "Chile") {
    name
    capital
  }
}`}</pre>
            </figure>
            <figure>
              <figcaption className="label">Its result</figcaption>
              <pre className="code code--paper">{`{
  "data": {
    "country": {
      "name": "Chile",
      "capital": "Santiago"
    }
  }
}`}</pre>
            </figure>
          </div>

          <h2>Three things to know</h2>
          <ul>
            <li>
              A request the archive cannot read is not processed. It comes back
              with a note from the records clerk saying where to look. Correct
              the request and transmit it again.
            </li>
            <li>
              The first case has no clock. You can transmit as many queries as
              you like. The second case brings in a clock, and that clock counts
              hours in the story, never real time.
            </li>
            <li>
              The Documentation tab lists everything the archive holds. The{" "}
              <a href={href({ name: "manual" })}>tradecraft manual</a> defines
              every term.
            </li>
          </ul>
          <p>
            The training range teaches the rest by doing, one skill at a time.
          </p>

          <p className="briefing__go">
            <a
              className="button button--primary"
              href={href({ name: "training" })}
            >
              Start training
            </a>{" "}
            {first && (
              <a
                className="button"
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
