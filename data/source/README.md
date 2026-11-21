# Source snapshot for the world data

Everything in this directory is input to the two build scripts:

```
node scripts/build-world.ts   # -> data/world.json
node scripts/build-map.ts     # -> data/map.json      (or: npm run world:build)
```

The game never reads these files at run time, and nobody edits
`data/world.json` or `data/map.json` by hand. To correct the data, change
`overrides.yaml`, `cities.yaml` or the scripts and rebuild. The build is
deterministic: the same inputs give byte-identical output.

## Files

| File                                   | What it is                                                                           | Maintained                |
| -------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------- |
| `factbook-extract.json`                | Trimmed extract of the CIA World Factbook (251 country and territory profiles)       | generated, do not edit    |
| `mledoze-countries-extract.json`       | Trimmed extract of mledoze/countries (250 entries)                                   | generated, do not edit    |
| `ne_110m_admin_0_countries.geojson`    | Natural Earth 1:110m Admin 0 – Countries, verbatim                                   | downloaded, do not edit   |
| `ne_50m_admin_0_small-extract.geojson` | The 65 shapes of Natural Earth 1:50m Admin 0 – Countries that the 1:110m file lacks  | generated, do not edit    |
| `overrides.yaml`                       | Hand corrections applied by `build-world.ts`, each with its reason                   | by hand                   |
| `cities.yaml`                          | The cities the game knows                                                            | by hand                   |
| `fetch-sources.ts`                     | The one-off fetch step that produced the four vendored files above                   | by hand                   |

## Upstream sources

All four vendored files were fetched on 2026-11-20 by `fetch-sources.ts`, which
pins each upstream to an exact commit or tag.

### CIA World Factbook (primary source for `world.json`)

- Repository: <https://github.com/factbook/factbook.json>
- Commit: `144d6977b2b01ac1cbd220de754c0a005616760b` (2026-09-11)
- Downloaded from: `https://codeload.github.com/factbook/factbook.json/tar.gz/144d6977b2b01ac1cbd220de754c0a005616760b`
- Data vintage: the repository's last weekly data update is dated 2026-01-22
  ("auto-update week 4"). The CIA took the World Factbook offline in February
  2026, so this is in effect the final edition.
- Licence: public domain. The Factbook is a work of the US government; the
  factbook.json repository dedicates its JSON conversion to the public domain.
- Vendored as: `factbook-extract.json`. One object per profile, keyed by the
  Factbook's own two-letter GEC code (not ISO), holding only the nine text
  fields the build reads: region folder, conventional short and long name,
  capital name and coordinates, border countries, languages, exchange-rate
  currency line and internet country code. The text is untouched (HTML entities
  and all); cleaning happens in `build-world.ts`.

### mledoze/countries (supplement for `world.json`)

- Repository: <https://github.com/mledoze/countries>
- Commit: `5d15c0ff8c87ef2f1f8e944093522d4b2de2dd5b` (2026-11-17)
- Downloaded from: `https://raw.githubusercontent.com/mledoze/countries/5d15c0ff8c87ef2f1f8e944093522d4b2de2dd5b/countries.json`
- Licence: **Open Database License (ODbL) 1.0**. Unlike the other sources this
  one carries obligations: attribution, and share-alike for a database derived
  from it. `data/world.json` takes its borders and currencies from it and says
  so in its `snapshot.supplements` field. Anyone redistributing `world.json`
  should keep that attribution; whether the share-alike clause matters for the
  project is a question for whoever owns its licensing.
- Vendored as: `mledoze-countries-extract.json` (ISO codes, common name,
  internet domains, UN membership, region, borders, languages, currencies).
- Why it is needed: the Factbook's land-boundary, language and currency fields
  are free text. Borders are a list of English names with lengths and notes,
  and its currency codes are years out of date in places (it still gives ZWD,
  VEB, GHC, MZM, ZMK ...). mledoze/countries has both as structured ISO data.

### Natural Earth (source for `map.json`)

- Repository: <https://github.com/nvkelso/natural-earth-vector>
- Version: tag `v5.1.2`
- Downloaded from:
  - `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_admin_0_countries.geojson`
    (vendored verbatim; SHA-256
    `6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f`)
  - `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_0_countries.geojson`
    (3 MB, not vendored; see below)
- Licence: public domain (<https://www.naturalearthdata.com/about/terms-of-use/>).
- The 1:110m file has 177 shapes and no Cabo Verde, Singapore, Malta, Bahrain
  or other small states. `ne_50m_admin_0_small-extract.geojson` holds the 65
  features of the 1:50m file whose `ADM0_A3` code is absent from the 1:110m
  file, with properties trimmed to five and coordinates rounded to three
  decimals. With it, every country in `world.json` has a shape.

## Which field comes from where

`data/world.json`:

| Field                         | Source                                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| which states are listed       | mledoze/countries: `unMember` (193), plus `VA`, `PS`, `XK`, `TW`                                          |
| `code`                        | mledoze/countries (`cca2`)                                                                                |
| `name`                        | Factbook "conventional short form" (long form where it is "none")                                         |
| `capital`                     | Factbook capital name: first one listed, parentheticals dropped                                           |
| `capitalLat`, `capitalLon`    | Factbook capital coordinates (degrees and minutes, converted to decimal degrees, 2 decimals)              |
| `continent`                   | Factbook region folder, mapped to a continent                                                             |
| `languages`                   | Factbook languages text, parsed (falls back to mledoze/countries only if nothing parses; currently never) |
| `borders`                     | mledoze/countries (`borders`), restricted to the listed states                                            |
| `currency`                    | mledoze/countries (`currencies`); where it lists several, the one the Factbook quotes exchange rates in   |
| `cities`                      | `cities.yaml`                                                                                             |
| any of the above, corrected   | `overrides.yaml`                                                                                          |

The two sources are joined on the internet country code (`.pt`), the one
identifier they share; `overrides.yaml` settles the single ambiguous case.

`data/map.json`: geometry from Natural Earth; `code` is `ISO_A2_EH` (which has
France, Norway and Kosovo right where `ISO_A2` is `-99`).

## Conventions and judgement calls

- **Names** follow the Factbook: Cabo Verde, Czechia, Côte d'Ivoire, Eswatini,
  North Macedonia, Timor-Leste, Turkey, Sao Tome and Principe (the Factbook
  writes most names without diacritics). Overrides replace only names that are
  abbreviations, fragments or US-government usage (DRC, "The Dominican", Burma,
  West Bank, Holy See ...).
- **Capitals** of states with several: the first the Factbook lists, which is
  the administrative seat. Capital spellings are the Factbook's (Sanaa, Lome,
  Yaounde, but Brasília, Bogotá).
- **Continents**: Factbook "Middle East", "Central Asia", "South Asia" and
  "East & Southeast Asia" are Asia; "Central America and the Caribbean" is
  North America. So Turkey, the Caucasus states and Kazakhstan are Asia; Egypt
  is Africa; Cyprus is Europe; Russia is Europe and Papua New Guinea is
  Oceania (both overrides).
- **Languages**: official languages first, then others in the Factbook's order,
  at most six. Where the Factbook gives population shares, a non-official
  language under 5% is left out. Spellings are unified across countries through
  `languageAliases` in `overrides.yaml`.
- **Borders** are land borders between the 197 listed states only. Borders with
  territories are dropped, including those of a state's own overseas territory:
  France does not border Brazil (French Guiana), Denmark does not border Canada
  (Greenland, Hans Island), the UK does not border Spain (Gibraltar). Western
  Sahara is not a listed state, so Morocco and Mauritania do not border each
  other here (the Factbook, following US policy, says they do).
- **Map**: Northern Cyprus is drawn as part of `CY` and Somaliland as part of
  `SO`, matching the border data. Western Sahara (`EH`), Greenland (`GL`) and
  other territories are separate shapes with their own ISO code. Antarctica is
  left out. Countries too small for the scale are drawn as a 0.8-unit diamond.

## Refreshing the snapshot

1. Change the pinned commit or tag at the top of `fetch-sources.ts`.
2. `node data/source/fetch-sources.ts` (needs network, `curl` and `tar`).
3. `npm run world:build`. The build stops with a message for anything it can
   no longer parse or validate; fix it in `overrides.yaml` or the scripts.
4. Review the diff of `data/world.json` and `data/map.json`, and update the
   commits, dates and checksum in this file.
