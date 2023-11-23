import { ChangeEvent, DragEventHandler, useCallback, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import styles from "./InputFile.module.css";
import ErrorPopin from "./internal/ErrorPopin";
import { InputProps, InputPropsDocs } from "./internal/inputProps";
import { Closure } from "tal-eval";

type InputFileProps = {
  ctx: RuntimeContext;
  placeholder: string;
} & InputProps<string>;

// TODO: find a solution out of Electron

const onDragOverHandler: DragEventHandler<HTMLInputElement> = (event) =>
  event.preventDefault();

export default function InputFile({
  ctx,
  placeholder,
  value,
  onChange,
  disabled,
}: InputFileProps) {
  const [lastError, setLastError] = useState(null as any);

  const onDropHandler: DragEventHandler<HTMLInputElement> = useCallback(
    async (event) => {
      try {
        const files = event.dataTransfer.files;
        if (files.length) {
          const file = files[0];
          if ((file as any).path) {
            if (onChange) {
              await ctx.callFunctionAsync(onChange as Closure, [
                (file as any).path,
              ]);
            }
            event.preventDefault();
          }
        }
      } catch (err) {
        setLastError(err);
      }
    },
    [ctx, onChange]
  );

  const onInputChangeHandler = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      try {
        if (onChange) {
          await ctx.callFunctionAsync(onChange as Closure, [e.target.value]);
        }
      } catch (err) {
        setLastError(err);
      }
    },
    [ctx, onChange]
  );

  return (
    <>
      <input
        className={styles.InputFile}
        placeholder={placeholder}
        type="text"
        onChange={onInputChangeHandler}
        value={value}
        onDrop={onDropHandler}
        onDragOver={onDragOverHandler}
        disabled={disabled}
      />
      <ErrorPopin lastError={lastError} setLastError={setLastError} />
    </>
  );
}

export const InputFileDocumentation: WidgetDocumentation<InputFileProps> = {
  description:
    "Input a file from a path located on the server (only compatible with electron)",
  props: {
    placeholder: "Message to show when the widget is empty",
    ...InputPropsDocs,
  },
};
