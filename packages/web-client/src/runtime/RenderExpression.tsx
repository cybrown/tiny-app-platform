import {
  EvaluationError,
  IRNode,
  RuntimeContext,
  run,
  runForAllStack,
} from "tal-eval";
import styles from "./styles.module.css";
import React, { useCallback, useRef } from "react";
import Debug from "../widgets/Debug";
import { Closure, TODO_ANY } from "tal-eval/dist/core";
import Text from "../widgets/Text";

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
            .map((child) => renderAgain(ctxRef.current, uiClosure))
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
    const runResult = run(uiClosure.ctx, (uiClosure as TODO_ANY).name);
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
        {renderNullableWidget(runResult)}
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

function CustomWidgetHost({
  ctx,
  widget,
  props,
  children,
}: {
  ctx: RuntimeContext;
  widget: Closure;
  props: Record<string, unknown>;
  children: unknown[];
}) {
  const state = useRef({
    childCtx: widget.ctx.createChildForWidget({ ...props, children }),
    name: widget.name,
    oldProps: props,
    oldChildren: children,
  });

  if (widget.name !== state.current.name) {
    state.current.childCtx.triggerDestructors();
    state.current = {
      childCtx: ctx.createChildForWidget({ ...props, children }),
      name: widget.name,
      oldProps: props,
      oldChildren: children,
    };
  } else {
    let hasSetNewProp = false;
    for (let [key, value] of Object.entries(state.current.oldProps)) {
      if (props[key] !== value) {
        state.current.childCtx.setOwnLocalWithoutRender(key, props[key]);
        hasSetNewProp = true;
      }
    }

    if (hasSetNewProp) {
      state.current.oldProps = props;
    }

    if (children.length !== state.current.oldChildren.length) {
      state.current.childCtx.setOwnLocalWithoutRender("children", children);
    } else {
      for (let i = 0; i < children.length; i++) {
        if (children[i] !== state.current.oldChildren[i]) {
          state.current.childCtx.setOwnLocalWithoutRender("children", children);
          state.current.oldChildren = children;
          break;
        }
      }
    }
  }

  const { childCtx } = state.current;

  if (childCtx.onCreateError) {
    return (
      <RenderError
        phase="on_create"
        expression={null}
        err={childCtx.onCreateError}
      />
    );
  }

  const ui = (runForAllStack(childCtx, widget.name) as unknown[]).filter(
    (a) => a != null
  );
  childCtx.setCreated();
  return <RenderExpression ctx={childCtx} ui={ui} />;
}

export function RenderError({
  expression,
  err,
  phase,
  retry,
}: {
  expression: IRNode | null;
  err: unknown;
  phase: "startup" | "render" | "on_create";
  retry?: () => void;
}) {
  let locationMessage = "";

  const irNode = err
    ? (err instanceof EvaluationError ? err.node : expression) ?? expression
    : null;
  if (typeof irNode == "object" && irNode && irNode.location) {
    locationMessage = ` at location: (${irNode.location.path}, ${irNode.location.start.line}, ${irNode.location.start.column})`;
  }

  return (
    <div className={styles.RenderError}>
      {`Failed to evaluate ${
        expression ? nameKindOfExpression(expression) : "an expression"
      } during ${phase} because of: <${err}>${locationMessage}`}
      <button
        onClick={() =>
          err && console.error(err instanceof EvaluationError ? err.cause : err)
        }
      >
        Dump error in console
      </button>
      {retry ? <button onClick={retry}>Retry</button> : null}
    </div>
  );
}

function nameKindOfExpression(expr: IRNode) {
  if (expr.kind === "Local") {
    return expr.name;
  }
  if (
    expr.kind === "Literal" &&
    expr.value &&
    typeof expr.value == "object" &&
    "kind" in expr.value
  ) {
    return expr.value.kind;
  }
  return expr.kind;
}

class ErrorBoundary extends React.Component<
  {
    ctx: RuntimeContext;
    children: any;
    onError: (err: any, retry: () => void) => JSX.Element;
  },
  { error: any }
> {
  constructor(props: ErrorBoundary["props"]) {
    super(props);
    this.state = { error: null };
    props.ctx.registerStateChangedListener(this.onStateChangeListener);
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  onStateChangeListener = () => this.setState({ error: null });

  retry = () => {
    this.props.ctx.forceRefresh();
  };

  render() {
    if (this.state.error) {
      return <div>{this.props.onError(this.state.error, this.retry)}</div>;
    }

    return this.props.children;
  }

  componentWillUnmount() {
    this.props.ctx.unregisterStateChangedListener(this.onStateChangeListener);
  }
}
