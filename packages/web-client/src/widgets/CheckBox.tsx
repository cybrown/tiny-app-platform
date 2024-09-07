import { useCallback } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import { InputProps, InputPropsDocs } from "./internal/inputProps";
import {
  InputLabelProps,
  InputLabelPropsDocs,
} from "./internal/inputLabelProps";
import SemanticCheckBox from "./semantic/CheckBox";

type CheckBoxProps = {
  ctx: RuntimeContext;
  secondary?: boolean;
} & InputProps<boolean> &
  InputLabelProps;

export default function CheckBox({
  ctx,
  onChange,
  ...commonProps
}: CheckBoxProps) {
  const onChangeHandler = useCallback(
    (newValue: boolean) => {
      if (!onChange) return;
      return ctx.callFunctionAsync(onChange, [newValue]);
    },
    [ctx, onChange]
  );

  return <SemanticCheckBox onChange={onChangeHandler} {...commonProps} />;
}

export const CheckBoxDocumentation: WidgetDocumentation<CheckBoxProps> = {
  description: "A checkbox to input a boolean value",
  props: {
    ...InputPropsDocs,
    ...InputLabelPropsDocs,
    secondary: "Give the secondary style",
  },
};
