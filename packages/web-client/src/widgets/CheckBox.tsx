import { useCallback, useRef, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import ErrorPopover from "./internal/ErrorPopover";
import {
  BaseInputProps,
  InputProps,
  InputPropsDocs,
} from "./internal/inputProps";
import { CheckBox as ThemedCheckBox } from "../theme";
import {
  InputLabelProps,
  InputLabelPropsDocs,
} from "./internal/inputLabelProps";
import commonStyles from "./common.module.css";

type BaseCheckBoxProps = {
  secondary?: boolean;
} & BaseInputProps<boolean> &
  InputLabelProps;

function BaseCheckBox({
  disabled,
  onChange,
  value,
  secondary,
  label,
}: BaseCheckBoxProps) {
  const [lastError, setLastError] = useState(null as any);

  const handleChange = useCallback(
    async (newValue: boolean) => {
      if (!onChange) return;
      try {
        await onChange(newValue);
      } catch (err) {
        setLastError(err);
      }
    },
    [onChange]
  );
  const popoverTargetRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={commonStyles.refWrapper} ref={popoverTargetRef}>
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

type CheckBoxProps = {
  ctx: RuntimeContext;
  secondary?: boolean;
} & InputProps<boolean> &
  InputLabelProps;

export default function CheckBox({
  ctx,
  onChange,
  ...commonProps
}: CheckBoxProps) {
  const onChangeHandler = useCallback(
    (newValue: boolean) => {
      if (!onChange) return;
      return ctx.callFunctionAsync(onChange, [newValue]);
    },
    [ctx, onChange]
  );

  return <BaseCheckBox onChange={onChangeHandler} {...commonProps} />;
}

export const CheckBoxDocumentation: WidgetDocumentation<CheckBoxProps> = {
  description: "A checkbox to input a boolean value",
  props: {
    ...InputPropsDocs,
    ...InputLabelPropsDocs,
    secondary: "Give the secondary style",
  },
};
