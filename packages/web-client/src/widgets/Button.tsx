import { useCallback } from "react";
import {
  Closure,
  RuntimeContext,
  typeAny,
  typeBoolean,
  typeFunction,
  typeKindedRecord,
  typeNull,
  typeString,
  typeUnion,
  WidgetDocumentation,
} from "tal-eval";
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
  shortcut?: string;
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
    shortcut:
      "Keyboard shortcut, only one character without modifier is supported",
  },
  type: typeFunction(
    [
      { name: "confirm", type: typeUnion(typeNull(), typeString()) },
      { name: "disabled", type: typeUnion(typeNull(), typeBoolean()) },
      {
        name: "onClick",
        type: typeUnion(typeNull(), typeFunction([], [], typeAny())),
      },
      { name: "secondary", type: typeUnion(typeNull(), typeBoolean()) },
      { name: "text", type: typeString() },
      { name: "outline", type: typeUnion(typeNull(), typeBoolean()) },
      { name: "link", type: typeUnion(typeNull(), typeBoolean()) },
      { name: "shortcut", type: typeUnion(typeNull(), typeString()) },
    ],
    [],
    typeKindedRecord()
  ),
};
