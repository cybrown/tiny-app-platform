import { IRNode } from "tal-eval";

export type InputProps<T> = {
  disabled?: boolean;
  onChange: unknown;
} & (
  | {
      bindTo: IRNode;
      value: undefined;
    }
  | {
      bindTo: undefined;
      value: T;
    }
);

export const InputPropsDocs = {
  bindTo: "Variable declared with var to bind this widget value to",
  disabled: "Do not allow the user to change the value",
  onChange: "Function to execute when the value changes",
  value: "Value to assign",
};
