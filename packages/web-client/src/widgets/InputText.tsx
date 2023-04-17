import { ChangeEvent, useCallback, useState } from "react";
import { FunctionExpression } from "tal-parser";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import ErrorPopin from "./internal/ErrorPopin";
import styles from "./InputText.module.css";
import { AddressableExpression } from "tal-parser";

type InputTextProps = {
  ctx: RuntimeContext;
  bindTo: AddressableExpression;
  multiline: boolean;
  placeholder: string;
  onSubmit?: FunctionExpression;
  type?: "text" | "email" | "url" | "password";
};

export default function InputText({
  ctx,
  multiline,
  placeholder,
  bindTo,
  onSubmit,
  type,
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
        ctx.setValue(bindTo, e.target.value);
      } catch (err) {
        setLastError(err);
      }
    },
    [bindTo, ctx]
  );

  const onTextareaChangeHandler = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      try {
        ctx.setValue(bindTo, e.target.value);
      } catch (err) {
        setLastError(err);
      }
    },
    [bindTo, ctx]
  );

  return (
    <>
      {multiline ? (
        <textarea
          className={styles.InputText}
          placeholder={placeholder}
          onChange={onTextareaChangeHandler}
          value={ctx.evaluateOr(bindTo, "") as string}
        />
      ) : (
        <input
          className={styles.InputText}
          placeholder={placeholder}
          type={type ?? "text"}
          onChange={onInputChangeHandler}
          onKeyDown={onKeyDownHandler}
          value={ctx.evaluateOr(bindTo, "") as string}
        />
      )}
      <ErrorPopin lastError={lastError} setLastError={setLastError} />
    </>
  );
}

export const InputTextDocumentation: WidgetDocumentation<InputTextProps> = {
  description: "Allow the user to input a string",
  props: {
    bindTo: "Variable declared with var to bind this widget value to",
    multiline: "Allow multiple lines of text. Not compatible with type",
    onSubmit: "Expression to evaluate when the user presses enter",
    type: "One of: text, email, url, password. Not compatible with multiline",
    placeholder: "Message to show when the widget is empty",
  },
};
