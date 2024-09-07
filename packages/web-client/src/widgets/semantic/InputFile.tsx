import { useCallback, useRef, useState } from "react";
import ErrorPopover from "../internal/ErrorPopover";
import { BaseInputProps } from "../internal/inputProps";
import { InputFile as ThemedInputFile } from "../../theme";
import commonStyles from "./common.module.css";

type InputFileProps = {
  placeholder?: string;
} & BaseInputProps<string>;

export default function InputFile({
  placeholder,
  value,
  onChange,
  disabled,
}: InputFileProps) {
  const [lastError, setLastError] = useState(null as any);

  const onChangeHandler = useCallback(
    async (newFile: string) => {
      if (!onChange) return;
      try {
        await onChange(newFile);
      } catch (err) {
        setLastError(err);
      }
    },
    [onChange]
  );

  const popoverTargetRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={commonStyles.refWrapper} ref={popoverTargetRef}>
      <ThemedInputFile
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={onChangeHandler}
      />
      <ErrorPopover
        target={popoverTargetRef.current}
        lastError={lastError}
        setLastError={setLastError}
      />
    </div>
  );
}
