import React, { useContext } from "react";

export interface ButtonProps {
  text: string;
  disabled?: boolean;
  onClick?: () => void;
  secondary?: boolean;
}

export interface CheckBoxProps {
  disabled?: boolean;
  onChange?(newValue: boolean): Promise<void>;
  value?: boolean;
}

export interface SwitchProps {
  disabled?: boolean;
  onChange?(newValue: boolean): Promise<void>;
  value?: boolean;
}

export interface InputTextProps {
  multiline: boolean;
  placeholder: string;
  onSubmit?(): Promise<void>;
  type?: "text" | "email" | "url" | "password";
  onChange?(newValue: string): void;
  value?: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: string[];
  placeholder?: string;
  value?: string;
  onChange?(newValueIndex: number): void;
  disabled?: boolean;
  showEmpty?: boolean;
}

export interface InputFileProps {
  placeholder?: string;
  value?: string;
  onChange?(newValue: string): void;
  disabled?: boolean;
}

export interface TextProps {
  text: string;
  preformatted?: boolean;
  size?: number;
  align?: "center" | "right" | "left";
  weight?: "light" | "normal" | "bold";
  wrap?: boolean;
  color?: string;
}

export interface Theme {
  name: string;
  Button(props: ButtonProps): any;
  CheckBox(props: CheckBoxProps): any;
  Switch(props: SwitchProps): any;
  InputText(props: InputTextProps): any;
  InputFile(props: InputFileProps): any;
  Select(props: SelectProps): any;
  Text(props: TextProps): any;
}

export const THEME_CONTEXT = React.createContext<null | Theme>(null);

export function useTheme() {
  const theme = useContext(THEME_CONTEXT);
  if (!theme) {
    throw new Error("No theme defined !");
  }
  return theme;
}
