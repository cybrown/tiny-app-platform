import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import styles from "./Image.module.css";

type ImageProps = {
  ctx: RuntimeContext;
  url: string;
  fit?: boolean;
};

export default function Image({ url, fit }: ImageProps) {
  return (
    <div>
      <img
        className={`${styles.Image} ${fit ? styles.fitted : ""}`}
        src={url}
        alt="Default content"
      />
    </div>
  );
}

export const ImageDocumentation: WidgetDocumentation<ImageProps> = {
  description: "An image from a URL",
  props: {
    url: "URL to the image",
    fit:
      "Allow the image to use its container size, use inside a sized Box to control the image size",
  },
};
