import { useGame } from "../app/GameProvider.tsx";
import type { Mission } from "../content/types.ts";
import { availability, isPlacement } from "../engine/clearance.ts";
import { href } from "./parseRoute.ts";

const MODE_TEXT = {
  independent: "Completed independently",
  hinted: "Completed with hints",
  "solution-revealed": "Completed with the solution revealed",
} as const;

function conceptTitle(
  mission: Mission,
  titles: ReadonlyMap<string, string>,
): string {
  if (mission.teaches)
    return `Teaches: ${titles.get(mission.teaches) ?? mission.teaches}`;
  return `Assessment: ${mission.practises
    .map((c) => (titles.get(c) ?? c).toLowerCase())
    .join(", ")}`;
}

export function HomeRoute() {
  const { course, standing, save, preferences } = useGame();
  const titles = new Map(course.concepts.map((c) => [c.id, c.title]));
  const done = course.missions.filter((m) => standing.completions[m.id]).length;
  const levels = [...new Set(course.missions.map((m) => m.clearance))];
  const campaign = course.campaigns[0];

  return (
    <main className="page">
      <header className="page__head">
        <p className="label page__eyebrow">Assignments desk</p>
        <h1>{campaign?.title ?? "Assignments"}</h1>
        <p className="page__lede">{campaign?.summary}</p>
        <p className="page__lede">
          You hold clearance {standing.clearance}. {done} of{" "}
          {course.missions.length} cases resolved.
        </p>
        {!preferences.orientationSeen && done === 0 && (
          <p className="page__lede">
            New to the terminal?{" "}
            <a href={href({ name: "orientation" })}>
              Read the optional orientation
            </a>{" "}
            first, or open the first case and begin.
          </p>
        )}
      </header>

      {levels.map((level) => (
        <section
          key={level}
          className="level"
          aria-labelledby={`level-${String(level)}`}
        >
          <h2 id={`level-${String(level)}`} className="level__title">
            Clearance {level}
          </h2>
          <ul className="cases">
            {course.missions
              .filter((m) => m.clearance === level)
              .map((mission) => {
                const completion = standing.completions[mission.id];
                const locked = availability(mission, standing) === "locked";
                const investigation = save.investigations[mission.id]?.state;
                const underway =
                  investigation &&
                  investigation.status !== "complete" &&
                  investigation.status !== "briefing";
                const placement =
                  !completion &&
                  isPlacement(mission, course.missions, standing);
                return (
                  <li
                    key={mission.id}
                    className="case paper"
                    data-locked={locked}
                  >
                    <div
                      className={`motif motif--${mission.motif ?? "plain"}`}
                      aria-hidden="true"
                    />
                    <div className="case__body">
                      <p className="label">
                        Clearance {mission.clearance} ·{" "}
                        {mission.kind === "assessment"
                          ? "Assessment"
                          : "Teaching case"}
                      </p>
                      <h3 className="case__title">{mission.title}</h3>
                      <p className="case__concept">
                        {conceptTitle(mission, titles)}
                      </p>
                      <p>{mission.summary}</p>
                      <ul className="case__status">
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
                        {underway && (
                          <li className="chip chip--info">In progress</li>
                        )}
                        {completion && (
                          <li className="chip chip--ok">
                            {MODE_TEXT[completion.mode]}
                          </li>
                        )}
                        {completion?.late && (
                          <li className="chip chip--open">
                            Resolved after the deadline
                          </li>
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
                          Pass the level {mission.clearance - 1} assessment to
                          open this case.
                        </p>
                      ) : (
                        <p className="case__go">
                          <a
                            className="button button--primary"
                            href={href({
                              name: "mission",
                              missionId: mission.id,
                            })}
                          >
                            {underway
                              ? "Resume"
                              : completion
                                ? "Open case"
                                : placement
                                  ? "Attempt placement"
                                  : "Open case"}
                            <span className="visually-hidden">
                              : {mission.title}
                            </span>
                          </a>
                          {completion &&
                            investigation?.status === "complete" && (
                              <a
                                className="button"
                                href={href({
                                  name: "debrief",
                                  missionId: mission.id,
                                })}
                              >
                                Read debrief
                                <span className="visually-hidden">
                                  : {mission.title}
                                </span>
                              </a>
                            )}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </main>
  );
}
