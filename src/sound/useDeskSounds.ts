import { useEffect } from "react";
import { isCueName, type CueName } from "./cues.ts";
import { cue } from "./sound.ts";

const CONTROL = 'button, [role="tab"], label.check, input[type="checkbox"]';

/**
 * The cue for the control under a press, or null for none. A button may ask
 * for its own cue with `data-sound`. Otherwise the cue follows the button's
 * kind, and a checkbox clicks on or off by the state it is about to take.
 */
export function cueFor(target: EventTarget | null): CueName | null {
  if (!(target instanceof Element)) return null;
  // Keys typed in an editor are writing, not pressing a control.
  if (target.closest(".cm-editor")) return null;
  const control = target.closest(CONTROL);
  if (!control) return null;
  if (
    control.matches(":disabled") ||
    control.getAttribute("aria-disabled") === "true"
  ) {
    return null;
  }
  const asked = control.closest<HTMLElement>("[data-sound]")?.dataset.sound;
  if (isCueName(asked)) return asked;
  const box =
    control instanceof HTMLInputElement
      ? control
      : control.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if (box) {
    if (box.disabled) return null;
    return box.checked ? "toggle-off" : "toggle-on";
  }
  if (control.classList.contains("button--danger")) return "danger";
  if (control.classList.contains("button--primary")) return "primary";
  return "click";
}

/**
 * Listens once, at the top of the page, for every press of a control, so
 * that each button sounds without a line of its own. The press sounds when
 * the button goes down and the release when it comes up, whether by mouse,
 * finger or the keyboard (SDD 8.1).
 */
export function useDeskSounds(): void {
  useEffect(() => {
    let pointer: CueName | null = null;
    let key: CueName | null = null;

    const pointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      pointer = cueFor(event.target);
      if (pointer) cue(pointer, "press");
    };
    // The release is heard wherever the pointer is let go.
    const pointerUp = () => {
      if (pointer) cue(pointer, "release");
      pointer = null;
    };
    const keyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = event.target;
      // Enter does not toggle a checkbox, so it makes no sound there.
      if (
        event.key === "Enter" &&
        target instanceof HTMLInputElement &&
        target.type === "checkbox"
      ) {
        return;
      }
      key = cueFor(target);
      if (key) cue(key, "press");
    };
    const keyUp = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (key) cue(key, "release");
      key = null;
    };

    document.addEventListener("pointerdown", pointerDown, true);
    window.addEventListener("pointerup", pointerUp, true);
    window.addEventListener("pointercancel", pointerUp, true);
    document.addEventListener("keydown", keyDown, true);
    window.addEventListener("keyup", keyUp, true);
    return () => {
      document.removeEventListener("pointerdown", pointerDown, true);
      window.removeEventListener("pointerup", pointerUp, true);
      window.removeEventListener("pointercancel", pointerUp, true);
      document.removeEventListener("keydown", keyDown, true);
      window.removeEventListener("keyup", keyUp, true);
    };
  }, []);
}
