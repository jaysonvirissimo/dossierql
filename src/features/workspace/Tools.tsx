import { lazy, Suspense, useEffect, useState } from "react";
import { useGame } from "../../app/GameProvider.tsx";
import {
  bindingTypes,
  leadBinding,
  quarryRef,
  quarryShown,
  referenceSteps,
} from "../../content/types.ts";
import { COSTS, HINT_LADDER_COST } from "../../engine/clock.ts";
import { hintCost, revealCost, type Dispatch } from "../../engine/mission.ts";
import { parseRef, refOf } from "../../graphql/store.ts";
import { Prose } from "../Prose.tsx";
import { SchemaDocs } from "../SchemaDocs.tsx";
import { Clues } from "./Clues.tsx";
import { EvidenceChain } from "./Evidence.tsx";
import { LeadBoard } from "./LeadBoard.tsx";
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

function CasePanel({ onShowMap }: { onShowMap(): void }) {
  const { env, state, stage, restart, dispatch, notice } = useWorkspace();
  const [confirming, setConfirming] = useState(false);
  const [passing, setPassing] = useState(false);
  const here = state.dispatches.filter((d) => d.stageId === state.stageId);
  const before = state.dispatches.filter((d) => d.stageId !== state.stageId);
  // The dispatch that brought the player to this stage, such as an arrival,
  // is read first, beside the briefing it leads into. The older paperwork
  // waits, closed, below this stage's own dispatches (SDD 8.2).
  const opening = before.at(-1);
  const earlier = before.slice(0, -1);
  // A dispatch is headed with the lead as the player knows it, by its name.
  const leadName = (stageId: string, leadId: string) => {
    const at = env.mission.stages[stageId];
    const type = at ? bindingTypes(at)[leadBinding(at)] : undefined;
    return type ? labelOf(refOf(type, leadId), state.ledger) : leadId;
  };
  const item = (dispatch: Dispatch) => (
    <li
      key={dispatch.n}
      className={
        notice?.kind === "dispatch" && notice.dispatch.n === dispatch.n
          ? "dispatch dispatch--new"
          : "dispatch"
      }
    >
      <span className="label">
        {words(dispatch.kind.replace("-", " "))}
        {dispatch.leadId
          ? ` · ${leadName(dispatch.stageId, dispatch.leadId)}`
          : ""}
        {dispatch.cost > 0 ? ` · ${hours(dispatch.cost)}` : ""}
      </span>
      <Prose text={dispatch.text} />
      <EvidenceChain dispatch={dispatch} />
    </li>
  );
  return (
    <div className="tool">
      <h3>Objective</h3>
      <p>{stage.objective}</p>
      {opening && (
        <>
          <h3>{opening.kind === "travel" ? "Arrival" : "Last dispatch"}</h3>
          <ol className="dispatches-opening" data-testid="opening-dispatch">
            {item(opening)}
          </ol>
        </>
      )}
      <h3>Briefing</h3>
      <Prose text={stage.briefing} />
      <h3>Clues</h3>
      <Clues stage={stage} />
      <LeadBoard onShowMap={onShowMap} />
      {(here.length > 0 || earlier.length > 0) && (
        <div className="dispatches">
          {here.length > 0 && (
            <>
              <h3>Dispatches at this stage</h3>
              <ol className="dispatches__list">{here.map(item)}</ol>
            </>
          )}
          {earlier.length > 0 && (
            <details className="dispatches__earlier">
              <summary>Earlier dispatches ({earlier.length})</summary>
              <ol className="dispatches__list">{earlier.map(item)}</ol>
            </details>
          )}
        </div>
      )}
      <h3>Case file</h3>
      <p>
        {env.mission.title} · clearance {env.mission.clearance}
        {env.mission.clock && ` · budget ${hours(state.budget)}`}
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
      {env.mission.clock &&
        state.clock === "active" &&
        (passing ? (
          <p className="note note--warn">
            {env.mission.clock.onExpiry === "continue"
              ? "The deadline event will happen now. You keep your evidence and drafts and carry on untimed."
              : "The deadline event will happen now and this attempt will end."}{" "}
            <button
              type="button"
              className="button button--small button--danger"
              onClick={() => {
                setPassing(false);
                dispatch({ type: "let-deadline-pass" });
              }}
            >
              Let the deadline pass
            </button>{" "}
            <button
              type="button"
              className="button button--small"
              onClick={() => setPassing(false)}
            >
              Keep the clock
            </button>
          </p>
        ) : (
          <button
            type="button"
            className="button button--small"
            onClick={() => setPassing(true)}
          >
            Let the deadline pass…
          </button>
        ))}
    </div>
  );
}

function DocsPanel() {
  const { env } = useWorkspace();
  return <SchemaDocs clearance={env.clearance} />;
}

const HINT_STEPS = [
  ["nudge", "restates what you are looking for"],
  ["concept", "says which GraphQL idea is involved"],
  ["schema", "lists the fields to look at, each written as Type.field"],
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
          : state.clock === "none"
            ? "This case has no clock, so help costs nothing. Each hint says more than the one before it."
            : "The deadline has passed, so help is free."}{" "}
        {state.clock !== "none" &&
          "The documentation and glossary are always free."}
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
          Take hint {step + 1} of 4
          {state.clock !== "none" &&
            ` (${timed ? hours(hintCost(state)) : "free"})`}
        </button>
      )}
      <h3>Solution</h3>
      {stageState.solutionRevealed ? (
        <>
          <p>
            {referenceSteps(stage).length === 0
              ? "This stage needs no new query. The facts it asks for are in the responses you already have."
              : "The stage's reference solution:"}
          </p>
          {referenceSteps(stage).map((step, index) =>
            step.kind === "keep-watch" ? (
              <p key={index} data-testid="reference-solution">
                Keep watch until the next event ({hours(step.hours)}).
              </p>
            ) : (
              <div key={index}>
                {step.operationName !== undefined && (
                  <p>Transmit the operation {step.operationName}:</p>
                )}
                <pre className="hint__code" data-testid="reference-solution">
                  {step.operation.trim()}
                </pre>
                {step.variables && (
                  <pre className="hint__code">
                    {JSON.stringify(step.variables, null, 2)}
                  </pre>
                )}
              </div>
            ),
          )}
        </>
      ) : (
        <button
          type="button"
          className="button"
          onClick={() => dispatch({ type: "reveal" })}
        >
          View the solution
          {state.clock !== "none" &&
            ` (${revealCost(state) > 0 ? hours(revealCost(state)) : "free"})`}
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
  const { env, state } = useWorkspace();
  // While the stage asks which operative is the quarry, the tab does not say.
  const quarry = quarryShown(env.mission, state.stageId)
    ? quarryRef(env.mission)
    : undefined;
  // The briefing gives the quarry's codename, or an officer's name, so the
  // heading may.
  const [quarryType, quarryId = ""] = quarry?.split(":") ?? [];
  const quarryName =
    quarryType === "Officer"
      ? String(env.store.get("Officer", quarryId)?.name ?? quarryId)
      : env.mission.quarry;
  const operatives = new Map<string, typeof entries>();
  const entries = Object.values(state.ledger);
  for (const entry of entries) {
    if (
      !entry.fact.entity.startsWith("Operative:") &&
      entry.fact.entity !== quarry
    ) {
      continue;
    }
    const list = operatives.get(entry.fact.entity) ?? [];
    list.push(entry);
    operatives.set(entry.fact.entity, list);
  }
  return (
    <div className="tool">
      <p className="tool__lede">
        A dossier shows only what your queries have retrieved.
      </p>
      {quarry && !operatives.has(quarry) && (
        <article className="dossier dossier--quarry" data-testid="quarry">
          <p className="label">The quarry</p>
          <h3>{quarryName}</h3>
          <p className="draft__none">
            Nothing about the quarry has appeared in your results yet.
          </p>
        </article>
      )}
      {operatives.size === 0 && !quarry && (
        <p className="draft__none">
          No operative has appeared in your results yet.
        </p>
      )}
      {[...operatives.entries()]
        .sort(([a], [b]) => Number(b === quarry) - Number(a === quarry))
        .map(([entity, facts]) => (
          <article
            key={entity}
            className={
              entity === quarry ? "dossier dossier--quarry" : "dossier"
            }
            {...(entity === quarry ? { "data-testid": "quarry" } : {})}
          >
            {entity === quarry && <p className="label">The quarry</p>}
            <h3>
              {entity === quarry ? quarryName : labelOf(entity, state.ledger)}
            </h3>
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
  const { state } = useWorkspace();
  // A new stage opens on its own briefing and clues.
  useEffect(() => {
    setTab("case");
  }, [state.stageId]);
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
        {tab === "case" && <CasePanel onShowMap={() => setTab("map")} />}
        {/* Kept mounted so the sections a player opened stay open. */}
        <div hidden={tab !== "docs"}>
          <DocsPanel />
        </div>
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
