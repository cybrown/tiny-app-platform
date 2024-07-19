import { useCallback } from "react";
import { Closure, RuntimeContext, WidgetDocumentation } from "tal-eval";
import { InputProps, InputPropsDocs } from "./internal/inputProps";
import { default as HeadlessInputText } from "./headless/InputText";

type InputTextProps = {
  ctx: RuntimeContext;
  multiline: boolean;
  placeholder: string;
  onSubmit?: Closure;
  type?: "text" | "email" | "url" | "password";
} & InputProps<string>;

export default function InputText({
  ctx,
  multiline,
  placeholder,
  onSubmit,
  type,
  onChange,
  value,
  disabled,
}: InputTextProps) {
  if (type && type !== "text" && multiline) {
    throw new Error(
      "Type and multiline can't be true at the same time for InputText"
    );
  }

  const onSubmitHandler = useCallback(async () => {
    if (!onSubmit) return;
    await ctx.callFunctionAsync(onSubmit, []);
  }, [ctx, onSubmit]);

  const onChangeHandler = useCallback(
    async (newValue: string) => {
      if (onChange) {
        ctx.callFunction(onChange as Closure, [newValue]);
      }
    },
    [ctx, onChange]
  );

  return (
    <HeadlessInputText
      multiline={multiline}
      placeholder={placeholder}
      disabled={disabled}
      onChange={onChangeHandler}
      onSubmit={onSubmitHandler}
      type={type}
      value={value ?? ""}
    />
  );
}

export const InputTextDocumentation: WidgetDocumentation<InputTextProps> = {
  description: "Allow the user to input a string",
  props: {
    multiline: "Allow multiple lines of text. Not compatible with type",
    onSubmit: "Expression to evaluate when the user presses enter",
    type: "One of: text, email, url, password. Not compatible with multiline",
    placeholder: "Message to show when the widget is empty",
    ...InputPropsDocs,
  },
};
