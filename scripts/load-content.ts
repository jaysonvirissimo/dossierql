import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import type { RawContent } from "../src/content/catalog.ts";
import type { IntelFile } from "../src/content/records.ts";
import type { Mission, World } from "../src/content/types.ts";

const root = fileURLToPath(new URL("..", import.meta.url));

function yaml(path: string): unknown {
  return parse(readFileSync(join(root, path), "utf8"));
}

function directory(path: string): { file: string; data: unknown }[] {
  return readdirSync(join(root, path))
    .filter((name) => /\.ya?ml$/.test(name))
    .sort()
    .map((name) => ({
      file: `${path}/${name}`,
      data: yaml(`${path}/${name}`),
    }));
}

export interface LoadedContent {
  raw: RawContent;
  /** The file each mission came from, for error messages. */
  missionFiles: { file: string; data: unknown }[];
}

/** Reads the content directory from disk, for scripts and tests. */
export function loadContent(): LoadedContent {
  const missionFiles = directory("content/missions");
  return {
    missionFiles,
    raw: {
      missions: missionFiles.map((m) => m.data as Mission),
      intel: directory("content/intel").map((f) => f.data as IntelFile),
      glossary: yaml("content/glossary.yaml") as RawContent["glossary"],
      concepts: yaml("content/concepts.yaml") as RawContent["concepts"],
      campaigns: yaml("content/campaigns.yaml") as RawContent["campaigns"],
      world: JSON.parse(
        readFileSync(join(root, "data/world.json"), "utf8"),
      ) as World,
    },
  };
}
