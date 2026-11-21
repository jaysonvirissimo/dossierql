import { getNamedType, isObjectType, type GraphQLObjectType } from "graphql";
import { lazy, Suspense, useMemo, useState } from "react";
import { useGame } from "../../app/GameProvider.tsx";
import { referenceOperations } from "../../content/types.ts";
import { COSTS, HINT_LADDER_COST } from "../../engine/clock.ts";
import { hintCost, revealCost } from "../../engine/mission.ts";
import { schemaFor } from "../../graphql/schema.ts";
import { parseRef } from "../../graphql/store.ts";
import { Prose } from "../Prose.tsx";
import { useWorkspace } from "./context.ts";
import {
  describeFact,
  describeValue,
  hours,
  labelOf,
  words,
} from "./describe.ts";

const MapPanel = lazy(() => import("./MapPanel.tsx"));

const TABS = [
  ["case", "Case"],
  ["docs", "Documentation"],
  ["hints", "Hints"],
  ["evidence", "Evidence"],
  ["dossiers", "Dossiers"],
  ["map", "Map"],
  ["glossary", "Glossary"],
] as const;
type TabId = (typeof TABS)[number][0];

function CasePanel() {
  const { env, state, stage, restart } = useWorkspace();
  const [confirming, setConfirming] = useState(false);
  const here = state.dispatches.filter((d) => d.stageId === state.stageId);
  const earlier = state.dispatches.filter((d) => d.stageId !== state.stageId);
  return (
    <div className="tool">
      <h3>Objective</h3>
      <p>{stage.objective}</p>
      <h3>Briefing</h3>
      <Prose text={stage.briefing} />
      <h3>Clues</h3>
      <ul className="clues">
        {stage.clues.map((clue, index) => (
          <li key={index}>{clue.text}</li>
        ))}
      </ul>
      {state.dispatches.length > 0 && (
        <>
          <h3>Dispatches</h3>
          <ol className="dispatches">
            {[...earlier, ...here].map((dispatch) => (
              <li key={dispatch.n} className="dispatch">
                <span className="label">
                  {words(dispatch.kind.replace("-", " "))}
                  {dispatch.leadId ? ` · ${dispatch.leadId}` : ""}
                  {dispatch.cost > 0 ? ` · ${hours(dispatch.cost)}` : ""}
                </span>
                <Prose text={dispatch.text} />
              </li>
            ))}
          </ol>
        </>
      )}
      <h3>Case file</h3>
      <p>
        {env.mission.title} · clearance {env.mission.clearance} · budget{" "}
        {hours(state.budget)}
      </p>
      {confirming ? (
        <p className="note note--warn">
          Restarting discards this attempt's evidence, drafts and time.{" "}
          <button
            type="button"
            className="button button--small button--danger"
            onClick={restart}
          >
            Restart the investigation
          </button>{" "}
          <button
            type="button"
            className="button button--small"
            onClick={() => setConfirming(false)}
          >
            Keep going
          </button>
        </p>
      ) : (
        <button
          type="button"
          className="button button--small"
          onClick={() => setConfirming(true)}
        >
          Restart the investigation…
        </button>
      )}
    </div>
  );
}

function DocsPanel() {
  const { env } = useWorkspace();
  const types = useMemo(() => {
    const schema = schemaFor(env.clearance);
    const query = schema.getQueryType();
    const all = Object.values(schema.getTypeMap()).filter(
      (t): t is GraphQLObjectType =>
        isObjectType(t) && !t.name.startsWith("__") && t !== query,
    );
    all.sort((a, b) => a.name.localeCompare(b.name));
    return query ? [query, ...all] : all;
  }, [env.clearance]);
  return (
    <div className="tool">
      <p className="tool__lede">
        The archive at clearance {env.clearance}, as it describes itself.
        Reading this is free.
      </p>
      {types.map((type, index) => (
        <details key={type.name} className="doc" open={index === 0}>
          <summary>
            <code>{type.name}</code>
            {index === 0 && <span> · where every query starts</span>}
            {type.description && <span> · {type.description}</span>}
          </summary>
          <dl className="doc__fields">
            {Object.values(type.getFields()).map((field) => (
              <div key={field.name} className="doc__field">
                <dt>
                  <code>
                    {field.name}
                    {field.args.length > 0 &&
                      `(${field.args
                        .map((a) => `${a.name}: ${String(a.type)}`)
                        .join(", ")})`}
                    : {String(field.type)}
                  </code>
                </dt>
                <dd>
                  {field.description ??
                    (isObjectType(getNamedType(field.type))
                      ? `Returns ${String(getNamedType(field.type))} records, which need a selection.`
                      : "A plain value.")}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      ))}
    </div>
  );
}

const HINT_STEPS = [
  ["nudge", "restates what you are looking for"],
  ["concept", "names the GraphQL idea involved"],
  ["schema", "names the relevant types and fields"],
  ["skeleton", "shows the shape of a working query"],
] as const;

function HintsPanel() {
  const { state, stage, stageState, dispatch } = useWorkspace();
  const step = stageState.hintStep;
  const timed = state.clock === "active";
  const next = HINT_STEPS[step];
  const closed = state.status === "complete";
  return (
    <div className="tool">
      <p className="tool__lede">
        {timed
          ? `Help costs time. The four hints cost ${COSTS.hints.join(", ")} hours in turn, ${String(HINT_LADDER_COST)} in all. Viewing the solution costs ${hours(COSTS.solutionReveal)}.`
          : "The deadline has passed, so help is free."}{" "}
        The documentation and glossary are always free.
      </p>
      <ol className="hints">
        {HINT_STEPS.map(([key, purpose], index) => (
          <li key={key} className="hint">
            <p className="label">
              Hint {index + 1} of 4: {purpose}
              {timed && index >= step
                ? ` · ${hours(COSTS.hints[index] ?? 0)}`
                : ""}
            </p>
            {index < step ? (
              key === "skeleton" ? (
                <pre className="hint__code">{stage.hints[key]}</pre>
              ) : (
                <p>{stage.hints[key]}</p>
              )
            ) : (
              <p className="hint__sealed">Not taken.</p>
            )}
          </li>
        ))}
      </ol>
      {next && state.clock !== "ended" && (
        <button
          type="button"
          className="button"
          disabled={closed}
          onClick={() => dispatch({ type: "hint" })}
        >
          Take hint {step + 1} of 4 ({timed ? hours(hintCost(state)) : "free"})
        </button>
      )}
      <h3>Solution</h3>
      {stageState.solutionRevealed ? (
        <>
          <p>The stage's reference solution:</p>
          {referenceOperations(stage).map(({ operation, variables }, index) => (
            <div key={index}>
              <pre className="hint__code" data-testid="reference-solution">
                {operation.trim()}
              </pre>
              {variables && (
                <pre className="hint__code">
                  {JSON.stringify(variables, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </>
      ) : (
        <button
          type="button"
          className="button"
          onClick={() => dispatch({ type: "reveal" })}
        >
          View the solution (
          {revealCost(state) > 0 ? hours(revealCost(state)) : "free"})
        </button>
      )}
    </div>
  );
}

function EvidencePanel() {
  const { state, dispatch, view } = useWorkspace();
  const entries = Object.values(state.ledger);
  const groups = new Map<string, typeof entries>();
  for (const entry of entries) {
    const list = groups.get(entry.fact.entity) ?? [];
    list.push(entry);
    groups.set(entry.fact.entity, list);
  }
  const pinned = state.pins
    .map((key) => state.ledger[key])
    .filter((e) => e !== undefined);
  return (
    <div className="tool">
      <p className="tool__lede">
        Every fact your queries have returned: {entries.length} so far. Browsing
        the ledger is free.
      </p>
      <h3>Pinned</h3>
      {pinned.length === 0 ? (
        <p className="draft__none">Nothing pinned.</p>
      ) : (
        <ul className="ledger">
          {pinned.map((entry) => (
            <li key={entry.fact.key}>
              {describeFact(entry.fact, state.ledger)}{" "}
              <button
                type="button"
                className="button button--small"
                onClick={() => dispatch({ type: "unpin", key: entry.fact.key })}
              >
                Unpin
              </button>
            </li>
          ))}
        </ul>
      )}
      <h3>Ledger</h3>
      {[...groups.entries()].map(([entity, facts]) => (
        <details key={entity} className="doc">
          <summary>
            <span className="label">{words(parseRef(entity).type)}</span>{" "}
            {labelOf(entity, state.ledger)} · {facts.length}
          </summary>
          <ul className="ledger">
            {facts.map(({ fact, sources }) => {
              const isPinned = state.pins.includes(fact.key);
              const last = sources[sources.length - 1];
              return (
                <li key={fact.key}>
                  <strong>{words(fact.field)}:</strong>{" "}
                  {describeValue(fact, state.ledger)}{" "}
                  {last && (
                    <button
                      type="button"
                      className="button button--quiet button--small"
                      onClick={() => view(last.transmission)}
                    >
                      Transmission {last.transmission}
                    </button>
                  )}
                  <button
                    type="button"
                    className="button button--small"
                    aria-pressed={isPinned}
                    onClick={() =>
                      dispatch({
                        type: isPinned ? "unpin" : "pin",
                        key: fact.key,
                      })
                    }
                  >
                    {isPinned ? "Pinned" : "Pin"}
                  </button>
                </li>
              );
            })}
          </ul>
        </details>
      ))}
    </div>
  );
}

function DossierPanel() {
  const { state } = useWorkspace();
  const operatives = new Map<string, typeof entries>();
  const entries = Object.values(state.ledger);
  for (const entry of entries) {
    if (!entry.fact.entity.startsWith("Operative:")) continue;
    const list = operatives.get(entry.fact.entity) ?? [];
    list.push(entry);
    operatives.set(entry.fact.entity, list);
  }
  return (
    <div className="tool">
      <p className="tool__lede">
        A dossier shows only what your queries have retrieved.
      </p>
      {operatives.size === 0 && (
        <p className="draft__none">
          No operative has appeared in your results yet.
        </p>
      )}
      {[...operatives.entries()].map(([entity, facts]) => (
        <article key={entity} className="dossier">
          <h3>{labelOf(entity, state.ledger)}</h3>
          <dl>
            {facts.map(({ fact }) => (
              <div key={fact.key} className="dossier__row">
                <dt>{words(fact.field)}</dt>
                <dd>{describeValue(fact, state.ledger)}</dd>
              </div>
            ))}
          </dl>
        </article>
      ))}
    </div>
  );
}

function GlossaryPanel() {
  const { env } = useWorkspace();
  const { course } = useGame();
  return (
    <div className="tool">
      <p className="tool__lede">Definitions are reference material and free.</p>
      <dl className="glossary">
        {course.glossary
          .filter((entry) => entry.clearance <= env.clearance)
          .map((entry) => (
            <div key={entry.id} className="glossary__entry">
              <dt>{entry.term}</dt>
              <dd>
                <Prose text={entry.definition} />
              </dd>
            </div>
          ))}
      </dl>
    </div>
  );
}

export function Tools() {
  const [tab, setTab] = useState<TabId>("case");
  return (
    <section className="tools paper paper--plain" aria-label="Case tools">
      <div className="tabs" role="tablist" aria-label="Case tools">
        {TABS.map(([id, title]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tool-tab-${id}`}
            aria-selected={tab === id}
            aria-controls="tool-panel"
            className="tab"
            onClick={() => setTab(id)}
          >
            {title}
          </button>
        ))}
      </div>
      <div
        id="tool-panel"
        role="tabpanel"
        aria-labelledby={`tool-tab-${tab}`}
        className="tools__panel"
        tabIndex={0}
      >
        {tab === "case" && <CasePanel />}
        {tab === "docs" && <DocsPanel />}
        {tab === "hints" && <HintsPanel />}
        {tab === "evidence" && <EvidencePanel />}
        {tab === "dossiers" && <DossierPanel />}
        {tab === "map" && (
          <Suspense fallback={<p className="tool">Unrolling the map…</p>}>
            <MapPanel />
          </Suspense>
        )}
        {tab === "glossary" && <GlossaryPanel />}
      </div>
    </section>
  );
}
