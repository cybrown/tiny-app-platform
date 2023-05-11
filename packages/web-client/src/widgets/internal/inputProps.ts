import { FunctionValue } from "tal-eval";
import { AddressableExpression } from "tal-parser";

export type InputProps<T> = {
  onChange: FunctionValue;
} & (
  | {
      bindTo: AddressableExpression;
      value: undefined;
    }
  | {
      bindTo: undefined;
      value: T;
    }
);

export const InputPropsDocs = {
  bindTo: "Variable declared with var to bind this widget value to",
  onChange: "Function to execute when the value changes",
  value: "Value to assign",
};
