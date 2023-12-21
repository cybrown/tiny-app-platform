import { DragEventHandler, useCallback } from "react";
import { InputFileProps } from "../../theme";

// TODO: find a solution out of Electron

const onDragOverHandler: DragEventHandler<HTMLInputElement> = (event) =>
  event.preventDefault();

export default function InputFile({
  placeholder,
  value,
  onChange,
  disabled,
}: InputFileProps) {
  const onDropHandler: DragEventHandler<HTMLInputElement> = useCallback(
    async (event) => {
      const files = event.dataTransfer.files;
      if (files.length) {
        const file = files[0];
        if ((file as any).path) {
          if (onChange) {
            onChange((file as any).path);
          }
          event.preventDefault();
        }
      }
    },
    [onChange]
  );

  return (
    <input
      placeholder={placeholder}
      type="text"
      onChange={(e) => onChange && onChange(e.target.value)}
      value={value}
      onDrop={onDropHandler}
      onDragOver={onDragOverHandler}
      disabled={disabled}
    />
  );
}
