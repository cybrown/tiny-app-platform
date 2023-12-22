import React, { useContext } from "react";

const THEME_CONTEXT = React.createContext<null | Theme>(null);

function useTheme() {
  const theme = useContext(THEME_CONTEXT);
  if (!theme) {
    throw new Error("No theme defined !");
  }
  return theme;
}

export const ThemeProvider = THEME_CONTEXT.Provider;

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
  onChange?(newValue: boolean): Promise<void> | void;
  value?: boolean;
}

export interface InputTextProps {
  multiline?: boolean;
  placeholder?: string;
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

export type TableTitle = {
  text: string;
  width?: string | number;
  remainingPercent?: string | null;
};

export type TableRow = {
  key: string;
  cells: TableCell[];
};

export type TableCell = {
  content: any;
};

export interface TableProps {
  titles: TableTitle[];
  rows: TableRow[];
  bordered?: boolean;
  striped?: boolean;
  noHeader?: boolean;
  noHighlight?: boolean;
}

export type PagerButtonState = "HIDDEN" | "DISABLED" | "ENABLED";

export type PagerOnChangeAction =
  | "FIRST"
  | "PREVIOUS"
  | "NEXT"
  | "LAST"
  | number;

export interface PagerProps {
  firstState?: PagerButtonState;
  lastState?: PagerButtonState;
  previousState?: PagerButtonState;
  nextState?: PagerButtonState;
  values?: number[];
  value?: number;
  onChange?(action: PagerOnChangeAction): void;
  disabled?: boolean;
}

export interface ModalProps {
  header: any;
  body: any;
  footer: any;
  onClose(): void;
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
  Pager(props: PagerProps): any;
  Table(props: TableProps): any;
  Modal(props: ModalProps): any;
  onLoad?(): void;
  onUnload?(): void;
}

export function Button(props: ButtonProps) {
  const theme = useTheme();
  return <theme.Button {...props} />;
}

export function Switch(props: SwitchProps) {
  const theme = useTheme();
  return <theme.Switch {...props} />;
}

export function Text(props: TextProps) {
  const theme = useTheme();
  return <theme.Text {...props} />;
}

export function InputText(props: InputTextProps) {
  const theme = useTheme();
  return <theme.InputText {...props} />;
}

export function InputFile(props: InputFileProps) {
  const theme = useTheme();
  return <theme.InputFile {...props} />;
}

export function CheckBox(props: CheckBoxProps) {
  const theme = useTheme();
  return <theme.CheckBox {...props} />;
}

export function Select(props: SelectProps) {
  const theme = useTheme();
  return <theme.Select {...props} />;
}

export function Pager(props: PagerProps) {
  const theme = useTheme();
  return <theme.Pager {...props} />;
}

export function Table(props: TableProps) {
  const theme = useTheme();
  return <theme.Table {...props} />;
}

export function Modal(props: ModalProps) {
  const theme = useTheme();
  return <theme.Modal {...props} />;
}
