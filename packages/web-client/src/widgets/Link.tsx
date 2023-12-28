import { WidgetDocumentation } from "tal-eval";
import { TextDocumentation } from "./Text";
import { LinkProps, Link as ThemedLink } from "../theme";

export default function Link(props: LinkProps) {
  if (!props.text && !props.url) {
    throw new Error("text or url is mandatory for Link widget");
  }
  return <ThemedLink {...props} />;
}

export const LinkDocumentation: WidgetDocumentation<LinkProps> = {
  description:
    "A link to navigate elsewhere, use system properties to configure the context where to navigate",
  props: {
    ...TextDocumentation.props,
    text: "Text content of the link",
    url: "URL to navigate to",
  },
};
