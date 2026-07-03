import {
  Closure,
  Type,
  typeAny,
  typeBoolean,
  typeFunction,
  TypeFunction,
  typeNull,
  typeUnion,
} from "tal-eval";

export type InputProps<T> = {
  disabled?: boolean;
  onChange?: Closure;
  value: T;
};

export type BaseInputProps<T> = {
  disabled?: boolean;
  onChange?: (newValue: T) => unknown;
  value: T;
};

export const InputPropsDocs = {
  disabled: "Do not allow the user to change the value",
  onChange: "Function to execute when the value changes",
  value: "Value to assign",
};

export function inputPropsParameters(
  inputType: Type
): TypeFunction["parameters"] {
  return [
    { name: "disabled", type: typeUnion(typeNull(), typeBoolean()) },
    {
      name: "onChange",
      type: typeUnion(
        typeNull(),
        typeFunction([{ name: "newValue", type: inputType }], [], typeAny())
      ),
    },
    { name: "value", type: typeUnion(typeNull(), inputType) },
  ];
}
