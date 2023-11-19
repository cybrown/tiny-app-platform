import { EvaluationError, IRNode, RuntimeContext } from "tal-eval";
import styles from "./styles.module.css";
import React, { useCallback, useRef } from "react";
import Debug from "../widgets/Debug";

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
          {result.map((child) => (
            <ErrorBoundary
              ctx={ctxRef.current}
              onError={(err, retry) => (
                <RenderError
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
      <RenderError expression={expression ?? (evaluatedUI as any).kind ?? null} err={err} retry={retry} />
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
    return ui.flatMap((a) => renderWidget(a));
  }

  if (
    typeof ui == "object" &&
    ui !== null &&
    "kind" in ui &&
    "ctx" in ui &&
    ui.ctx instanceof RuntimeContext
  ) {
    const kind = ui.ctx.evaluate(ui.kind as any) as string;
    const children =
      "children" in ui && ui.children ? ui.ctx.evaluate(ui.children as any) : [];
    const props =
      "props" in ui && ui.props ? (ui.ctx.evaluate(ui.props as any) as any) : {};

    const component = ui.ctx.getWidgetByKind(kind);
    if (component == null) {
      throw new Error("Component is null");
    }
    return React.createElement(component, { ...props, ctx: ui.ctx, children });
  }
  return <Debug ctx={null as any} value={ui} />;
}

export function RenderError({
  expression,
  err,
  isStartup = false,
  retry,
}: {
  expression: IRNode | null;
  err: unknown;
  isStartup?: boolean;
  retry: () => void;
}) {
  let locationMessage = "";

  const irNode =
    (err instanceof EvaluationError ? err.node : expression) ??
    expression;
  if (
    typeof irNode == "object" &&
    irNode &&
    irNode.location
  ) {
    locationMessage = ` at location: (${irNode.location.start.line}, ${irNode.location.start.column})`;
  }

  return (
    <div className={styles.RenderError}>
      {`Failed to evaluate ${
        expression ? nameKindOfExpression(expression) : "an expression"
      } during ${
        isStartup ? "startup" : "render"
      } because of: <${err}>${locationMessage}`}
      <button
        onClick={() =>
          console.error(err instanceof EvaluationError ? err.cause : err)
        }
      >
        Dump error in console
      </button>
      <button onClick={retry}>Retry</button>
    </div>
  );
}

function nameKindOfExpression(expr: IRNode) {
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
