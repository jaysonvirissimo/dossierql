import { CUES, type Cue, type CueName } from "./cues.ts";

/**
 * Plays the sounds of the desk (SDD 8.1). The library, and Howler behind it,
 * load on demand the first time a sound is wanted, so the first screen does
 * not wait for them. Nothing here may get in the way of play: a sound that
 * cannot load or play is skipped without a word.
 */

type Library = typeof import("button-sounds");

const VOLUME = 0.3;
const PITCH_VARIATION = 0.08;

let enabled = false;
let library: Promise<Library> | null = null;

function load(): Promise<Library> {
  library ??= import("button-sounds").then((sounds) => {
    // The sounds are served from the game's own origin (SDD 4.3), so the
    // path is set before any sound is loaded.
    sounds.setPath(new URL("sounds/", document.baseURI).href);
    return sounds;
  });
  return library;
}

export function setSoundEnabled(on: boolean): void {
  enabled = on;
}

export function soundEnabled(): boolean {
  return enabled;
}

/** Plays the press or the release half of a cue. */
export function cue(name: CueName, phase: "press" | "release"): void {
  if (!enabled) return;
  const { sound, lofi }: Cue = CUES[name];
  const playbackRate = 1 + (Math.random() * 2 - 1) * PITCH_VARIATION;
  load()
    .then((sounds) => {
      sounds[phase](sound, {
        volume: VOLUME,
        playbackRate,
        lofi: lofi === true,
      });
    })
    .catch(() => undefined);
}

/** Presses and releases a cue that no hand is holding, such as a stamp. */
export function strike(name: CueName, held = 120): void {
  cue(name, "press");
  window.setTimeout(() => cue(name, "release"), held);
}

/**
 * Turns sound on at once and clicks the switch. A switch pressed while sound
 * was off made no sound of its own, so it is heard as it comes on.
 */
export function switchSoundOn(): void {
  enabled = true;
  strike("toggle-on");
}
