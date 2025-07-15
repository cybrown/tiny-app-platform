import {
  lower,
  RegisterableFunction,
  RuntimeContext,
  typeAny,
  TypeChecker,
} from "tal-eval";
import { Editor, EditorApi } from "./Editor";
import ToolBar from "./Toolbar";
import LowLevelOverlay from "../widgets/internal/LowLevelOverlay";
import Documentation from "./Documentation";
import { Button, Text, View, WindowFrame } from "../theme";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { walk, parse } from "tal-parser";
import { secretCreate } from "tal-stdlib";

type SourceTabProps = {
  ctx: RuntimeContext;
  hidden: boolean;
  setEditorApi(api: EditorApi): void;
  onFormatHandler(): void;
  onApplyAndFormatHandler(): void;
  onApplyAndFormatWithSourceHandler(source: string): void;
};

export default function SourceTab({
  ctx,
  hidden,
  onFormatHandler,
  onApplyAndFormatHandler,
  setEditorApi,
  onApplyAndFormatWithSourceHandler,
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
    () => setShowDocumentation((showDocumentation) => !showDocumentation),
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

  const onExtendSelection = useCallback(() => {
    const source = editorApiRef.current?.getSource();
    if (!source) return;

    const currentSelection = editorApiRef.current?.getSelectionRanges()[0];
    if (!currentSelection) return;

    const ast = parse(source, "any");

    const selectionStack: [number, number][] = [[0, source.length]];

    for (const { node, mode } of walk(ast)) {
      if (mode === "leave") continue;

      const from = node.location?.start.offset;
      const to = node.location?.end.offset;

      if (from == null || to == null) continue;

      if (
        (from < currentSelection.from && to >= currentSelection.to) ||
        (from <= currentSelection.from && to > currentSelection.to)
      ) {
        selectionStack.push([from, to]);
      }
    }

    if (!selectionStack.length) return;

    const newSelection = selectionStack.pop();
    if (!newSelection) return;

    editorApiRef.current?.setSelectionRange(newSelection[0], newSelection[1]);
  }, []);

  const onWrapSelection = useCallback((open: string, close: string) => {
    const source = editorApiRef.current?.getSource();
    if (!source) return;

    const currentSelection = editorApiRef.current?.getSelectionRanges()[0];
    if (!currentSelection) return;

    if (currentSelection.from === currentSelection.to) return;

    editorApiRef.current?.transaction([
      {
        kind: "ReplaceSelection",
        from: currentSelection.to,
        to: currentSelection.to,
        text: close,
      },
      {
        kind: "ReplaceSelection",
        from: currentSelection.from,
        to: currentSelection.from,
        text: open,
      },
    ]);

    editorApiRef.current?.setSelectionRange(
      currentSelection.from,
      currentSelection.from
    );
  }, []);

  const [wrapSelectionOverlayVisible, setWrapSelectionOverlayVisible] =
    useState(false);

  const onShowWrapSelectionOverlay = useCallback(
    () => setWrapSelectionOverlayVisible(true),
    []
  );

  const [typeCheckVisible, setTypeCheckVisible] = useState(false);

  const onShowTypeCheckHandler = useCallback(
    () => setTypeCheckVisible(true),
    []
  );

  const onHideTypeCheckHandler = useCallback(
    () => setTypeCheckVisible(false),
    []
  );

  const onHideWrapSelectionOverlay = useCallback(
    () => setWrapSelectionOverlayVisible(false),
    []
  );

  const onWrapSelectionCurly = useCallback(() => {
    onWrapSelection("{", "}");
    onHideWrapSelectionOverlay();
  }, [onWrapSelection, onHideWrapSelectionOverlay]);

  const onWrapSelectionBrackets = useCallback(() => {
    onWrapSelection("[", "]");
    onHideWrapSelectionOverlay();
  }, [onWrapSelection, onHideWrapSelectionOverlay]);

  const onWrapSelectionParenthesis = useCallback(() => {
    onWrapSelection("(", ")");
    onHideWrapSelectionOverlay();
  }, [onWrapSelection, onHideWrapSelectionOverlay]);

  const onWrapSelectionDoubleQuotes = useCallback(() => {
    onWrapSelection('"', '"');
    onHideWrapSelectionOverlay();
  }, [onWrapSelection, onHideWrapSelectionOverlay]);

  const onWrapSelectionSimpleQuotes = useCallback(() => {
    onWrapSelection("'", "'");
    onHideWrapSelectionOverlay();
  }, [onWrapSelection, onHideWrapSelectionOverlay]);

  const onWrapSelectionSecret = useCallback(() => {
    onConvertToSecret();
    onHideWrapSelectionOverlay();
  }, [onConvertToSecret, onHideWrapSelectionOverlay]);

  return (
    <>
      {typeCheckVisible ? (
        <LowLevelOverlay
          size="m"
          position="bottom"
          onClose={onHideTypeCheckHandler}
          modal
        >
          <WindowFrame
            title="Errors"
            position="bottom"
            onClose={onHideTypeCheckHandler}
            modal
          >
            <ErrorReport ctx={ctx} source={editorApiRef.current?.getSource()} />
          </WindowFrame>
        </LowLevelOverlay>
      ) : null}
      {!hidden ? (
        <ToolBar
          onFormat={onFormatHandler}
          onApplyAndFormat={onApplyAndFormatHandler}
          onShowDocumentation={toggleShowDocumentationHandler}
          onUndo={onUndoHandler}
          onRedo={onRedoHandler}
          onExtendSelection={onExtendSelection}
          onWrapSelection={onShowWrapSelectionOverlay}
          onShowTypeCheck={onShowTypeCheckHandler}
        />
      ) : null}
      <Editor
        setEditorApi={setEditorApiHandler}
        onSave={onApplyAndFormatWithSourceHandler}
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
      {wrapSelectionOverlayVisible ? (
        <LowLevelOverlay
          onClose={onHideWrapSelectionOverlay}
          modal
          position="center"
        >
          <WindowFrame
            onClose={onHideWrapSelectionOverlay}
            modal
            position="center"
            title="Wrap selection"
          >
            <View padding={0.5}>
              <Button text="{ ... }" onClick={onWrapSelectionCurly} />
              <Button text="[ ... ]" onClick={onWrapSelectionBrackets} />
              <Button text="( ... )" onClick={onWrapSelectionParenthesis} />
              <Button text={'" ... "'} onClick={onWrapSelectionDoubleQuotes} />
              <Button text="' ... '" onClick={onWrapSelectionSimpleQuotes} />
              <Button text="secret( ... )" onClick={onWrapSelectionSecret} />
            </View>
          </WindowFrame>
        </LowLevelOverlay>
      ) : null}
    </>
  );
}

const ErrorReport = ({
  ctx,
  source,
}: {
  ctx: RuntimeContext;
  source?: string;
}) => {
  const [errors, setErrors] = useState<string[]>([]);

  const typeChecker = useMemo(() => {
    const result = new TypeChecker();
    // TODO: Use info from the context to declare symbols

    ctx
      .listLocals()
      .filter((local) => {
        return (
          Array.isArray(local) &&
          local.length > 1 &&
          local[1] &&
          (local[1] as any) &&
          (local[1] as any).parameters
        );
      })
      .map((a) => a as [string, RegisterableFunction<string>])
      .forEach((local) => {
        result.declareSymbol(local[0], {
          kind: "function",
          parameters: local[1].parameters.map((p) => ({
            name: p.name,
            type: p.type ?? typeAny(),
          })),
          returnType: local[1].returnType ?? typeAny(),
        });
      });

    return result;
  }, []);

  useEffect(() => {
    if (!source) return;

    typeChecker.pushSymbolTable();
    typeChecker.clearErrors();

    try {
      const expressions = lower(parse(source, "any"));

      for (const expression of expressions) {
        typeChecker.check(expression);
      }
      if (typeChecker.errors.length) {
        setErrors(
          typeChecker.errors.map(
            (e) =>
              `(${e[0]?.location?.start.line}:${e[0]?.location?.start.column}) ${e[1]}`
          )
        );
      } else {
        setErrors([]);
      }
    } catch (err) {
    } finally {
      typeChecker.popSymbolTable();
    }
  }, [source, typeChecker]);

  return (
    <View>
      {errors.length ? (
        <View layout="flex-column">
          {errors.map((error, index) => (
            <View key={index} padding={0.5}>
              <Text text={error} />
            </View>
          ))}
        </View>
      ) : (
        <Text text="No errors found" />
      )}
    </View>
  );
};
