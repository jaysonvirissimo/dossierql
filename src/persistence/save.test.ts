import { describe, expect, it } from "vitest";
import type { MissionState } from "../engine/mission.ts";
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  loadSave,
  PREFS_KEY,
  resetProgress,
  SAVE_KEY,
  writePreferences,
  writeSave,
  type SaveData,
} from "./save.ts";
import { memoryStorage, type StorageAdapter } from "./storage.ts";

const versions = { azulejos: "v2" };
const state = { missionId: "azulejos" } as MissionState;

function saved(save: unknown): StorageAdapter {
  const storage = memoryStorage();
  storage.write(SAVE_KEY, JSON.stringify(save));
  return storage;
}

describe("loadSave", () => {
  it("starts fresh when nothing is stored", () => {
    expect(loadSave(memoryStorage(), versions).note).toBe("fresh");
  });

  it("round-trips progress and investigations", () => {
    const storage = memoryStorage();
    const save: SaveData = {
      format: 1,
      events: [{ type: "solution-viewed", missionId: "azulejos" }],
      investigations: { azulejos: { contentVersion: "v2", state } },
    };
    expect(writeSave(storage, save)).toBe(true);
    expect(loadSave(storage, versions)).toEqual({
      save,
      note: "loaded",
      restarted: [],
    });
  });

  it("brings an older format forward one step at a time", () => {
    const storage = saved({ format: 0, log: [] });
    const loaded = loadSave(storage, versions, {
      0: (older) => ({ format: 1, events: older.log, investigations: {} }),
    });
    expect(loaded.note).toBe("migrated");
    expect(loaded.save.format).toBe(1);
  });

  it("does not guess at a format it has no migration for, or a newer one", () => {
    expect(loadSave(saved({ format: 0 }), versions).note).toBe("unreadable");
    expect(loadSave(saved({ format: 99 }), versions).note).toBe("too-new");
    const junk = memoryStorage();
    junk.write(SAVE_KEY, "{not json");
    expect(loadSave(junk, versions).note).toBe("unreadable");
  });

  it("restarts an investigation whose mission has changed, and keeps the record", () => {
    const events = [
      { type: "completed", missionId: "azulejos", mode: "hinted", late: false },
    ];
    const loaded = loadSave(
      saved({
        format: 1,
        events,
        investigations: { azulejos: { contentVersion: "v1", state } },
      }),
      versions,
    );
    expect(loaded.restarted).toEqual(["azulejos"]);
    expect(loaded.save.investigations).toEqual({});
    expect(loaded.save.events).toEqual(events);
  });
});

describe("storage that is unavailable", () => {
  const broken: StorageAdapter = {
    durable: false,
    read: () => null,
    write: () => false,
    remove: () => undefined,
  };

  it("leaves the game playable and reports that nothing was written", () => {
    expect(loadSave(broken, versions).note).toBe("fresh");
    expect(writeSave(broken, loadSave(broken, versions).save)).toBe(false);
    expect(loadPreferences(broken)).toEqual(DEFAULT_PREFERENCES);
  });
});

describe("preferences", () => {
  it("are stored apart from progress and survive a reset", () => {
    const storage = saved({ format: 1, events: [], investigations: {} });
    writePreferences(storage, {
      motion: "reduced",
      orientationSeen: true,
      vim: true,
    });
    expect(resetProgress(storage).events).toEqual([]);
    expect(storage.read(SAVE_KEY)).toBeNull();
    expect(storage.read(PREFS_KEY)).not.toBeNull();
    expect(loadPreferences(storage)).toEqual({
      motion: "reduced",
      orientationSeen: true,
      vim: true,
    });
  });

  it("keep Vim keybindings off through a reset when they were off", () => {
    const storage = saved({ format: 1, events: [], investigations: {} });
    expect(loadPreferences(storage).vim).toBe(false);
    writePreferences(storage, { ...DEFAULT_PREFERENCES, vim: false });
    resetProgress(storage);
    expect(loadPreferences(storage).vim).toBe(false);
  });

  it("read a stored Vim value that is not true as off", () => {
    const storage = saved({ format: 1, events: [], investigations: {} });
    storage.write(PREFS_KEY, JSON.stringify({ vim: "yes" }));
    expect(loadPreferences(storage).vim).toBe(false);
  });
});
