import { useCallback } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import styles from "./Text.module.css";

type TextProps = {
  ctx: RuntimeContext;
  text: string;
  preformatted: boolean;
  copy?: boolean;
};

export default function Text({ ctx, copy, preformatted, text }: TextProps) {
  const showCopyButton = copy ?? preformatted;
  const copyClickHandler = useCallback(() => {
    navigator.clipboard.writeText(text);
  }, [text]);
  return (
    <div className={styles.Text}>
      {showCopyButton ? (
        <button className={styles.buttonCopy} onClick={copyClickHandler}>
          copy
        </button>
      ) : null}
      {preformatted ? (
        <pre>{text}</pre>
      ) : (
        <div className={styles.Text}>{text}</div>
      )}
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
  },
};
