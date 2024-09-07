import { useCallback } from "react";
import { Closure, RuntimeContext, WidgetDocumentation } from "tal-eval";
import SemanticButton from "./semantic/Button";

type ButtonProps = {
  ctx: RuntimeContext;
  text: string;
  onClick: Closure;
  confirm?: string | boolean;
  secondary?: boolean;
  disabled?: boolean;
  outline?: boolean;
  link?: boolean;
};

export default function Button({ ctx, onClick, ...commonProps }: ButtonProps) {
  const onClickHandler = useCallback(() => {
    return onClick && ctx.callFunctionAsync(onClick, []);
  }, [ctx, onClick]);

  return <SemanticButton onClick={onClickHandler} {...commonProps} />;
}

export const ButtonDocumentation: WidgetDocumentation<ButtonProps> = {
  description: "A clickable button",
  props: {
    confirm: "Message to show to confirm the action",
    disabled: "Do not allow the user to interact with this widget",
    onClick: "Expression to evaluate on click",
    secondary: "Give the secondary style",
    text: "Message to show inside the button",
    outline: "Give an outlined style",
    link: "Give a link style",
  },
};
