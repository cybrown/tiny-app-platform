import { RuntimeContext } from "tal-eval";
import { Editor, EditorApi } from "./Editor";
import ToolBar from "./Toolbar";
import LowLevelOverlay from "../widgets/internal/LowLevelOverlay";
import Documentation from "./Documentation";
import { WindowFrame } from "../theme";
import { useCallback, useRef, useState } from "react";
import { walk, parse } from "tal-parser";
import { secretCreate } from "tal-stdlib";

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

  const onConvertToSecret = useCallback(() => {
    if (!editorApiRef.current) {
      return;
    }
    const source = editorApiRef.current.getSource();
    const positions = editorApiRef.current.getCusorPositions();
    const ast = parse(source, "any");

    if (!positions) {
      return;
    }

    if (positions.length !== 1) {
      ctx.notify(
        "Only one selection is supported when converting to a secret."
      );
      return;
    }

    if (positions[0].isRange) {
      ctx.notify(
        "Convert selection range not supported, place the cursor on a string to encrypt."
      );
      return;
    }

    const offsetToSearch = positions[0].offset;

    let found = false;

    for (const { node, mode } of walk(ast)) {
      if (mode === "leave") continue;
      if (!node.location) continue;
      if (node.kind !== "Literal") continue;
      if (
        typeof node.value == "string" &&
        node.location.start.offset <= offsetToSearch &&
        node.location.end.offset >= offsetToSearch
      ) {
        secretCreate(ctx, node.value)
          .then((secretValue) => {
            if (!editorApiRef.current) return;
            if (!node.location) return;
            editorApiRef.current.replaceAtRange(
              'secret("' + secretValue + '")',
              node.location.start.offset,
              node.location.end.offset
            );
          })
          .catch(() => {
            ctx.notify("Failed to convert string to secret");
          });
        found = true;
        break;
      }
    }

    if (!found) {
      ctx.notify(
        "No string found at cursor position, make sure to place the cursor on a string."
      );
    }
  }, [ctx]);

  return (
    <>
      {!hidden ? (
        <ToolBar
          onFormat={onFormatHandler}
          onApplyAndFormat={onApplyAndFormatHandler}
          onShowDocumentation={toggleShowDocumentationHandler}
          onUndo={onUndoHandler}
          onRedo={onRedoHandler}
          onConvertToSecret={onConvertToSecret}
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
