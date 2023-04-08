import React, { useCallback, useState } from "react";
import { AddressableExpression } from "tal-parser";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import styles from "./Switch.module.css";
import ErrorPopin from "./internal/ErrorPopin";

type SwitchProps = {
  ctx: RuntimeContext;
  bindTo: AddressableExpression;
};

export default function Switch({ ctx, bindTo }: SwitchProps) {
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
      <div className={styles.SwitchContainer}>
        <input
          className={styles.Switch}
          type="checkbox"
          checked={ctx.evaluateOr(bindTo, false) as boolean}
          onChange={handleChange}
        />
        <div className={styles.background}></div>
        <div className={styles.switch}></div>
      </div>
      <ErrorPopin lastError={lastError} setLastError={setLastError} />
    </>
  );
}

export const SwitchDocumentation: WidgetDocumentation<SwitchProps> = {
  description: "Input a boolean value. Like Checkbox but with another style",
  props: {
    bindTo: "Variable declared with var to bind this widget value to",
  },
};
