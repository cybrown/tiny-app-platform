import { useCallback, useRef, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import ErrorPopover from "./internal/ErrorPopover";
import {
  BaseInputProps,
  InputProps,
  InputPropsDocs,
} from "./internal/inputProps";
import { Switch as ThemedSwitch } from "../theme";
import {
  InputLabelProps,
  InputLabelPropsDocs,
} from "./internal/inputLabelProps";
import commonStyles from "./common.module.css";

type BaseSwitchProps = {
  secondary?: boolean;
} & BaseInputProps<boolean> &
  InputLabelProps;

function BaseSwitch({
  onChange,
  value,
  disabled,
  secondary,
  label,
}: BaseSwitchProps) {
  const [lastError, setLastError] = useState(null as any);

  const handleChange = useCallback(
    async (value: boolean) => {
      if (!onChange) return;
      try {
        await onChange(value);
      } catch (err) {
        setLastError(err);
      }
    },
    [onChange]
  );

  const popoverTargetRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={commonStyles.refWrapper} ref={popoverTargetRef}>
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

type SwitchProps = {
  ctx: RuntimeContext;
  secondary?: boolean;
} & InputProps<boolean> &
  InputLabelProps;

export default function Switch({ ctx, onChange, ...commonProps }: SwitchProps) {
  const onChangeHandler = useCallback(
    async (value: boolean) => {
      if (!onChange) return;
      return ctx.callFunctionAsync(onChange, [value]);
    },
    [ctx, onChange]
  );

  return <BaseSwitch onChange={onChangeHandler} {...commonProps} />;
}

export const SwitchDocumentation: WidgetDocumentation<SwitchProps> = {
  description: "Input a boolean value. Like Checkbox but with another style",
  props: {
    ...InputPropsDocs,
    ...InputLabelPropsDocs,
    secondary: "Give the secondary style",
  },
};
