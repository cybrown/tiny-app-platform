import { EvaluationError, IRNode, RuntimeContext, runNode } from "tal-eval";
import styles from "./styles.module.css";
import React, { useCallback, useRef } from "react";
import Debug from "../widgets/Debug";
import { Closure, TODO_ANY } from "tal-eval/dist/core";
import Text from "../widgets/Text";

export default function RenderExpression({
  ctx,
  expression,
  evaluatedUI,
}: {
  ctx: RuntimeContext;
} & (
  | { expression: IRNode | null; evaluatedUI?: undefined }
  | { expression?: undefined; evaluatedUI: unknown }
)): JSX.Element {
  const ctxRef = useRef(ctx.createChild({}));
  const retry = useCallback(() => ctx.forceRefresh(), [ctx]);
  try {
    const ui =
      expression != null
        ? ctxRef.current.evaluate(expression)
        : evaluatedUI != null
        ? evaluatedUI
        : null;
    const result = renderNullableWidget(ui);
    if (Array.isArray(result)) {
      return (
        <>
          {result
            .filter((child) => child != null)
            .map((child) => (
              <ErrorBoundary
                ctx={ctxRef.current}
                onError={(err, retry) => (
                  <RenderError
                    phase="render"
                    expression={expression ?? (evaluatedUI as any).kind ?? null}
                    err={err}
                    retry={retry}
                  />
                )}
              >
                {child}
              </ErrorBoundary>
            ))}
        </>
      );
    } else {
      return (
        <ErrorBoundary
          ctx={ctxRef.current}
          onError={(err, retry) => (
            <RenderError
              phase="render"
              expression={expression ?? (evaluatedUI as any).kind ?? null}
              err={err}
              retry={retry}
            />
          )}
        >
          {renderNullableWidget(ui)}
        </ErrorBoundary>
      );
    }
  } catch (err) {
    return (
      <RenderError
        phase="render"
        expression={expression ?? (evaluatedUI as any).kind ?? null}
        err={err}
        retry={retry}
      />
    );
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
    const widget = ui.ctx.evaluate(ui.kind as any) as TODO_ANY;
    const children =
      "children" in ui && ui.children
        ? (ui.ctx.evaluate(ui.children as any, true) as unknown[])
        : [];
    const props =
      "props" in ui && ui.props
        ? (ui.ctx.evaluate(ui.props as any) as any)
        : {};

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
    return <Text text={ui}  />
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
    childCtx: ctx.createChildForWidget({ ...props, children }),
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

  const irNode = widget.ctx.program![widget.name].body as IRNode;
  let ui: unknown;
  if (irNode.kind === "BLOCK") {
    const n = irNode as IRNode<"BLOCK">;
    ui = n.children
      .map((childNode) => runNode(childCtx, childCtx.program!, childNode, true))
      .filter((child) => child != null);
  } else {
    ui = runNode(childCtx, childCtx.program!, irNode, true);
  }
  childCtx.setCreated();
  return <RenderExpression ctx={childCtx} evaluatedUI={ui} />;
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

  const irNode =
    (err instanceof EvaluationError ? err.node : expression) ?? expression;
  if (typeof irNode == "object" && irNode && irNode.location) {
    locationMessage = ` at location: (${irNode.location.start.line}, ${irNode.location.start.column})`;
  }

  return (
    <div className={styles.RenderError}>
      {`Failed to evaluate ${
        expression ? nameKindOfExpression(expression) : "an expression"
      } during ${phase} because of: <${err}>${locationMessage}`}
      <button
        onClick={() =>
          console.error(err instanceof EvaluationError ? err.cause : err)
        }
      >
        Dump error in console
      </button>
      {retry ? <button onClick={retry}>Retry</button> : null}
    </div>
  );
}

function nameKindOfExpression(expr: IRNode) {
  if (expr.kind === "LOCAL") {
    return (expr as IRNode<"LOCAL">).name;
  }
  if (expr && typeof expr == "object") {
    if (
      "value" in expr &&
      expr.value &&
      typeof expr.value == "object" &&
      "kind" in expr.value
    ) {
      return expr.value.kind;
    }
    return expr.kind;
  }
  if (expr == null) {
    return null;
  }
  return typeof expr;
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
