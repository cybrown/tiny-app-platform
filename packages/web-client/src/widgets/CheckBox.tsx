import React, { useCallback, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import styles from "./CheckBox.module.css";
import ErrorPopin from "./internal/ErrorPopin";
import { InputProps, InputPropsDocs } from "./internal/inputProps";
import { Closure } from "tal-eval";

type CheckBoxProps = {
  ctx: RuntimeContext;
} & InputProps<boolean>;

export default function CheckBox({
  ctx,
  disabled,
  onChange,
  value,
}: CheckBoxProps) {
  const [lastError, setLastError] = useState(null as any);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        if (onChange) {
          await ctx.callFunctionAsync(onChange as Closure, [e.target.checked]);
        }
      } catch (err) {
        setLastError(err);
      }
    },
    [ctx, onChange]
  );

  return (
    <>
      <div className={styles.CheckBox + (disabled ? ' ' + styles.disabled : '')}>
        <input
          type="checkbox"
          checked={value}
          onChange={handleChange}
          disabled={disabled}
        />
        <div className={styles.checkMark}></div>
      </div>
      <ErrorPopin lastError={lastError} setLastError={setLastError} />
    </>
  );
}

export const CheckBoxDocumentation: WidgetDocumentation<CheckBoxProps> = {
  description: "A checkbox to input a boolean value",
  props: {
    ...InputPropsDocs,
  },
};
