import { fullSchema } from "../graphql/schema.ts";
import { Store } from "../graphql/store.ts";
import { sortMissions } from "./order.ts";
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

export function buildStore(world: World, intel: readonly IntelFile[]): Store {
  return new Store(
    [...worldRecords(world), ...intelRecords(intel)],
    fullSchema(),
  );
}

export function buildCatalog(raw: RawContent): Catalog {
  return {
    ...raw,
    missions: sortMissions(raw.missions),
    store: buildStore(raw.world, raw.intel),
  };
}
