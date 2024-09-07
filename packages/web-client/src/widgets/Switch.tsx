import { useCallback } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import { InputProps, InputPropsDocs } from "./internal/inputProps";
import {
  InputLabelProps,
  InputLabelPropsDocs,
} from "./internal/inputLabelProps";
import SemanticSwitch from "./semantic/Switch";

type SwitchProps = {
  ctx: RuntimeContext;
  secondary?: boolean;
} & InputProps<boolean> &
  InputLabelProps;

export default function Switch({ ctx, onChange, ...commonProps }: SwitchProps) {
  const onChangeHandler = useCallback(
    async (value: boolean) => {
      if (!onChange) return;
      return ctx.callFunctionAsync(onChange, [value]);
    },
    [ctx, onChange]
  );

  return <SemanticSwitch onChange={onChangeHandler} {...commonProps} />;
}

export const SwitchDocumentation: WidgetDocumentation<SwitchProps> = {
  description: "Input a boolean value. Like Checkbox but with another style",
  props: {
    ...InputPropsDocs,
    ...InputLabelPropsDocs,
    secondary: "Give the secondary style",
  },
};
