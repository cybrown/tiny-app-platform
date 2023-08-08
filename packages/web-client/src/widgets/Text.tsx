import { useCallback, useMemo } from "react";
import {
  RuntimeContext,
  TalValue,
  WidgetDocumentation,
  talValueToString,
} from "tal-eval";
import styles from "./Text.module.css";
import {
  talValueToStringEnumOpt,
  talValueToStringOpt,
} from "tal-eval/dist/TalValue";

export type TextProps = {
  ctx: RuntimeContext;
  text: TalValue;
  preformatted?: TalValue;
  copy?: TalValue;
  size?: TalValue;
  align?: TalValue;
  weight?: TalValue;
  wrap?: TalValue;
  color?: TalValue;
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
    navigator.clipboard.writeText(talValueToString(text));
  }, [text]);

  const style = useMemo<React.CSSProperties>(
    () => ({
      fontSize: (size ?? 1) + "em",
      textAlign:
        talValueToStringEnumOpt(align, ["left", "right", "center"]) ?? "left",
      fontFamily:
        talValueToStringOpt(weight) === "light"
          ? "Proxima Nova Lt"
          : "Proxima Nova Rg",
      fontWeight: talValueToStringOpt(weight) ?? "normal",
      whiteSpace: talValueToStringOpt(wrap) ? undefined : "nowrap",
      color: talValueToStringOpt(color),
    }),
    [align, size, weight, wrap, color]
  );

  return (
    <div className={styles.Text}>
      {showCopyButton ? (
        <button className={styles.buttonCopy} onClick={copyClickHandler}>
          copy
        </button>
      ) : null}
      {preformatted ? (
        <pre>{talValueToString(text)}</pre>
      ) : (
        <div className={styles.Text} style={style}>
          {talValueToString(text)}
        </div>
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
    size: "Size in proportion of base size",
    align: "Text alignement: center, left, right",
    weight: "Font weight: light, normal, bold",
    wrap: "True if text must wrap, false by default",
    color: "Text color",
  },
};
