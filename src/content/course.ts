import campaigns from "../../content/campaigns.yaml";
import concepts from "../../content/concepts.yaml";
import drills from "../../content/drills.yaml";
import katas from "../../content/katas.yaml";
import glossary from "../../content/glossary.yaml";
import { sortMissions } from "./order.ts";
import type {
  Campaign,
  ConceptCard,
  Drill,
  Kata,
  GlossaryEntry,
  Mission,
  MissionSummary,
} from "./types.ts";

/**
 * Missions are discovered from the content directory. There is no separate
 * list to keep in step with the files (SDD 5.6). The first screen loads only
 * what the assignments desk shows of each mission. Its stages and debrief
 * load when the case or its debrief opens (SDD 4.3).
 */
const summaries = import.meta.glob<{
  default: MissionSummary;
  version: string;
}>("../../content/missions/*.yaml", { eager: true, query: "?summary" });
const bodies = import.meta.glob<Mission>("../../content/missions/*.yaml", {
  import: "default",
});

const loaders = new Map<string, () => Promise<Mission>>();
const versions: Record<string, string> = {};
for (const [path, file] of Object.entries(summaries)) {
  const load = bodies[path];
  if (load) loaders.set(file.default.id, load);
  versions[file.default.id] = file.version;
}

export interface Course {
  missions: MissionSummary[];
  /** The fingerprint of each whole mission, by id, stored with saves. */
  versions: Readonly<Record<string, string>>;
  glossary: GlossaryEntry[];
  concepts: ConceptCard[];
  campaigns: Campaign[];
  drills: Drill[];
  katas: Kata[];
}

export const course: Course = {
  missions: sortMissions(Object.values(summaries).map((file) => file.default)),
  versions,
  glossary: glossary as GlossaryEntry[],
  concepts: concepts as ConceptCard[],
  campaigns: campaigns as Campaign[],
  drills: drills as Drill[],
  katas: katas as Kata[],
};

const loading = new Map<string, Promise<Mission>>();

/**
 * The whole mission, stages and debrief included. The same promise is
 * returned for every call with the same id, so a screen can wait on it.
 */
export function loadMission(id: string): Promise<Mission> {
  let promise = loading.get(id);
  if (!promise) {
    const load = loaders.get(id);
    promise = load
      ? load()
      : Promise.reject(new Error(`No mission is filed as "${id}".`));
    loading.set(id, promise);
  }
  return promise;
}
