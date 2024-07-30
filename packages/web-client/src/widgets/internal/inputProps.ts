import { Closure } from "tal-eval";

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
