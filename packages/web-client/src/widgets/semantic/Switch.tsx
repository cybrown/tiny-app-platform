import { useCallback, useRef, useState } from "react";
import ErrorPopover from "../internal/ErrorPopover";
import { BaseInputProps } from "../internal/inputProps";
import { Switch as ThemedSwitch } from "../../theme";
import { InputLabelProps } from "../internal/inputLabelProps";
import commonStyles from "./common.module.css";

type SwitchProps = {
  secondary?: boolean;
} & BaseInputProps<boolean> &
  InputLabelProps;

export default function Switch({
  onChange,
  value,
  disabled,
  secondary,
  label,
}: SwitchProps) {
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
