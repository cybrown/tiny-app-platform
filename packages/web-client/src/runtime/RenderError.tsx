import { EvaluationError, Opcode, RuntimeContext } from "tal-eval";
import { Button, Text, View } from "../theme";

export default function RenderError({
  ctx,
  expression,
  err,
  phase,
  retry,
}: {
  ctx: RuntimeContext;
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
    <View backgroundColor="rgb(230, 104, 104)" padding={0.5}>
      <Text
        text={`Failed to evaluate ${
          expression ? nameKindOfExpression(expression) : "an expression"
        } during ${phase} because of: <${err}>${locationMessage}`}
        wrap
        color="rgb(245, 242, 242)"
      />
      <View layout="flex-row">
        <Button
          text="Dump error in console"
          onClick={() => {
            if (err) {
              console.error(err instanceof EvaluationError ? err.cause : err);
              ctx.log("error", err);
            }
          }}
        />
        {retry ? <Button onClick={retry} text="Retry" /> : null}
      </View>
    </View>
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
