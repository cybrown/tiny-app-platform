import { RuntimeContext } from "tal-eval";

import Button, { ButtonDocumentation } from "./Button";
import CheckBox, { CheckBoxDocumentation } from "./CheckBox";
import Column, { ColumnDocumentation } from "./Column";
import Debug, { DebugDocumentation } from "./Debug";
import Html, { HtmlDocumentation } from "./Html";
import Image, { ImageDocumentation } from "./Image";
import InputFile, { InputFileDocumentation } from "./InputFile";
import InputText, { InputTextDocumentation } from "./InputText";
import Link, { LinkDocumentation } from "./Link";
import Loader, { LoaderDocumentation } from "./Loader";
import Md, { MdDocumentation } from "./Md";
import Overlay, { OverlayDocumentation } from "./Overlay";
import Pager, { PagerDocumentation } from "./Pager";
import Radio, { RadioDocumentation } from "./Radio";
import Row, { RowDocumentation } from "./Row";
import Select, { SelectDocumentation } from "./Select";
import Snippet, { SnippetDocumentation } from "./Snippet";
import Switch, { SwitchDocumentation } from "./Switch";
import Table, { TableDocumentation } from "./Table";
import Tabs, { TabsDocumentation } from "./Tabs";
import Terminal, { TerminalDocumentation } from "./Terminal";
import Text, { TextDocumentation } from "./Text";
import View, { ViewDocumentation } from "./View";
import WindowFrame, { WindowFrameDocumentation } from "./WindowFrame";

/**
 * Register every built-in widget on a runtime context. This is the single
 * entry point the host application uses to make the widget system available
 * to a running program.
 */
export function registerWidgets(ctx: RuntimeContext): void {
  ctx.registerWidget("Button", Button, ButtonDocumentation);
  ctx.registerWidget("CheckBox", CheckBox, CheckBoxDocumentation);
  ctx.registerWidget("Column", Column, ColumnDocumentation);
  ctx.registerWidget("Debug", Debug, DebugDocumentation);
  ctx.registerWidget("Html", Html, HtmlDocumentation);
  ctx.registerWidget("Md", Md, MdDocumentation);
  ctx.registerWidget("Image", Image, ImageDocumentation);
  ctx.registerWidget("InputFile", InputFile, InputFileDocumentation);
  ctx.registerWidget("InputText", InputText, InputTextDocumentation);
  ctx.registerWidget("Link", Link, LinkDocumentation);
  ctx.registerWidget("Loader", Loader, LoaderDocumentation);
  ctx.registerWidget("Overlay", Overlay, OverlayDocumentation);
  ctx.registerWidget("Pager", Pager, PagerDocumentation);
  ctx.registerWidget("Radio", Radio, RadioDocumentation);
  ctx.registerWidget("Row", Row, RowDocumentation);
  ctx.registerWidget("Select", Select, SelectDocumentation);
  ctx.registerWidget("Snippet", Snippet, SnippetDocumentation);
  ctx.registerWidget("Switch", Switch, SwitchDocumentation);
  ctx.registerWidget("Table", Table, TableDocumentation);
  ctx.registerWidget("Tabs", Tabs, TabsDocumentation);
  ctx.registerWidget("Text", Text, TextDocumentation);
  ctx.registerWidget("View", View, ViewDocumentation);
  ctx.registerWidget("WindowFrame", WindowFrame, WindowFrameDocumentation);
  ctx.registerWidget("Terminal", Terminal, TerminalDocumentation);
}

// Individual widgets and their documentation.
export {
  Button,
  ButtonDocumentation,
  CheckBox,
  CheckBoxDocumentation,
  Column,
  ColumnDocumentation,
  Debug,
  DebugDocumentation,
  Html,
  HtmlDocumentation,
  Image,
  ImageDocumentation,
  InputFile,
  InputFileDocumentation,
  InputText,
  InputTextDocumentation,
  Link,
  LinkDocumentation,
  Loader,
  LoaderDocumentation,
  Md,
  MdDocumentation,
  Overlay,
  OverlayDocumentation,
  Pager,
  PagerDocumentation,
  Radio,
  RadioDocumentation,
  Row,
  RowDocumentation,
  Select,
  SelectDocumentation,
  Snippet,
  SnippetDocumentation,
  Switch,
  SwitchDocumentation,
  Table,
  TableDocumentation,
  Tabs,
  TabsDocumentation,
  Terminal,
  TerminalDocumentation,
  Text,
  TextDocumentation,
  View,
  ViewDocumentation,
  WindowFrame,
  WindowFrameDocumentation,
};

// Widget helpers reused by the host application.
export { default as ViewChild } from "./ViewChild";
export { default as LowLevelOverlay } from "./internal/LowLevelOverlay";
export * from "./internal/keyboard-util";

// Widget rendering runtime.
export { default as RenderExpression } from "./runtime/RenderExpression";
export { default as RenderError } from "./runtime/RenderError";
export { default as CustomWidgetHost } from "./runtime/CustomWidgetHost";
export { default as ErrorBoundary } from "./runtime/ErrorBoundary";
export { APP_DEBUG_MODE_ENV } from "./runtime/constants";
