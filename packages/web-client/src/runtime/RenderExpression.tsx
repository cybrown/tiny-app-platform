import { RuntimeContext, runForAllStack } from "tal-eval";
import { ReactNode, useCallback, useRef } from "react";
import Debug from "../widgets/Debug";
import { Closure } from "tal-eval/dist/core";
import Text from "../widgets/Text";
import ErrorBoundary from "./ErrorBoundary";
import CustomWidgetHost from "./CustomWidgetHost";
import RenderError from "./RenderError";

export default function RenderExpression({
  ctx,
  ui,
}: {
  ctx: RuntimeContext;
  ui: unknown;
}) {
  const ctxRef = useRef(ctx.createChild({}));
  const retry = useCallback(() => ctx.forceRefresh(), [ctx]);

  try {
    if (Array.isArray(ui)) {
      return (
        <>
          {ui.map((child, index) => (
            <RenderExpression key={index} ctx={ctxRef.current} ui={child} />
          ))}
        </>
      );
    }
    let valueToReturn: ReactNode = null;
    if (isClosure(ui)) {
      valueToReturn = (
        <RenderExpression ctx={ui.ctx} ui={runForAllStack(ui.ctx, ui.name)} />
      );
    } else if (isCustomWidget(ui)) {
      valueToReturn = (
        <CustomWidgetHost
          ctx={ui.ctx}
          widget={ui.kind}
          props={ui.props}
          children={ui.children}
        />
      );
    } else if (isNativeWidget(ui)) {
      valueToReturn = (
        <ui.kind ctx={ui.ctx} {...ui.props}>
          {ui.children}
        </ui.kind>
      );
    } else if (typeof ui === "string" || typeof ui === "number") {
      valueToReturn = <Text text={String(ui)} />;
    } else if (ui != null) {
      valueToReturn = <Debug value={ui} />;
    }
    return (
      <ErrorBoundary
        ctx={ctx}
        onError={(err, retry) => (
          <RenderError
            ctx={ctx}
            phase="render"
            expression={
              /*expression ?? (evaluatedUI as any).kind ?? null*/ null
            }
            err={err}
            retry={retry}
          />
        )}
      >
        {valueToReturn}
      </ErrorBoundary>
    );
  } catch (err) {
    return (
      <RenderError
        ctx={ctx}
        phase="render"
        expression={/*expression ?? (evaluatedUI as any).kind ?? null*/ null}
        err={err}
        retry={retry}
      />
    );
  }
}

function isClosure(ui: unknown): ui is Closure {
  return (
    (typeof ui === "object" &&
      ui &&
      "name" in ui &&
      "ctx" in ui &&
      ui.ctx instanceof RuntimeContext) ??
    false
  );
}

interface CustomWidget {
  ctx: RuntimeContext;
  kind: Closure;
  children: unknown[];
  props: Record<string, unknown>;
}

interface NativeWidget {
  ctx: RuntimeContext;
  kind: Function;
  children: unknown[];
  props: Record<string, unknown>;
}

function isCustomWidget(ui: unknown): ui is CustomWidget {
  return (
    (typeof ui === "object" &&
      ui &&
      "ctx" in ui &&
      ui.ctx instanceof RuntimeContext &&
      "kind" in ui &&
      typeof ui.kind === "object") ??
    false
  );
}

function isNativeWidget(ui: unknown): ui is NativeWidget {
  return (
    (typeof ui === "object" &&
      ui &&
      "ctx" in ui &&
      ui.ctx instanceof RuntimeContext &&
      "kind" in ui &&
      typeof ui.kind === "function") ??
    false
  );
}
