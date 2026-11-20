// One-off fetch step: downloads the pinned upstream sources and writes the
// trimmed, vendored extracts that scripts/build-world.ts and
// scripts/build-map.ts read. It is NOT part of the normal build; run it only
// to refresh the snapshot (bump the pins below, re-run, review the diff, and
// update README.md in this directory).
//
//   node data/source/fetch-sources.ts
//
// Needs network access plus `curl` and `tar` on the PATH. Output is
// deterministic for a given set of pins.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FACTBOOK_COMMIT = '144d6977b2b01ac1cbd220de754c0a005616760b';
const MLEDOZE_COMMIT = '5d15c0ff8c87ef2f1f8e944093522d4b2de2dd5b';
const NATURAL_EARTH_TAG = 'v5.1.2';

const FACTBOOK_URL = `https://codeload.github.com/factbook/factbook.json/tar.gz/${FACTBOOK_COMMIT}`;
const MLEDOZE_URL = `https://raw.githubusercontent.com/mledoze/countries/${MLEDOZE_COMMIT}/countries.json`;
const NE_BASE = `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/${NATURAL_EARTH_TAG}/geojson`;

const here = dirname(fileURLToPath(import.meta.url));
const work = mkdtempSync(join(tmpdir(), 'dossierql-sources-'));

function curl(url: string, dest: string): void {
  execFileSync('curl', ['-sSfL', '--retry', '3', '-o', dest, url], { stdio: 'inherit' });
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = sortKeys((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

function writeJson(name: string, value: unknown, pretty: boolean): void {
  const text = pretty ? JSON.stringify(value, null, 2) : JSON.stringify(value);
  writeFileSync(join(here, name), text + '\n');
  console.log(`wrote ${name} (${text.length + 1} bytes)`);
}

type Json = Record<string, any>;

// ---------------------------------------------------------------- Factbook
// Regions that hold country profiles. `world`, `oceans`, `antarctica` and
// `meta` are not countries and are skipped.
const FACTBOOK_REGIONS = [
  'africa',
  'australia-oceania',
  'central-america-n-caribbean',
  'central-asia',
  'east-n-southeast-asia',
  'europe',
  'middle-east',
  'north-america',
  'south-america',
  'south-asia',
];

function text(node: unknown): string | null {
  if (node && typeof node === 'object' && typeof (node as Json).text === 'string') {
    return (node as Json).text;
  }
  return null;
}

function fetchFactbook(): void {
  const tarball = join(work, 'factbook.tar.gz');
  const dir = join(work, 'factbook');
  curl(FACTBOOK_URL, tarball);
  execFileSync('mkdir', ['-p', dir]);
  execFileSync('tar', ['xzf', tarball, '-C', dir, '--strip-components=1']);

  const entries: Json = {};
  for (const region of FACTBOOK_REGIONS) {
    for (const file of readdirSync(join(dir, region)).sort()) {
      if (!file.endsWith('.json')) continue;
      const profile: Json = JSON.parse(readFileSync(join(dir, region, file), 'utf8'));
      const government: Json = profile['Government'] ?? {};
      const names: Json = government['Country name'] ?? {};
      const capital: Json = government['Capital'] ?? {};
      const languages: Json = profile['People and Society']?.['Languages'] ?? {};
      entries[file.replace(/\.json$/, '')] = {
        region,
        shortName: text(names['conventional short form']),
        longName: text(names['conventional long form']),
        capital: text(capital['name']),
        capitalCoordinates: text(capital['geographic coordinates']),
        borderCountries: text(profile['Geography']?.['Land boundaries']?.['border countries']),
        // The language list sits either directly on the field or one level down.
        languages: text(languages) ?? text(languages['Languages']),
        exchangeRateCurrency: text(profile['Economy']?.['Exchange rates']?.['Currency']),
        internetCountryCode: text(profile['Communications']?.['Internet country code']),
      };
    }
  }
  writeJson(
    'factbook-extract.json',
    sortKeys({
      source: 'https://github.com/factbook/factbook.json',
      commit: FACTBOOK_COMMIT,
      entries,
    }),
    true,
  );
}

// ----------------------------------------------------------------- mledoze
function fetchMledoze(): void {
  const file = join(work, 'countries.json');
  curl(MLEDOZE_URL, file);
  const all: Json[] = JSON.parse(readFileSync(file, 'utf8'));
  const countries = all
    .map((c) => ({
      cca2: c.cca2,
      cca3: c.cca3,
      name: c.name.common,
      tld: c.tld,
      unMember: c.unMember,
      independent: c.independent,
      region: c.region,
      subregion: c.subregion,
      borders: c.borders,
      languages: c.languages,
      currencies: Object.fromEntries(
        Object.entries(c.currencies as Json).map(([code, v]) => [code, (v as Json).name]),
      ),
    }))
    .sort((a, b) => (a.cca2 < b.cca2 ? -1 : 1));
  writeJson(
    'mledoze-countries-extract.json',
    { source: 'https://github.com/mledoze/countries', commit: MLEDOZE_COMMIT, countries },
    true,
  );
}

// ----------------------------------------------------------- Natural Earth
function fetchNaturalEarth(): void {
  // 1:110m is vendored verbatim.
  curl(
    `${NE_BASE}/ne_110m_admin_0_countries.geojson`,
    join(here, 'ne_110m_admin_0_countries.geojson'),
  );
  console.log('wrote ne_110m_admin_0_countries.geojson');

  // 1:110m leaves out about 65 small states and territories (Cabo Verde, Singapore,
  // Malta ...). Vendor just those shapes from 1:50m, trimmed to the properties
  // build-map.ts reads and with coordinates rounded to 3 decimals.
  const small: Json = JSON.parse(
    readFileSync(join(here, 'ne_110m_admin_0_countries.geojson'), 'utf8'),
  );
  const have = new Set(small.features.map((f: Json) => f.properties.ADM0_A3));
  const file = join(work, 'ne50.geojson');
  curl(`${NE_BASE}/ne_50m_admin_0_countries.geojson`, file);
  const medium: Json = JSON.parse(readFileSync(file, 'utf8'));
  const round = (v: unknown): unknown =>
    Array.isArray(v) ? v.map(round) : Math.round((v as number) * 1000) / 1000;
  const features = medium.features
    .filter((f: Json) => !have.has(f.properties.ADM0_A3))
    .map((f: Json) => ({
      type: 'Feature',
      properties: {
        ADM0_A3: f.properties.ADM0_A3,
        ISO_A2: f.properties.ISO_A2,
        ISO_A2_EH: f.properties.ISO_A2_EH,
        NAME: f.properties.NAME,
        TYPE: f.properties.TYPE,
      },
      geometry: { type: f.geometry.type, coordinates: round(f.geometry.coordinates) },
    }))
    .sort((a: Json, b: Json) => (a.properties.ADM0_A3 < b.properties.ADM0_A3 ? -1 : 1));
  const lines = features.map((f: Json) => JSON.stringify(f));
  writeFileSync(
    join(here, 'ne_50m_admin_0_small-extract.geojson'),
    `{"type":"FeatureCollection","source":"https://github.com/nvkelso/natural-earth-vector",` +
      `"version":"${NATURAL_EARTH_TAG.replace(/^v/, '')}","features":[\n${lines.join(',\n')}\n]}\n`,
  );
  console.log(`wrote ne_50m_admin_0_small-extract.geojson (${features.length} features)`);
}

try {
  fetchFactbook();
  fetchMledoze();
  fetchNaturalEarth();
} finally {
  rmSync(work, { recursive: true, force: true });
}
