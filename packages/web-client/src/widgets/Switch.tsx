import React, { useCallback, useState } from "react";
import { RuntimeContext, WidgetDocumentation, Closure } from "tal-eval";
import styles from "./Switch.module.css";
import ErrorPopin from "./internal/ErrorPopin";
import { InputProps, InputPropsDocs } from "./internal/inputProps";

type SwitchProps = {
  ctx: RuntimeContext;
} & InputProps<boolean>;

export default function Switch({
  ctx,
  bindTo,
  onChange,
  value,
  disabled,
}: SwitchProps) {
  const [lastError, setLastError] = useState(null as any);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        if (bindTo) {
          ctx.setValue(bindTo, e.target.checked);
        }
        if (onChange) {
          await ctx.callFunctionAsync(onChange as Closure, [e.target.checked]);
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
          disabled={disabled}
        />
        <div className={styles.background + (disabled ? ' ' + styles.backgroundDisabled : '')}></div>
        <div className={styles.switch + (disabled ? ' ' + styles.switchDisabled : '')}></div>
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
