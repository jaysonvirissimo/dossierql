import { useGame } from "../app/GameProvider.tsx";
import { referenceOperations } from "../content/types.ts";
import { availability } from "../engine/clearance.ts";
import { readTechnique } from "../engine/debrief.ts";
import { ConceptCardView } from "../features/ConceptCardView.tsx";
import { Prose } from "../features/Prose.tsx";
import { href } from "./parseRoute.ts";

const MODE_TEXT = {
  independent: "independently, with no hints",
  hinted: "with hints",
  "solution-revealed": "with the solution revealed",
} as const;

function plural(n: number, word: string): string {
  return n === 1 ? `1 ${word}` : `${String(n)} ${word}s`;
}

export function DebriefRoute({ missionId }: { missionId: string }) {
  const { course, save, standing, commit } = useGame();
  const mission = course.missions.find((m) => m.id === missionId);
  const state = save.investigations[missionId]?.state;

  if (!mission || !state || state.status !== "complete" || !state.outcome) {
    return (
      <main className="page">
        <article className="paper sheet">
          <div className="sheet__body">
            <h1>No debrief on file</h1>
            <p>A debrief is written when a case is resolved.</p>
            <a
              className="button"
              href={
                mission
                  ? href({ name: "mission", missionId })
                  : href({ name: "home" })
              }
            >
              {mission ? "Open the case" : "Back to assignments"}
            </a>
          </div>
        </article>
      </main>
    );
  }

  const { late, mode } = state.outcome;
  const completion = standing.completions[mission.id];
  const stages = Object.entries(mission.stages);
  const reference = stages.flatMap(([, stage]) => referenceOperations(stage));
  const card = mission.teaches
    ? course.concepts.find((c) => c.id === mission.teaches)
    : undefined;
  // The next case that practises what this one taught, with new data.
  const index = course.missions.indexOf(mission);
  const followUp = course.missions
    .slice(index + 1)
    .find(
      (m) =>
        (mission.teaches ? m.practises.includes(mission.teaches) : true) &&
        availability(m, standing) === "available" &&
        !standing.completions[m.id],
    );
  // What the transmissions behind the cited facts show of the level's
  // technique (SDD 3.10). This never changes the outcome or the promotion.
  const reading = readTechnique(mission, state, course);
  const promoted = mission.kind === "assessment" && completion?.passed === true;
  const techniqueNote =
    reading && !reading.used
      ? promoted && completion.placement
        ? reading.kata.debrief.placement
        : reading.kata.debrief.unused
      : null;
  const kata =
    reading && standing.clearance >= reading.kata.clearance
      ? reading.kata
      : null;
  const kataCard = kata
    ? course.concepts.find((c) => c.id === kata.concept)
    : undefined;

  return (
    <main className="page">
      <article className="paper sheet debrief" aria-labelledby="debrief-title">
        <div
          className={`motif motif--${mission.motif ?? "plain"}`}
          aria-hidden="true"
        />
        <div className="sheet__body">
          <p className="label">Debrief · {mission.title}</p>
          <div className="debrief__head">
            <h1 id="debrief-title">
              {late ? "Resolved after the deadline" : "Case resolved"}
            </h1>
            <p className="stamp" data-testid="stamp">
              {late
                ? (mission.debrief.stampLate ?? mission.debrief.stampOnTime)
                : mission.debrief.stampOnTime}
            </p>
          </div>

          <section aria-labelledby="outcome-title">
            <h2 id="outcome-title">Outcome</h2>
            <Prose
              text={
                late
                  ? (mission.debrief.afterDeadline ?? mission.debrief.onTime)
                  : mission.debrief.onTime
              }
            />
            <p>
              You resolved the case {MODE_TEXT[mode]}
              {late
                ? ", after the deadline had passed."
                : state.clock === "none"
                  ? "."
                  : `, with ${plural(state.hoursLeft, "hour")} to spare.`}
            </p>
            {promoted && (
              <p className="note">
                {completion.placement
                  ? `Placement passed. You now hold clearance ${String(standing.clearance)}, with the concept cards for the levels you skipped.`
                  : `Assessment passed. You now hold clearance ${String(standing.clearance)}.`}
                {!course.missions.some(
                  (m) => m.clearance >= standing.clearance,
                ) &&
                  " No cases are filed above this level yet. Any case you have not played is still open on the assignments desk."}
              </p>
            )}
            {mission.kind === "assessment" &&
              completion &&
              !completion.passed && (
                <p className="note note--warn">
                  This was a placement attempt and its solution has been viewed,
                  so it does not promote you. Playing the level's teaching case
                  first makes any completion count.
                </p>
              )}
          </section>

          <section aria-labelledby="compare-title">
            <h2 id="compare-title">Your transmissions and the reference</h2>
            <p>
              You sent {plural(state.transmissions.length, "transmission")}. The
              reference solution sends{" "}
              {plural(reference.length, "transmission")}.
            </p>
            <Prose text={mission.debrief.comparison} />
            {techniqueNote && (
              <div className="note" data-testid="technique-note">
                <Prose text={techniqueNote} />
              </div>
            )}
            {kata && kataCard && (
              <p data-testid="kata-link">
                To practise {kataCard.title.toLowerCase()} on records that no
                case uses, try the kata{" "}
                <a href={href({ name: "kata", kataId: kata.id })}>
                  {kata.title}
                </a>{" "}
                in the training range.
                {standing.katas.includes(kata.id) && " You have passed it."}
              </p>
            )}
            <div className="compare">
              <div>
                <h3>Yours</h3>
                <ol className="compare__list">
                  {state.transmissions.map((t) => (
                    <li key={t.n}>
                      <pre className="code">
                        {(t.operation.trim().includes("\n")
                          ? t.operation
                          : (t.formatted ?? t.operation)
                        ).trim()}
                      </pre>
                      {t.variables.trim() && (
                        <pre className="code">{t.variables.trim()}</pre>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3>Reference</h3>
                <ol className="compare__list">
                  {reference.map(({ operation, variables }, i) => (
                    <li key={i}>
                      <pre className="code">{operation.trim()}</pre>
                      {variables && (
                        <pre className="code">
                          {JSON.stringify(variables, null, 1).replace(
                            /\s+/g,
                            " ",
                          )}
                        </pre>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <p className="debrief__aside">
              Any query that returns the evidence is a correct one. The
              reference solution is one economical way, not the only way. If you
              typed a request on one line, it is laid out here over several
              lines so that it is easier to read. The word <code>query</code> at
              the start of a request is optional.
            </p>
          </section>

          <section aria-labelledby="geo-title">
            <h2 id="geo-title">The geography</h2>
            <Prose text={mission.debrief.geography} />
          </section>

          {card && (
            <section aria-labelledby="card-title">
              <h2 id="card-title">Added to your tradecraft manual</h2>
              <ConceptCardView card={card} />
            </section>
          )}

          <p className="debrief__next">
            {followUp && (
              <a
                className="button button--primary"
                href={href({ name: "mission", missionId: followUp.id })}
              >
                Next case: {followUp.title}
              </a>
            )}
            <a className="button" href={href({ name: "home" })}>
              Back to assignments
            </a>
            <button
              type="button"
              className="button"
              onClick={() => {
                commit(mission.id, null);
                window.location.hash = href({
                  name: "mission",
                  missionId: mission.id,
                });
              }}
            >
              Investigate again
            </button>
          </p>
        </div>
      </article>
    </main>
  );
}
