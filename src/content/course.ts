import campaigns from "../../content/campaigns.yaml";
import concepts from "../../content/concepts.yaml";
import drills from "../../content/drills.yaml";
import glossary from "../../content/glossary.yaml";
import { sortMissions } from "./order.ts";
import type {
  Campaign,
  ConceptCard,
  Drill,
  GlossaryEntry,
  Mission,
} from "./types.ts";

/**
 * Missions are discovered from the content directory. There is no separate
 * list to keep in step with the files (SDD 5.6).
 */
const files = import.meta.glob<{ default: Mission }>(
  "../../content/missions/*.yaml",
  { eager: true },
);

export interface Course {
  missions: Mission[];
  glossary: GlossaryEntry[];
  concepts: ConceptCard[];
  campaigns: Campaign[];
  drills: Drill[];
}

export const course: Course = {
  missions: sortMissions(Object.values(files).map((file) => file.default)),
  glossary: glossary as GlossaryEntry[],
  concepts: concepts as ConceptCard[],
  campaigns: campaigns as Campaign[],
  drills: drills as Drill[],
};
