import { useState, type ReactNode } from "react";
import type { ResultError, TransmissionRecord } from "../../engine/mission.ts";
import { annotate } from "../../feedback/annotate.ts";
import { useWorkspace } from "./context.ts";
import { findingAt, pathKey, typeWords, words } from "./describe.ts";

function Errors({ errors }: { errors: readonly ResultError[] }) {
  if (errors.length === 0) return null;
  return (
    <ul className="errors" aria-label="Errors">
      {errors.map((error, index) => (
        <li key={index} className="error">
          <pre className="error__message">{error.message}</pre>
          {(error.line !== undefined || error.path) && (
            <p className="error__where">
              {error.line !== undefined &&
                `Line ${String(error.line)}, column ${String(error.column ?? 1)}`}
              {error.line !== undefined && error.path ? " · " : ""}
              {error.path && `at ${error.path.join(".")}`}
            </p>
          )}
          <p className="clerk">
            <span className="visually-hidden">Clerk's note: </span>
            {annotate(error)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function headingOf(value: Record<string, unknown>, index: number): string {
  for (const key of ["name", "codename", "id", "code"]) {
    if (typeof value[key] === "string") return value[key];
  }
  return `Entry ${String(index + 1)}`;
}

function Findings({ record }: { record: TransmissionRecord }) {
  const { state, stage, stageState, dispatch } = useWorkspace();
  const [said, setSaid] = useState("");
  const factAt = new Map(record.facts.map((f) => [pathKey(f.path), f.key]));

  const actions = (path: (string | number)[], name: string): ReactNode => {
    const key = factAt.get(pathKey(path));
    if (!key) return null;
    const finding = findingAt(record, path, stage, state.ledger);
    const pinned = state.pins.includes(key);
    const leadId = finding?.leadId ?? stageState.activeLead;
    const draft = leadId ? stageState.drafts[leadId] : undefined;
    const cited =
      finding !== null &&
      draft?.citations.some(
        (c) => c.factKeys.join("|") === finding.factKeys.join("|"),
      ) === true;
    const closed = state.status === "complete" || state.clock === "ended";
    return (
      <span className="finding__actions">
        <button
          type="button"
          className="button button--small"
          disabled={closed || cited}
          aria-label={`Cite ${finding?.label ?? name}${leadId ? `, into the draft for ${leadId}` : ""}`}
          onClick={() => {
            if (!finding) return;
            if (!leadId) {
              setSaid(
                "Open a lead in the draft first, then cite this finding.",
              );
              return;
            }
            dispatch({
              type: "cite",
              leadId,
              label: finding.label,
              factKeys: finding.factKeys,
            });
            setSaid(`Cited ${finding.label} in the draft for ${leadId}.`);
          }}
        >
          {cited ? "Cited" : "Cite"}
        </button>
        <button
          type="button"
          className="button button--small"
          aria-pressed={pinned}
          aria-label={`${pinned ? "Unpin" : "Pin"} ${finding?.label ?? name}`}
          disabled={closed}
          onClick={() => dispatch({ type: pinned ? "unpin" : "pin", key })}
        >
          {pinned ? "Pinned" : "Pin"}
        </button>
      </span>
    );
  };

  const typeAt = (path: (string | number)[]): string => {
    // A record's type is read from the facts recorded beneath it.
    const prefix = `${pathKey(path)}/`;
    const child = record.facts.find(
      (f) =>
        pathKey(f.path).startsWith(prefix) && f.path.length === path.length + 1,
    );
    const entity = child ? state.ledger[child.key]?.fact.entity : undefined;
    return entity ? typeWords(entity) : "record";
  };

  const render = (value: unknown, path: (string | number)[]): ReactNode => {
    if (!isRecord(value)) return null;
    return (
      <ul className="finding__fields">
        {Object.entries(value).map(([key, child]) => {
          const childPath = [...path, key];
          const name = words(key);
          if (Array.isArray(child)) {
            // A list of records with nothing nested reads best on one line.
            const plain = child.every(
              (item) =>
                !isRecord(item) ||
                (Object.keys(item).length <= 2 &&
                  Object.values(item).every(
                    (v) => v === null || typeof v !== "object",
                  )),
            );
            return (
              <li key={key} className="finding">
                <div className="finding__row">
                  <span className="finding__name">{name}</span>
                  <span className="finding__value">
                    {child.length === 0
                      ? "none"
                      : plain
                        ? child
                            .map((item, index) =>
                              isRecord(item)
                                ? headingOf(item, index)
                                : String(item),
                            )
                            .join(", ")
                        : `${String(child.length)} on file`}
                  </span>
                  {actions(childPath, name)}
                </div>
                <ol className="finding__list" hidden={plain}>
                  {child.map((item, index) =>
                    isRecord(item) ? (
                      <li key={index} className="finding__record">
                        <p className="finding__heading">
                          <span className="label">
                            {typeAt([...childPath, index])}
                          </span>{" "}
                          {headingOf(item, index)}
                        </p>
                        {render(item, [...childPath, index])}
                      </li>
                    ) : (
                      <li key={index}>{String(item)}</li>
                    ),
                  )}
                </ol>
              </li>
            );
          }
          if (isRecord(child)) {
            return (
              <li key={key} className="finding">
                <div className="finding__row">
                  <span className="finding__name">{name}</span>
                  <span className="finding__value">
                    {headingOf(child, 0).startsWith("Entry ")
                      ? typeAt(childPath)
                      : headingOf(child, 0)}
                  </span>
                  {actions(childPath, name)}
                </div>
                <div className="finding__nested">
                  {render(child, childPath)}
                </div>
              </li>
            );
          }
          return (
            <li key={key} className="finding">
              <div className="finding__row">
                <span className="finding__name">{name}</span>
                <span className="finding__value">
                  {child === null ? <em>nothing returned</em> : String(child)}
                </span>
                {actions(childPath, name)}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  if (!isRecord(record.data)) {
    return <p>The archive returned no data.</p>;
  }
  return (
    <div className="findings">
      <p className="visually-hidden" role="status">
        {said.startsWith("Open a lead") ? "" : said}
      </p>
      {said.startsWith("Open a lead") && (
        <p className="note note--warn" role="alert">
          {said}
        </p>
      )}
      {Object.entries(record.data).map(([key, value]) => (
        <section key={key} className="findings__root">
          <h3 className="findings__title">{key}</h3>
          {value === null ? (
            <p>
              <em>No record matched.</em>
            </p>
          ) : Array.isArray(value) ? (
            <ol className="finding__list">
              {value.map((item, index) =>
                isRecord(item) ? (
                  <li key={index} className="finding__record">
                    <p className="finding__heading">
                      <span className="label">{typeAt([key, index])}</span>{" "}
                      {headingOf(item, index)}
                    </p>
                    {render(item, [key, index])}
                  </li>
                ) : null,
              )}
            </ol>
          ) : (
            render(value, [key])
          )}
        </section>
      ))}
    </div>
  );
}

export function Results() {
  const { state, viewing, view } = useWorkspace();
  const [tab, setTab] = useState<"findings" | "raw">("findings");
  const total = state.transmissions.length;
  const record = state.transmissions.find((t) => t.n === viewing);
  const rejected = state.rejected;

  return (
    <section
      className="results paper paper--plain"
      aria-labelledby="results-title"
    >
      <header className="panel-head">
        <h2 id="results-title">Results</h2>
        {total > 0 && (
          <div className="results__pager">
            <button
              type="button"
              className="button button--small"
              disabled={viewing <= 1}
              onClick={() => view(viewing - 1)}
            >
              Earlier
            </button>
            <span>
              Transmission {viewing} of {total}
            </span>
            <button
              type="button"
              className="button button--small"
              disabled={viewing >= total}
              onClick={() => view(viewing + 1)}
            >
              Later
            </button>
          </div>
        )}
      </header>

      <div aria-live="polite">
        {rejected && (
          <div className="results__rejected">
            <p className="note note--warn">
              Returned by the records clerk unprocessed. No time was spent.
            </p>
            <Errors errors={rejected.errors} />
          </div>
        )}
      </div>

      {!record && !rejected && (
        <p className="results__empty">
          Nothing has been transmitted yet. Write a query in the terminal and
          transmit it.
        </p>
      )}

      {record && (
        <>
          <div className="tabs" role="tablist" aria-label="Result views">
            {(["findings", "raw"] as const).map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                id={`result-tab-${name}`}
                aria-selected={tab === name}
                aria-controls="result-view"
                className="tab"
                onClick={() => setTab(name)}
              >
                {name === "findings" ? "Findings" : "Raw response"}
              </button>
            ))}
          </div>
          <div
            id="result-view"
            role="tabpanel"
            aria-labelledby={`result-tab-${tab}`}
            className="results__view"
            tabIndex={0}
          >
            <Errors errors={record.errors} />
            {tab === "findings" ? (
              <Findings key={record.n} record={record} />
            ) : (
              <pre className="raw" data-testid="raw-response">
                {JSON.stringify(
                  record.errors.length
                    ? { data: record.data, errors: record.errors }
                    : { data: record.data },
                  null,
                  2,
                )}
              </pre>
            )}
          </div>
        </>
      )}
    </section>
  );
}
