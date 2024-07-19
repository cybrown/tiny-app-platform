import { useCallback, useRef, useState } from "react";
import ErrorPopover from "../internal/ErrorPopover";
import { InputProps } from "./inputProps";
import { CheckBox as ThemedCheckBox } from "../../theme";
import { InputLabelProps } from "../internal/inputLabelProps";
import commonStyles from "../common.module.css";

type CheckBoxProps = {
  secondary?: boolean;
} & InputProps<boolean> &
  InputLabelProps;

export default function CheckBox({
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
          await onChange(value);
        }
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
