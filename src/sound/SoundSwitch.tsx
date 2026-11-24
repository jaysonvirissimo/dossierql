import { useGame } from "../app/GameProvider.tsx";
import { switchSoundOn } from "./sound.ts";

/** The sound preference (SDD 8.1), kept between visits. */
export function SoundSwitch() {
  const { preferences, setPreferences } = useGame();
  return (
    <label className="check">
      <input
        type="checkbox"
        role="switch"
        checked={preferences.sound}
        data-testid="sound-switch"
        onChange={(event) => {
          const sound = event.target.checked;
          setPreferences({ ...preferences, sound });
          if (sound) switchSoundOn();
        }}
      />
      Sounds on the desk
    </label>
  );
}
