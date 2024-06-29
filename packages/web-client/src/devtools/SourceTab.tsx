import { RuntimeContext } from "tal-eval";
import { Editor, EditorApi } from "./Editor";
import ToolBar from "./Toolbar";
import { APP_DEBUG_MODE_ENV } from "../constants";
import LowLevelOverlay from "../widgets/internal/LowLevelOverlay";
import Documentation from "./Documentation";
import { WindowFrame } from "../theme";
import { useCallback, useRef, useState } from "react";

type SourceTabProps = {
  ctx: RuntimeContext;
  updateSourceFunc: React.MutableRefObject<(() => string) | null>;
  setEditorApi(api: EditorApi): void;
  onFormatHandler(): void;
  onApplyAndFormatHandler(): void;
  onDebugModeChange(mode: boolean): void;
  onApplyAndFormatWithSourceHandler(source: string): void;
  onCloseHandler(): void;
};

export default function SourceTab({
  ctx,
  onFormatHandler,
  onApplyAndFormatHandler,
  onDebugModeChange,
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
      <ToolBar
        onFormat={onFormatHandler}
        onApplyAndFormat={onApplyAndFormatHandler}
        onShowDocumentation={toggleShowDocumentationHandler}
        appDebugMode={ctx.getLocalOr(APP_DEBUG_MODE_ENV, false) as boolean}
        setAppDebugMode={onDebugModeChange}
        onUndo={onUndoHandler}
        onRedo={onRedoHandler}
      />
      <Editor
        grabSetSource={(a) => (updateSourceFunc.current = a())}
        onApiReady={setEditorApiHandler}
        onSaveAndFormat={onApplyAndFormatWithSourceHandler}
        onCloseEditor={onCloseHandler}
      />
      {showDocumentation ? (
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
