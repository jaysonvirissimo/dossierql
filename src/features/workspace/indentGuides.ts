import { RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import { braceBalance } from "./braces.ts";

/** The columns of leading space on a line. A tab counts as two. */
function leading(line: string): number {
  let columns = 0;
  for (const char of line) {
    if (char === " ") columns += 1;
    else if (char === "\t") columns += 2;
    else break;
  }
  return columns;
}

/**
 * How far the guides reach on each line, in columns: two for each block the
 * line is inside, so that one guide stands for one open brace. A line that
 * starts by closing a block is outside that block. The guides stop short of
 * the text on a line, and run on through a blank line.
 */
export function guideColumns(lines: readonly string[]): number[] {
  let depth = 0;
  return lines.map((line) => {
    const closes = line.trimStart().startsWith("}") ? 1 : 0;
    const level = Math.max(depth - closes, 0) * 2;
    depth = Math.max(depth + braceBalance(line), 0);
    return line.trim() === "" ? level : Math.min(level, leading(line));
  });
}

function guides(view: EditorView): DecorationSet {
  const { doc } = view.state;
  const lines: string[] = [];
  for (let n = 1; n <= doc.lines; n++) lines.push(doc.line(n).text);
  const builder = new RangeSetBuilder<Decoration>();
  guideColumns(lines).forEach((columns, index) => {
    if (columns < 2) return;
    const from = doc.line(index + 1).from;
    builder.add(
      from,
      from,
      Decoration.line({
        class: "cm-indent-guides",
        attributes: { style: `--indent: ${String(columns)}ch` },
      }),
    );
  });
  return builder.finish();
}

/**
 * Faint vertical lines, one for each block a line is inside, so that a
 * player can see that a brace the editor closed for them is still open
 * below the cursor (SDD 8.2).
 */
export const indentGuides = [
  ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = guides(view);
      }
      update(update: ViewUpdate) {
        if (update.docChanged) this.decorations = guides(update.view);
      }
    },
    { decorations: (plugin) => plugin.decorations },
  ),
  EditorView.baseTheme({
    ".cm-indent-guides": {
      backgroundImage:
        "repeating-linear-gradient(to right, rgb(255 255 255 / 14%) 0 1px, transparent 1px 2ch)",
      backgroundSize: "var(--indent) 100%",
      backgroundRepeat: "no-repeat",
      backgroundOrigin: "content-box",
    },
  }),
];
