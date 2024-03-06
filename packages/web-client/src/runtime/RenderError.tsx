import { EvaluationError, Opcode } from "tal-eval";
import styles from "./styles.module.css";

export default function RenderError({
  expression,
  err,
  phase,
  retry,
}: {
  expression: Opcode | null;
  err: unknown;
  phase: "startup" | "render" | "on_create";
  retry?: () => void;
}) {
  let locationMessage = "";

  const opcode = err
    ? (err instanceof EvaluationError ? err.node : expression) ?? expression
    : null;
  if (typeof opcode == "object" && opcode && opcode.location) {
    locationMessage = ` at location: (${opcode.location.path}, ${opcode.location.start.line}, ${opcode.location.start.column})`;
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

function nameKindOfExpression(opcode: Opcode) {
  if (opcode.kind === "Local") {
    return opcode.name;
  }
  if (
    opcode.kind === "Literal" &&
    opcode.value &&
    typeof opcode.value == "object" &&
    "kind" in opcode.value
  ) {
    return opcode.value.kind;
  }
  return opcode.kind;
}
