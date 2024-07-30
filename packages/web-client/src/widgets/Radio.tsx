import { useCallback, useRef, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import ErrorPopover from "./internal/ErrorPopover";
import {
  BaseInputProps,
  InputProps,
  InputPropsDocs,
} from "./internal/inputProps";
import { Radio as ThemedRadio } from "../theme";
import {
  InputLabelProps,
  InputLabelPropsDocs,
} from "./internal/inputLabelProps";
import commonStyles from "./common.module.css";

type BaseRadioProps = {
  option: string | { value: string; label: string };
  secondary?: boolean;
} & BaseInputProps<string> &
  InputLabelProps;

function BaseRadio({
  disabled,
  onChange,
  value,
  option = "",
  secondary,
  label,
}: BaseRadioProps) {
  const [lastError, setLastError] = useState(null as any);

  const handleChange = useCallback(async () => {
    if (!onChange) return;
    try {
      await onChange(typeof option === "string" ? option : option.value);
    } catch (err) {
      setLastError(err);
    }
  }, [onChange, option]);

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

type RadioProps = {
  ctx: RuntimeContext;
  option: string | { value: string; label: string };
  secondary?: boolean;
} & InputProps<string> &
  InputLabelProps;

export default function Radio({ ctx, onChange, ...commonProps }: RadioProps) {
  const onChangeHandler = useCallback(
    (newValue: string) => {
      if (!onChange) return;
      return ctx.callFunctionAsync(onChange, [newValue]);
    },
    [ctx, onChange]
  );

  return <BaseRadio onChange={onChangeHandler} {...commonProps} />;
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
