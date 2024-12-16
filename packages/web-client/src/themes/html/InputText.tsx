import { ChangeEvent, useCallback } from "react";
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

  const onKeyDownMultilineHandler = useCallback(
    async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey && e.key === "Enter" && onSubmit) {
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
          className="tap-input-text"
          placeholder={placeholder}
          onChange={onTextareaChangeHandler}
          onKeyDown={onKeyDownMultilineHandler}
          disabled={disabled}
          value={value ?? ""}
        />
      ) : (
        <input
          className="tap-input-text"
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
