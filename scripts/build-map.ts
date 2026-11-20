// Converts the vendored Natural Earth country shapes under data/source/ into
// data/map.json: one SVG path per country in a 1000x500 equirectangular
// viewBox.
//
//   node scripts/build-map.ts
//
// Plain Node, no mapping libraries. The output is deterministic (sorted by
// code, no timestamps). Never edit data/map.json by hand; fix this script.
//
// Notes for whoever draws the paths:
//   - A path holds every ring of the country, outer rings and holes alike
//     (South Africa has a Lesotho-shaped hole). Use fill-rule="evenodd", or
//     rely on the enclave being drawn on top.
//   - `code` is the ISO 3166-1 alpha-2 code, also for territories that are not
//     in data/world.json (GL, EH, PR ...), so the map has no holes. Shapes
//     with no code at all are merged into one entry with `"code": null`.
//   - Countries too small to survive at this scale are drawn as a small
//     diamond so they can still be seen and hit.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(root, "data", "source");
const outputPath = join(root, "data", "map.json");

const WIDTH = 1000;
const HEIGHT = 500;

/** A point is dropped when it is closer than this to the last point kept. */
const MIN_POINT_DISTANCE = 0.3;
/** Rings (islands, holes) smaller than this many square units are dropped. */
const MIN_RING_AREA = 0.15;
/** Half-diagonal of the diamond that stands in for a too-small country. */
const MARKER_RADIUS = 0.4;

// Natural Earth has no ISO code for a few shapes. Fold the two breakaway
// regions into the state they belong to in data/world.json; leave the rest
// uncoded.
const CODE_BY_ADM0_A3: Record<string, string | null> = {
  CYN: "CY", // Northern Cyprus
  SOL: "SO", // Somaliland
  KAS: null, // Siachen Glacier (disputed, claimed by India and Pakistan)
};

/** Not drawn at all. */
const SKIPPED_CODES = ["AQ"]; // Antarctica

// ------------------------------------------------------------------ types

type Position = [number, number];
type Ring = Position[];

interface Feature {
  properties: {
    ADM0_A3: string;
    ISO_A2: string;
    ISO_A2_EH: string;
    NAME: string;
  };
  geometry:
    | { type: "Polygon"; coordinates: Ring[] }
    | { type: "MultiPolygon"; coordinates: Ring[][] };
}

interface FeatureCollection {
  version?: string;
  features: Feature[];
}

// ---------------------------------------------------------------- helpers

function fail(message: string): never {
  console.error(`build-map: ${message}`);
  process.exit(1);
}

function readGeoJson(name: string): FeatureCollection {
  return JSON.parse(
    readFileSync(join(sourceDir, name), "utf8"),
  ) as FeatureCollection;
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function codeOf(feature: Feature): string | null {
  const { ADM0_A3, ISO_A2_EH, ISO_A2, NAME } = feature.properties;
  // ISO_A2 is "-99" for France, Norway and Kosovo; ISO_A2_EH has them right.
  for (const candidate of [ISO_A2_EH, ISO_A2]) {
    if (/^[A-Z]{2}$/.test(candidate)) return candidate;
  }
  const mapped = CODE_BY_ADM0_A3[ADM0_A3];
  if (mapped === undefined) {
    fail(`no ISO code for "${NAME}" (${ADM0_A3}); add it to CODE_BY_ADM0_A3`);
  }
  return mapped;
}

function project([lon, lat]: Position): Position {
  return [((lon + 180) / 360) * WIDTH, ((90 - lat) / 180) * HEIGHT];
}

function round1(value: number): number {
  const rounded = Math.round(value * 10) / 10;
  return rounded === 0 ? 0 : rounded; // no negative zero
}

/** Absolute area of a closed ring (shoelace formula), in square units. */
function area(ring: Ring): number {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i] as Position;
    const [x2, y2] = ring[(i + 1) % ring.length] as Position;
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

/** Projects a GeoJSON ring and drops its repeated closing point. */
function projectRing(ring: Ring): Ring {
  const points = ring.map(project);
  const first = points[0];
  const last = points[points.length - 1];
  if (
    points.length > 1 &&
    first &&
    last &&
    first[0] === last[0] &&
    first[1] === last[1]
  ) {
    points.pop();
  }
  return points;
}

/** Drops points too close to the previous kept one, then rounds. */
function simplify(ring: Ring, minDistance: number): Ring {
  const kept: Ring = [];
  for (const point of ring) {
    const previous = kept[kept.length - 1];
    if (
      previous &&
      Math.hypot(point[0] - previous[0], point[1] - previous[1]) < minDistance
    ) {
      continue;
    }
    kept.push(point);
  }
  const rounded: Ring = [];
  for (const [x, y] of kept) {
    const point: Position = [round1(x), round1(y)];
    const previous = rounded[rounded.length - 1];
    if (previous && previous[0] === point[0] && previous[1] === point[1])
      continue;
    rounded.push(point);
  }
  const first = rounded[0];
  const last = rounded[rounded.length - 1];
  if (
    rounded.length > 1 &&
    first &&
    last &&
    first[0] === last[0] &&
    first[1] === last[1]
  ) {
    rounded.pop();
  }
  return rounded;
}

function marker(ring: Ring): Ring {
  const cx = ring.reduce((sum, p) => sum + p[0], 0) / ring.length;
  const cy = ring.reduce((sum, p) => sum + p[1], 0) / ring.length;
  return [
    [round1(cx), round1(cy - MARKER_RADIUS)],
    [round1(cx + MARKER_RADIUS), round1(cy)],
    [round1(cx), round1(cy + MARKER_RADIUS)],
    [round1(cx - MARKER_RADIUS), round1(cy)],
  ];
}

function toPath(ring: Ring): string {
  const [first, ...rest] = ring.map(([x, y]) => `${x},${y}`);
  return `M${first}L${rest.join(" ")}Z`;
}

// ------------------------------------------------------------------- build

const small = readGeoJson("ne_110m_admin_0_countries.geojson");
const medium = readGeoJson("ne_50m_admin_0_small-extract.geojson");
if (!medium.version)
  fail("ne_50m_admin_0_small-extract.geojson carries no version");

// The 1:50m extract only fills in what 1:110m lacks; never mix scales for one
// shape.
const inSmall = new Set(small.features.map((f) => f.properties.ADM0_A3));
const extra = medium.features.filter((f) => !inSmall.has(f.properties.ADM0_A3));

const ringsByCode = new Map<string | null, Ring[]>();
for (const feature of [...small.features, ...extra]) {
  const code = codeOf(feature);
  if (code !== null && SKIPPED_CODES.includes(code)) continue;
  const polygons =
    feature.geometry.type === "Polygon"
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;
  const rings = ringsByCode.get(code) ?? [];
  for (const polygon of polygons) {
    for (const ring of polygon) rings.push(projectRing(ring));
  }
  ringsByCode.set(code, rings);
}

const countries: { code: string | null; d: string }[] = [];
for (const [code, rings] of ringsByCode) {
  let largest = rings[0];
  for (const ring of rings) {
    if (largest === undefined || area(ring) > area(largest)) largest = ring;
  }
  if (largest === undefined) fail(`${code}: no geometry`);

  const paths: string[] = [];
  for (const ring of rings) {
    const simplified = simplify(ring, MIN_POINT_DISTANCE);
    const usable = simplified.length >= 3 && area(simplified) >= MIN_RING_AREA;
    if (usable) paths.push(toPath(simplified));
    else if (ring === largest) paths.push(toPath(marker(ring)));
  }
  countries.push({ code, d: paths.join("") });
}

// Sorted by code; the uncoded entry goes last.
countries.sort((a, b) =>
  a.code === null ? 1 : b.code === null ? -1 : compare(a.code, b.code),
);

// ------------------------------------------------------------- validation

for (const { code, d } of countries) {
  if (!/^(M-?[\d.]+,-?[\d.]+L(-?[\d.]+,-?[\d.]+ ?)+Z)+$/.test(d))
    fail(`${code}: malformed path`);
  for (const pair of d.match(/-?[\d.]+,-?[\d.]+/g) ?? []) {
    const [x, y] = pair.split(",").map(Number) as [number, number];
    if (x < -0.5 || x > WIDTH + 0.5 || y < -0.5 || y > HEIGHT + 0.5) {
      fail(`${code}: point ${pair} is outside the ${WIDTH}x${HEIGHT} viewBox`);
    }
  }
}

// Every country of the world dataset should be on the map. This is a warning,
// not an error, so the two scripts can still be run independently.
const worldPath = join(root, "data", "world.json");
if (existsSync(worldPath)) {
  const world = JSON.parse(readFileSync(worldPath, "utf8")) as {
    countries: { code: string }[];
  };
  const drawn = new Set(countries.map((c) => c.code));
  const missing = world.countries
    .map((c) => c.code)
    .filter((code) => !drawn.has(code));
  if (missing.length > 0) {
    console.warn(`build-map: warning: no shape for ${missing.join(", ")}`);
  }
}

// ------------------------------------------------------------------ output

const map = {
  snapshot: {
    source: "Natural Earth 1:110m Admin 0 - Countries (public domain)",
    version: medium.version,
    supplements: [
      `Natural Earth 1:50m Admin 0 - Countries ${medium.version}: ` +
        `${extra.length} small states and territories that 1:110m leaves out`,
    ],
  },
  width: WIDTH,
  height: HEIGHT,
  projection: "equirectangular",
  countries,
};

const text = JSON.stringify(map, null, 2) + "\n";
writeFileSync(outputPath, text);
console.log(
  `build-map: wrote data/map.json (${countries.length} shapes, ${Math.round(text.length / 1024)} KB)`,
);
