import { getNamedType, isAbstractType, isObjectType } from "graphql";
import { Fragment, useState, type ReactNode } from "react";
import { useGame } from "../../app/GameProvider.tsx";
import type { ResultError, TransmissionRecord } from "../../engine/mission.ts";
import { annotate } from "../../feedback/annotate.ts";
import { WEIGHT_LIMIT, WEIGHT_LIMITED_FROM } from "../../graphql/weight.ts";
import { fromLedger } from "../../engine/draft.ts";
import { useWorkspace } from "./context.ts";
import { IntrospectionResult, introspectionRoots } from "./Introspection.tsx";
import { bindingTypes, leadBinding } from "../../content/types.ts";
import { schemaFor } from "../../graphql/schema.ts";
import { refOf } from "../../graphql/store.ts";
import { findingAt, labelOf, pathKey, typeWords, words } from "./describe.ts";
import {
  cellAt,
  hasGroup,
  headingOf,
  isGroup,
  isPlainList,
  isRecord,
  rowsOf,
  type Path,
} from "./columns.ts";
import type { Ledger } from "./describe.ts";

/** A record's type, read from the facts recorded beneath it. */
function typeOfIn(record: TransmissionRecord, ledger: Ledger) {
  return (path: Path): string => {
    const prefix = `${pathKey(path)}/`;
    const child = record.facts.find(
      (f) =>
        pathKey(f.path).startsWith(prefix) && f.path.length === path.length + 1,
    );
    return child ? (ledger[child.key]?.fact.entity ?? "") : "";
  };
}

/** The type part of an entity, such as Operative in Operative:GREY_PETREL. */
function typeName(entity: string): string {
  return entity.slice(0, Math.max(0, entity.indexOf(":")));
}

/** Where an error was made: its line and column, and its path if it has one. */
export function whereOf(error: ResultError): string {
  const line =
    error.line !== undefined
      ? `Line ${String(error.line)}, column ${String(error.column ?? 1)}`
      : "";
  const path = error.path ? `at ${error.path.join(".")}` : "";
  return [line, path].filter(Boolean).join(" · ");
}

export function Errors({
  errors,
  clearance,
}: {
  errors: readonly ResultError[];
  clearance: number;
}) {
  const { course } = useGame();
  if (errors.length === 0) return null;
  const aliasAvailable = course.glossary.some(
    (entry) => entry.id === "alias" && entry.clearance <= clearance,
  );
  // The same complaint about three fields is said once, with every place
  // it was made.
  const groups: { error: ResultError; places: string[] }[] = [];
  for (const error of errors) {
    const place = whereOf(error);
    const group = groups.find((g) => g.error.message === error.message);
    if (!group) groups.push({ error, places: place ? [place] : [] });
    else if (place && !group.places.includes(place)) group.places.push(place);
  }
  return (
    <ul className="errors" aria-label="Errors">
      {groups.map(({ error, places }, index) => (
        <li key={index} className="error">
          <pre className="error__message">{error.message}</pre>
          {places.length > 0 && (
            <p className="error__where">
              {places.length > 1 && `In ${String(places.length)} places: `}
              {places.join("; ")}
            </p>
          )}
          <p className="clerk">
            <span className="visually-hidden">Clerk's note: </span>
            {annotate(error, aliasAvailable)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function Findings({
  record,
  layout,
}: {
  record: TransmissionRecord;
  layout: "stacked" | "columns";
}) {
  const { env, state, stage, stageState, dispatch } = useWorkspace();
  const [said, setSaid] = useState("");
  const factAt = new Map(record.facts.map((f) => [pathKey(f.path), f.key]));
  const leadType = bindingTypes(stage)[leadBinding(stage)] ?? "";

  const actions = (path: (string | number)[], name: string): ReactNode => {
    const key = factAt.get(pathKey(path));
    // Where the archive checks the form, a row is read, not cited.
    if (!key || fromLedger(stage)) return null;
    const finding = findingAt(
      record,
      path,
      stage,
      state.ledger,
      stageState.activeLead,
    );
    // A row that returned nothing offers nothing to cite.
    if (!finding) return null;
    const leadId = finding?.leadId ?? stageState.activeLead;
    const draft = leadId ? stageState.drafts[leadId] : undefined;
    const leadName = leadId
      ? labelOf(refOf(leadType, leadId), state.ledger)
      : "";
    const cited =
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
          aria-label={`Cite ${finding.row || name}${leadId ? `, into the draft for ${leadName}` : ""}`}
          title={`Cites ${finding.label}`}
          onClick={() => {
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
            setSaid(`Cited ${finding.label} in the draft for ${leadName}.`);
          }}
        >
          {cited ? "Cited" : "Cite"}
          {/* The space is for anyone who reads or copies the text; the
              button's own gap sets the spacing on screen. */}
          {leadId && " "}
          {leadId && <span className="finding__for">for {leadName}</span>}
        </button>
      </span>
    );
  };

  const entityAt = typeOfIn(record, state.ledger);
  const typeAt = (path: Path): string => {
    const entity = entityAt(path);
    if (entity) return typeWords(entity);
    // A record whose fields record nothing may still say what it is.
    let value: unknown = record.data;
    for (const part of path) {
      value =
        value !== null && typeof value === "object"
          ? (value as Record<string | number, unknown>)[part]
          : undefined;
    }
    const named = isRecord(value) ? value.__typename : undefined;
    return typeof named === "string" ? words(named) : "record";
  };
  const typesAt = (paths: Path[]) => paths.map((p) => typeName(entityAt(p)));

  /**
   * The links on a record that the query did not follow. Naming them is how
   * a player learns that a result can be opened further.
   */
  const mentioned = new Set<string>();
  const unopened = (path: (string | number)[]): ReactNode => {
    const prefix = `${pathKey(path)}/`;
    const facts = record.facts
      .filter(
        (f) =>
          pathKey(f.path).startsWith(prefix) &&
          f.path.length === path.length + 1,
      )
      .map((f) => state.ledger[f.key]?.fact)
      .filter((fact) => fact !== undefined);
    const entity = facts[0]?.entity;
    if (!entity) return null;
    const type = schemaFor(env.clearance).getType(
      entity.slice(0, entity.indexOf(":")),
    );
    if (!isObjectType(type)) return null;
    const asked = new Set(facts.map((fact) => fact.field));
    const links = Object.values(type.getFields())
      .filter(
        (field) =>
          (isObjectType(getNamedType(field.type)) ||
            isAbstractType(getNamedType(field.type))) &&
          !asked.has(field.name),
      )
      .map((field) => field.name);
    if (links.length === 0) return null;
    // Said once for each kind of record, however many rows repeat it.
    const line = `${entity.slice(0, entity.indexOf(":"))}: ${links.join(",")}`;
    if (mentioned.has(line)) return null;
    mentioned.add(line);
    return (
      <p className="finding__more">
        Not yet opened on this {typeWords(entity)}:{" "}
        {links.map((name, index) => (
          <span key={name}>
            {index > 0 && ", "}
            <code>{name}</code>
          </span>
        ))}
      </p>
    );
  };

  const render = (value: unknown, path: (string | number)[]): ReactNode => {
    if (!isRecord(value)) return null;
    return (
      <>
        {unopened(path)}
        {fields(value, path)}
      </>
    );
  };

  /** The records as a group, if this view sets them in columns. */
  const grouped = (values: unknown[], paths: Path[]) =>
    layout === "columns" && isGroup(values, typesAt(paths))
      ? (values as Record<string, unknown>[])
      : null;

  const cellValue = (value: unknown, kind: string): ReactNode => {
    if (value === null) return <em>nothing returned</em>;
    if (kind === "list" && Array.isArray(value)) {
      return value.length === 0
        ? "none"
        : value
            .map((item, index) =>
              isRecord(item) ? headingOf(item, index) : String(item),
            )
            .join(", ");
    }
    if (isRecord(value)) {
      const heading = headingOf(value, 0);
      return heading.startsWith("Entry ") ? "on file" : heading;
    }
    return String(value);
  };

  /**
   * Records of one type in columns, one row for each field. The table sets
   * out what came back and marks nothing as a match (SDD 8.2).
   */
  const table = (
    records: Record<string, unknown>[],
    paths: Path[],
    caption: string,
    aliases: string[] | null,
  ): ReactNode => {
    const rows = rowsOf(records);
    // The links not yet opened, said once for each kind of record. A row
    // holds a record when it is a nested record or a list of one record.
    const notes = [
      unopened(paths[0] ?? []),
      ...rows.map((row) => {
        const inner = row.kind === "list" ? [...row.path, 0] : row.path;
        const first = records.findIndex((r) => {
          const cell = cellAt(r, inner);
          return cell.kind === "value" && isRecord(cell.value);
        });
        return first < 0 ? null : unopened([...(paths[first] ?? []), ...inner]);
      }),
    ].map((note, index) => <Fragment key={index}>{note}</Fragment>);
    return (
      <>
        <div className="side-by-side__wrap">
          <table className="side-by-side">
            <caption className="visually-hidden">{caption}</caption>
            <thead>
              <tr>
                <td className="side-by-side__corner" />
                {records.map((item, index) => (
                  <th key={index} scope="col" className="side-by-side__record">
                    {aliases?.[index] !== undefined && (
                      <code className="side-by-side__alias">
                        {aliases[index]}
                      </code>
                    )}
                    <span className="label">{typeAt(paths[index] ?? [])}</span>{" "}
                    {/* An alias already tells apart records with no name. */}
                    {aliases && headingOf(item, index).startsWith("Entry ")
                      ? null
                      : headingOf(item, index)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                // A list of one record adds its index to the path; it is not a field.
                const named = row.path.filter(
                  (part): part is string => typeof part === "string",
                );
                const name = words(named[named.length - 1] ?? "");
                const full = named.map(words).join(" → ");
                return (
                  <tr key={row.path.join("/")}>
                    <th
                      scope="row"
                      className="side-by-side__field"
                      title={full}
                    >
                      {named.length > 1 && (
                        <span className="side-by-side__parent">
                          {named.slice(0, -1).map(words).join(" → ")} →{" "}
                        </span>
                      )}
                      {name}
                    </th>
                    {records.map((item, index) => {
                      const cell = cellAt(item, row.path);
                      if (cell.kind === "absent") {
                        return (
                          <td
                            key={index}
                            className="side-by-side__cell--absent"
                          >
                            <span className="visually-hidden">
                              Not asked for in this record
                            </span>
                          </td>
                        );
                      }
                      if (cell.kind === "under-nothing") {
                        return <td key={index} />;
                      }
                      return (
                        <td key={index} className="side-by-side__cell">
                          <span className="finding__value">
                            {cellValue(cell.value, row.kind)}
                          </span>
                          {actions(
                            [...(paths[index] ?? []), ...row.path],
                            name,
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {notes}
      </>
    );
  };

  const fields = (
    value: Record<string, unknown>,
    path: (string | number)[],
  ): ReactNode => {
    return (
      <ul className="finding__fields">
        {Object.entries(value).map(([key, child]) => {
          const childPath = [...path, key];
          const name = words(key);
          if (Array.isArray(child)) {
            // A list of records with nothing nested reads best on one line.
            const plain = isPlainList(child);
            const itemPaths = child.map((_, index) => [...childPath, index]);
            const group = plain ? null : grouped(child, itemPaths);
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
                {group ? (
                  <div className="finding__nested">
                    {table(group, itemPaths, name, null)}
                  </div>
                ) : (
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
                )}
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
                      ? "on file"
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
  const meta = introspectionRoots(record.operation);
  const roots = Object.entries(record.data);
  const rootPaths = roots.map(([key]) => [key]);
  const onlyIntrospection = roots.every(([key]) => meta.has(key));
  // A list asked for directly inside the query's braces, set in columns.
  const rootList = (key: string, list: unknown[]): ReactNode => {
    const paths = list.map((_, index) => [key, index]);
    const group = isPlainList(list) ? null : grouped(list, paths);
    return group ? table(group, paths, key, null) : null;
  };
  const rootGroup = onlyIntrospection
    ? null
    : grouped(
        roots.map(([, value]) => value),
        rootPaths,
      );
  return (
    <div className="findings">
      {meta.size > 0 && (
        <p className="findings__legend" data-testid="introspection-legend">
          Introspection describes the archive, not its records, so it holds no
          evidence. No form can rest on it. Each type is listed with its fields,
          one line to a field.
          {JSON.stringify(record.data).includes('"ofType"') && (
            <>
              {" "}
              A type with a <code>!</code> or a list around it is shown layer by
              layer, outermost first, as in{" "}
              <code>NON_NULL → LIST → NON_NULL → OBJECT TransferOrder</code>.
            </>
          )}
        </p>
      )}
      {onlyIntrospection ? null : layout === "columns" ? (
        <p className="findings__legend">
          Each column is one record and each row is one field, so each cell is
          one fact. A shaded cell is a field that the query did not ask for on
          that record.{" "}
          {fromLedger(stage)
            ? "The archive keeps every cell as a fact, and checks your form against those facts when you submit it."
            : "Cite the cells that prove a claim. A citation includes the fields above the cell in the same column."}
        </p>
      ) : (
        <>
          {hasGroup(record.data, (p) => typeName(entityAt(p))) && (
            <p className="findings__legend">
              This response holds several records of the same type. The Side by
              side tab shows them in columns, with one row for each field.
            </p>
          )}
          {fromLedger(stage) ? (
            <p className="findings__legend">
              Each row is one fact. The archive keeps every fact that comes back
              to you, from every response. When you submit a form, the archive
              looks through all of those facts for the evidence.
            </p>
          ) : (
            <p className="findings__legend">
              Each row is one fact. Cite the rows that prove a claim. When you
              cite a row that is nested under other rows, the citation also
              includes the rows it is nested under, so one citation can count as
              several facts. If the facts you need sit beside each other, cite
              each row. The number beside a citation in the draft is how many
              facts it includes.
            </p>
          )}
        </>
      )}
      <p
        className="findings__legend"
        hidden={onlyIntrospection || fromLedger(stage)}
      >
        A Cite button shows which {words(leadType)} gets the citation. For facts
        that belong to no particular {words(leadType)}, the button uses the
        draft you have open. If the button says only Cite, open a lead first.
      </p>
      <p className="visually-hidden" role="status">
        {said.startsWith("Open a lead") ? "" : said}
      </p>
      {said.startsWith("Open a lead") && !stageState.activeLead && (
        <p className="note note--warn" role="alert">
          {said}
        </p>
      )}
      {rootGroup ? (
        <section className="findings__root">
          {table(
            rootGroup,
            rootPaths,
            "Records returned",
            roots.map(([key]) => key),
          )}
        </section>
      ) : (
        roots.map(([key, value]) => (
          <section key={key} className="findings__root">
            <h3 className="findings__title">{key}</h3>
            {meta.has(key) ? (
              <IntrospectionResult value={value} />
            ) : value === null ? (
              <p>
                <em>No record matched.</em>
              </p>
            ) : Array.isArray(value) && rootList(key, value) ? (
              rootList(key, value)
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
        ))
      )}
    </div>
  );
}

/**
 * The variables a transmission was sent with, on one line, or null when it
 * was sent with none (SDD 8.2).
 */
export function sentWith(variables: string): string | null {
  if (variables.trim() === "") return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(variables);
  } catch {
    return null;
  }
  if (!isRecord(parsed) || Object.keys(parsed).length === 0) return null;
  const pairs = Object.entries(parsed).map(
    ([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`,
  );
  return `{ ${pairs.join(", ")} }`;
}

export function Results() {
  const { env, state, viewing, view } = useWorkspace();
  const [chosen, setTab] = useState<"findings" | "columns" | "raw">("findings");
  const total = state.transmissions.length;
  const record = state.transmissions.find((t) => t.n === viewing);
  const typeOf = record ? typeOfIn(record, state.ledger) : null;
  const sent = record ? sentWith(record.variables) : null;
  // The Side by side tab is offered only for a response that has a group.
  const sideBySide =
    record !== undefined &&
    typeOf !== null &&
    isRecord(record.data) &&
    hasGroup(record.data, (p) => typeName(typeOf(p)));
  const tab = chosen === "columns" && !sideBySide ? "findings" : chosen;
  const names = sideBySide
    ? (["findings", "columns", "raw"] as const)
    : (["findings", "raw"] as const);
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
              disabled={viewing === 1}
              onClick={() => view(viewing === 0 ? total : viewing - 1)}
            >
              Earlier
            </button>
            <span>
              {viewing === 0
                ? `${String(total)} earlier`
                : `Transmission ${String(viewing)} of ${String(total)}`}
            </span>
            <button
              type="button"
              className="button button--small"
              disabled={viewing === 0 || viewing >= total}
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
              The records clerk returned your request without processing it.
              {state.clock !== "none" && " No time was spent."}
            </p>
            <Errors errors={rejected.errors} clearance={env.clearance} />
            {record && (
              <p className="note" data-testid="earlier-findings">
                The findings below are not for this request. They are from
                transmission {record.n}, which the archive answered earlier.
              </p>
            )}
          </div>
        )}
      </div>

      {!record && !rejected && (
        <p className="results__empty">
          {total === 0
            ? "Nothing has been transmitted yet. Write a query in the terminal and transmit it."
            : "Nothing has been transmitted from here yet. Responses from earlier in the case are kept: use Earlier to read them."}
        </p>
      )}

      {record && (
        <>
          {sent !== null && (
            <p className="results__variables" data-testid="sent-with">
              You sent this request with the variables <code>{sent}</code>.
            </p>
          )}
          {record.weight !== undefined && (
            <p className="results__variables" data-testid="weight">
              {record.weight === 0 ? (
                <>
                  The records clerk weighed this request at 0: it asks for no
                  records. Introspection and <code>__typename</code> describe
                  the archive itself, and weigh nothing.
                </>
              ) : (
                <>
                  The records clerk weighed this request at {record.weight}: it
                  could return up to {record.weight}{" "}
                  {record.weight === 1 ? "record" : "records"}.
                </>
              )}{" "}
              {env.clearance >= WEIGHT_LIMITED_FROM &&
                `The limit at your clearance is ${String(WEIGHT_LIMIT)}. `}
              The Raw response tab shows the weight under{" "}
              <code>extensions</code>.
            </p>
          )}
          <div className="tabs" role="tablist" aria-label="Result views">
            {names.map((name) => (
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
                {name === "findings"
                  ? "Findings"
                  : name === "columns"
                    ? "Side by side"
                    : "Raw response"}
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
            <Errors errors={record.errors} clearance={env.clearance} />
            {tab !== "raw" ? (
              <Findings
                key={`${state.stageId}:${String(record.n)}:${tab}`}
                record={record}
                layout={tab === "columns" ? "columns" : "stacked"}
              />
            ) : (
              <pre className="raw" data-testid="raw-response">
                {JSON.stringify(
                  {
                    data: record.data,
                    ...(record.errors.length ? { errors: record.errors } : {}),
                    ...(record.weight !== undefined
                      ? { extensions: { weight: record.weight } }
                      : {}),
                  },
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
