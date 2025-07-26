import { useRef, useState, useMemo, useEffect } from "react";
import styles from "./Editor.module.css";
import "./Editor.css";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { EditorApi } from "./EditorApi";
import { useTheme } from "../theme";

// TODO: Custom themes for each theme ?
// TODO: IN PROGRESS Syntax coloring: https://microsoft.github.io/monaco-editor/monarch.html

export function Editor({
  hidden,
  setEditorApi,
  onSave,
}: {
  hidden?: boolean;
  setEditorApi(api: EditorApi): void;
  onSave(source: string): void;
}) {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [editor, setEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);

  const editorApi = useMemo<EditorApi>(
    () => ({
      undo() {
        editor?.trigger("api", "undo", null);
      },
      redo() {
        editor?.trigger("api", "redo", null);
      },
      replaceSelection(text) {
        if (!editor) return;
        const selection = editor.getSelection();
        if (!selection) return;

        editor.executeEdits("my-source", [
          {
            range: selection,
            text: text,
            forceMoveMarkers: true,
          },
        ]);
      },
      replaceAll(text) {
        editor?.setValue(text);
        // TODO: Not implemented
      },
      replaceAtRange(newText: string, start: number, end: number) {
        // TODO: Not implemented
        if (!editor) return;
        const model = editor.getModel();
        if (!model) return;

        const startPosition = model.getPositionAt(start);
        const endPosition = model.getPositionAt(end);

        editor.executeEdits("my-source", [
          {
            range: {
              startColumn: startPosition.column,
              startLineNumber: startPosition.lineNumber,
              endColumn: endPosition.column,
              endLineNumber: endPosition.lineNumber,
            },
            text: newText,
            forceMoveMarkers: true,
          },
        ]);
      },
      getSource() {
        if (!editor) return "";
        return editor?.getValue();
      },
      getCusorPositions() {
        if (!editor) return null;
        const selection = editor.getSelections();
        if (!selection) return null;
        const model = editor.getModel();
        if (!model) return null;

        return selection.map((s) => {
          const startOffset = model.getOffsetAt(s.getStartPosition());
          const endOffset = model.getOffsetAt(s.getEndPosition());
          return {
            offset: startOffset,
            line: s.startLineNumber,
            column: s.startColumn,
            isRange: endOffset > startOffset,
          };
        });
      },
      getSelectionRanges() {
        if (!editor) return [];
        const selection = editor.getSelections();
        if (!selection) return [];
        const model = editor.getModel();
        if (!model) return [];

        return selection.map((s) => {
          const startOffset = model.getOffsetAt(s.getStartPosition());
          const endOffset = model.getOffsetAt(s.getEndPosition());
          return {
            from: startOffset,
            to: endOffset,
          };
        });
      },
      setSelectionRange(start, end) {
        if (!editor) return [];
        const model = editor.getModel();
        if (!model) return [];

        const startPosition = model.getPositionAt(start);
        const endPosition = model.getPositionAt(end);

        editor.setSelection({
          startLineNumber: startPosition.lineNumber,
          startColumn: startPosition.column,
          endLineNumber: endPosition.lineNumber,
          endColumn: endPosition.column,
        });
      },
      replaceMultipleAtRange(replacements) {
        if (!editor) return;
        const model = editor.getModel();
        if (!model) return;

        const edits: monaco.editor.IIdentifiedSingleEditOperation[] = [];

        for (const replacement of replacements) {
          const start = model.getPositionAt(replacement.from);
          const end = model.getPositionAt(replacement.to);
          edits.push({
            range: new monaco.Range(
              start.lineNumber,
              start.column,
              end.lineNumber,
              end.column
            ),
            text: replacement.text,
            forceMoveMarkers: true,
          });
        }

        editor.executeEdits("api", edits);
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
      setEditor((pEditor) => {
        if (pEditor) return pEditor;

        monaco.languages.register({ id: "tiny-app-language" });

        monaco.languages.setMonarchTokensProvider("tiny-app-language", {
          keywords: [
            "if",
            "else",
            "var",
            "let",
            "set",
            "export",
            "import",
            "try",
            "catch",
            "while",
            "type",
            "any",
            "number",
            "boolean",
            "string",
            "array",
            "record",
            "bytes",
            "switch",
            "fun",
            "true",
            "false",
            "null",
          ],
          tokenizer: {
            root: [
              [
                /[a-z_$][\w$]*/,
                {
                  cases: {
                    "@keywords": "keyword",
                    "@default": "identifier",
                  },
                },
              ],
              [/\d+/, "number"],
              [/".*?"/, "string"],
            ],
          },
        });

        monaco.languages.setLanguageConfiguration("tiny-app-language", {
          comments: {
            lineComment: "//",
          },
          brackets: [
            ["{", "}"],
            ["[", "]"],
            ["(", ")"],
          ],
          autoClosingPairs: [
            { open: "(", close: ")" },
            { open: "{", close: "}" },
          ],
        });

        monaco.editor.defineTheme("tiny-app-language-toy-box", {
          base: "vs",
          inherit: true,
          rules: [
            {
              token: "keyword",
              foreground: convertColor(
                theme.colors.primary?.[700] ?? "rgb(1,1,1)"
              ),
            },
          ],
          colors: {
            "editor.background": convertColor(theme.colors.background),
          },
        });
        monaco.editor.setTheme("tiny-app-language-toy-box");

        const editor = monaco.editor.create(ref.current!, {
          value: "",
          automaticLayout: true,
          language: "tiny-app-language",
        });

        monaco.editor.addEditorAction({
          id: "tap.save",
          label: "Save",
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
          run: () => {
            onSaveRef.current(editor.getValue());
          },
        });

        return editor;
      });
    }
  }, [editor, theme]);

  useEffect(() => {
    setEditorApi(editorApi);
  }, [editorApi, setEditorApi]);

  return (
    <div
      ref={ref}
      className={`${styles.Editor} ${hidden ? styles.hidden : ""}`}
      style={{ flexGrow: 1 }}
      id="editor"
    ></div>
  );
}

const COLOR_RGB = /^rgb\s*\(\s*(\d+),\s*(\d+),\s*(\d+\)\s*)$/;

function convertColor(color: string): string {
  const matches = color.match(COLOR_RGB);
  if (matches == null) return "#ffffff";
  return (
    "#" +
    [matches[1], matches[2], matches[3]]
      .map((a) => parseInt(a).toString(16).padStart(2, "0"))
      .join("")
  );
}
