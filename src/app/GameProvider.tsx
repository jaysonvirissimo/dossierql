import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { course, type Course } from "../content/course.ts";
import {
  deriveStanding,
  type ProgressEvent,
  type Standing,
} from "../engine/clearance.ts";
import type { MissionState } from "../engine/mission.ts";
import {
  loadPreferences,
  loadSave,
  resetProgress,
  writePreferences,
  writeSave,
  type LoadNote,
  type Preferences,
  type SaveData,
} from "../persistence/save.ts";
import { browserStorage, type StorageAdapter } from "../persistence/storage.ts";

export interface Game {
  course: Course;
  standing: Standing;
  save: SaveData;
  preferences: Preferences;
  /** False when nothing will be remembered after this visit. */
  remembers: boolean;
  loadNote: LoadNote;
  /** Missions that restarted because their content changed. */
  restarted: string[];
  /** Stores a mission's state, or clears it with null, and records events. */
  commit(
    missionId: string,
    state: MissionState | null,
    events?: readonly ProgressEvent[],
  ): void;
  /** Records events that belong to no investigation, such as a drill. */
  record(events: readonly ProgressEvent[]): void;
  setPreferences(preferences: Preferences): void;
  reset(): void;
}

const GameContext = createContext<Game | null>(null);

const WRITE_DELAY_MS = 300;

export function GameProvider({
  children,
  storage: given,
}: {
  children: ReactNode;
  storage?: StorageAdapter;
}) {
  const [storage] = useState(() => given ?? browserStorage());
  const versions = course.versions;
  const [loaded] = useState(() => loadSave(storage, versions));
  const [save, setSave] = useState(loaded.save);
  const [preferences, setPrefs] = useState(() => loadPreferences(storage));
  const [remembers, setRemembers] = useState(
    storage.durable && loaded.note !== "too-new",
  );

  // Writes are batched so that typing in the editor does not hit storage
  // on every keystroke, and flushed when the page is hidden.
  const pending = useRef<SaveData | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const flush = useCallback(() => {
    window.clearTimeout(timer.current);
    if (pending.current && loaded.note !== "too-new") {
      const written = writeSave(storage, pending.current);
      if (!written) setRemembers(false);
    }
    pending.current = null;
  }, [storage, loaded.note]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [flush]);

  const schedule = useCallback(
    (next: SaveData, now: boolean) => {
      pending.current = next;
      window.clearTimeout(timer.current);
      if (now) flush();
      else timer.current = window.setTimeout(flush, WRITE_DELAY_MS);
    },
    [flush],
  );

  const commit = useCallback<Game["commit"]>(
    (missionId, state, events = []) => {
      setSave((current) => {
        const investigations = { ...current.investigations };
        if (state === null) delete investigations[missionId];
        else {
          investigations[missionId] = {
            contentVersion: versions[missionId] ?? "",
            state,
          };
        }
        const next: SaveData = {
          ...current,
          events: events.length
            ? [...current.events, ...events]
            : current.events,
          investigations,
        };
        schedule(next, events.length > 0 || state === null);
        return next;
      });
    },
    [schedule, versions],
  );

  const record = useCallback<Game["record"]>(
    (events) => {
      setSave((current) => {
        const next: SaveData = {
          ...current,
          events: [...current.events, ...events],
        };
        schedule(next, true);
        return next;
      });
    },
    [schedule],
  );

  const setPreferences = useCallback(
    (next: Preferences) => {
      setPrefs(next);
      writePreferences(storage, next);
    },
    [storage],
  );

  const reset = useCallback(() => {
    pending.current = null;
    window.clearTimeout(timer.current);
    setSave(resetProgress(storage));
  }, [storage]);

  useEffect(() => {
    if (preferences.motion === "reduced") {
      document.documentElement.dataset.motion = "reduced";
    } else {
      delete document.documentElement.dataset.motion;
    }
  }, [preferences.motion]);

  const standing = useMemo(
    () => deriveStanding(course.missions, save.events),
    [save.events],
  );

  const game = useMemo<Game>(
    () => ({
      course,
      standing,
      save,
      preferences,
      remembers,
      loadNote: loaded.note,
      restarted: loaded.restarted,
      commit,
      record,
      setPreferences,
      reset,
    }),
    [
      standing,
      save,
      preferences,
      remembers,
      loaded,
      commit,
      record,
      setPreferences,
      reset,
    ],
  );

  return <GameContext.Provider value={game}>{children}</GameContext.Provider>;
}

export function useGame(): Game {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGame needs a GameProvider.");
  return game;
}
