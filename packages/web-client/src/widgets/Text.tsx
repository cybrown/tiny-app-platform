import { useCallback } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import styles from "./Text.module.css";
import { Button, Text as ThemedText } from "../theme";

export type TextProps = {
  ctx?: RuntimeContext;
  text: string;
  preformatted?: boolean;
  copy?: boolean;
  size?: number;
  align?: "center" | "right" | "left";
  weight?: "light" | "normal" | "bold";
  wrap?: boolean;
  color?: string;
  ellipsis?: boolean;
  line?: "under" | "over" | "through";
};

export default function Text({
  ctx,
  copy,
  preformatted,
  text,
  size,
  align,
  color,
  weight,
  wrap,
  ellipsis,
  line,
}: TextProps) {
  if (
    preformatted &&
    (size != null ||
      align != null ||
      weight != null ||
      wrap != null ||
      color != null)
  ) {
    throw new Error(
      "preformatted is not compatible with size, align, weight, wrap or color"
    );
  }

  const showCopyButton = copy ?? preformatted;

  const copyClickHandler = useCallback(() => {
    navigator.clipboard.writeText(text);
  }, [text]);

  return (
    <div className={styles.Text}>
      {showCopyButton ? (
        <div className={styles.buttonCopy}>
          <Button text="Copy" onClick={copyClickHandler} />
        </div>
      ) : null}
      <ThemedText
        text={text}
        align={align}
        color={color}
        preformatted={preformatted}
        size={size}
        weight={weight}
        wrap={wrap}
        ellipsis={ellipsis}
        line={line}
      />
    </div>
  );
}

export const TextDocumentation: WidgetDocumentation<TextProps> = {
  description: "Show a line of text",
  props: {
    copy:
      "Show a button to copy the content, default true when preformatted is true",
    preformatted: "Show text with a monospace font and keep whitespaces",
    text: "Text to display",
    size: "Size in proportion of base size",
    align: "Text alignement: center, left, right",
    weight: "Font weight: light, normal, bold",
    wrap: "True if text must wrap, false by default",
    color: "Text color",
    ellipsis: "Truncate the text with an ellipsis if it is too long",
    line: "Add line decoration: under | over | through",
  },
};
