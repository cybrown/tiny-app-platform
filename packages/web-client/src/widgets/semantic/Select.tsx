import { useCallback, useRef, useState } from "react";
import ErrorPopover from "../internal/ErrorPopover";
import { BaseInputProps } from "../internal/inputProps";
import { Select as ThemedSelect } from "../../theme";
import commonStyles from "./common.module.css";

type SelectProps = {
  options: (string | { value: string; label: string })[];
  placeholder?: string;
} & BaseInputProps<string>;

export default function Select({
  options,
  placeholder,
  onChange,
  value,
  disabled,
}: SelectProps) {
  const [lastError, setLastError] = useState(null as any);

  const showEmpty =
    value === undefined ||
    !options
      .map((a) => (typeof a === "string" ? a : a.value))
      .includes(value ?? "");

  const onChangeHandler = useCallback(
    async (newSelectedIndex: number) => {
      if (!onChange) return;
      try {
        const optionToSet = options[newSelectedIndex - (showEmpty ? 1 : 0)];
        const valueToSet =
          typeof optionToSet === "string" ? optionToSet : optionToSet.value;
        await onChange(valueToSet);
      } catch (err) {
        setLastError(err);
      }
    },
    [options, showEmpty, onChange]
  );

  const popoverTargetRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={commonStyles.refWrapper} ref={popoverTargetRef}>
      <ThemedSelect
        options={options.map((option) =>
          typeof option === "string" ? { label: option, value: option } : option
        )}
        disabled={disabled}
        onChange={onChangeHandler}
        placeholder={placeholder}
        showEmpty={showEmpty}
        value={value ?? ""}
      />
      <ErrorPopover
        target={popoverTargetRef.current}
        lastError={lastError}
        setLastError={setLastError}
      />
    </div>
  );
}
