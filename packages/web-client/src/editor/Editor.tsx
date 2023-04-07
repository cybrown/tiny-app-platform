import { useRef, useState, useMemo, useEffect } from "react";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView, basicSetup } from "codemirror";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import styles from "./Editor.module.css";

export function Editor({
  source,
  grabSetSource,
}: {
  source: string;
  grabSetSource(arg: () => () => string): void;
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
      const newState = EditorState.create({
        doc: source,
        extensions: [basicSetup, keymap.of([indentWithTab]), javascript()],
      });
      editor.setState(newState);
    }
    grabSetSource(setUpdateSourceFunc);
  }, [editor, grabSetSource, setUpdateSourceFunc, source, sourceBefore]);
  return <div ref={ref} className={styles.Editor} id="editor"></div>;
}
