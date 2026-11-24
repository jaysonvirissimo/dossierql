import { useGame } from "../app/GameProvider.tsx";
import type { MissionSummary } from "../content/types.ts";
import { availability, isPlacement, nextCase } from "../engine/clearance.ts";
import { href } from "./parseRoute.ts";

const MODE_TEXT = {
  independent: "Completed independently",
  hinted: "Completed with hints",
  "solution-revealed": "Completed with the solution revealed",
} as const;

const KIND_LABEL = {
  teaching: "Teaching case",
  assessment: "Assessment",
  coda: "Coda",
} as const;

function conceptTitle(
  mission: MissionSummary,
  titles: ReadonlyMap<string, string>,
): string | null {
  if (mission.kind === "coda") return null;
  if (mission.teaches)
    return `Teaches: ${titles.get(mission.teaches) ?? mission.teaches}`;
  return `Assessment: ${mission.practises
    .map((c) => (titles.get(c) ?? c).toLowerCase())
    .join(", ")}`;
}

/** Whether an investigation has been started and not finished. */
function underway(state: { status: string } | undefined): boolean {
  return (
    state !== undefined &&
    state.status !== "complete" &&
    state.status !== "briefing"
  );
}

function CaseCard({
  mission,
  next,
  titles,
}: {
  mission: MissionSummary;
  /** Whether this is the next case in the story, which the desk emphasizes. */
  next: boolean;
  titles: ReadonlyMap<string, string>;
}) {
  const { course, standing, save } = useGame();
  const completion = standing.completions[mission.id];
  const locked = availability(mission, course.missions, standing) === "locked";
  // The assessment that opens a locked case.
  const gate = course.missions.find(
    (m) => m.kind === "assessment" && m.clearance === mission.clearance - 1,
  );
  const investigation = save.investigations[mission.id]?.state;
  const inProgress = underway(investigation);
  const placement =
    !completion && isPlacement(mission, course.missions, standing);
  const concept = conceptTitle(mission, titles);
  return (
    <li
      className={next ? "case paper case--next" : "case paper"}
      data-locked={locked}
    >
      <div
        className={`motif motif--${mission.motif ?? "plain"}`}
        aria-hidden="true"
      />
      <div className="case__body">
        <p className="label">
          Clearance {mission.clearance} · {KIND_LABEL[mission.kind]}
        </p>
        <h3 className="case__title">{mission.title}</h3>
        {concept && <p className="case__concept">{concept}</p>}
        <p>{mission.summary}</p>
        <ul className="case__status">
          {next && <li className="chip chip--next">Next in the story</li>}
          {locked && (
            <li className="chip chip--open">
              Locked: needs clearance {mission.clearance}
            </li>
          )}
          {placement && !locked && (
            <li className="chip chip--info">
              {standing.clearance > mission.clearance
                ? "Optional: you already hold a higher clearance"
                : "Placement: attempt it to skip ahead"}
            </li>
          )}
          {inProgress && <li className="chip chip--info">In progress</li>}
          {completion && (
            <li className="chip chip--ok">{MODE_TEXT[completion.mode]}</li>
          )}
          {completion?.late && (
            <li className="chip chip--open">Resolved after the deadline</li>
          )}
          {completion &&
            mission.kind === "assessment" &&
            !completion.passed && (
              <li className="chip chip--bad">
                Placement not passed: the solution was viewed
              </li>
            )}
        </ul>
        {locked ? (
          <p className="case__locked">
            Pass the level {mission.clearance - 1} assessment
            {gate ? `, ${gate.title},` : ""} to open this case.
          </p>
        ) : (
          <p className="case__go">
            <a
              className={next ? "button button--primary" : "button"}
              href={href({ name: "mission", missionId: mission.id })}
            >
              {inProgress
                ? "Resume"
                : !completion && placement
                  ? "Attempt placement"
                  : "Open case"}
              <span className="visually-hidden">: {mission.title}</span>
            </a>
            {completion && investigation?.status === "complete" && (
              <a
                className="button"
                href={href({ name: "debrief", missionId: mission.id })}
              >
                Read debrief
                <span className="visually-hidden">: {mission.title}</span>
              </a>
            )}
          </p>
        )}
      </div>
    </li>
  );
}

export function HomeRoute() {
  const { course, standing, save } = useGame();
  const titles = new Map(course.concepts.map((c) => [c.id, c.title]));
  // A coda is not counted among the cases (SDD 5.4).
  const counted = course.missions.filter((m) => m.kind !== "coda");
  const done = counted.filter((m) => standing.completions[m.id]).length;
  const levels = [...new Set(course.missions.map((m) => m.clearance))];
  const next = nextCase(course.missions, standing);
  const placements = course.missions.filter(
    (m) =>
      !standing.completions[m.id] &&
      availability(m, course.missions, standing) === "available" &&
      isPlacement(m, course.missions, standing) &&
      !underway(save.investigations[m.id]?.state),
  );
  // The desk is headed by the campaign of the next case in the story.
  const campaign =
    course.campaigns.find((c) => c.id === next?.campaign) ??
    course.campaigns[0];
  const campaignTitles = new Map(course.campaigns.map((c) => [c.id, c.title]));
  let shownCampaign: string | undefined;
  const drills = course.drills.length;
  const trained = course.drills.filter((d) =>
    standing.drills.includes(d.id),
  ).length;
  const katasOpen = course.katas.filter(
    (k) => standing.clearance >= k.clearance,
  );
  const katasPassed = katasOpen.filter((k) =>
    standing.katas.includes(k.id),
  ).length;

  return (
    <main className="page">
      <header className="page__head">
        <p className="label page__eyebrow">Assignments desk</p>
        <h1>{campaign?.title ?? "Assignments"}</h1>
        <p className="page__lede">{campaign?.summary}</p>
        <p className="page__lede">
          You hold clearance {standing.clearance}. {done} of {counted.length}{" "}
          cases resolved.
        </p>
      </header>

      <section className="level" aria-labelledby="induction-title">
        <h2 id="induction-title" className="level__title">
          Induction
        </h2>
        <article className="induction paper">
          <div className="motif motif--plain" aria-hidden="true" />
          <div className="case__body">
            <p className="label">First day · optional · about six minutes</p>
            <h3 className="case__title">The Training Range</h3>
            <p className="case__concept">
              Teaches: how to write a request, one skill at a time
            </p>
            <p>
              The records clerk likes to see that a new analyst can work the
              terminal before handing over a case file. Nothing is timed.
            </p>
            <ul className="case__status">
              {trained === drills ? (
                <li className="chip chip--ok">Passed</li>
              ) : (
                trained > 0 && (
                  <li className="chip chip--info">
                    {trained} of {drills} drills passed
                  </li>
                )
              )}
              {katasOpen.length > 0 && (
                <li className="chip chip--info" data-testid="katas-chip">
                  {katasPassed} of {katasOpen.length}{" "}
                  {katasOpen.length === 1 ? "kata" : "katas"} passed
                </li>
              )}
            </ul>
            <p className="case__go">
              <a
                className={
                  trained === drills ? "button" : "button button--primary"
                }
                href={href({ name: "training" })}
              >
                {trained === 0
                  ? "Start training"
                  : trained === drills
                    ? "Repeat training"
                    : "Continue training"}
              </a>
            </p>
          </div>
        </article>
      </section>

      {levels.map((level) => {
        const cases = course.missions.filter(
          (m) =>
            m.clearance === level &&
            !placements.includes(m) &&
            availability(m, course.missions, standing) !== "hidden",
        );
        if (cases.length === 0) return null;
        const first = cases[0]?.campaign;
        const opens = shownCampaign !== undefined && first !== shownCampaign;
        shownCampaign = first;
        return (
          <section
            key={level}
            className="level"
            aria-labelledby={`level-${String(level)}`}
          >
            {opens && first !== undefined && (
              <p className="label" data-testid="campaign-opens">
                {campaignTitles.get(first)}
              </p>
            )}
            <h2 id={`level-${String(level)}`} className="level__title">
              Clearance {level}
            </h2>
            <ul className="cases">
              {cases.map((mission) => (
                <CaseCard
                  key={mission.id}
                  mission={mission}
                  next={mission === next}
                  titles={titles}
                />
              ))}
            </ul>
          </section>
        );
      })}

      {placements.length > 0 && (
        <section className="level" aria-labelledby="placements-title">
          <h2 id="placements-title" className="level__title">
            Skip ahead
          </h2>
          <details className="placements paper">
            <summary className="placements__summary">
              Placement: {placements.length}{" "}
              {placements.length === 1 ? "assessment" : "assessments"} you can
              attempt now to skip ahead
            </summary>
            <div className="placements__body">
              <p>
                An assessment that you attempt before its level&apos;s teaching
                case is a placement. If you solve it without viewing the
                solution, you are promoted past that level, and every case you
                skipped stays open to you.
              </p>
              <ul className="cases">
                {placements.map((mission) => (
                  <CaseCard
                    key={mission.id}
                    mission={mission}
                    next={false}
                    titles={titles}
                  />
                ))}
              </ul>
            </div>
          </details>
        </section>
      )}
    </main>
  );
}
