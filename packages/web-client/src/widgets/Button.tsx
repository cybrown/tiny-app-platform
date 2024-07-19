import { useCallback } from "react";
import { Closure, RuntimeContext, WidgetDocumentation } from "tal-eval";
import {
  default as HeadlessButton,
  ButtonProps as HeadlessButtonProps,
} from "./headless/Button";

type ButtonProps = {
  ctx: RuntimeContext;
  onClick: Closure;
} & Exclude<HeadlessButtonProps, "onClick">;

export default function Button({ ctx, onClick, ...props }: ButtonProps) {
  const doClickAction = useCallback(async () => {
    if (!onClick) return;
    return await ctx.callFunctionAsync(onClick, []);
  }, [ctx, onClick]);

  return <HeadlessButton {...props} onClick={doClickAction} />;
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
