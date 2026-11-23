import { useState } from "react";
import { useGame } from "../../app/GameProvider.tsx";
import { archiveStore } from "../../content/archive.ts";
import type { Drill, Kata } from "../../content/types.ts";
import { attemptKata } from "../../engine/kata.ts";
import { declaresVariables } from "../../engine/technique.ts";
import { matchSet } from "../../engine/match.ts";
import { resultErrors, VARIABLES_REFUSED } from "../../engine/mission.ts";
import { transmit } from "../../graphql/execute.ts";
import { href } from "../../routes/parseRoute.ts";
import { Exercise, type Outcome } from "./Exercise.tsx";

/** Drills are played with the archive as a new analyst sees it. */
const CLEARANCE = 1;

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
  const firstCase = course.missions[0];

  const attempt = (operation: string): Outcome => {
    const sent = transmit(archiveStore, { operation, clearance: CLEARANCE });
    // Any request that returns the facts passes. The text is never judged.
    const passed =
      sent.transmitted &&
      matchSet(
        drill.expects,
        sent.facts.map((occurrence) => occurrence.fact),
      ) !== null;
    return {
      kind: "sent",
      transmitted: sent.transmitted,
      data: sent.result.data ?? null,
      errors: resultErrors(sent.result.errors),
      verdict: passed ? "passed" : "facts",
      variables: "",
    };
  };

  return (
    <Exercise
      title={drill.title}
      task={drill.task}
      starter={drill.starter}
      clearance={CLEARANCE}
      level="Practice · nothing is timed"
      attempt={attempt}
      onPass={() => {
        if (!standing.drills.includes(drill.id)) {
          record([{ type: "drill-passed", drillId: drill.id }]);
        }
      }}
      nudge={drill.nudge}
      payoff={drill.payoff}
      next={
        last ? (
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
        )
      }
    />
  );
}

function KataView({ kata }: { kata: Kata }) {
  const { standing, record } = useGame();

  const attempt = (operation: string, variables: string): Outcome => {
    const tried = attemptKata(archiveStore, kata, operation, variables);
    if (tried.kind === "refused-variables") {
      return { kind: "refused", text: VARIABLES_REFUSED };
    }
    return {
      kind: "sent",
      transmitted: tried.sent.transmitted,
      data: tried.sent.result.data ?? null,
      errors: resultErrors(tried.sent.result.errors),
      verdict: tried.verdict,
      // A request that declares no variable did not use the panel.
      variables: declaresVariables(operation) ? variables : "",
    };
  };

  return (
    <Exercise
      title={kata.title}
      task={kata.task}
      starter={kata.starter}
      variables={kata.variables}
      clearance={kata.clearance}
      level={`Kata · clearance ${String(kata.clearance)} · nothing is timed`}
      attempt={attempt}
      onPass={() => {
        if (!standing.katas.includes(kata.id)) {
          record([{ type: "kata-passed", kataId: kata.id }]);
        }
      }}
      nudge={kata.nudge}
      structureNudge={kata.structureNudge}
      payoff={kata.payoff}
      next={
        <p className="drill__next">
          <a className="button" href={href({ name: "training" })}>
            Back to the training range
          </a>
        </p>
      }
    />
  );
}

/** The katas, each opening at the clearance of its concept (SDD 3.11). */
function KataList({ current }: { current?: string }) {
  const { course, standing } = useGame();
  return (
    <ol className="drill__list kata__list" aria-label="Katas">
      {course.katas.map((kata) => {
        const open = standing.clearance >= kata.clearance;
        return (
          <li key={kata.id}>
            {open ? (
              <a
                className="kata__pick"
                href={href({ name: "kata", kataId: kata.id })}
                aria-current={kata.id === current ? "page" : undefined}
              >
                {kata.title}
                {standing.katas.includes(kata.id) && (
                  <span className="chip chip--ok">Passed</span>
                )}
              </a>
            ) : (
              // A locked kata keeps its title, which may use a term the
              // player has not met yet.
              <span className="kata__pick kata__pick--locked">
                Opens at clearance {kata.clearance}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function KataScreen({ kataId }: { kataId: string }) {
  const { course, standing } = useGame();
  const kata = course.katas.find((k) => k.id === kataId);
  const open = kata !== undefined && standing.clearance >= kata.clearance;

  return (
    <main className="page drill">
      <header className="page__head">
        <p className="label page__eyebrow">Training range · kata</p>
        <h1>{open ? kata.title : "Kata"}</h1>
        <p className="page__lede">
          A kata asks you to use one technique on records you have not seen in a
          case. It passes when the response holds the facts and the request uses
          the technique. Nothing is timed or scored.
        </p>
        <KataList current={kataId} />
      </header>
      {kata && open ? (
        <KataView key={kata.id} kata={kata} />
      ) : (
        <article className="paper sheet">
          <div className="sheet__body">
            <p>
              {kata
                ? `This kata opens at clearance ${String(kata.clearance)}. You hold clearance ${String(standing.clearance)}.`
                : `The training range has no kata filed as "${kataId}".`}
            </p>
            <a className="button" href={href({ name: "training" })}>
              Back to the training range
            </a>
          </div>
        </article>
      )}
    </main>
  );
}

/**
 * The training range: one skill at a time, with no clock, no draft and no
 * consequences. It is optional, and offered before the first case. Its
 * katas open as the player's clearance rises.
 */
export default function Training({ kataId }: { kataId?: string }) {
  const { course, standing } = useGame();
  const drills = course.drills;
  const [index, setIndex] = useState(() => {
    const open = drills.findIndex((d) => !standing.drills.includes(d.id));
    return open === -1 ? 0 : open;
  });
  if (kataId !== undefined) return <KataScreen kataId={kataId} />;
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
        <h2 className="kata__title">Katas</h2>
        <p className="page__lede kata__lede">
          A kata asks you to use one technique on records you have not seen in a
          case. Each kata opens when you reach the clearance that teaches its
          technique.
        </p>
        <KataList />
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
