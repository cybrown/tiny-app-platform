import {
  typeAny,
  typeBoolean,
  typeFunction,
  typeKindedRecord,
  typeNull,
  typeString,
  typeUnion,
  WidgetDocumentation,
} from "tal-eval";
import { textPropTypes, TextDocumentation } from "./Text";
import { LinkProps, Link as ThemedLink } from "../theme";

export default function Link(props: LinkProps) {
  if (!props.text && !props.url) {
    throw new Error("text or url is mandatory for Link widget");
  }
  if (props.url && props.onClick) {
    throw new Error("url is mutually exclusive with onClick for Link widget");
  }
  return <ThemedLink url="#default" {...props} />;
}

export const LinkDocumentation: WidgetDocumentation<LinkProps> = {
  description:
    "A link to navigate elsewhere, use system properties to configure the context where to navigate",
  props: {
    ...TextDocumentation.props,
    text: "Text content of the link",
    url: "URL to navigate to, mutually exclusive with onClick",
    onClick: "Expression to evaluate on click, mutually exclusive with url",
    disabled: "Do not allow the user to interact with this widget",
    secondary: "Give the secondary style",
  },
  type: typeFunction(
    [
      ...textPropTypes,
      { name: "text", type: typeUnion(typeNull(), typeString()) },
      { name: "url", type: typeUnion(typeNull(), typeString()) },
      {
        name: "onClick",
        type: typeUnion(typeNull(), typeFunction([], [], typeAny())),
      },
      { name: "disabled", type: typeUnion(typeNull(), typeBoolean()) },
      { name: "secondary", type: typeUnion(typeNull(), typeBoolean()) },
    ],
    [],
    typeKindedRecord()
  ),
};
