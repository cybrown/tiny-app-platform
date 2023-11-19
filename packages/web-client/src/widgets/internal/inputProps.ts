import { IRNode } from "tal-eval";

export type InputProps<T> = {
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
  onChange: "Function to execute when the value changes",
  value: "Value to assign",
};
