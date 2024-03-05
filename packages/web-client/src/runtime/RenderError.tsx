import { EvaluationError, IRNode } from "tal-eval";
import styles from "./styles.module.css";

export default function RenderError({
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
