import { ChangeEvent, DragEventHandler, useCallback, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import styles from "./InputFile.module.css";
import ErrorPopin from "./internal/ErrorPopin";
import { InputProps, InputPropsDocs } from "./internal/inputProps";

type InputFileProps = {
  ctx: RuntimeContext;
  placeholder: string;
} & InputProps<string>;

// TODO: find a solution out of Electron

const onDragOverHandler: DragEventHandler<HTMLInputElement> = (event) =>
  event.preventDefault();

export default function InputFile({
  ctx,
  bindTo,
  placeholder,
  value,
  onChange,
}: InputFileProps) {
  const [lastError, setLastError] = useState(null as any);

  const onDropHandler: DragEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      try {
        const files = event.dataTransfer.files;
        if (files.length) {
          const file = files[0];
          if ((file as any).path) {
            if (bindTo) {
              ctx.setValue(bindTo, (file as any).path);
            }
            if (onChange) {
              ctx.callFunctionAsync(onChange, [(file as any).path]);
            }
            event.preventDefault();
          }
        }
      } catch (err) {
        setLastError(err);
      }
    },
    [bindTo, ctx, onChange]
  );

  const onInputChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      try {
        if (bindTo) {
          ctx.setValue(bindTo, e.target.value);
        }
        if (onChange) {
          ctx.callFunctionAsync(onChange, [e.target.value]);
        }
      } catch (err) {
        setLastError(err);
      }
    },
    [bindTo, ctx, onChange]
  );

  return (
    <>
      <input
        className={styles.InputFile}
        placeholder={placeholder}
        type="text"
        onChange={onInputChangeHandler}
        value={bindTo ? (ctx.evaluateOr(bindTo, "") as string) : value}
        onDrop={onDropHandler}
        onDragOver={onDragOverHandler}
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
