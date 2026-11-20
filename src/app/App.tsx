import { lazy, Suspense, useEffect, useRef } from "react";
import { DebriefRoute } from "../routes/DebriefRoute.tsx";
import { HomeRoute } from "../routes/HomeRoute.tsx";
import { ManualRoute } from "../routes/ManualRoute.tsx";
import { OrientationRoute } from "../routes/OrientationRoute.tsx";
import { href, type Route } from "../routes/parseRoute.ts";
import { SettingsRoute } from "../routes/SettingsRoute.tsx";
import { useHashRoute } from "../routes/useHashRoute.ts";
import { useGame } from "./GameProvider.tsx";

// The editor, the GraphQL engine and the world data load when a case opens.
const Workspace = lazy(() => import("../features/workspace/Workspace.tsx"));
const Training = lazy(() => import("../features/training/Training.tsx"));

function TrainingRoute() {
  return (
    <Suspense
      fallback={
        <main className="page">
          <p className="loading" role="status">
            Opening the training range…
          </p>
        </main>
      }
    >
      <Training />
    </Suspense>
  );
}

function MissionRoute({ missionId }: { missionId: string }) {
  const { course } = useGame();
  const mission = course.missions.find((m) => m.id === missionId);
  if (!mission)
    return <NotFound what={`No case is filed as "${missionId}".`} />;
  return (
    <Suspense
      fallback={
        <main className="page">
          <p className="loading" role="status">
            Fetching the case file…
          </p>
        </main>
      }
    >
      <Workspace key={mission.id} mission={mission} />
    </Suspense>
  );
}

function NotFound({ what }: { what: string }) {
  return (
    <main className="page">
      <article className="paper sheet">
        <div className="sheet__body">
          <h1>Nothing filed here</h1>
          <p>{what}</p>
          <a className="button" href={href({ name: "home" })}>
            Back to assignments
          </a>
        </div>
      </article>
    </main>
  );
}

function Screen({ route }: { route: Route }) {
  switch (route.name) {
    case "home":
      return <HomeRoute />;
    case "mission":
      return <MissionRoute missionId={route.missionId} />;
    case "debrief":
      return <DebriefRoute missionId={route.missionId} />;
    case "manual":
      return <ManualRoute entryId={route.entryId} />;
    case "orientation":
      return <OrientationRoute />;
    case "training":
      return <TrainingRoute />;
    case "settings":
      return <SettingsRoute />;
    case "not-found":
      return <NotFound what={`The archive has no page at "${route.path}".`} />;
  }
}

const TITLES: Record<Route["name"], string> = {
  home: "Assignments",
  mission: "Case",
  debrief: "Debrief",
  manual: "Tradecraft manual",
  orientation: "Orientation",
  training: "Training range",
  settings: "Settings",
  "not-found": "Not found",
};

export function App() {
  const route = useHashRoute();
  const game = useGame();
  const key = JSON.stringify(route);
  const first = useRef(true);

  useEffect(() => {
    document.title = `${TITLES[route.name]} · DossierQL`;
    if (first.current) {
      first.current = false;
      return;
    }
    // Moving to a new screen puts keyboard and screen reader users at its top.
    document.getElementById("screen")?.focus();
    window.scrollTo(0, 0);
  }, [key, route.name]);

  return (
    <>
      <a className="skip" href="#screen">
        Skip to content
      </a>
      <header className="shell-bar">
        <a className="shell-bar__brand" href={href({ name: "home" })}>
          DossierQL
        </a>
        <nav aria-label="Main">
          <ul className="shell-bar__nav">
            <li>
              <a href={href({ name: "home" })}>Assignments</a>
            </li>
            <li>
              <a href={href({ name: "manual" })}>Tradecraft manual</a>
            </li>
            <li>
              <a href={href({ name: "training" })}>Training</a>
            </li>
            <li>
              <a href={href({ name: "orientation" })}>Orientation</a>
            </li>
            <li>
              <a href={href({ name: "settings" })}>Settings</a>
            </li>
          </ul>
        </nav>
        <p className="shell-bar__rank">Clearance {game.standing.clearance}</p>
      </header>
      {!game.remembers && (
        <p className="shell-notice" role="status">
          {game.loadNote === "too-new"
            ? "Your saved progress was written by a newer version of the game. It has been left untouched, and this visit will not be saved."
            : "This browser is not storing progress. The game is playable, and nothing will be remembered after you leave."}
        </p>
      )}
      {game.loadNote === "unreadable" && (
        <p className="shell-notice" role="status">
          The saved progress could not be read, so the record starts again.
        </p>
      )}
      {game.restarted.length > 0 && (
        <p className="shell-notice" role="status">
          A case you had in progress has been revised since, so it starts again.
          Completed cases keep their record.
        </p>
      )}
      <div id="screen" tabIndex={-1}>
        <Screen route={route} />
      </div>
      <footer className="shell-foot">
        <p>
          DossierQL is an independent project. Geography from the CIA World
          Factbook, mledoze/countries (ODbL) and Natural Earth. Every character,
          agency and crime is invented.
        </p>
      </footer>
    </>
  );
}
