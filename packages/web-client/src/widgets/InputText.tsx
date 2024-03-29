import { ChangeEvent, useCallback, useState } from "react";
import { Closure, RuntimeContext, WidgetDocumentation } from "tal-eval";
import ErrorPopin from "./internal/ErrorPopin";
import styles from "./InputText.module.css";
import { InputProps, InputPropsDocs } from "./internal/inputProps";

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

  const [lastError, setLastError] = useState(null as any);

  const onKeyDownHandler = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      try {
        if (e.key === "Enter" && onSubmit) {
          await ctx.callFunctionAsync(onSubmit, []);
        }
      } catch (err) {
        setLastError(err);
      }
    },
    [ctx, onSubmit]
  );

  const onInputChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      try {
        if (onChange) {
          ctx.callFunction(onChange as Closure, [e.currentTarget.value]);
        }
      } catch (err) {
        setLastError(err);
      }
    },
    [ctx, onChange]
  );

  const onTextareaChangeHandler = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      try {
        if (onChange) {
          ctx.callFunction(onChange as Closure, [e.currentTarget.value]);
        }
      } catch (err) {
        setLastError(err);
      }
    },
    [ctx, onChange]
  );

  return (
    <>
      {multiline ? (
        <textarea
          className={styles.InputText}
          placeholder={placeholder}
          onChange={onTextareaChangeHandler}
          disabled={disabled}
          value={value ?? ""}
        />
      ) : (
        <input
          className={styles.InputText}
          placeholder={placeholder}
          type={type ?? "text"}
          onChange={onInputChangeHandler}
          onKeyDown={onKeyDownHandler}
          disabled={disabled}
          value={value ?? ""}
        />
      )}
      <ErrorPopin lastError={lastError} setLastError={setLastError} />
    </>
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
