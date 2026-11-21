import { fullSchema } from "../graphql/schema.ts";
import { Store } from "../graphql/store.ts";
import { intelRecords, worldRecords, type IntelFile } from "./records.ts";
import type {
  Campaign,
  ConceptCard,
  GlossaryEntry,
  Mission,
  World,
} from "./types.ts";

export interface RawContent {
  missions: Mission[];
  intel: IntelFile[];
  glossary: GlossaryEntry[];
  concepts: ConceptCard[];
  campaigns: Campaign[];
  world: World;
}

/** Everything the game plays from: the course, the reference, the archive. */
export interface Catalog extends RawContent {
  store: Store;
}

export function buildCatalog(raw: RawContent): Catalog {
  const missions = [...raw.missions].sort(
    (a, b) =>
      a.clearance - b.clearance ||
      (a.kind === b.kind ? a.order - b.order : a.kind === "teaching" ? -1 : 1),
  );
  const store = new Store(
    [...worldRecords(raw.world), ...intelRecords(raw.intel)],
    fullSchema(),
  );
  return { ...raw, missions, store };
}

/** A short stable fingerprint of a mission, stored with saves (SDD 7.4). */
export function contentVersion(mission: Mission): string {
  const text = JSON.stringify(mission);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}
