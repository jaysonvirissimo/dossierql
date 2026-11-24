import { useState, type CSSProperties } from "react";

/**
 * The hours left on the mission clock. When a journey or a form costs time,
 * the figure counts down from the hours before to the hours after (SDD 8.1).
 * The count is drawn by CSS over the true figure, so the text that a screen
 * reader or a test reads is the true figure from the first frame, and no
 * count plays when motion is reduced.
 */
export function ClockFigure({ value }: { value: number }) {
  const [seen, setSeen] = useState({ value, from: value });
  if (seen.value !== value) setSeen({ value, from: seen.value });
  const counting = seen.from > value;
  return (
    <span
      key={value}
      className={counting ? "clock-figure clock-figure--count" : "clock-figure"}
      style={
        counting
          ? ({ "--from": seen.from, "--to": value } as CSSProperties)
          : undefined
      }
    >
      {value}
      {counting && <span className="clock-figure__count" aria-hidden="true" />}
    </span>
  );
}
