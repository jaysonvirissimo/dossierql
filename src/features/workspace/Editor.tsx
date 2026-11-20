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
import { EditorState, Prec } from "@codemirror/state";
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
import { useEffect, useRef } from "react";

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

interface EditorProps {
  /** The text the editor opens with. Later changes come from the player. */
  initial: string;
  schema: GraphQLSchema;
  label: string;
  onChange(text: string): void;
  onTransmit(): void;
}

type Host = HTMLDivElement & { cmView?: EditorView };

/**
 * The query editor. It is created once and left alone: the callbacks live
 * in refs so that a re-render never rebuilds it. Tab is not captured, so
 * keyboard users can always leave.
 */
export function Editor({
  initial,
  schema,
  label,
  onChange,
  onTransmit,
}: EditorProps) {
  const host = useRef<Host>(null);
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
          lineNumbers(),
          history(),
          drawSelection(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          // Suggests the fields that fit where the cursor is.
          autocompletion(),
          highlightActiveLine(),
          EditorView.lineWrapping,
          Prec.highest(
            keymap.of([
              {
                key: "Mod-Enter",
                preventDefault: true,
                run: () => {
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
          graphql(schema),
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
    return () => {
      delete parent.cmView;
      view.destroy();
    };
    // The editor is rebuilt only when its parent gives it a new key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={host} className="editor-host" data-testid="query-editor" />;
}
