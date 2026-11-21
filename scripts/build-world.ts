// Converts the vendored source snapshot under data/source/ into data/world.json,
// the static world dataset the game loads.
//
//   node scripts/build-world.ts
//
// The output is deterministic: no timestamps, fixed key order, countries sorted
// by code and cities by id, so re-running gives a byte-identical file. Never
// edit data/world.json by hand; fix this script or data/source/overrides.yaml.
//
// Which field comes from where (see data/source/README.md for details):
//   name, capital, capitalLat/Lon, continent, languages ... CIA World Factbook
//   borders, currency, the list of sovereign states ....... mledoze/countries
//   corrections to any of the above ....................... overrides.yaml
//   cities ................................................ cities.yaml

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(root, "data", "source");
const outputPath = join(root, "data", "world.json");

// ------------------------------------------------------------------ types

interface FactbookEntry {
  region: string;
  shortName: string | null;
  longName: string | null;
  capital: string | null;
  capitalCoordinates: string | null;
  borderCountries: string | null;
  languages: string | null;
  exchangeRateCurrency: string | null;
  internetCountryCode: string | null;
}

interface FactbookExtract {
  source: string;
  commit: string;
  entries: Record<string, FactbookEntry>;
}

interface MledozeCountry {
  cca2: string;
  cca3: string;
  name: string;
  tld: string[];
  unMember: boolean;
  independent: boolean;
  region: string;
  subregion: string;
  borders: string[];
  languages: Record<string, string>;
  currencies: Record<string, string>;
}

interface MledozeExtract {
  source: string;
  commit: string;
  countries: MledozeCountry[];
}

interface Currency {
  code: string;
  name: string;
}

interface CountryOverride {
  name?: string;
  capital?: string;
  capitalLat?: number;
  capitalLon?: number;
  continent?: string;
  languages?: string[];
  currency?: Currency | null;
}

interface Overrides {
  factbookCodes?: Record<string, string>;
  languageAliases?: Record<string, string>;
  borders?: { add?: [string, string][]; remove?: [string, string][] };
  countries?: Record<string, CountryOverride>;
}

interface Country {
  code: string;
  name: string;
  capital: string;
  capitalLat: number;
  capitalLon: number;
  continent: string;
  borders: string[];
  languages: string[];
  currency: Currency | null;
}

interface City {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

// ---------------------------------------------------------------- helpers

const errors: string[] = [];
function fail(message: string): void {
  errors.push(message);
}

function exitIfErrors(): void {
  if (errors.length === 0) return;
  console.error(`build-world: ${errors.length} problem(s), nothing written:`);
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(sourceDir, name), "utf8")) as T;
}

function readYaml<T>(name: string): T {
  return parseYaml(readFileSync(join(sourceDir, name), "utf8")) as T;
}

/** Plain code-point ordering, independent of the machine's locale. */
function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function round2(value: number): number {
  const rounded = Math.round(value * 100) / 100;
  return rounded === 0 ? 0 : rounded; // no negative zero
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  nbsp: " ",
  quot: '"',
  aacute: "á",
  eacute: "é",
  iacute: "í",
  oacute: "ó",
  uacute: "ú",
  egrave: "è",
  ccedil: "ç",
  ocirc: "ô",
  atilde: "ã",
  ntilde: "ñ",
};

/** Factbook text carries HTML entities and the odd inline tag. */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(
      /&([a-z]+);/gi,
      (whole, name: string) => ENTITIES[name.toLowerCase()] ?? whole,
    )
    .replace(/\s+/g, " ")
    .trim();
}

/** Removes every (parenthetical), including nested ones. */
function stripParentheses(text: string): string {
  let previous: string;
  let current = text;
  do {
    previous = current;
    current = current.replace(/\([^()]*\)/g, " ");
  } while (current !== previous);
  return current.replace(/\s+/g, " ").trim();
}

// ----------------------------------------------------------------- inputs

const factbook = readJson<FactbookExtract>("factbook-extract.json");
const mledoze = readJson<MledozeExtract>("mledoze-countries-extract.json");
const overrides = readYaml<Overrides>("overrides.yaml");
const cityRows = readYaml<unknown>("cities.yaml");

// The sovereign states the game knows: the 193 UN members, the two UN
// observer states, plus Kosovo and Taiwan.
const NON_MEMBER_STATES = ["PS", "TW", "VA", "XK"];
const EXPECTED_COUNTRIES = 197;

const sovereign = mledoze.countries
  .filter((c) => c.unMember || NON_MEMBER_STATES.includes(c.cca2))
  .sort((a, b) => compare(a.cca2, b.cca2));
const sovereignCodes = new Set(sovereign.map((c) => c.cca2));
const alpha2ByAlpha3 = new Map(mledoze.countries.map((c) => [c.cca3, c.cca2]));

for (const code of Object.keys(overrides.countries ?? {})) {
  if (!sovereignCodes.has(code))
    fail(`overrides.yaml: countries.${code} is not in the list`);
}

// ------------------------------------------- Factbook entry for each state

// The Factbook files are keyed by GEC (ex-FIPS) codes, not ISO. The country's
// internet domain is the one field both sources share, so match on that and
// let overrides.yaml settle the few ambiguous cases.
function factbookEntryFor(country: MledozeCountry): FactbookEntry | null {
  const forced = overrides.factbookCodes?.[country.cca2];
  if (forced !== undefined) {
    const entry = factbook.entries[forced];
    if (!entry)
      fail(
        `${country.cca2}: overrides.factbookCodes names unknown entry "${forced}"`,
      );
    return entry ?? null;
  }
  const matches = Object.entries(factbook.entries).filter(([, entry]) => {
    const tld = entry.internetCountryCode?.match(/\.[a-z]{2}\b/)?.[0];
    return tld !== undefined && country.tld.includes(tld);
  });
  if (matches.length !== 1) {
    const found = matches.map(([gec]) => gec).join(", ") || "none";
    fail(
      `${country.cca2} (${country.name}): expected exactly one Factbook entry by internet ` +
        `domain, found ${found}; add it to factbookCodes in overrides.yaml`,
    );
    return null;
  }
  return matches[0]?.[1] ?? null;
}

// ------------------------------------------------------------------ fields

const CONTINENTS = [
  "Africa",
  "Antarctica",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
];

const CONTINENT_BY_FACTBOOK_REGION: Record<string, string> = {
  africa: "Africa",
  "australia-oceania": "Oceania",
  "central-america-n-caribbean": "North America",
  "central-asia": "Asia",
  "east-n-southeast-asia": "Asia",
  europe: "Europe",
  "middle-east": "Asia",
  "north-america": "North America",
  "south-america": "South America",
  "south-asia": "Asia",
};

function parseName(entry: FactbookEntry): string | null {
  const short = entry.shortName ? cleanText(entry.shortName) : "";
  if (short !== "" && short !== "none") return short;
  return entry.longName ? cleanText(entry.longName) : null;
}

/** "La Paz (administrative capital); Sucre (...)" -> "La Paz" */
function parseCapital(entry: FactbookEntry): string | null {
  if (!entry.capital) return null;
  const first =
    stripParentheses(cleanText(entry.capital)).split(/[;,]/)[0]?.trim() ?? "";
  return first === "" || /^no /.test(first) ? null : first;
}

/** "38 43 N, 9 08 W" -> [38.72, -9.13] */
function parseCoordinates(text: string | null): [number, number] | null {
  const m = text
    ?.trim()
    .match(/^(\d{1,2}) (\d{2}) ([NS]), (\d{1,3}) (\d{2}) ([EW])$/);
  if (!m) return null;
  const [latDeg, latMin, lonDeg, lonMin] = [m[1], m[2], m[4], m[5]].map(
    Number,
  ) as [number, number, number, number];
  // The source has the occasional typo (minutes of 84); refuse to guess.
  if (latMin >= 60 || lonMin >= 60 || latDeg > 90 || lonDeg > 180) return null;
  const lat = (latDeg + latMin / 60) * (m[3] === "S" ? -1 : 1);
  const lon = (lonDeg + lonMin / 60) * (m[6] === "W" ? -1 : 1);
  return [round2(lat), round2(lon)];
}

// Words that open a Factbook list item which is not the name of a language
// ("other 3.6%", "indigenous languages", "many local dialects" ...).
const NOT_A_LANGUAGE =
  /^(other|unspecified|unknown|undeclared|none|no|not|indigenous|foreign|multilingual|two|more|many|numerous|various|small|some|several|minority|local|tribal|ethnic|native|amerindian|indian|nordic|niger-congo|nilo-saharan|micronesian|turkic|less|over|approximately|about)\b/i;

/** Splits on any of the separators, ignoring those inside parentheses. */
function splitTopLevel(text: string, separators: string[]): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i] ?? "";
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    const separator =
      depth === 0 ? separators.find((s) => text.startsWith(s, i)) : undefined;
    if (separator !== undefined) {
      parts.push(current);
      current = "";
      i += separator.length - 1;
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts;
}

function isOfficial(item: string): boolean {
  const notes = (item.match(/\(([^()]|\([^()]*\))*\)/g) ?? []).join(" ");
  if (/official in |official regional|only in /.test(notes)) return false;
  return /\bofficial\b|\bstate language\b/.test(notes);
}

function applyAlias(name: string): string {
  return overrides.languageAliases?.[name] ?? name;
}

function cleanLanguageItem(item: string): string | null {
  let name = stripParentheses(item)
    .replace(/\s+(less than\s+)?[<>]?\d.*$/, "") // "Umbundu 23%" -> "Umbundu"
    .replace(/\s+(widely|commonly)\s.*$/, "") // "English widely spoken"
    .replace(/^(and|only|or)\s+/i, "")
    .replace(/\s+only$/i, "")
    .trim();
  if (overrides.languageAliases?.[name] !== undefined) return applyAlias(name);
  name = name.replace(/\s+languages$/i, "").trim();
  if (name.includes(" or ")) name = name.split(" or ").pop()?.trim() ?? ""; // "isiZulu or Zulu"
  name = applyAlias(name);
  if (name.includes("/")) name = applyAlias(name.split("/")[0]?.trim() ?? ""); // "Zezuru/Shona"
  if (NOT_A_LANGUAGE.test(name)) return null;
  if (!/^[A-Z][A-Za-z'-]*( [A-Za-z'-]+){0,2}$/.test(name)) return null;
  if (/\b(languages?|dialects?|patois|speakers?|minorit(y|ies))\b/i.test(name))
    return null;
  return name;
}

const MAX_LANGUAGES = 6;

// Where the Factbook gives shares of the population, a language that is
// neither official nor spoken by at least this share is left out; otherwise
// every census footnote ("Italian 1.5%") would count as a major language.
const MIN_SHARE_PERCENT = 5;

/** "Umbundu 23%" -> 23; null when the item carries no percentage. */
function sharePercent(item: string): number | null {
  const m = stripParentheses(item).match(/(\d+(?:\.\d+)?)\s*%/);
  return m ? Number(m[1]) : null;
}

/**
 * Reduces a Factbook language list such as
 *   "Portuguese 71.2% (official), Umbundu 23%, ..., other 3.6% (2014 est.)"
 * to clean names, official languages first, then in the order given.
 * Only the first ";"-separated clause that names a language is read; later
 * clauses are notes ("note - English is widely understood ...").
 */
function parseLanguages(text: string | null): string[] {
  if (!text) return [];
  for (const clause of splitTopLevel(cleanText(text), [";"])) {
    if (/^\s*note\b/.test(clause)) break;
    const official: string[] = [];
    const rest: string[] = [];
    for (const item of splitTopLevel(clause, [",", " and "])) {
      const name = cleanLanguageItem(item);
      if (name === null) continue;
      const share = sharePercent(item);
      if (isOfficial(item)) official.push(name);
      else if (share === null || share >= MIN_SHARE_PERCENT) rest.push(name);
    }
    const names = [...new Set([...official, ...rest])];
    if (names.length > 0) return names.slice(0, MAX_LANGUAGES);
  }
  return [];
}

/**
 * mledoze/countries gives ISO 4217 codes and proper names; the Factbook's
 * exchange-rate line ("euros (EUR) per US dollar") is only used to pick the
 * primary one where a country lists several.
 */
function pickCurrency(
  country: MledozeCountry,
  entry: FactbookEntry,
): Currency | null {
  const codes = Object.keys(country.currencies).sort(compare);
  const only = codes.length === 1 ? codes[0] : undefined;
  const hinted = entry.exchangeRateCurrency?.match(/\(([A-Z]{3})\)/)?.[1];
  const code =
    only ??
    (hinted !== undefined && codes.includes(hinted) ? hinted : undefined);
  if (code === undefined) return null;
  const name = country.currencies[code] ?? "";
  return { code, name: name.charAt(0).toUpperCase() + name.slice(1) }; // "lari" -> "Lari"
}

// --------------------------------------------------------------- countries

const countries: Country[] = [];

for (const source of sovereign) {
  const code = source.cca2;
  const entry = factbookEntryFor(source);
  if (!entry) continue;
  const override: CountryOverride = overrides.countries?.[code] ?? {};

  const name = override.name ?? parseName(entry);
  const capital = override.capital ?? parseCapital(entry);
  const coordinates = parseCoordinates(entry.capitalCoordinates);
  const capitalLat = override.capitalLat ?? coordinates?.[0];
  const capitalLon = override.capitalLon ?? coordinates?.[1];
  const continent =
    override.continent ?? CONTINENT_BY_FACTBOOK_REGION[entry.region];

  let languages = override.languages ?? parseLanguages(entry.languages);
  if (languages.length === 0) {
    // Last resort: the supplement's list (alphabetical by ISO 639-3 code).
    languages = Object.values(source.languages).slice(0, MAX_LANGUAGES);
  }

  const currency =
    override.currency !== undefined
      ? override.currency
      : pickCurrency(source, entry);
  if (currency === null && override.currency !== null) {
    fail(
      `${code}: cannot pick one currency from [${Object.keys(source.currencies).join(", ")}]`,
    );
  }

  const borders = source.borders
    .map((alpha3) => alpha2ByAlpha3.get(alpha3))
    .filter((c): c is string => c !== undefined && sovereignCodes.has(c));

  if (!name) fail(`${code}: no name`);
  if (!capital)
    fail(`${code}: no capital (source: ${JSON.stringify(entry.capital)})`);
  if (capitalLat === undefined || capitalLon === undefined) {
    fail(
      `${code}: unusable capital coordinates ${JSON.stringify(entry.capitalCoordinates)}; ` +
        `set capitalLat/capitalLon in overrides.yaml`,
    );
  }
  if (!continent)
    fail(`${code}: no continent for Factbook region "${entry.region}"`);

  countries.push({
    code,
    name: name ?? "",
    capital: capital ?? "",
    capitalLat: round2(capitalLat ?? 0),
    capitalLon: round2(capitalLon ?? 0),
    continent: continent ?? "",
    borders,
    languages,
    currency,
  });
}
exitIfErrors();

// Border corrections, as unordered pairs so both sides stay in step.
const byCode = new Map(countries.map((c) => [c.code, c]));
function borderPair(pair: unknown, list: string): [Country, Country] | null {
  const [a, b] = Array.isArray(pair) ? (pair as unknown[]) : [];
  const first = typeof a === "string" ? byCode.get(a) : undefined;
  const second = typeof b === "string" ? byCode.get(b) : undefined;
  if (!first || !second || first === second) {
    fail(
      `overrides.yaml: borders.${list} entry ${JSON.stringify(pair)} is not a pair of known codes`,
    );
    return null;
  }
  return [first, second];
}
for (const pair of overrides.borders?.add ?? []) {
  const found = borderPair(pair, "add");
  if (!found) continue;
  const [a, b] = found;
  if (a.borders.includes(b.code) && b.borders.includes(a.code)) {
    fail(
      `overrides.yaml: borders.add ${a.code}-${b.code} is already in the source; remove it`,
    );
  }
  a.borders.push(b.code);
  b.borders.push(a.code);
}
for (const pair of overrides.borders?.remove ?? []) {
  const found = borderPair(pair, "remove");
  if (!found) continue;
  const [a, b] = found;
  if (!a.borders.includes(b.code) && !b.borders.includes(a.code)) {
    fail(
      `overrides.yaml: borders.remove ${a.code}-${b.code} is not in the source; remove it`,
    );
  }
  a.borders = a.borders.filter((c) => c !== b.code);
  b.borders = b.borders.filter((c) => c !== a.code);
}
for (const country of countries) {
  country.borders = [...new Set(country.borders)].sort(compare);
}

// ------------------------------------------------------------------ cities

const cities: City[] = [];
if (!Array.isArray(cityRows)) {
  fail("cities.yaml: expected a list of cities");
} else {
  cityRows.forEach((row: unknown, index: number) => {
    const where = `cities.yaml entry ${index + 1}`;
    if (row === null || typeof row !== "object")
      return fail(`${where}: not a mapping`);
    const { id, name, country, lat, lon } = row as Record<string, unknown>;
    const label = typeof id === "string" ? `cities.yaml "${id}"` : where;
    if (typeof id !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
      return fail(`${label}: id must be lowercase kebab-case ASCII`);
    }
    if (typeof name !== "string" || name.trim() === "")
      return fail(`${label}: missing name`);
    if (typeof country !== "string") return fail(`${label}: missing country`);
    if (typeof lat !== "number" || lat < -90 || lat > 90)
      return fail(`${label}: bad lat`);
    if (typeof lon !== "number" || lon < -180 || lon > 180)
      return fail(`${label}: bad lon`);
    cities.push({
      id,
      name: name.trim(),
      country,
      lat: round2(lat),
      lon: round2(lon),
    });
  });
}
cities.sort((a, b) => compare(a.id, b.id));

// -------------------------------------------------------------- validation

if (countries.length !== EXPECTED_COUNTRIES) {
  fail(`expected ${EXPECTED_COUNTRIES} countries, got ${countries.length}`);
}
if (new Set(countries.map((c) => c.code)).size !== countries.length) {
  fail("country codes are not unique");
}
const namesSeen = new Map<string, string>();
for (const c of countries) {
  if (!/^[A-Z]{2}$/.test(c.code)) fail(`${c.code}: not an alpha-2 code`);
  const sameName = namesSeen.get(c.name);
  if (sameName) fail(`${c.code}: name "${c.name}" is also used by ${sameName}`);
  namesSeen.set(c.name, c.code);
  for (const text of [c.name, c.capital, ...c.languages]) {
    if (text.trim() === "" || /[&<>;()%]|\d/.test(text)) {
      fail(`${c.code}: suspicious text ${JSON.stringify(text)}`);
    }
  }
  if (!CONTINENTS.includes(c.continent) || c.continent === "Antarctica") {
    fail(`${c.code}: bad continent "${c.continent}"`);
  }
  if (Math.abs(c.capitalLat) > 90 || Math.abs(c.capitalLon) > 180) {
    fail(`${c.code}: capital coordinates out of range`);
  }
  if (c.languages.length < 1 || c.languages.length > MAX_LANGUAGES) {
    fail(
      `${c.code}: needs 1-${MAX_LANGUAGES} languages, has ${c.languages.length}`,
    );
  }
  if (new Set(c.languages).size !== c.languages.length)
    fail(`${c.code}: duplicate language`);
  if (
    c.currency &&
    (!/^[A-Z]{3}$/.test(c.currency.code) || c.currency.name.trim() === "")
  ) {
    fail(`${c.code}: bad currency ${JSON.stringify(c.currency)}`);
  }
  for (const neighbour of c.borders) {
    const other = byCode.get(neighbour);
    if (neighbour === c.code) fail(`${c.code}: borders itself`);
    else if (!other)
      fail(`${c.code}: border ${neighbour} is not a country in the list`);
    else if (!other.borders.includes(c.code)) {
      fail(
        `border asymmetry: ${c.code} lists ${neighbour} but ${neighbour} does not list ${c.code}`,
      );
    }
  }
}
const cityIds = new Set<string>();
for (const city of cities) {
  if (cityIds.has(city.id)) fail(`cities.yaml: duplicate id "${city.id}"`);
  cityIds.add(city.id);
  if (!byCode.has(city.country)) {
    fail(
      `cities.yaml "${city.id}": country ${city.country} is not a country in the list`,
    );
  }
}
exitIfErrors();

// ------------------------------------------------------------------ output

const used = new Set(countries.map((c) => c.continent));
const world = {
  snapshot: {
    source:
      "CIA World Factbook, as JSON from github.com/factbook/factbook.json (public domain)",
    version: `factbook.json@${factbook.commit.slice(0, 12)}`,
    supplements: [
      `github.com/mledoze/countries@${mledoze.commit.slice(0, 12)} (ODbL 1.0): borders, currency, list of sovereign states`,
      "data/source/overrides.yaml: hand corrections",
      "data/source/cities.yaml: hand-maintained cities",
    ],
  },
  continents: CONTINENTS.filter((name) => used.has(name)),
  countries,
  cities,
};

writeFileSync(outputPath, JSON.stringify(world, null, 2) + "\n");
console.log(
  `build-world: wrote data/world.json (${countries.length} countries, ${cities.length} cities)`,
);
