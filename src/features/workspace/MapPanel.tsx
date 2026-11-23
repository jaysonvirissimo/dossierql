import map from "../../../data/map.json";
import { travelHours } from "../../engine/clock.ts";
import { parseRef } from "../../graphql/store.ts";
import { useWorkspace } from "./context.ts";
import { hours } from "./describe.ts";

interface Shape {
  code: string | null;
  d: string;
}

const shapes = (map as { countries: Shape[] }).countries;
const WIDTH = (map as { width: number }).width;
const HEIGHT = (map as { height: number }).height;

function project(lat: number, lon: number): { x: number; y: number } {
  return { x: ((lon + 180) / 360) * WIDTH, y: ((90 - lat) / 180) * HEIGHT };
}

/**
 * Present-day geography in period dress. The map marks where the player
 * is and the countries their queries have turned up, and the same journeys
 * are listed as text with what each would cost.
 */
export default function MapPanel() {
  const { env, state, stage } = useWorkspace();
  const byCode = new Map(env.world.countries.map((c) => [c.code, c]));
  const here = byCode.get(stage.location);
  const seen = new Set<string>();
  for (const { fact } of Object.values(state.ledger)) {
    const { type, id } = parseRef(fact.entity);
    if (type === "Country" && id !== stage.location) seen.add(id);
  }
  const journeys = [...seen]
    .map((code) => byCode.get(code))
    .filter((c) => c !== undefined)
    .map((country) => ({
      country,
      hours: travelHours(env.world, stage.location, country.code),
    }))
    .sort(
      (a, b) =>
        a.hours - b.hours || a.country.name.localeCompare(b.country.name),
    );
  const timed = state.clock === "active";

  return (
    <div className="tool">
      <p className="tool__lede">
        You are in {here?.name ?? stage.location}. Countries from your results
        are marked
        {state.clock === "none"
          ? "."
          : ", with the time a journey there would take."}
      </p>
      <svg
        className="map"
        viewBox={`0 60 ${String(WIDTH)} ${String(HEIGHT - 110)}`}
        role="img"
        aria-label={`World map. Current location: ${here?.name ?? stage.location}. ${String(journeys.length)} other countries from your results are marked.`}
      >
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} className="map__sea" />
        {shapes.map((shape, index) => (
          <path
            key={index}
            d={shape.d}
            fillRule="evenodd"
            className={
              shape.code === stage.location
                ? "map__land map__land--here"
                : shape.code && seen.has(shape.code)
                  ? "map__land map__land--seen"
                  : "map__land"
            }
          />
        ))}
        {journeys.map(({ country }) => {
          const p = project(country.capitalLat, country.capitalLon);
          return (
            <circle
              key={country.code}
              cx={p.x}
              cy={p.y}
              r="3"
              className="map__pin"
            />
          );
        })}
        {here && (
          <circle
            {...(({ x, y }) => ({ cx: x, cy: y }))(
              project(here.capitalLat, here.capitalLon),
            )}
            r="4.5"
            className="map__pin map__pin--here"
          />
        )}
      </svg>
      <h3>Journeys from {here?.name ?? stage.location}</h3>
      {journeys.length === 0 ? (
        <p className="draft__none">
          No other country has appeared in your results yet.
        </p>
      ) : (
        <ul className="journeys">
          {journeys.map(({ country, hours: h }) => (
            <li key={country.code}>
              {state.clock === "none"
                ? country.name
                : `${country.name}: ${timed ? hours(h) : `${hours(h)} (untimed)`}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
