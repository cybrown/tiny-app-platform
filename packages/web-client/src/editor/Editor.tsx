import { useRef, useState, useMemo, useEffect } from "react";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView, basicSetup } from "codemirror";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import styles from "./Editor.module.css";

export interface EditorApi {
  replaceSelection(text: string): void;
  replaceAll(text: string): void;
}

export function Editor({
  source,
  grabSetSource,
  onApiReady,
}: {
  source: string;
  grabSetSource(arg: () => () => string): void;
  onApiReady(api: EditorApi): void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<EditorView | null>(null);
  const [sourceBefore, setSourceBefore] = useState(source);
  const setUpdateSourceFunc = useMemo(
    () => () => () => {
      if (editor) {
        const newSource = [...editor.state.doc].join("");
        setSourceBefore(newSource);
        return newSource;
      }
      return "";
    },
    [editor]
  );
  const editorApi = useMemo<EditorApi>(
    () => ({
      replaceSelection(text) {
        editor?.dispatch(editor?.state.replaceSelection(text));
      },
      replaceAll(text) {
        editor?.dispatch(
          editor.state.update({
            changes: { from: 0, to: editor.state.doc.length, insert: text },
          })
        );
      },
    }),
    [editor]
  );

  useEffect(() => {
    if (ref.current == null) {
      console.log("ref is null");
      return;
    }
    if (editor == null) {
      setEditor(
        new EditorView({
          doc: source,
          extensions: [basicSetup, keymap.of([indentWithTab]), javascript()],
          parent: ref.current,
        })
      );
    } else if (sourceBefore !== source) {
      editorApi?.replaceAll(source);
    }
    grabSetSource(setUpdateSourceFunc);
  }, [editor, editorApi, grabSetSource, setUpdateSourceFunc, source, sourceBefore]);

  useEffect(() => {
    onApiReady(editorApi);
  }, [editorApi, onApiReady]);

  return <div ref={ref} className={styles.Editor} id="editor"></div>;
}
