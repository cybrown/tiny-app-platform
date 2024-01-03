import { useCallback, useState } from "react";
import { RuntimeContext, WidgetDocumentation, Closure } from "tal-eval";
import ErrorPopin from "./internal/ErrorPopin";
import { InputProps, InputPropsDocs } from "./internal/inputProps";
import { Switch as ThemedSwitch } from "../theme";

type SwitchProps = {
  ctx: RuntimeContext;
  secondary?: boolean;
} & InputProps<boolean>;

export default function Switch({
  ctx,
  onChange,
  value,
  disabled,
  secondary,
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

  return (
    <>
      <ThemedSwitch
        disabled={disabled}
        onChange={handleChange}
        value={value}
        secondary={secondary}
      />
      <ErrorPopin lastError={lastError} setLastError={setLastError} />
    </>
  );
}

export const SwitchDocumentation: WidgetDocumentation<SwitchProps> = {
  description: "Input a boolean value. Like Checkbox but with another style",
  props: {
    ...InputPropsDocs,
    secondary: "Give the secondary style",
  },
};
