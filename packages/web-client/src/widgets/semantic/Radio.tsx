import { useCallback, useRef, useState } from "react";
import ErrorPopover from "../internal/ErrorPopover";
import { BaseInputProps } from "../internal/inputProps";
import { Radio as ThemedRadio } from "../../theme";
import { InputLabelProps } from "../internal/inputLabelProps";
import commonStyles from "./common.module.css";

type RadioProps = {
  option: string | { value: string; label: string };
  secondary?: boolean;
} & BaseInputProps<string> &
  InputLabelProps;

export default function Radio({
  disabled,
  onChange,
  value,
  option = "",
  secondary,
  label,
}: RadioProps) {
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
