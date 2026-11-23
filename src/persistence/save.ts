import type { ProgressEvent } from "../engine/clearance.ts";
import type { MissionState } from "../engine/mission.ts";
import type { StorageAdapter } from "./storage.ts";

export const SAVE_FORMAT = 1;
export const SAVE_KEY = "dossierql:save";
export const PREFS_KEY = "dossierql:prefs";

export interface Investigation {
  /** The mission content this state was played against. */
  contentVersion: string;
  state: MissionState;
}

/**
 * What happened, in order, and the investigations in progress. No rank is
 * stored: clearance and concept cards are derived by replaying the events.
 */
export interface SaveData {
  format: number;
  events: ProgressEvent[];
  investigations: Record<string, Investigation>;
}

export interface Preferences {
  motion: "system" | "reduced";
  orientationSeen: boolean;
  /** Vim keybindings in every code editor (SDD 8.2). */
  vim: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  motion: "system",
  orientationSeen: false,
  vim: false,
};

export function emptySave(): SaveData {
  return { format: SAVE_FORMAT, events: [], investigations: {} };
}

/** One step from an older save format to the next. */
export type Migration = (
  older: Record<string, unknown>,
) => Record<string, unknown>;

/** Keyed by the format a migration reads. None are needed yet. */
export const MIGRATIONS: Readonly<Record<number, Migration>> = {};

export type LoadNote =
  "fresh" | "loaded" | "migrated" | "unreadable" | "too-new";

export interface Loaded {
  save: SaveData;
  note: LoadNote;
  /** Missions whose content changed, so their investigations restart. */
  restarted: string[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Reads saved progress. Older formats are brought forward one step at a
 * time. An investigation whose mission has since changed is dropped, so it
 * restarts instead of loading state that no longer fits.
 */
export function loadSave(
  storage: StorageAdapter,
  versions: Readonly<Record<string, string>>,
  migrations: Readonly<Record<number, Migration>> = MIGRATIONS,
): Loaded {
  const text = storage.read(SAVE_KEY);
  if (text === null) return { save: emptySave(), note: "fresh", restarted: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { save: emptySave(), note: "unreadable", restarted: [] };
  }
  if (!isObject(parsed) || typeof parsed.format !== "number") {
    return { save: emptySave(), note: "unreadable", restarted: [] };
  }
  if (parsed.format > SAVE_FORMAT) {
    return { save: emptySave(), note: "too-new", restarted: [] };
  }
  let current = parsed;
  let note: LoadNote = "loaded";
  while ((current.format as number) < SAVE_FORMAT) {
    const step = migrations[current.format as number];
    if (!step) return { save: emptySave(), note: "unreadable", restarted: [] };
    current = step(current);
    note = "migrated";
  }
  if (!Array.isArray(current.events) || !isObject(current.investigations)) {
    return { save: emptySave(), note: "unreadable", restarted: [] };
  }
  const investigations: Record<string, Investigation> = {};
  const restarted: string[] = [];
  for (const [id, value] of Object.entries(current.investigations)) {
    const investigation = value as Investigation;
    if (
      versions[id] !== undefined &&
      versions[id] === investigation.contentVersion
    ) {
      investigations[id] = investigation;
    } else {
      restarted.push(id);
    }
  }
  return {
    save: {
      format: SAVE_FORMAT,
      events: current.events as ProgressEvent[],
      investigations,
    },
    note,
    restarted,
  };
}

export function writeSave(storage: StorageAdapter, save: SaveData): boolean {
  return storage.write(SAVE_KEY, JSON.stringify(save));
}

export function loadPreferences(storage: StorageAdapter): Preferences {
  try {
    const parsed: unknown = JSON.parse(storage.read(PREFS_KEY) ?? "null");
    if (!isObject(parsed)) return DEFAULT_PREFERENCES;
    return {
      motion: parsed.motion === "reduced" ? "reduced" : "system",
      orientationSeen: parsed.orientationSeen === true,
      vim: parsed.vim === true,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function writePreferences(
  storage: StorageAdapter,
  preferences: Preferences,
): void {
  storage.write(PREFS_KEY, JSON.stringify(preferences));
}

/** Clears progress. Preferences are stored apart and are kept. */
export function resetProgress(storage: StorageAdapter): SaveData {
  storage.remove(SAVE_KEY);
  return emptySave();
}
