import { useCallback } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import { InputProps, InputPropsDocs } from "./internal/inputProps";
import SemanticInputFile from "./semantic/InputFile";

type InputFileProps = {
  ctx: RuntimeContext;
  placeholder?: string;
} & InputProps<string>;

// TODO: find a solution out of Electron

export default function InputFile({
  ctx,
  onChange,
  ...commonProps
}: InputFileProps) {
  const onChangeHandler = useCallback(
    async (newFile: string) => {
      if (!onChange) return;
      return ctx.callFunctionAsyncForInput(onChange, [newFile]);
    },
    [ctx, onChange]
  );

  return <SemanticInputFile onChange={onChangeHandler} {...commonProps} />;
}

export const InputFileDocumentation: WidgetDocumentation<InputFileProps> = {
  description:
    "Input a file from a path located on the server (only compatible with electron)",
  props: {
    placeholder: "Message to show when the widget is empty",
    ...InputPropsDocs,
  },
};
