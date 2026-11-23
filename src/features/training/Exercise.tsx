import { useRef, useState, type ReactNode } from "react";
import { useGame } from "../../app/GameProvider.tsx";
import type { ResultError } from "../../engine/mission.ts";
import { schemaFor } from "../../graphql/schema.ts";
import { Prose } from "../Prose.tsx";
import { SchemaDocs } from "../SchemaDocs.tsx";
import { Editor } from "../workspace/Editor.tsx";
import { Errors, sentWith } from "../workspace/Results.tsx";
import { VimSwitch } from "../workspace/VimSwitch.tsx";
import "../workspace/workspace.css";
import "./training.css";

/**
 * How one transmission went. `facts` means the response lacked the expected
 * facts, and `structure` that it held them without the technique a kata asks
 * for. Drills never judge structure.
 */
export type Verdict = "passed" | "facts" | "structure";

export type Outcome =
  | { kind: "refused"; text: string }
  | {
      kind: "sent";
      /** False when the clerk returned the request unprocessed. */
      transmitted: boolean;
      data: unknown;
      errors: ResultError[];
      verdict: Verdict;
      variables: string;
    };

/**
 * The screen a drill and a kata share (SDD 3.11, 3.14): the task, the
 * terminal, the response beside it, the verdict, and the documentation.
 */
export function Exercise({
  title,
  task,
  starter,
  variables,
  clearance,
  level,
  attempt,
  onPass,
  nudge,
  structureNudge,
  payoff,
  next,
}: {
  title: string;
  task: string;
  starter: string;
  /** When given, the terminal has a variables panel holding this text. */
  variables?: string;
  clearance: number;
  /** The label in the terminal's head. */
  level: string;
  attempt(operation: string, variables: string): Outcome;
  onPass(): void;
  nudge: string;
  structureNudge?: string;
  payoff: string;
  next: ReactNode;
}) {
  const { preferences } = useGame();
  const text = useRef(starter);
  const vars = useRef(variables ?? "");
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const send = () => {
    const result = attempt(text.current, vars.current);
    setOutcome(result);
    if (result.kind === "sent" && result.verdict === "passed") onPass();
  };

  const sent = outcome?.kind === "sent" ? outcome : null;
  const label = sent?.transmitted ? sentWith(sent.variables) : null;

  return (
    <>
      <div className="drill__task paper paper--plain">
        <h2>{title}</h2>
        <Prose text={task} />
      </div>

      <div
        className={
          variables === undefined
            ? "drill__grid"
            : "drill__grid drill__grid--variables"
        }
      >
        <section className="terminal" aria-labelledby="terminal-title">
          <header className="terminal__head">
            <h2 id="terminal-title">Terminal</h2>
            <div className="terminal__tools">
              <VimSwitch />
              <span className="terminal__level">{level}</span>
            </div>
          </header>
          <div className="terminal__editor">
            <Editor
              initial={starter}
              schema={schemaFor(clearance)}
              label="GraphQL query"
              vim={preferences.vim}
              onChange={(value) => {
                text.current = value;
              }}
              onTransmit={send}
            />
          </div>
          {variables !== undefined && (
            <div className="terminal__variables">
              <p aria-hidden="true">Variables (JSON)</p>
              <Editor
                initial={variables}
                label="Variables (JSON)"
                vim={preferences.vim}
                compact
                testId="variables-editor"
                onChange={(value) => {
                  vars.current = value;
                }}
                onTransmit={send}
              />
            </div>
          )}
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
            {outcome?.kind === "refused" && (
              <p className="note note--warn">{outcome.text}</p>
            )}
            {sent && !sent.transmitted && (
              <p className="note note--warn">
                The records clerk returned your request without processing it.
                Try again: a transmission here costs nothing.
              </p>
            )}
            {label && (
              <p className="results__variables" data-testid="sent-with">
                You sent this request with the variables <code>{label}</code>.
              </p>
            )}
            {sent && <Errors errors={sent.errors} clearance={clearance} />}
            {sent?.transmitted && (
              <pre className="raw" data-testid="raw-response">
                {JSON.stringify({ data: sent.data }, null, 2)}
              </pre>
            )}
          </div>
        </section>
      </div>

      <div className="drill__verdict" role="status">
        {sent?.verdict === "passed" && (
          <div className="drill__passed paper paper--plain">
            <p className="stamp" data-testid="stamp">
              Passed
            </p>
            <div>
              <Prose text={payoff} />
              {next}
            </div>
          </div>
        )}
        {sent && sent.verdict !== "passed" && (
          <div className="note" data-testid="not-yet">
            <p>
              <strong>Not yet.</strong>
            </p>
            <Prose
              text={
                sent.verdict === "structure" && structureNudge
                  ? structureNudge
                  : nudge
              }
            />
          </div>
        )}
      </div>

      <details className="drill__docs paper paper--plain">
        <summary>Documentation: what the archive holds</summary>
        <SchemaDocs clearance={clearance} />
      </details>
    </>
  );
}
