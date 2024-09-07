import { useCallback } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import { InputProps, InputPropsDocs } from "./internal/inputProps";
import SemanticSelect from "./semantic/Select";

type SelectProps = {
  ctx: RuntimeContext;
  options: (string | { value: string; label: string })[];
  placeholder?: string;
} & InputProps<string>;

export default function Select({ ctx, onChange, ...commonProps }: SelectProps) {
  const onChangeHandler = useCallback(
    async (newValue: string) => {
      if (!onChange) return;
      return ctx.callFunctionAsync(onChange, [newValue]);
    },
    [ctx, onChange]
  );

  return <SemanticSelect onChange={onChangeHandler} {...commonProps} />;
}

export const SelectDocumentation: WidgetDocumentation<SelectProps> = {
  description: "Pick a string value from a predefined list",
  props: {
    options:
      "List of all possible values as string | {value: string, label: string}",
    placeholder: "Message to show when the widget is empty",
    ...InputPropsDocs,
  },
};
