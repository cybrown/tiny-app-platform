import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import styles from "./Image.module.css";

type ImageProps = {
  ctx: RuntimeContext;
  url: string;
};

export default function Image({ ctx, url }: ImageProps) {
  return <img className={styles.Image} src={url} alt="Default content" />;
}

export const ImageDocumentation: WidgetDocumentation<ImageProps> = {
  description: "An image from a URL",
  props: {
    url: "URL to the image",
  },
};
