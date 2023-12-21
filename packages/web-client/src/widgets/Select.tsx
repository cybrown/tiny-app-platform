import { useCallback, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import ErrorPopin from "./internal/ErrorPopin";
import { InputProps, InputPropsDocs } from "./internal/inputProps";
import { Closure } from "tal-eval";
import { useTheme } from "../theme";

type SelectProps = {
  ctx: RuntimeContext;
  options: (string | { value: string; label: string })[];
  placeholder?: string;
} & InputProps<string>;

export default function Select({
  ctx,
  options,
  placeholder,
  onChange,
  value,
  disabled,
}: SelectProps) {
  const [lastError, setLastError] = useState(null as any);

  const showEmpty =
    value === undefined ||
    !options
      .map((a) => (typeof a === "string" ? a : a.value))
      .includes(value ?? "");

  const onChangeHandler = useCallback(
    async (newSelectedIndex: number) => {
      try {
        const optionToSet = options[newSelectedIndex - (showEmpty ? 1 : 0)];
        const valueToSet =
          typeof optionToSet === "string" ? optionToSet : optionToSet.value;
        if (onChange) {
          await ctx.callFunctionAsync(onChange as Closure, [valueToSet]);
        }
      } catch (err) {
        setLastError(err);
      }
    },
    [ctx, options, showEmpty, onChange]
  );

  const theme = useTheme();

  return (
    <>
      <theme.Select
        options={options.map((o) => (typeof o == "string" ? o : o.label))}
        disabled={disabled}
        onChange={onChangeHandler}
        placeholder={placeholder}
        showEmpty={showEmpty}
        value={value ?? ""}
      />
      <ErrorPopin lastError={lastError} setLastError={setLastError} />
    </>
  );
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
