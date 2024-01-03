import { useCallback, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import ErrorPopin from "./internal/ErrorPopin";
import { InputProps, InputPropsDocs } from "./internal/inputProps";
import { Closure } from "tal-eval";
import { Radio as ThemedRadio } from "../theme";

type RadioProps = {
  ctx: RuntimeContext;
  option: string | { value: string; label: string };
  secondary?: boolean;
} & InputProps<string>;

export default function Radio({
  ctx,
  disabled,
  onChange,
  value,
  option,
  secondary,
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

  return (
    <>
      <ThemedRadio
        option={typeof option === "string" ? option : option.value}
        onChange={handleChange}
        value={value}
        disabled={disabled}
        secondary={secondary}
      />
      <ErrorPopin lastError={lastError} setLastError={setLastError} />
    </>
  );
}

export const RadioDocumentation: WidgetDocumentation<RadioProps> = {
  description: "Radio to select a value",
  props: {
    ...InputPropsDocs,
    option:
      "Value to set when this radio is checked, string | {value: string, label: string}",
    secondary: "Give the secondary style",
  },
};
