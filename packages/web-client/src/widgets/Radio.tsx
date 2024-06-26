import { useCallback, useRef, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import ErrorPopover from "./internal/ErrorPopover";
import { InputProps, InputPropsDocs } from "./internal/inputProps";
import { Closure } from "tal-eval";
import { Radio as ThemedRadio } from "../theme";
import {
  InputLabelProps,
  InputLabelPropsDocs,
} from "./internal/inputLabelProps";
import commonStyles from "./common.module.css";

type RadioProps = {
  ctx: RuntimeContext;
  option: string | { value: string; label: string };
  secondary?: boolean;
} & InputProps<string> &
  InputLabelProps;

export default function Radio({
  ctx,
  disabled,
  onChange,
  value,
  option = "",
  secondary,
  label,
}: RadioProps) {
  const [lastError, setLastError] = useState(null as any);

  const handleChange = useCallback(async () => {
    try {
      if (onChange) {
        await ctx.callFunctionAsync(onChange as Closure, [
          typeof option === "string" ? option : option.value,
        ]);
      }
    } catch (err) {
      setLastError(err);
    }
  }, [ctx, onChange, option]);

  const popoverTargetRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={commonStyles.refWrapper} ref={popoverTargetRef}>
      <ThemedRadio
        option={typeof option === "string" ? option : option.value}
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

export const RadioDocumentation: WidgetDocumentation<RadioProps> = {
  description: "Radio to select a value",
  props: {
    ...InputPropsDocs,
    ...InputLabelPropsDocs,
    option:
      "Value to set when this radio is checked, string | {value: string, label: string}",
    secondary: "Give the secondary style",
  },
};
