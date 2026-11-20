import { useState } from "react";
import { useGame } from "../app/GameProvider.tsx";

export function SettingsRoute() {
  const { preferences, setPreferences, reset, save, remembers } = useGame();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const hasProgress =
    save.events.length > 0 || Object.keys(save.investigations).length > 0;

  return (
    <main className="page">
      <article className="paper sheet">
        <div className="sheet__body">
          <p className="label">Preferences</p>
          <h1>Settings</h1>

          <section aria-labelledby="motion-title">
            <h2 id="motion-title">Motion</h2>
            <label className="check">
              <input
                type="checkbox"
                checked={preferences.motion === "reduced"}
                onChange={(event) =>
                  setPreferences({
                    ...preferences,
                    motion: event.target.checked ? "reduced" : "system",
                  })
                }
              />
              Reduce motion, whatever the system setting says
            </label>
          </section>

          <section aria-labelledby="progress-title">
            <h2 id="progress-title">Progress</h2>
            <p>
              Progress is kept in this browser only. There is no account and
              nothing is sent anywhere.
              {!remembers && " This browser is not storing it at present."}
            </p>
            <div aria-live="polite">
              {done && (
                <p className="note">Progress cleared. Preferences were kept.</p>
              )}
            </div>
            {confirming ? (
              <p className="note note--warn">
                This erases every completed case, your clearance, and every
                investigation in progress. Preferences are kept.{" "}
                <button
                  type="button"
                  className="button button--small button--danger"
                  data-testid="reset-confirm"
                  onClick={() => {
                    reset();
                    setConfirming(false);
                    setDone(true);
                  }}
                >
                  Erase progress
                </button>{" "}
                <button
                  type="button"
                  className="button button--small"
                  onClick={() => setConfirming(false)}
                >
                  Keep it
                </button>
              </p>
            ) : (
              <button
                type="button"
                className="button button--danger"
                disabled={!hasProgress}
                onClick={() => {
                  setDone(false);
                  setConfirming(true);
                }}
              >
                Reset progress…
              </button>
            )}
          </section>
        </div>
      </article>
    </main>
  );
}
