import { useCallback, useState } from "react";
import { AddressableExpression } from "tal-parser";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import styles from "./Select.module.css";
import ErrorPopin from "./internal/ErrorPopin";

type SelectProps = {
  ctx: RuntimeContext;
  bindTo: AddressableExpression;
  options: (string | { value: string; label: string })[];
  placeholder?: string;
};

export default function Select({
  ctx,
  bindTo,
  options,
  placeholder,
}: SelectProps) {
  const [lastError, setLastError] = useState(null as any);

  const showEmpty =
    !ctx.hasValue(bindTo) ||
    !options
      .map((a) => (typeof a === "string" ? a : a.value))
      .includes(ctx.evaluate(bindTo) as string);

  const onChangeHandler = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      try {
        const optionToSet =
          options[e.target.selectedIndex - (showEmpty ? 1 : 0)];
        ctx.setValue(
          bindTo,
          typeof optionToSet === "string" ? optionToSet : optionToSet.value
        );
      } catch (err) {
        setLastError(err);
      }
    },
    [bindTo, ctx, options, showEmpty]
  );

  return (
    <>
      <select
        className={[styles.Select, showEmpty ? styles.selectDisabled : ""].join(
          " "
        )}
        onChange={onChangeHandler}
        value={ctx.evaluateOr(bindTo, "") as string}
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
    bindTo: "Variable declared with var to bind this widget value to",
    options: "List of all possible values as string",
    placeholder: "Message to show when the widget is empty",
  },
};
