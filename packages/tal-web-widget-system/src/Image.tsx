import {
  RuntimeContext,
  typeFunction,
  typeKindedRecord,
  typeNull,
  typeString,
  typeUnion,
  WidgetDocumentation,
} from "tal-eval";
import styles from "./Image.module.css";

type ImageProps = {
  ctx: RuntimeContext;
  url: string;
  size?: "fit" | "original" | "standard";
};

export default function Image({ url, size: sizeFromProp }: ImageProps) {
  const size = sizeFromProp ?? "standard";
  return (
    <div>
      <img
        className={`${styles.Image} ${
          size == "fit"
            ? styles.sizeFitted
            : size == "original"
            ? styles.sizeOriginal
            : size === "standard"
            ? styles.sizeStandard
            : ""
        }`}
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
    size: "Image size: fit: Allow the image to use its container size, use inside a sized Box to control the image size, original: keep original image size",
  },
  type: typeFunction(
    [
      { name: "url", type: typeString() },
      { name: "size", type: typeUnion(typeNull(), typeString()) },
    ],
    [],
    typeKindedRecord()
  ),
};
