import world from "../../data/world.json";
import { buildStore } from "./catalog.ts";
import type { IntelFile } from "./records.ts";
import type { World } from "./types.ts";

/**
 * The world data, the intelligence records and the GraphQL engine. This
 * module is loaded on demand, when a mission opens (SDD 4.3).
 */
const files = import.meta.glob<{ default: IntelFile }>(
  "../../content/intel/*.yaml",
  { eager: true },
);

export const archiveWorld = world as World;
export const archiveStore = buildStore(
  archiveWorld,
  Object.keys(files)
    .sort()
    .map((key) => (files[key] as { default: IntelFile }).default),
);
