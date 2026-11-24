import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import {
  bracketMatching,
  HighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import { linter } from "@codemirror/lint";
import { Compartment, EditorState, Prec } from "@codemirror/state";
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { graphql } from "cm6-graphql";
import type { GraphQLSchema } from "graphql";
import { useEffect, useRef, useState } from "react";
import { braceBalance } from "./braces.ts";
import { strike } from "../../sound/sound.ts";

const theme = EditorView.theme(
  {
    "&": {
      color: "var(--terminal-ink)",
      backgroundColor: "var(--navy-900)",
      fontSize: "1rem",
      height: "100%",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-mono)",
      lineHeight: "1.55",
      overflow: "auto",
    },
    ".cm-content": { caretColor: "var(--terminal-ink)", padding: "0.75rem 0" },
    ".cm-gutters": {
      backgroundColor: "var(--navy-900)",
      color: "var(--terminal-dim)",
      border: "none",
    },
    ".cm-activeLine": { backgroundColor: "rgb(255 255 255 / 4%)" },
    ".cm-activeLineGutter": { backgroundColor: "transparent" },
    "&.cm-focused": { outline: "2px solid var(--terminal-key)" },
    "&.cm-focused .cm-cursor": { borderLeftColor: "var(--terminal-ink)" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
      backgroundColor: "var(--navy-line)",
    },
    ".cm-tooltip": {
      backgroundColor: "var(--navy-800)",
      color: "var(--terminal-ink)",
      border: "1px solid var(--navy-line)",
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
      backgroundColor: "var(--navy-line)",
      color: "var(--terminal-ink)",
    },
    ".cm-diagnostic": { fontFamily: "var(--font-sans)" },
  },
  { dark: true },
);

const highlight = HighlightStyle.define([
  { tag: tags.keyword, color: "var(--terminal-key)" },
  { tag: tags.definitionKeyword, color: "var(--terminal-key)" },
  { tag: tags.string, color: "var(--terminal-string)" },
  { tag: tags.number, color: "var(--terminal-string)" },
  { tag: tags.comment, color: "var(--terminal-comment)", fontStyle: "italic" },
  { tag: tags.variableName, color: "var(--terminal-name)" },
  { tag: tags.typeName, color: "var(--terminal-key)" },
  { tag: tags.attributeName, color: "var(--terminal-name)" },
  { tag: tags.propertyName, color: "var(--terminal-ink)" },
  { tag: tags.atom, color: "var(--terminal-string)" },
  { tag: tags.punctuation, color: "var(--terminal-dim)" },
]);

// The Vim keybindings are fetched the first time a player turns them on
// (SDD 4.3), and once only.
let vimModule: Promise<typeof import("@replit/codemirror-vim")> | null = null;
const loadVim = () => (vimModule ??= import("@replit/codemirror-vim"));

const MODES: Record<string, string> = {
  normal: "normal",
  insert: "insert",
  visual: "visual",
  replace: "replace",
};

interface EditorProps {
  /** The text the editor opens with. Later changes come from the player. */
  initial: string;
  /** The schema for a query editor. Without one the editor holds plain text. */
  schema?: GraphQLSchema;
  label: string;
  /** Vim keybindings, the player's preference. */
  vim: boolean;
  /** A short editor with no line numbers, for the variables panel. */
  compact?: boolean;
  testId?: string;
  onChange(text: string): void;
  onTransmit(): void;
}

type Host = HTMLDivElement & { cmView?: EditorView };

/**
 * Puts the cursor in the editor with the given test id, at the end of its
 * text, so that a player who chooses to write another query can type at
 * once.
 */
export function focusEditor(testId = "query-editor"): void {
  const host = document.querySelector<Host>(`[data-testid="${testId}"]`);
  const view = host?.cmView;
  if (!view) return;
  view.dispatch({ selection: { anchor: view.state.doc.length } });
  view.focus();
}

/**
 * The editor closes each brace as it is opened. A player who types the
 * closing brace on a new line, as they would on paper, would then have one
 * too many. When every brace is already closed and the next character after
 * the cursor is a closing brace, typing `}` steps over that brace instead,
 * and a line left blank by the step is removed.
 */
export const stepOverClosingBrace = EditorView.inputHandler.of(
  (view, from, to, text) => {
    if (text !== "}" || from !== to) return false;
    const doc = view.state.doc.toString();
    if (braceBalance(doc) > 0) return false;
    const after = /^\s*/.exec(doc.slice(from))?.[0].length ?? 0;
    if (doc[from + after] !== "}") return false;
    const line = view.state.doc.lineAt(from);
    const blank = line.text.trim() === "" && after > 0;
    view.dispatch({
      changes: blank ? { from: line.from, to: line.to + 1 } : undefined,
      selection: {
        anchor: blank
          ? from + after + 1 - (line.to + 1 - line.from)
          : from + after + 1,
      },
      scrollIntoView: true,
      userEvent: "input.type",
    });
    return true;
  },
);

/**
 * The query editor. It is created once and left alone: the callbacks live
 * in refs so that a re-render never rebuilds it. Tab is not captured, so
 * keyboard users can always leave.
 */
export function Editor({
  initial,
  schema,
  label,
  vim,
  compact = false,
  testId = "query-editor",
  onChange,
  onTransmit,
}: EditorProps) {
  const host = useRef<Host>(null);
  const views = useRef<EditorView | null>(null);
  const vimSlot = useRef(new Compartment());
  const [mode, setMode] = useState<string | null>(null);
  const change = useRef(onChange);
  const send = useRef(onTransmit);
  useEffect(() => {
    change.current = onChange;
    send.current = onTransmit;
  });

  useEffect(() => {
    const parent = host.current;
    if (!parent) return;
    const view = new EditorView({
      parent,
      state: EditorState.create({
        doc: initial,
        extensions: [
          // Vim goes before every other keymap, as the package asks.
          vimSlot.current.of([]),
          compact ? [] : lineNumbers(),
          history(),
          drawSelection(),
          indentOnInput(),
          bracketMatching(),
          // Ahead of closeBrackets, which would add a second brace.
          Prec.high(stepOverClosingBrace),
          closeBrackets(),
          // Suggests the fields that fit where the cursor is. Nothing is
          // chosen until the player picks a suggestion, so Enter always
          // starts a new line.
          autocompletion({ selectOnOpen: false }),
          highlightActiveLine(),
          EditorView.lineWrapping,
          Prec.highest(
            keymap.of([
              {
                key: "Mod-Enter",
                preventDefault: true,
                run: () => {
                  strike("transmit");
                  send.current();
                  return true;
                },
              },
            ]),
          ),
          keymap.of([
            ...closeBracketsKeymap,
            ...completionKeymap,
            ...defaultKeymap,
            ...historyKeymap,
          ]),
          schema ? graphql(schema) : [],
          // An empty editor is not a mistake. The GraphQL linter reports one
          // at the first character, and would leave a red mark there that
          // the player's first keystrokes carry along.
          linter(null, {
            markerFilter: (diagnostics, state) =>
              state.doc.toString().trim() === "" ? [] : [...diagnostics],
          }),
          syntaxHighlighting(highlight),
          theme,
          EditorView.contentAttributes.of({
            "aria-label": label,
            "aria-multiline": "true",
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) change.current(update.state.doc.toString());
          }),
        ],
      }),
    });
    // Browser tests set the text through the view, as typing fights the
    // editor's bracket closing.
    parent.cmView = view;
    views.current = view;
    return () => {
      delete parent.cmView;
      views.current = null;
      view.destroy();
    };
    // The editor is rebuilt only when its parent gives it a new key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Turning Vim on or off changes the keymap and keeps the text.
  useEffect(() => {
    const view = views.current;
    if (!view) return;
    if (!vim) {
      view.dispatch({ effects: vimSlot.current.reconfigure([]) });
      setMode(null);
      return;
    }
    let current = true;
    void loadVim().then(({ vim: vimKeys, getCM }) => {
      if (!current || views.current !== view) return;
      view.dispatch({ effects: vimSlot.current.reconfigure(vimKeys()) });
      setMode("normal");
      getCM(view)?.on("vim-mode-change", (event: { mode: string }) => {
        if (current) setMode(MODES[event.mode] ?? event.mode);
      });
    });
    return () => {
      current = false;
    };
  }, [vim]);

  return (
    <div className={compact ? "editor editor--compact" : "editor"}>
      <div ref={host} className="editor-host" data-testid={testId} />
      {vim && mode && (
        <p className="editor-mode" aria-live="polite" data-testid="vim-mode">
          Vim: {mode} mode
        </p>
      )}
    </div>
  );
}
