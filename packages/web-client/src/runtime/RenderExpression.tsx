import { EvaluationError, RuntimeContext } from "tal-eval";
import { Expression } from "tal-parser";
import styles from "./styles.module.css";
import React, { useCallback, useRef } from "react";
import Debug from "../widgets/Debug";

export default function RenderExpression({
  ctx,
  expression,
}: {
  ctx: RuntimeContext;
  expression: Expression | null;
}): JSX.Element {
  const ctxRef = useRef(ctx.createChild({}));
  const retry = useCallback(() => ctx.forceRefresh(), [ctx]);
  try {
    const ui = expression == null ? null : ctxRef.current.evaluate(expression);
    const result = renderNullableWidget(ui);
    if (Array.isArray(result)) {
      return (
        <>
          {result.map((child) => (
            <ErrorBoundary
              ctx={ctxRef.current}
              onError={(err, retry) => (
                <RenderError expression={expression} err={err} retry={retry} />
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
            <RenderError expression={expression} err={err} retry={retry} />
          )}
        >
          {renderNullableWidget(ui)}
        </ErrorBoundary>
      );
    }
  } catch (err) {
    return <RenderError expression={expression} err={err} retry={retry} />;
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
    ui.ctx instanceof RuntimeContext &&
    typeof ui.kind == "string"
  ) {
    const component = ui.ctx.getWidgetByKind(ui.kind);
    if (component == null) {
      throw new Error("Component is null");
    }
    return React.createElement(component, ui);
  }
  return <Debug ctx={null as any} value={ui} />;
}

export function RenderError({
  expression,
  err,
  isStartup = false,
  retry,
}: {
  expression: Expression | null;
  err: unknown;
  isStartup?: boolean;
  retry: () => void;
}) {
  let locationMessage = "";
  const expressionToUse =
    (err instanceof EvaluationError ? err.expression : expression) ??
    expression;
  if (
    typeof expressionToUse == "object" &&
    expressionToUse &&
    expressionToUse.location
  ) {
    locationMessage = ` at location: (${expressionToUse.location.start.line}, ${expressionToUse.location.start.column})`;
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

function nameKindOfExpression(expr: Expression) {
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
