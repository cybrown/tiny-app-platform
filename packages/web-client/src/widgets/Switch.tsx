import React, { useCallback, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import styles from "./Switch.module.css";
import ErrorPopin from "./internal/ErrorPopin";
import { InputProps, InputPropsDocs } from "./internal/inputProps";

type SwitchProps = {
  ctx: RuntimeContext;
} & InputProps<boolean>;

export default function Switch({ ctx, bindTo, onChange, value }: SwitchProps) {
  const [lastError, setLastError] = useState(null as any);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        if (bindTo) {
          ctx.setValue(bindTo, e.target.checked);
        }
        if (onChange) {
          ctx.callFunctionAsync(onChange, [e.target.checked]);
        }
      } catch (err) {
        setLastError(err);
      }
    },
    [ctx, bindTo, onChange]
  );

  return (
    <>
      <div className={styles.SwitchContainer}>
        <input
          className={styles.Switch}
          type="checkbox"
          checked={bindTo ? (ctx.evaluateOr(bindTo, false) as boolean) : value}
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
    ...InputPropsDocs,
  },
};
