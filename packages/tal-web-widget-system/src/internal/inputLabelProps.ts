import { TypeFunction, typeNull, typeString, typeUnion } from "tal-eval";

export type InputLabelProps = {
  label?: string;
};

export const InputLabelPropsDocs = {
  label: "Label associated with this input",
};

export function inputLabelParameters(): TypeFunction["parameters"] {
  return [{ name: "label", type: typeUnion(typeNull(), typeString()) }];
}
