import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { readFileSync } from "node:fs";
import { missionSummary } from "../../build/yaml-plugin.ts";
import { loadContent } from "../../scripts/load-content.ts";
import { contentVersion } from "./order.ts";

// The mission files as the validator reads them, straight from disk.
const missions = loadContent().raw.missions;

describe("missionSummary", () => {
  it("keeps everything but the stages and the debrief", () => {
    for (const mission of missions) {
      const { stages, debrief, startingStage, ...rest } = mission;
      void [stages, debrief, startingStage];
      expect(missionSummary(mission).summary).toEqual(rest);
    }
  });

  // A save is kept only while this fingerprint matches (SDD 7.4). The game
  // used to compute it from the whole mission module in the browser, so the
  // build must compute the same value or every case in progress restarts.
  it("fingerprints the whole mission, as the browser did", () => {
    for (const mission of missions) {
      expect(missionSummary(mission).version).toBe(contentVersion(mission));
    }
  });

  it("matches what the YAML plugin parses from the file", () => {
    const text = readFileSync(
      new URL(
        "../../content/missions/01-vanishing-azulejos.yaml",
        import.meta.url,
      ),
      "utf8",
    );
    const azulejos = missions.find((m) => m.id === "vanishing-azulejos");
    expect(missionSummary(parse(text)).version).toBe(contentVersion(azulejos!));
  });
});
