import type { RawRecord } from "../graphql/store.ts";
import type { World } from "./types.ts";

export function slug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** The geographical records, from the generated world snapshot. */
export function worldRecords(world: World): RawRecord[] {
  const records: RawRecord[] = [];
  const languages = new Map<string, string>();
  const currencies = new Map<string, string>();
  for (const name of world.continents) {
    records.push({ type: "Continent", id: slug(name), name });
  }
  for (const country of world.countries) {
    for (const language of country.languages) {
      languages.set(slug(language), language);
    }
    if (country.currency) {
      currencies.set(country.currency.code, country.currency.name);
    }
    records.push({
      type: "Country",
      id: country.code,
      code: country.code,
      name: country.name,
      capital: country.capital,
      continent: slug(country.continent),
      borders: country.borders,
      languages: country.languages.map(slug),
      currency: country.currency?.code ?? null,
    });
  }
  for (const [id, name] of languages) {
    records.push({ type: "Language", id, name });
  }
  for (const [code, name] of currencies) {
    records.push({ type: "Currency", id: code, code, name });
  }
  for (const city of world.cities) {
    records.push({
      type: "City",
      id: city.id,
      name: city.name,
      country: city.country,
    });
  }
  return records;
}

/** Intelligence files group records by type and key them by identifier. */
export type IntelFile = Record<string, Record<string, Record<string, unknown>>>;

export function intelRecords(files: readonly IntelFile[]): RawRecord[] {
  return files.flatMap((file) =>
    Object.entries(file).flatMap(([type, table]) =>
      Object.entries(table).map(([id, fields]) => ({ ...fields, type, id })),
    ),
  );
}
