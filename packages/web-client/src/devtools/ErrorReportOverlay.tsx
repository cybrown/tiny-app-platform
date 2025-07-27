import {
  lower,
  RegisterableFunction,
  RuntimeContext,
  typeBoolean,
  TypeChecker,
} from "tal-eval";
import { parse } from "tal-parser";
import { View, WindowFrame, Text } from "../theme";
import LowLevelOverlay from "../widgets/internal/LowLevelOverlay";
import { useState, useMemo, useEffect } from "react";
import { EditorApi } from "./EditorApi";
import { AnyTmp } from "../util";
import { ErrorReportOverlayController } from "./ErrorReportOverlaySupport";

export default function ErrorReportOverlay({
  ctx,
  ctrl,
  editorApi,
}: {
  ctx: RuntimeContext;
  editorApi: EditorApi;
  ctrl: ErrorReportOverlayController;
}) {
  return ctrl.state.visible ? (
    <LowLevelOverlay
      size="m"
      position="bottom"
      onClose={() => ctrl.close()}
      modal
    >
      <WindowFrame
        title="Errors"
        position="bottom"
        onClose={() => ctrl.close()}
        modal
      >
        <ErrorReport ctx={ctx} source={editorApi.getSource()} />
      </WindowFrame>
    </LowLevelOverlay>
  ) : null;
}

const ErrorReport = ({
  ctx,
  source,
}: {
  ctx: RuntimeContext;
  source?: string;
}) => {
  const [errors, setErrors] = useState<string[]>([]);

  const [initError, setInitError] = useState<unknown>();

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
          (local[1] as AnyTmp).parameters
        );
      })
      .map((a) => a as [string, RegisterableFunction<string>])
      .forEach((local) => {
        result.declareSymbol(local[0], local[1].type);
      });

    for (const widget of Object.entries(ctx.listWidgets())) {
      result.declareSymbol(widget[0], widget[1].type);
    }

    result.declareSymbol("debug", typeBoolean());

    return result;
  }, [ctx]);

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
      setInitError(null);
      typeChecker.popSymbolTable();
    } catch (err) {
      setInitError(err);
    }
  }, [source, typeChecker]);

  return (
    <View padding={0.5}>
      {initError ? (
        <View layout="flex-column">
          <Text text="Error while initializing error checking:" />
          <pre>
            {initError &&
            typeof initError == "object" &&
            "stack" in initError &&
            typeof initError.stack == "string"
              ? initError.stack
              : "Unknown error"}
          </pre>
        </View>
      ) : errors.length ? (
        <View layout="flex-column">
          <Text text={`${errors.length} errors found`} color="red" />
          {errors.map((error, index) => (
            <Text key={index} text={error} />
          ))}
        </View>
      ) : (
        <Text text="No errors found" />
      )}
    </View>
  );
};
