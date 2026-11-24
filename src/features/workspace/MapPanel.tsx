import { useEffect, useState } from "react";
import map from "../../../data/map.json";
import type { Country } from "../../content/types.ts";
import { travelHours } from "../../engine/clock.ts";
import { stageOf } from "../../engine/mission.ts";
import { parseRef } from "../../graphql/store.ts";
import { useWorkspace } from "./context.ts";
import { hours } from "./describe.ts";
import { STATUS_WORDS, stageLeads } from "./leads.ts";

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
 * The journeys whose route has already been drawn in. Each route draws once,
 * the first time the map is shown after the journey (SDD 8.1).
 */
const drawn = new Set<string>();

interface Route {
  n: number;
  from: Country;
  to: Country;
  cost: number;
}

/**
 * Present-day geography in period dress. The map marks where the player
 * is, the leads the stage keeps in contention, and the countries their
 * queries have turned up. The same journeys are listed as text with what
 * each would cost, so the map can help decide where to go (SDD 8.2).
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
  const leads = stageLeads(env, state, stage).filter((l) => l.country);
  const leadLands = new Set(
    leads.filter((l) => l.status !== "ruled-out").map((l) => l.country?.code),
  );
  // With leads in contention the map closes in on the region they span, so
  // that each city can be read by its name. Otherwise it shows the world.
  const leadPoint = (lead: (typeof leads)[number]) =>
    lead.city
      ? project(lead.city.lat, lead.city.lon)
      : project(lead.country?.capitalLat ?? 0, lead.country?.capitalLon ?? 0);
  const box = (() => {
    const points = leads.map(leadPoint);
    if (here) points.push(project(here.capitalLat, here.capitalLon));
    if (leads.length === 0 || points.length < 2) {
      return { x: 0, y: 60, w: WIDTH, h: HEIGHT - 110 };
    }
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const pad = 20;
    let w = Math.max(...xs) - Math.min(...xs) + pad * 2;
    let h = Math.max(...ys) - Math.min(...ys) + pad * 2;
    // Keep the frame twice as wide as it is tall, and no smaller than a
    // region of a few countries.
    w = Math.max(w, h * 2, 160);
    h = w / 2;
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
    const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  })();
  const scale = box.w / WIDTH;
  const leadCodes = new Set(leads.map((l) => l.country?.code));
  const others = journeys.filter((j) => !leadCodes.has(j.country.code));
  const journeyText = (country: string, h: number) =>
    state.clock === "none"
      ? country
      : h === 0
        ? `${country}: no journey needed`
        : `${country}: ${timed ? hours(h) : `${hours(h)} (untimed)`}`;
  // The case so far, journey by journey: each travel dispatch closed a stage
  // in one country and opened the next stage in another.
  const routes: Route[] = [];
  for (const d of state.dispatches) {
    if (d.kind !== "travel") continue;
    const left = stageOf(env.mission, d.stageId);
    const from = byCode.get(left.location);
    const to = left.next
      ? byCode.get(stageOf(env.mission, left.next).location)
      : undefined;
    if (from && to) routes.push({ n: d.n, from, to, cost: d.cost });
  }
  const latest = routes.at(-1);
  const latestKey = latest ? `${env.mission.id}:${String(latest.n)}` : null;
  const [fresh] = useState(() => latestKey !== null && !drawn.has(latestKey));
  useEffect(() => {
    if (latestKey) drawn.add(latestKey);
  }, [latestKey]);

  return (
    <div className="tool">
      <p className="tool__lede">
        You are in {here?.name ?? stage.location}.
        {leads.length > 0 &&
          ` The cities your leads point to are marked with their names.`}{" "}
        Countries from your results are marked
        {state.clock === "none"
          ? "."
          : ", with the time a journey there would take."}
      </p>
      <svg
        className="map"
        viewBox={`${String(box.x)} ${String(box.y)} ${String(box.w)} ${String(box.h)}`}
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
                : shape.code && leadLands.has(shape.code)
                  ? "map__land map__land--lead"
                  : shape.code && seen.has(shape.code)
                    ? "map__land map__land--seen"
                    : "map__land"
            }
          />
        ))}
        {routes.map((route) => {
          const a = project(route.from.capitalLat, route.from.capitalLon);
          const b = project(route.to.capitalLat, route.to.capitalLon);
          return (
            <line
              key={route.n}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              pathLength={1}
              className={
                fresh && route === latest
                  ? "map__route map__route--new"
                  : "map__route"
              }
            />
          );
        })}
        {journeys.map(({ country }) => {
          const p = project(country.capitalLat, country.capitalLon);
          return (
            <circle
              key={country.code}
              cx={p.x}
              cy={p.y}
              r={3 * Math.max(scale, 0.35)}
              className="map__pin"
            />
          );
        })}
        {leads.map((lead) => {
          const p = leadPoint(lead);
          const struck = lead.status === "ruled-out";
          return (
            <g
              key={lead.id}
              className={struck ? "map__lead map__lead--struck" : "map__lead"}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={10 * scale}
                className="map__pin--lead"
                strokeWidth={4 * scale}
              />
              <text
                x={p.x + 14 * scale}
                y={p.y + 8 * scale}
                fontSize={26 * scale}
                strokeWidth={6 * scale}
                className="map__lead-name"
              >
                {lead.city?.name ?? lead.country?.name}
              </text>
            </g>
          );
        })}
        {here && (
          <circle
            {...(({ x, y }) => ({ cx: x, cy: y }))(
              project(here.capitalLat, here.capitalLon),
            )}
            r={4.5 * Math.max(scale, 0.35) * (leads.length > 0 ? 2.5 : 1)}
            className="map__pin map__pin--here"
          />
        )}
      </svg>
      {routes.length > 0 && (
        <>
          <h3>Your route so far</h3>
          <ol className="journeys" data-testid="route">
            {routes.map((route) => (
              <li key={route.n}>
                {route.from.name} to {route.to.name}
                {route.cost > 0 && `, ${hours(route.cost)}`}
              </li>
            ))}
          </ol>
        </>
      )}
      {leads.length > 0 && (
        <>
          <h3>Leads in contention</h3>
          <ul className="journeys" data-testid="map-leads">
            {leads.map((lead) => (
              <li
                key={lead.id}
                className={
                  lead.status === "ruled-out" ? "journeys__struck" : undefined
                }
              >
                {lead.label}, in{" "}
                {journeyText(
                  lead.city
                    ? `${lead.city.name}, ${lead.country?.name ?? ""}`
                    : (lead.country?.name ?? ""),
                  lead.hours,
                )}{" "}
                · {STATUS_WORDS[lead.status]}
              </li>
            ))}
          </ul>
        </>
      )}
      <h3>
        {leads.length > 0 ? "Other journeys" : "Journeys"} from{" "}
        {here?.name ?? stage.location}
      </h3>
      {others.length === 0 ? (
        <p className="draft__none">
          {leads.length > 0
            ? "No country apart from those of your leads has appeared in your results yet."
            : "No other country has appeared in your results yet."}
        </p>
      ) : (
        <ul className="journeys">
          {others.map(({ country, hours: h }) => (
            <li key={country.code}>{journeyText(country.name, h)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
