import React, { useCallback, useState } from "react";
import { AddressableExpression } from "tal-parser";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import styles from "./CheckBox.module.css";
import ErrorPopin from "./internal/ErrorPopin";

type CheckBoxProps = {
  ctx: RuntimeContext;
  bindTo: AddressableExpression;
  disabled?: boolean;
};

export default function CheckBox({ ctx, bindTo, disabled }: CheckBoxProps) {
  const [lastError, setLastError] = useState(null as any);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        ctx.setValue(bindTo, e.target.checked);
      } catch (err) {
        setLastError(err);
      }
    },
    [ctx, bindTo]
  );

  return (
    <>
      <div className={styles.CheckBox}>
        <input
          type="checkbox"
          checked={ctx.evaluateOr(bindTo, false) as boolean}
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
    bindTo: "Variable declared with var to bind this widget value to",
    disabled: "Do not allow changing the value",
  },
};
