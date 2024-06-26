import { useCallback, useRef, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import ErrorPopover from "./internal/ErrorPopover";
import { InputProps, InputPropsDocs } from "./internal/inputProps";
import { Closure } from "tal-eval";
import { CheckBox as ThemedCheckBox } from "../theme";
import {
  InputLabelProps,
  InputLabelPropsDocs,
} from "./internal/inputLabelProps";

type CheckBoxProps = {
  ctx: RuntimeContext;
  secondary?: boolean;
} & InputProps<boolean> &
  InputLabelProps;

export default function CheckBox({
  ctx,
  disabled,
  onChange,
  value,
  secondary,
  label,
}: CheckBoxProps) {
  const [lastError, setLastError] = useState(null as any);

  const handleChange = useCallback(
    async (value: boolean) => {
      try {
        if (onChange) {
          await ctx.callFunctionAsync(onChange as Closure, [value]);
        }
      } catch (err) {
        setLastError(err);
      }
    },
    [ctx, onChange]
  );
  const popoverTargetRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={popoverTargetRef}>
      <ThemedCheckBox
        onChange={handleChange}
        value={value}
        disabled={disabled}
        secondary={secondary}
        label={label}
      />
      <ErrorPopover
        target={popoverTargetRef.current}
        lastError={lastError}
        setLastError={setLastError}
      />
    </div>
  );
}

export const CheckBoxDocumentation: WidgetDocumentation<CheckBoxProps> = {
  description: "A checkbox to input a boolean value",
  props: {
    ...InputPropsDocs,
    ...InputLabelPropsDocs,
    secondary: "Give the secondary style",
  },
};
