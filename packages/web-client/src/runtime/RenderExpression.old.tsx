import { RuntimeContext, runForAllStack } from "tal-eval";
import React, { useCallback, useRef } from "react";
import Debug from "../widgets/Debug";
import { Closure, TODO_ANY } from "tal-eval/dist/core";
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
}): JSX.Element {
  const ctxRef = useRef(ctx.createChild({}));
  const retry = useCallback(() => ctx.forceRefresh(), [ctx]);
  if (ui == null) {
    return <></>;
  }
  try {
    const uiClosure = ui as Closure | Closure[];
    if (Array.isArray(uiClosure)) {
      return (
        <>
          {uiClosure
            .filter((child) => child != null)
            .map((child) => renderAgain(ctxRef.current, child))
          /*
            .map((uiClosure) => {
              const vm = new VM(uiClosure.ctx);
              const runResult = run(vm, uiClosure.name);
              return renderNullableWidget(runResult);
            })
            .map((child, index) => (
              <ErrorBoundary
                key={index}
                ctx={ctxRef.current}
                onError={(err, retry) => (
                  <RenderError
                    phase="render"
                    expression={
                      /*expression ?? (evaluatedUI as any).kind ?? null* / null
                    }
                    err={err}
                    retry={retry}
                  />
                )}
              >
                {child}
              </ErrorBoundary>
            ))*/
          }
        </>
      );
    } else {
      const a = renderAgain(ctxRef.current, uiClosure);
      if (Array.isArray(a)) {
        return <>a</>;
      } else {
        return a;
      }
    }
  } catch (err) {
    return (
      <RenderError
        phase="render"
        expression={/*expression ?? (evaluatedUI as any).kind ?? null*/ null}
        err={err}
        retry={retry}
      />
    );
  }
}

function renderAgain(
  ctx: RuntimeContext,
  uiClosure: unknown
): JSX.Element | JSX.Element[] {
  if (Array.isArray(uiClosure)) {
    return uiClosure
      .flatMap((a) => renderAgain(ctx, a))
      .filter((a) => a != null);
  }

  if (
    typeof uiClosure === "object" &&
    uiClosure != null &&
    "ctx" in uiClosure &&
    uiClosure.ctx != null &&
    uiClosure.ctx instanceof RuntimeContext
  ) {
    const runResult = runForAllStack(
      uiClosure.ctx,
      (uiClosure as TODO_ANY).name
    );
    return (
      <ErrorBoundary
        ctx={ctx}
        onError={(err, retry) => (
          <RenderError
            phase="render"
            expression={
              /*expression ?? (evaluatedUI as any).kind ?? null*/ null
            }
            err={err}
            retry={retry}
          />
        )}
      >
        {console.log(runResult)}
        {Array.isArray(runResult) ? (
          <>{runResult.map((a) => renderNullableWidget(a))}</>
        ) : (
          renderNullableWidget(runResult)
        )}
      </ErrorBoundary>
    );
  } else if (typeof uiClosure === "string") {
    return <Text text={uiClosure} />;
  } else {
    return <Debug value={uiClosure} force />;
  }
}

function renderNullableWidget(ui: unknown): JSX.Element | JSX.Element[] | null {
  if (ui == null) {
    return null;
  }
  return renderWidget(ui);
}

function renderWidget(ui: unknown): JSX.Element | JSX.Element[] {
  if (Array.isArray(ui)) {
    return ui.flatMap((a) => renderWidget(a)).filter((a) => a != null);
  }

  if (
    typeof ui == "object" &&
    ui !== null &&
    "kind" in ui &&
    "ctx" in ui &&
    ui.ctx instanceof RuntimeContext
  ) {
    const widget = ui.kind as any;
    const children = (ui as any).children;
    const props = (ui as any).props;

    if (widget == null) {
      throw new Error("Widget is null");
    }
    if (typeof widget == "function") {
      return React.createElement(widget, {
        ...props,
        ctx: ui.ctx,
        children,
      });
    }
    return (
      <CustomWidgetHost
        ctx={ui.ctx}
        widget={widget}
        props={props}
        children={children}
      />
    );
  } else if (typeof ui === "string") {
    return <Text text={ui} />;
  }
  return <Debug value={ui} />;
}
