import type { SoundName } from "button-sounds";

/**
 * The sounds of the desk (SDD 8.1). Each cue is one of the recorded switches
 * of the button-sounds library, served from the game's own `sounds/` folder.
 * The three cues that mark the case moving on — travel, the stamp and a
 * promotion — are bit-crushed, for the crunch of an old office computer.
 */
export interface Cue {
  sound: SoundName;
  lofi?: boolean;
}

export const CUES = {
  click: { sound: "uhk-soft" },
  primary: { sound: "hi75-hard" },
  transmit: { sound: "kvm-switch" },
  "rule-out": { sound: "camera-latch" },
  "field-check": { sound: "popper-dice" },
  travel: { sound: "lock-open", lofi: true },
  danger: { sound: "sd-metallic" },
  "toggle-on": { sound: "guitar-toggle-on" },
  "toggle-off": { sound: "guitar-toggle-off" },
  stamp: { sound: "low-thumps", lofi: true },
  promotion: { sound: "synth-on", lofi: true },
} as const satisfies Record<string, Cue>;

export type CueName = keyof typeof CUES;

export function isCueName(name: string | undefined): name is CueName {
  return name !== undefined && Object.hasOwn(CUES, name);
}

/** Every sound file the game serves, for the build check and the copy. */
export const SOUND_FILES: readonly string[] = [
  ...new Set(Object.values(CUES).map((cue) => `${cue.sound}.mp3`)),
].sort();
