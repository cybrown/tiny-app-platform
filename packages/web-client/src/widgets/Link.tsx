import { WidgetDocumentation } from "tal-eval";
import Text, { TextProps, TextDocumentation } from "./Text";

type LinkProps = Omit<TextProps, "text"> & { url?: string; text?: string };

export default function Link({ url, text, ...rest }: LinkProps) {
  if (!text && !url) {
    throw new Error("text or url is mandatory for Link widget");
  }
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <Text {...rest} text={text ?? url ?? ""} />
    </a>
  );
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
