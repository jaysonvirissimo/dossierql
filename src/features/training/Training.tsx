import { useRef, useState } from "react";
import { useGame } from "../../app/GameProvider.tsx";
import { archiveStore } from "../../content/archive.ts";
import type { Drill } from "../../content/types.ts";
import { matchSet } from "../../engine/match.ts";
import { resultErrors, type ResultError } from "../../engine/mission.ts";
import { transmit } from "../../graphql/execute.ts";
import { schemaFor } from "../../graphql/schema.ts";
import { href } from "../../routes/parseRoute.ts";
import { Prose } from "../Prose.tsx";
import { SchemaDocs } from "../SchemaDocs.tsx";
import { Editor } from "../workspace/Editor.tsx";
import { Errors } from "../workspace/Results.tsx";
import "../workspace/workspace.css";
import "./training.css";

/** Drills are played with the archive as a new analyst sees it. */
const CLEARANCE = 1;

interface Outcome {
  /** False when the clerk returned the request unprocessed. */
  transmitted: boolean;
  data: unknown;
  errors: ResultError[];
  passed: boolean;
}

function DrillView({
  drill,
  last,
  onNext,
}: {
  drill: Drill;
  last: boolean;
  onNext(): void;
}) {
  const { course, standing, record } = useGame();
  const text = useRef(drill.starter);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const firstCase = course.missions[0];

  const send = () => {
    const sent = transmit(archiveStore, {
      operation: text.current,
      clearance: CLEARANCE,
    });
    // Any request that returns the facts passes. The text is never judged.
    const passed =
      sent.transmitted &&
      matchSet(
        drill.expects,
        sent.facts.map((occurrence) => occurrence.fact),
      ) !== null;
    setOutcome({
      transmitted: sent.transmitted,
      data: sent.result.data ?? null,
      errors: resultErrors(sent.result.errors),
      passed,
    });
    if (passed && !standing.drills.includes(drill.id)) {
      record([{ type: "drill-passed", drillId: drill.id }]);
    }
  };

  return (
    <>
      <div className="drill__task paper paper--plain">
        <h2>{drill.title}</h2>
        <Prose text={drill.task} />
      </div>

      <div className="drill__grid">
        <section className="terminal" aria-labelledby="terminal-title">
          <header className="terminal__head">
            <h2 id="terminal-title">Terminal</h2>
            <span className="terminal__level">Practice · nothing is timed</span>
          </header>
          <div className="terminal__editor">
            <Editor
              initial={drill.starter}
              schema={schemaFor(CLEARANCE)}
              label="GraphQL query"
              onChange={(value) => {
                text.current = value;
              }}
              onTransmit={send}
            />
          </div>
          <footer className="terminal__foot">
            <button
              type="button"
              className="button button--primary"
              data-testid="transmit"
              onClick={send}
            >
              Transmit (free)
            </button>
            <span className="terminal__key">
              or press Ctrl+Enter (⌘+Enter) in the editor.
            </span>
          </footer>
        </section>

        <section
          className="results paper paper--plain"
          aria-labelledby="response-title"
        >
          <header className="panel-head">
            <h2 id="response-title">Response</h2>
          </header>
          <div className="results__view" aria-live="polite">
            {!outcome && (
              <p className="results__empty">
                Nothing has been transmitted yet. The response will appear here,
                in the same shape as the request.
              </p>
            )}
            {outcome && !outcome.transmitted && (
              <p className="note note--warn">
                The records clerk returned your request without processing it.
                Try again: a transmission here costs nothing.
              </p>
            )}
            {outcome && <Errors errors={outcome.errors} />}
            {outcome?.transmitted && (
              <pre className="raw" data-testid="raw-response">
                {JSON.stringify({ data: outcome.data }, null, 2)}
              </pre>
            )}
          </div>
        </section>
      </div>

      <div className="drill__verdict" role="status">
        {outcome?.passed && (
          <div className="drill__passed paper paper--plain">
            <p className="stamp" data-testid="stamp">
              Passed
            </p>
            <div>
              <Prose text={drill.payoff} />
              {last ? (
                <p className="drill__next">
                  Induction complete.{" "}
                  {firstCase && (
                    <a
                      className="button button--primary"
                      href={href({ name: "mission", missionId: firstCase.id })}
                    >
                      Open the first case
                    </a>
                  )}
                </p>
              ) : (
                <p className="drill__next">
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={onNext}
                  >
                    Next drill
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
        {outcome && !outcome.passed && (
          <div className="note">
            <p>
              <strong>Not yet.</strong>
            </p>
            <Prose text={drill.nudge} />
          </div>
        )}
      </div>

      <details className="drill__docs paper paper--plain">
        <summary>Documentation: what the archive holds</summary>
        <SchemaDocs clearance={CLEARANCE} />
      </details>
    </>
  );
}

/**
 * The training range: one skill at a time, with no clock, no draft and no
 * consequences. It is optional, and offered before the first case.
 */
export default function Training() {
  const { course, standing } = useGame();
  const drills = course.drills;
  const [index, setIndex] = useState(() => {
    const open = drills.findIndex((d) => !standing.drills.includes(d.id));
    return open === -1 ? 0 : open;
  });
  const drill = drills[index];
  if (!drill) return null;

  return (
    <main className="page drill">
      <header className="page__head">
        <p className="label page__eyebrow">
          Training range · drill {index + 1} of {drills.length}
        </p>
        <h1>Training range</h1>
        <p className="page__lede">
          The records clerk checks that every new analyst can work the terminal.
          Short drills, one skill each. Nothing is timed or scored.
        </p>
        <ol className="drill__list" aria-label="Drills">
          {drills.map((d, i) => (
            <li key={d.id}>
              <button
                type="button"
                className="drill__pick"
                aria-current={i === index ? "step" : undefined}
                onClick={() => setIndex(i)}
              >
                {i + 1}. {d.title}
                {standing.drills.includes(d.id) && (
                  <span className="chip chip--ok">Passed</span>
                )}
              </button>
            </li>
          ))}
        </ol>
      </header>
      <DrillView
        key={drill.id}
        drill={drill}
        last={index === drills.length - 1}
        onNext={() => setIndex(index + 1)}
      />
    </main>
  );
}
