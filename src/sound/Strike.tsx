import { useEffect } from "react";
import type { CueName } from "./cues.ts";
import { strike } from "./sound.ts";

/**
 * Strikes a cue once when it first appears, as a stamp comes down on the
 * page (SDD 8.1). It renders nothing. `after` waits that many milliseconds,
 * so that a second stamp lands after the first.
 */
export function Strike({ cue, after = 0 }: { cue: CueName; after?: number }) {
  useEffect(() => {
    const timer = window.setTimeout(() => strike(cue), after);
    return () => window.clearTimeout(timer);
  }, [cue, after]);
  return null;
}
