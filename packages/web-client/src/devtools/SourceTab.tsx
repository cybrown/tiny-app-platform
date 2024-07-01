import { RuntimeContext } from "tal-eval";
import { Editor, EditorApi } from "./Editor";
import ToolBar from "./Toolbar";
import LowLevelOverlay from "../widgets/internal/LowLevelOverlay";
import Documentation from "./Documentation";
import { WindowFrame } from "../theme";
import { useCallback, useRef, useState } from "react";

type SourceTabProps = {
  ctx: RuntimeContext;
  updateSourceFunc: React.MutableRefObject<(() => string) | null>;
  hidden: boolean;
  setEditorApi(api: EditorApi): void;
  onFormatHandler(): void;
  onApplyAndFormatHandler(): void;
  onApplyAndFormatWithSourceHandler(source: string): void;
  onCloseHandler(): void;
};

export default function SourceTab({
  ctx,
  hidden,
  onFormatHandler,
  onApplyAndFormatHandler,
  updateSourceFunc,
  setEditorApi,
  onApplyAndFormatWithSourceHandler,
  onCloseHandler,
}: SourceTabProps) {
  const editorApiRef = useRef<EditorApi | null>(null);

  const setEditorApiHandler = useCallback(
    (api: EditorApi) => {
      editorApiRef.current = api;
      setEditorApi(api);
    },
    [setEditorApi]
  );

  const onWriteInEditorHandler = useCallback(
    (text: string) => {
      if (!editorApiRef.current) {
        return;
      }
      editorApiRef.current.replaceSelection(text);
      onFormatHandler();
    },
    [onFormatHandler]
  );

  const [showDocumentation, setShowDocumentation] = useState(false);

  const toggleShowDocumentationHandler = useCallback(
    () => setShowDocumentation(!showDocumentation),
    [showDocumentation]
  );

  const onUndoHandler = useCallback(() => {
    editorApiRef.current?.undo();
  }, []);

  const onRedoHandler = useCallback(() => {
    editorApiRef.current?.redo();
  }, []);

  return (
    <>
      {!hidden ? (
        <ToolBar
          onFormat={onFormatHandler}
          onApplyAndFormat={onApplyAndFormatHandler}
          onShowDocumentation={toggleShowDocumentationHandler}
          onUndo={onUndoHandler}
          onRedo={onRedoHandler}
        />
      ) : null}
      <Editor
        grabSetSource={(a) => (updateSourceFunc.current = a())}
        onApiReady={setEditorApiHandler}
        onSaveAndFormat={onApplyAndFormatWithSourceHandler}
        onCloseEditor={onCloseHandler}
        hidden={hidden}
      />
      {!hidden && showDocumentation ? (
        <LowLevelOverlay
          size="l"
          position="right"
          onClose={toggleShowDocumentationHandler}
          modal
        >
          <WindowFrame
            title="Documentation"
            position="right"
            onClose={toggleShowDocumentationHandler}
            modal
          >
            <Documentation ctx={ctx} onWriteInEditor={onWriteInEditorHandler} />
          </WindowFrame>
        </LowLevelOverlay>
      ) : null}
    </>
  );
}
