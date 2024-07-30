import { useCallback, useRef, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import ErrorPopover from "./internal/ErrorPopover";
import {
  BaseInputProps,
  InputProps,
  InputPropsDocs,
} from "./internal/inputProps";
import { Select as ThemedSelect } from "../theme";
import commonStyles from "./common.module.css";

type BaseSelectProps = {
  options: (string | { value: string; label: string })[];
  placeholder?: string;
} & BaseInputProps<string>;

function BaseSelect({
  options,
  placeholder,
  onChange,
  value,
  disabled,
}: BaseSelectProps) {
  const [lastError, setLastError] = useState(null as any);

  const showEmpty =
    value === undefined ||
    !options
      .map((a) => (typeof a === "string" ? a : a.value))
      .includes(value ?? "");

  const onChangeHandler = useCallback(
    async (newSelectedIndex: number) => {
      if (!onChange) return;
      try {
        const optionToSet = options[newSelectedIndex - (showEmpty ? 1 : 0)];
        const valueToSet =
          typeof optionToSet === "string" ? optionToSet : optionToSet.value;
        await onChange(valueToSet);
      } catch (err) {
        setLastError(err);
      }
    },
    [options, showEmpty, onChange]
  );

  const popoverTargetRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={commonStyles.refWrapper} ref={popoverTargetRef}>
      <ThemedSelect
        options={options.map((option) =>
          typeof option === "string" ? { label: option, value: option } : option
        )}
        disabled={disabled}
        onChange={onChangeHandler}
        placeholder={placeholder}
        showEmpty={showEmpty}
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

type SelectProps = {
  ctx: RuntimeContext;
  options: (string | { value: string; label: string })[];
  placeholder?: string;
} & InputProps<string>;

export default function Select({ ctx, onChange, ...commonProps }: SelectProps) {
  const onChangeHandler = useCallback(
    async (newValue: string) => {
      if (!onChange) return;
      return ctx.callFunctionAsync(onChange, [newValue]);
    },
    [ctx, onChange]
  );

  return <BaseSelect onChange={onChangeHandler} {...commonProps} />;
}

export const SelectDocumentation: WidgetDocumentation<SelectProps> = {
  description: "Pick a string value from a predefined list",
  props: {
    options:
      "List of all possible values as string | {value: string, label: string}",
    placeholder: "Message to show when the widget is empty",
    ...InputPropsDocs,
  },
};
