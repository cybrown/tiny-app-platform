import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import styles from "./Link.module.css";

type LinkProps = { ctx: RuntimeContext; url: string; text: string };

export default function Link({ url, text }: LinkProps) {
  return (
    <div className={styles.Link}>
      <a href={url} target="_blank" rel="noreferrer">
        {text ?? url}
      </a>
    </div>
  );
}

export const LinkDocumentation: WidgetDocumentation<LinkProps> = {
  description:
    "A link to navigate elsewhere, use system properties to configure the context where to navigate",
  props: {
    text: "Text content of the link",
    url: "URL to navigate to",
  },
};
