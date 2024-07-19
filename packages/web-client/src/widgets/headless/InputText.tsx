import { useCallback, useRef, useState } from "react";
import ErrorPopover from "../internal/ErrorPopover";
import { InputProps } from "./inputProps";
import { InputText as ThemedInputText } from "../../theme";
import commonStyles from "../common.module.css";

type InputTextProps = {
  multiline: boolean;
  placeholder: string;
  onSubmit?: () => Promise<void>;
  type?: "text" | "email" | "url" | "password";
} & InputProps<string>;

export default function InputText({
  multiline,
  placeholder,
  onSubmit,
  type,
  onChange,
  value,
  disabled,
}: InputTextProps) {
  if (type && type !== "text" && multiline) {
    throw new Error(
      "Type and multiline can't be true at the same time for InputText"
    );
  }

  const [lastError, setLastError] = useState(null as any);

  const onSubmitHandler = useCallback(async () => {
    if (!onSubmit) return;
    try {
      await onSubmit();
    } catch (err) {
      setLastError(err);
    }
  }, [onSubmit]);

  const onChangeHandler = useCallback(
    (newValue: string) => {
      try {
        if (onChange) {
          onChange(newValue);
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
      <ThemedInputText
        multiline={multiline}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChangeHandler}
        onSubmit={onSubmitHandler}
        type={type}
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
