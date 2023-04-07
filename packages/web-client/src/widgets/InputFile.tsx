import { DragEventHandler, useCallback } from "react";
import { AddressableExpression } from "tal-parser";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import styles from "./InputFile.module.css";

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
  const onDropHandler: DragEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const files = event.dataTransfer.files;
      if (files.length) {
        const file = files[0];
        if ((file as any).path) {
          ctx.setValue(bindTo, (file as any).path);
          event.preventDefault();
        }
      }
    },
    [bindTo, ctx]
  );

  return (
    <input
      className={styles.InputFile}
      placeholder={placeholder}
      type="text"
      onChange={(e) => ctx.setValue(bindTo, e.target.value)}
      value={ctx.evaluateOr(bindTo, "") as string}
      onDrop={onDropHandler}
      onDragOver={onDragOverHandler}
    />
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
