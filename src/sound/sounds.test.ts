import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SOUND_FILES } from "./cues.ts";

const served = new URL("../../public/sounds/", import.meta.url);
const library = new URL(
  "../../node_modules/button-sounds/assets/",
  import.meta.url,
);

describe("the sounds of the desk (SDD 8.1)", () => {
  it("serves exactly the files the cues play, with the library's licence", () => {
    const files = readdirSync(served)
      .filter((name) => name.endsWith(".mp3"))
      .sort();
    expect(files).toEqual(SOUND_FILES);
    expect(readdirSync(served)).toContain("LICENSE.txt");
  });

  it("serves the library's own recordings, unchanged", () => {
    for (const file of SOUND_FILES) {
      expect(
        readFileSync(new URL(file, served)).equals(
          readFileSync(new URL(file, library)),
        ),
        file,
      ).toBe(true);
    }
  });
});
