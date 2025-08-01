import { useCallback } from "react";
import {
  RuntimeContext,
  typeBoolean,
  typeFunction,
  typeKindedRecord,
  typeNull,
  typeRecord,
  typeString,
  typeUnion,
  WidgetDocumentation,
} from "tal-eval";
import {
  InputProps,
  InputPropsDocs,
  inputPropsParameters,
} from "./internal/inputProps";
import {
  inputLabelParameters,
  InputLabelProps,
  InputLabelPropsDocs,
} from "./internal/inputLabelProps";
import SemanticRadio from "./semantic/Radio";

type RadioProps = {
  ctx: RuntimeContext;
  option: string | { value: string; label: string };
  secondary?: boolean;
} & InputProps<string> &
  InputLabelProps;

export default function Radio({ ctx, onChange, ...commonProps }: RadioProps) {
  const onChangeHandler = useCallback(
    (newValue: string) => {
      if (!onChange) return;
      return ctx.callFunctionAsync(onChange, [newValue]);
    },
    [ctx, onChange]
  );

  return <SemanticRadio onChange={onChangeHandler} {...commonProps} />;
}

export const RadioDocumentation: WidgetDocumentation<RadioProps> = {
  description: "Radio to select a value",
  props: {
    ...InputPropsDocs,
    ...InputLabelPropsDocs,
    option:
      "Value to set when this radio is checked, string | {value: string, label: string}",
    secondary: "Give the secondary style",
  },
  type: typeFunction(
    [
      ...inputPropsParameters(typeString()),
      ...inputLabelParameters(),
      {
        name: "option",
        type: typeUnion(
          typeRecord({ value: typeString(), label: typeString() }),
          typeString()
        ),
      },
      { name: "secondary", type: typeUnion(typeNull(), typeBoolean()) },
    ],
    [],
    typeKindedRecord()
  ),
};
