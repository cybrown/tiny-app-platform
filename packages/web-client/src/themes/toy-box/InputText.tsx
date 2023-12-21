import { ChangeEvent, useCallback } from "react";
import styles from "./InputText.module.css";
import { InputTextProps } from "../../theme";

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

  const onKeyDownHandler = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSubmit) {
        await onSubmit();
      }
    },
    [onSubmit]
  );

  const onInputChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      onChange && onChange(e.currentTarget.value),
    [onChange]
  );

  const onTextareaChangeHandler = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange && onChange(e.currentTarget.value);
    },
    [onChange]
  );

  return (
    <>
      {multiline ? (
        <textarea
          className={styles.InputText}
          placeholder={placeholder}
          onChange={onTextareaChangeHandler}
          disabled={disabled}
          value={value ?? ""}
        />
      ) : (
        <input
          className={styles.InputText}
          placeholder={placeholder}
          type={type ?? "text"}
          onChange={onInputChangeHandler}
          onKeyDown={onKeyDownHandler}
          disabled={disabled}
          value={value ?? ""}
        />
      )}
    </>
  );
}
