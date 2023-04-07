import { EvaluationError, RuntimeContext } from "tal-eval";
import { Expression } from "tal-parser";
import styles from "./styles.module.css";
import React from "react";
import Debug from "../widgets/Debug";

export default function renderExpression(
  ctx: RuntimeContext,
  expression: Expression | null
) {
  try {
    const ui = ctx.evaluate(expression);
    const result = renderNullableWidget(ui);
    if (Array.isArray(result)) {
      return result.map((child) => (
        <ErrorBoundary
          ctx={ctx}
          onError={(err) => <RenderError expression={expression} err={err} />}
        >
          {child}
        </ErrorBoundary>
      ));
    } else {
      return (
        <ErrorBoundary
          ctx={ctx}
          onError={(err) => <RenderError expression={expression} err={err} />}
        >
          {renderNullableWidget(ui)}
        </ErrorBoundary>
      );
    }
  } catch (err) {
    return <RenderError expression={expression} err={err} />;
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
    return React.createElement(ui.ctx.getWidgetByKind(ui.kind), ui);
  }
  return <Debug ctx={null as any} value={ui} />;
}

function RenderError({
  expression,
  err,
}: {
  expression: Expression;
  err: unknown;
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
      {`Failed to evaluate ${nameKindOfExpression(
        expression
      )} during render because of: <${err}>${locationMessage}`}
      <button
        onClick={() =>
          console.error(err instanceof EvaluationError ? err.cause : err)
        }
      >
        Dump error in console
      </button>
    </div>
  );
}

function nameKindOfExpression(expr: Expression) {
  if (expr && !Array.isArray(expr) && typeof expr == "object" && expr.kind) {
    return expr.kind;
  }
  if (expr == null) {
    return null;
  }
  return typeof expr;
}

class ErrorBoundary extends React.Component<
  { ctx: RuntimeContext; children: any; onError: (err: any) => JSX.Element },
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

  render() {
    if (this.state.error) {
      return <div>{this.props.onError(this.state.error)}</div>;
    }

    return this.props.children;
  }

  componentWillUnmount() {
    this.props.ctx.unregisterStateChangedListener(this.onStateChangeListener);
  }
}
