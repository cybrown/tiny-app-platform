import { useCallback } from "react";
import {
  Closure,
  RuntimeContext,
  typeAny,
  typeBoolean,
  typeFunction,
  typeKindedRecord,
  typeNull,
  typeString,
  typeUnion,
  WidgetDocumentation,
} from "tal-eval";
import {
  InputProps,
  InputPropsDocs,
  inputPropsParameters,
} from "./internal/inputProps";
import SemanticInputText from "./semantic/InputText";

type InputTextProps = {
  ctx: RuntimeContext;
  multiline?: boolean;
  placeholder?: string;
  onSubmit?: Closure;
  type?: "text" | "email" | "url" | "password";
} & InputProps<string>;

export default function InputText({
  ctx,
  onSubmit,
  onChange,
  ...commonProps
}: InputTextProps) {
  const onSubmitHandler = useCallback(async () => {
    if (!onSubmit) return;
    return ctx.callFunctionAsync(onSubmit, []);
  }, [ctx, onSubmit]);

  const onChangeHandler = useCallback(
    (newValue: string) => {
      if (!onChange) return;
      return ctx.callFunctionAsyncForInput(onChange, [newValue]);
    },
    [ctx, onChange]
  );

  return (
    <SemanticInputText
      onChange={onChangeHandler}
      onSubmit={onSubmitHandler}
      {...commonProps}
    />
  );
}

export const InputTextDocumentation: WidgetDocumentation<InputTextProps> = {
  description: "Allow the user to input a string",
  props: {
    multiline: "Allow multiple lines of text. Not compatible with type",
    onSubmit: "Expression to evaluate when the user presses enter",
    type: "One of: text, email, url, password. Not compatible with multiline",
    placeholder: "Message to show when the widget is empty",
    ...InputPropsDocs,
  },
  type: typeFunction(
    [
      { name: "multiline", type: typeUnion(typeNull(), typeBoolean()) },
      {
        name: "onSubmit",
        type: typeUnion(typeNull(), typeFunction([], [], typeAny())),
      },
      { name: "type", type: typeUnion(typeNull(), typeString()) },
      { name: "placeholder", type: typeUnion(typeNull(), typeString()) },
      ...inputPropsParameters(typeString()),
    ],
    [],
    typeKindedRecord()
  ),
};
