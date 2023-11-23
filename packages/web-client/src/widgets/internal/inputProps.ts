export type InputProps<T> = {
  disabled?: boolean;
  onChange: unknown;
  value: T;
};

export const InputPropsDocs = {
  disabled: "Do not allow the user to change the value",
  onChange: "Function to execute when the value changes",
  value: "Value to assign",
};
