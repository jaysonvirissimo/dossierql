import { useGame } from "../../app/GameProvider.tsx";

/** The Vim keybindings preference (SDD 8.2), kept between visits. */
export function VimSwitch({ className = "" }: { className?: string }) {
  const { preferences, setPreferences } = useGame();
  return (
    <label className={`check vim-switch ${className}`.trim()}>
      <input
        type="checkbox"
        role="switch"
        checked={preferences.vim}
        data-testid="vim-switch"
        onChange={(event) =>
          setPreferences({ ...preferences, vim: event.target.checked })
        }
      />
      Vim keybindings
    </label>
  );
}
