import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "../../app/GameProvider.tsx";
import { archiveStore, archiveWorld } from "../../content/archive.ts";
import type { Mission } from "../../content/types.ts";
import {
  availability,
  clearanceInForce,
  isPlacement,
} from "../../engine/clearance.ts";
import { COSTS } from "../../engine/clock.ts";
import {
  act,
  deskStages,
  stageOf,
  startMission,
  type Action,
  type Env,
  type Notice,
  type Outcome,
} from "../../engine/mission.ts";
import { schemaFor } from "../../graphql/schema.ts";
import { href } from "../../routes/parseRoute.ts";
import { Prose } from "../Prose.tsx";
import { Clues } from "./Clues.tsx";
import { WorkspaceContext, type WorkspaceValue } from "./context.ts";
import { hours } from "./describe.ts";
import { DraftPanel } from "./DraftPanel.tsx";
import { Editor } from "./Editor.tsx";
import { Results } from "./Results.tsx";
import { Tools } from "./Tools.tsx";
import { VimSwitch } from "./VimSwitch.tsx";
import "./workspace.css";

const EDIT_DELAY_MS = 400;

const KIND_LABEL = {
  teaching: "teaching case",
  assessment: "assessment",
  coda: "coda",
} as const;

function clockLine(
  clock: NonNullable<Mission["clock"]>,
  hoursLeft: number,
): string {
  return clock.countdown.replace("{remaining}", hours(hoursLeft));
}

export default function Workspace({ mission }: { mission: Mission }) {
  const game = useGame();
  const { standing, course, commit } = game;
  const clearance = clearanceInForce(mission, standing);
  const env = useMemo<Env>(
    () => ({ mission, store: archiveStore, world: archiveWorld, clearance }),
    [mission, clearance],
  );
  const saved = game.save.investigations[mission.id]?.state;
  const fresh = useMemo(() => startMission(env), [env]);
  const state = saved ?? fresh;
  const stage = stageOf(mission, state.stageId);
  const stageState = state.stages[state.stageId]!;

  const [notice, setNotice] = useState<Notice | null>(null);
  const [viewing, setViewing] = useState(() =>
    // A new location opens on a clean results panel; earlier responses are
    // kept. Stages in one country share the panel.
    deskStages(mission, state.stageId).includes(
      state.transmissions.at(-1)?.stageId ?? "",
    )
      ? state.transmissions.length
      : 0,
  );
  const [attempt, setAttempt] = useState(0);

  // The state the next action applies to. Kept in a ref so that two actions
  // in one tick, such as a flushed edit and a transmission, do not race.
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  });

  const dispatch = useCallback(
    (action: Action): Outcome => {
      const before = latest.current.stageId;
      const outcome = act(env, latest.current, action);
      if (
        outcome.state.stageId !== before &&
        !deskStages(mission, outcome.state.stageId).includes(before)
      ) {
        setViewing(0);
      }
      latest.current = outcome.state;
      commit(mission.id, outcome.state, outcome.events);
      if (action.type !== "edit") {
        setNotice(outcome.notice ?? null);
        if (action.type === "transmit") {
          setViewing(outcome.state.transmissions.length);
        }
      }
      return outcome;
    },
    [env, commit, mission],
  );

  // Typing is held briefly so each keystroke does not rewrite the save.
  const draftText = useRef<{ editor?: string; variables?: string }>({});
  const timer = useRef<number | undefined>(undefined);
  const flush = useCallback(() => {
    window.clearTimeout(timer.current);
    const edit = draftText.current;
    if (edit.editor !== undefined || edit.variables !== undefined) {
      draftText.current = {};
      dispatch({ type: "edit", ...edit });
    }
  }, [dispatch]);
  const edit = useCallback(
    (change: { editor?: string; variables?: string }) => {
      draftText.current = { ...draftText.current, ...change };
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, EDIT_DELAY_MS);
    },
    [flush],
  );
  useEffect(() => flush, [flush]);

  const transmit = useCallback(() => {
    flush();
    dispatch({ type: "transmit" });
  }, [flush, dispatch]);

  const restart = useCallback(() => {
    window.clearTimeout(timer.current);
    draftText.current = {};
    const again = startMission(env);
    latest.current = again;
    commit(mission.id, again);
    setNotice(null);
    setViewing(0);
    setAttempt((n) => n + 1);
  }, [env, commit, mission.id]);

  useEffect(() => {
    if (state.status === "complete") {
      window.location.hash = href({ name: "debrief", missionId: mission.id });
    }
  }, [state.status, mission.id]);

  const value: WorkspaceValue = {
    env,
    state,
    stage,
    stageState,
    dispatch,
    notice,
    clearNotice: () => setNotice(null),
    viewing,
    view: setViewing,
    restart,
  };

  if (availability(mission, course.missions, standing) === "locked") {
    return (
      <main className="page">
        <article className="paper sheet">
          <h1>{mission.title}</h1>
          <p>
            This case needs clearance {mission.clearance}. You hold clearance{" "}
            {standing.clearance}. Pass the assessment that ends level{" "}
            {mission.clearance - 1} to open it.
          </p>
          <a className="button" href={href({ name: "home" })}>
            Back to assignments
          </a>
        </article>
      </main>
    );
  }

  if (state.status === "briefing") {
    const placement = isPlacement(mission, course.missions, standing);
    return (
      <main className="page">
        <article
          className="paper sheet briefing"
          aria-labelledby="briefing-title"
        >
          <div
            className={`motif motif--${mission.motif ?? "plain"}`}
            aria-hidden="true"
          />
          <div className="sheet__body">
            <p className="label">
              Classified briefing · clearance {mission.clearance} ·{" "}
              {KIND_LABEL[mission.kind]}
            </p>
            <h1 id="briefing-title">{mission.title}</h1>
            <Prose text={stage.briefing} className="briefing__text" />
            <h2>Objective</h2>
            <p>{stage.objective}</p>
            <h2>Initial intelligence</h2>
            <Clues stage={stage} />
            {mission.clock && (
              <>
                <h2>The clock</h2>
                <p>
                  {clockLine(mission.clock, state.budget)}. Each transmission
                  costs {hours(COSTS.transmission)}, however much it asks for.
                  Travel and hints cost more, and every cost is shown before you
                  commit. Reading, drafting and thinking are free, and nothing
                  is timed against a real clock.
                </p>
                {mission.clock.onExpiry === "continue" ? (
                  <p>
                    If the deadline passes on this case you may carry on
                    untimed, with everything you have gathered.
                  </p>
                ) : (
                  <p>
                    If the deadline passes, the attempt ends. You can then
                    restart the case from the beginning.
                  </p>
                )}
              </>
            )}
            {mission.id === course.missions[0]?.id &&
              standing.drills.length < course.drills.length && (
                <p className="note">
                  First time at the terminal? The{" "}
                  <a href={href({ name: "training" })}>training range</a> shows
                  how to write a request, in about six minutes.
                </p>
              )}
            {placement && (
              <p className="note">
                You are attempting this assessment as a placement, without
                having played the cases that lead to it. Completing it without
                viewing its solution promotes you past this level.
              </p>
            )}
            {clearance > standing.clearance && (
              <p className="note">
                The terminal will use the archive as seen at clearance{" "}
                {clearance} for this case.
              </p>
            )}
            <p className="briefing__go">
              <button
                type="button"
                className="button button--primary"
                onClick={() => dispatch({ type: "begin" })}
              >
                Open the terminal
              </button>{" "}
              <a className="button button--quiet" href={href({ name: "home" })}>
                Back to assignments
              </a>
            </p>
          </div>
        </article>
      </main>
    );
  }

  const timed = state.clock === "active";
  const location =
    archiveWorld.countries.find((c) => c.code === stage.location)?.name ??
    stage.location;
  const showVariables = clearance >= 5 || stageState.variables.trim() !== "";

  return (
    <WorkspaceContext.Provider value={value}>
      <main className="workspace">
        <header className="casebar" aria-label="Case status">
          <div className="casebar__title">
            <p className="label casebar__label">
              {mission.title} · {location}
            </p>
            <p className="casebar__objective">
              <span className="visually-hidden">Objective: </span>
              {stage.objective}
            </p>
          </div>
          {mission.clock && (
            <div
              className="casebar__clock"
              role="status"
              aria-label="Mission clock"
            >
              {timed ? (
                <>
                  <p className="casebar__deadline">
                    {clockLine(mission.clock, state.hoursLeft)}
                  </p>
                  <p className="casebar__budget">
                    {state.hoursLeft} of {hours(state.budget)} left
                  </p>
                </>
              ) : (
                <>
                  <p className="casebar__deadline">{mission.clock.expired}</p>
                  <p className="casebar__budget">
                    {state.clock === "continuing"
                      ? "Continuing untimed. Nothing costs time now."
                      : "This attempt is closed."}
                  </p>
                </>
              )}
            </div>
          )}
        </header>

        {mission.clock && state.clock === "ended" && (
          <div className="note note--bad workspace__ended" role="alert">
            <p>
              {mission.clock.expired}. The deadline has passed and this attempt
              is closed. The solution to this stage is now free to view under
              Hints, and the investigation can be restarted.
            </p>
            <button
              type="button"
              className="button button--small"
              onClick={restart}
            >
              Restart the investigation
            </button>
          </div>
        )}

        <div className="workspace__grid">
          <section className="terminal" aria-labelledby="terminal-title">
            <header className="terminal__head">
              <h2 id="terminal-title">Intelligence terminal</h2>
              <div className="terminal__tools">
                <VimSwitch />
                <span className="terminal__level">Clearance {clearance}</span>
              </div>
            </header>
            {stage.scaffold.level === "none" && !stage.scaffold.carryOver && (
              <p className="terminal__blank">
                The editor is blank, so you write the whole query. The
                Documentation tab lists what the archive holds, and reading the
                documentation costs no time.
              </p>
            )}
            <div className="terminal__editor">
              <Editor
                key={`${state.stageId}:${String(attempt)}`}
                initial={stageState.editor}
                schema={schemaFor(clearance)}
                label="GraphQL query"
                vim={game.preferences.vim}
                onChange={(editor) => edit({ editor })}
                onTransmit={transmit}
              />
            </div>
            {showVariables && (
              <div className="terminal__variables">
                <p aria-hidden="true">Variables (JSON)</p>
                <Editor
                  key={`${state.stageId}:${String(attempt)}`}
                  initial={stageState.variables}
                  label="Variables (JSON)"
                  vim={game.preferences.vim}
                  compact
                  testId="variables-editor"
                  onChange={(variables) => edit({ variables })}
                  onTransmit={transmit}
                />
              </div>
            )}
            <footer className="terminal__foot">
              <button
                type="button"
                className="button button--primary"
                data-testid="transmit"
                disabled={state.clock === "ended"}
                onClick={transmit}
              >
                {state.clock === "none"
                  ? "Transmit"
                  : `Transmit (${timed ? hours(COSTS.transmission) : "free"})`}
              </button>
              <span className="terminal__key">
                or press Ctrl+Enter (⌘+Enter) in the editor.
                {state.clock !== "none" &&
                  " A request the clerk cannot read is returned at no cost."}
              </span>
            </footer>
          </section>

          <Results />
          {/* A new stage opens on its own briefing and clues. */}
          <Tools />
          <DraftPanel />
        </div>
      </main>
    </WorkspaceContext.Provider>
  );
}
