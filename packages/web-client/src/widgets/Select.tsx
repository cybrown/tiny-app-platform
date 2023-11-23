import { useCallback, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import styles from "./Select.module.css";
import ErrorPopin from "./internal/ErrorPopin";
import { InputProps, InputPropsDocs } from "./internal/inputProps";
import { Closure } from "tal-eval";

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
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      try {
        const optionToSet =
          options[e.target.selectedIndex - (showEmpty ? 1 : 0)];
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

  return (
    <>
      <select
        className={[styles.Select, showEmpty ? styles.selectDisabled : ""].join(
          " "
        )}
        onChange={onChangeHandler}
        value={value ?? ""}
        disabled={disabled}
      >
        {showEmpty ? (
          <option className={styles.optionDisabled}>{placeholder}</option>
        ) : null}
        {options.map((option) =>
          typeof option === "string" ? (
            <option className={styles.option} key={option} value={option}>
              {option}
            </option>
          ) : (
            <option
              className={styles.option}
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          )
        )}
      </select>
      <ErrorPopin lastError={lastError} setLastError={setLastError} />
    </>
  );
}

export const SelectDocumentation: WidgetDocumentation<SelectProps> = {
  description: "Pick a string value from a predefined list",
  props: {
    options: "List of all possible values as string",
    placeholder: "Message to show when the widget is empty",
    ...InputPropsDocs,
  },
};
