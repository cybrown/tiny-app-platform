import { ChangeEvent, DragEventHandler, useCallback, useState } from "react";
import { AddressableExpression } from "tal-parser";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import styles from "./InputFile.module.css";
import ErrorPopin from "./internal/ErrorPopin";

type InputFileProps = {
  ctx: RuntimeContext;
  bindTo: AddressableExpression;
  placeholder: string;
};

// TODO: find a solution out of Electron

const onDragOverHandler: DragEventHandler<HTMLInputElement> = (event) =>
  event.preventDefault();

export default function InputFile({
  ctx,
  bindTo,
  placeholder,
}: InputFileProps) {
  const [lastError, setLastError] = useState(null as any);

  const onDropHandler: DragEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      try {
        const files = event.dataTransfer.files;
        if (files.length) {
          const file = files[0];
          if ((file as any).path) {
            ctx.setValue(bindTo, (file as any).path);
            event.preventDefault();
          }
        }
      } catch (err) {
        setLastError(err);
      }
    },
    [bindTo, ctx]
  );

  const onInputChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      try {
        ctx.setValue(bindTo, e.target.value);
      } catch (err) {
        setLastError(err);
      }
    },
    [bindTo, ctx]
  );

  return (
    <>
      <input
        className={styles.InputFile}
        placeholder={placeholder}
        type="text"
        onChange={onInputChangeHandler}
        value={ctx.evaluateOr(bindTo, "") as string}
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
    bindTo:
      "Variable declared with var to bind this widget value to, containing the path on the server",
    placeholder: "Message to show when the widget is empty",
  },
};
