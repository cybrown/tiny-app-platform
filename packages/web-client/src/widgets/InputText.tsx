import { useCallback, useRef, useState } from "react";
import { Closure, RuntimeContext, WidgetDocumentation } from "tal-eval";
import ErrorPopover from "./internal/ErrorPopover";
import {
  BaseInputProps,
  InputProps,
  InputPropsDocs,
} from "./internal/inputProps";
import { InputText as ThemedInputText } from "../theme";
import commonStyles from "./common.module.css";

type BaseInputTextProps = {
  multiline?: boolean;
  placeholder?: string;
  onSubmit?: () => unknown;
  type?: "text" | "email" | "url" | "password";
} & BaseInputProps<string>;

function BaseInputText({
  multiline,
  placeholder,
  onSubmit,
  type,
  onChange,
  value,
  disabled,
}: BaseInputTextProps) {
  if (type && type !== "text" && multiline) {
    throw new Error(
      "Type and multiline can't be true at the same time for InputText"
    );
  }

  const [lastError, setLastError] = useState(null as any);

  const onSubmitHandler = useCallback(async () => {
    if (!onSubmit) return;
    try {
      await onSubmit();
    } catch (err) {
      setLastError(err);
    }
  }, [onSubmit]);

  const onChangeHandler = useCallback(
    async (newValue: string) => {
      if (!onChange) return;
      try {
        await onChange(newValue);
      } catch (err) {
        setLastError(err);
      }
    },
    [onChange]
  );

  const popoverTargetRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={commonStyles.refWrapper} ref={popoverTargetRef}>
      <ThemedInputText
        multiline={multiline}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChangeHandler}
        onSubmit={onSubmitHandler}
        type={type}
        value={value ?? ""}
      />
      <ErrorPopover
        target={popoverTargetRef.current}
        lastError={lastError}
        setLastError={setLastError}
      />
    </div>
  );
}

type InputTextProps = {
  ctx: RuntimeContext;
  multiline?: boolean;
  placeholder?: string;
  onSubmit?: Closure;
  type?: "text" | "email" | "url" | "password";
} & InputProps<string>;

export default function InputText({
  ctx,
  onSubmit,
  onChange,
  ...commonProps
}: InputTextProps) {
  const onSubmitHandler = useCallback(async () => {
    if (!onSubmit) return;
    return ctx.callFunctionAsync(onSubmit, []);
  }, [ctx, onSubmit]);

  const onChangeHandler = useCallback(
    (newValue: string) => {
      if (!onChange) return;
      return ctx.callFunctionAsync(onChange, [newValue]);
    },
    [ctx, onChange]
  );

  return (
    <BaseInputText
      onChange={onChangeHandler}
      onSubmit={onSubmitHandler}
      {...commonProps}
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
