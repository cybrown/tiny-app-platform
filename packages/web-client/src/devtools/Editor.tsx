import { useRef, useState, useMemo, useEffect } from "react";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView, basicSetup } from "codemirror";
import { EditorSelection, TransactionSpec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { indentWithTab, undo, redo } from "@codemirror/commands";
import styles from "./Editor.module.css";
import "./Editor.css";

export type EditorCommand = {
  kind: "ReplaceSelection";
  text: string;
  from: number;
  to: number;
};

export interface EditorApi {
  // Misc features
  undo(): void;
  redo(): void;

  // Read features
  getSource(): string;
  // Depreciate this method and use getSelectionRanges instead
  getCusorPositions():
    | { offset: number; line: number; column: number; isRange: boolean }[]
    | null;
  getSelectionRanges(): {
    from: number;
    to: number;
  }[];

  // Write features
  replaceSelection(text: string): void;
  replaceAll(text: string): void;
  replaceAtRange(text: string, from: number, to: number): void;
  setSelectionRange(from: number, to: number): void;
  transaction(commands: EditorCommand[]): void;
}

export function Editor({
  hidden,
  setEditorApi,
  onSave,
}: {
  hidden?: boolean;
  setEditorApi(api: EditorApi): void;
  onSave(source: string): void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<EditorView | null>(null);

  const editorApi = useMemo<EditorApi>(
    () => ({
      undo() {
        editor && undo(editor);
      },
      redo() {
        editor && redo(editor);
      },
      replaceSelection(text) {
        editor?.dispatch(editor?.state.replaceSelection(text));
      },
      replaceAll(text) {
        const previousSelection = editor?.state.selection;
        editor?.dispatch(
          editor.state.update({
            changes: { from: 0, to: editor.state.doc.length, insert: text },
          })
        );
        if (previousSelection) {
          editor?.dispatch({
            selection: previousSelection,
          });
        }
      },
      replaceAtRange(newText: string, start: number, end: number) {
        if (!editor) return;
        editor.dispatch(
          editor.state.update({
            changes: { from: start, to: end, insert: newText },
          })
        );
      },
      getSource() {
        if (editor) {
          const newSource = [...editor.state.doc].join("");
          return newSource;
        }
        return "";
      },
      getCusorPositions() {
        if (!editor) {
          return null;
        }
        const state = editor.state;
        const positions = state.selection.ranges.map((range) => {
          const line = state.doc.lineAt(range.head);
          const column = range.from - line.from;
          return {
            offset: range.from,
            line: line.number,
            column,
            isRange: range.from !== range.to,
          };
        });
        return positions;
      },
      getSelectionRanges() {
        if (!editor) return [];
        return editor.state.selection.ranges.map((range) => ({
          from: range.from,
          to: range.to,
        }));
      },
      setSelectionRange(start, end) {
        if (!editor) return;

        editor.dispatch({
          selection: EditorSelection.create([
            EditorSelection.range(start, end),
          ]),
        });
      },
      transaction(commands) {
        if (!editor) return;

        const cmCommands: TransactionSpec[] = [];

        for (const command of commands) {
          switch (command.kind) {
            case "ReplaceSelection":
              cmCommands.push(
                editor.state.update({
                  changes: {
                    from: command.from,
                    to: command.to,
                    insert: command.text,
                  },
                })
              );
              break;
          }
        }

        editor.dispatch(...cmCommands);
      },
    }),
    [editor]
  );

  const onSaveRef = useRef<typeof onSave>(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (ref.current == null) {
      console.log("ref is null");
      return;
    }
    if (editor == null) {
      const saveWithModS = keymap.of([
        {
          key: "Mod-s",
          run: ({ state }) => {
            // Using a ref here because this handler is registered only once per editor instance
            onSaveRef.current([...state.doc].join(""));
            return true;
          },
        },
      ]);
      setEditor(
        new EditorView({
          doc: "",
          extensions: [
            basicSetup,
            keymap.of([indentWithTab]),
            saveWithModS,
            javascript(),
          ],
          parent: ref.current,
        })
      );
    }
  }, [editor]);

  useEffect(() => {
    setEditorApi(editorApi);
  }, [editorApi, setEditorApi]);

  return (
    <div
      ref={ref}
      className={`${styles.Editor} ${hidden ? styles.hidden : ""}`}
      id="editor"
    ></div>
  );
}
