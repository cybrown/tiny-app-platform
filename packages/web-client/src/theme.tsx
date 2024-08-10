import React, { useContext } from "react";

const THEME_CONTEXT = React.createContext<null | Theme>(null);

export function useTheme(): Theme {
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
  outline?: boolean;
  link?: boolean;
}

export interface CheckBoxProps {
  disabled?: boolean;
  onChange?(newValue: boolean): Promise<void> | void;
  value?: boolean;
  secondary?: boolean;
  label?: string;
}

export interface SwitchProps {
  disabled?: boolean;
  onChange?(newValue: boolean): Promise<void> | void;
  value?: boolean;
  secondary?: boolean;
  label?: string;
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
  options: { value: string; label: string }[];
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
  ellipsis?: boolean;
  line?: "under" | "over" | "through";
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

export type PagerButtonProps = {
  p: PagerProps;
  lastIndex: number;
  updateValue: (value: PagerOnChangeAction) => void;
} & (
  | {
      pos: "FIRST" | "PREVIOUS" | "NEXT" | "LAST";
    }
  | {
      pos: "PAGE";
      index: number;
    }
);

export interface PagerProps {
  firstState?: PagerButtonState;
  lastState?: PagerButtonState;
  previousState?: PagerButtonState;
  nextState?: PagerButtonState;
  values?: number[];
  value?: number;
  onChange?(action: PagerOnChangeAction): void;
  disabled?: boolean;
  lastIndex: number;
  size: number;
  PagerButtonComponent?(props: PagerButtonProps): JSX.Element | null;
}

export interface ModalBackdropProps extends React.PropsWithChildren {
  onClose(): void;
}

export interface ModalProps {
  header: string;
  body: any;
  footer: any;
  onClose(): void;
}

export type LinkProps = Omit<TextProps, "text"> & {
  url?: string;
  onClick?: () => void;
  text?: string;
  disabled?: boolean;
  secondary?: boolean;
};

export type RadioProps = {
  option: string;
  value?: string;
  onChange?(): void;
  disabled?: boolean;
  secondary?: boolean;
  label?: string;
};

export type TabsProps = {
  value?: string;
  onChange?(newValue: string): void;
  tabs: { value: string; label: string }[];
  after?: React.ReactElement;
};

export type ContainerProps = {
  height?: number;
} & React.PropsWithChildren;

export type LoaderSize = "sm" | "md" | "lg";

export type LoaderProps = {
  label?: string;
  primary?: boolean;
  secondary?: boolean;
  size?: LoaderSize;
  max?: number;
  value?: number;
};

export type ViewProps = {
  className?: string;
  layout?: "flex-row" | "flex-column";
  gap?: number;
  width?: string | number;
  height?: string | number;
  padding?: number;
  wrap?: boolean;
  scroll?: boolean;
  backgroundColor?: string;
} & React.PropsWithChildren;

export type WindowFrameProps = {
  title?: string;
  position?: string;
  footer?: React.ReactElement;
  modal?: boolean;
  drag?: boolean;
  onClose(): void;
} & React.PropsWithChildren;

interface ColorScale {
  "100": string;
  "200": string;
  "300": string;
  "400": string;
  "500": string;
  "600": string;
  "700": string;
}

interface SizeScale {
  "050": number;
  "100": number;
  "150": number;
  "200": number;
  "250": number;
  "300": number;
  "350": number;
  "400": number;
  "450": number;
  "500": number;
  "550": number;
  "600": number;
  "650": number;
  "700": number;
  "750": number;
  "800": number;
  "850": number;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    primary?: ColorScale;
    secondary?: ColorScale;
  };
  sizes?: SizeScale;
  baseSize?: number;
  Button: React.FC<ButtonProps>;
  CheckBox: React.FC<CheckBoxProps>;
  Switch: React.FC<SwitchProps>;
  InputText: React.FC<InputTextProps>;
  InputFile: React.FC<InputFileProps>;
  Select: React.FC<SelectProps>;
  Text: React.FC<TextProps>;
  Pager: React.FC<PagerProps>;
  Table: React.FC<TableProps>;
  Link: React.FC<LinkProps>;
  Radio: React.FC<RadioProps>;
  Tabs: React.FC<TabsProps>;
  Loader: React.FC<LoaderProps>;
  Container: React.FC<ContainerProps>;
  View: React.FC<ViewProps>;
  WindowFrame: React.FC<WindowFrameProps>;
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

export function Link(props: LinkProps) {
  const theme = useTheme();
  return <theme.Link {...props} />;
}

export function Radio(props: RadioProps) {
  const theme = useTheme();
  return <theme.Radio {...props} />;
}

export function Tabs(props: TabsProps) {
  const theme = useTheme();
  if (!theme.Tabs)
    return <Text text="Warning: Tabs not supported with this theme" />;
  return <theme.Tabs {...props} />;
}

export function Container(props: ContainerProps) {
  const theme = useTheme();
  return <theme.Container {...props} />;
}

export function Loader(props: LoaderProps) {
  const theme = useTheme();
  return <theme.Loader {...props} />;
}

export function View(props: ViewProps) {
  const theme = useTheme();
  return <theme.View {...props} />;
}

export function WindowFrame(props: WindowFrameProps) {
  const theme = useTheme();
  return <theme.WindowFrame {...props} />;
}
