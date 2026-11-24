import type { Plugin } from "vite";
import { parse } from "yaml";
import { contentVersion } from "../src/content/order.ts";
import type { Mission, MissionSummary } from "../src/content/types.ts";

/** The parts of a mission that only the workspace and the debrief read. */
const BODY = ["stages", "debrief", "startingStage"];

/**
 * What the assignments desk shows of a mission, and the fingerprint of the
 * whole mission that saves are kept against (SDD 7.4).
 */
export function missionSummary(mission: Mission): {
  summary: MissionSummary;
  version: string;
} {
  const summary = Object.fromEntries(
    Object.entries(mission).filter(([key]) => !BODY.includes(key)),
  ) as MissionSummary;
  return { summary, version: contentVersion(mission) };
}

/**
 * Turns YAML files into JSON modules at build time, so mission content is
 * authored as YAML and no YAML parser ships to the browser.
 *
 * Imported with `?summary`, a mission file yields only what the assignments
 * desk shows, and the fingerprint of the whole mission that saves are kept
 * against (SDD 4.3, 7.4). The rest loads with the case.
 */
export function yamlContent(): Plugin {
  return {
    name: "dossierql-yaml",
    transform(code, id) {
      const [path = "", query = ""] = id.split("?");
      if (!/\.ya?ml$/.test(path)) return null;
      const data: unknown = parse(code);
      if (new URLSearchParams(query).has("summary")) {
        const { summary, version } = missionSummary(data as Mission);
        return {
          code: `export default ${JSON.stringify(summary)};\nexport const version = ${JSON.stringify(version)};`,
          map: null,
        };
      }
      return {
        code: `export default ${JSON.stringify(data)};`,
        map: null,
      };
    },
  };
}
