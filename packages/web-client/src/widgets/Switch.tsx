import { useCallback, useRef, useState } from "react";
import { RuntimeContext, WidgetDocumentation, Closure } from "tal-eval";
import ErrorPopover from "./internal/ErrorPopover";
import { InputProps, InputPropsDocs } from "./internal/inputProps";
import { Switch as ThemedSwitch } from "../theme";
import {
  InputLabelProps,
  InputLabelPropsDocs,
} from "./internal/inputLabelProps";

type SwitchProps = {
  ctx: RuntimeContext;
  secondary?: boolean;
} & InputProps<boolean> &
  InputLabelProps;

export default function Switch({
  ctx,
  onChange,
  value,
  disabled,
  secondary,
  label,
}: SwitchProps) {
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
      <ThemedSwitch
        disabled={disabled}
        onChange={handleChange}
        value={value}
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

export const SwitchDocumentation: WidgetDocumentation<SwitchProps> = {
  description: "Input a boolean value. Like Checkbox but with another style",
  props: {
    ...InputPropsDocs,
    ...InputLabelPropsDocs,
    secondary: "Give the secondary style",
  },
};
