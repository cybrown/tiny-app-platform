import { useMemo } from "react";
import styles from "./Text.module.css";
import { TextProps } from "../../theme";

export default function Text({
  preformatted,
  text,
  size,
  align,
  color,
  weight,
  wrap,
  ellipsis,
}: TextProps) {
  if (
    preformatted &&
    (size != null ||
      align != null ||
      weight != null ||
      wrap != null ||
      color != null ||
      ellipsis != null)
  ) {
    throw new Error(
      "preformatted is not compatible with size, align, weight, wrap, color or ellipsis"
    );
  }

  const style = useMemo<React.CSSProperties>(
    () => ({
      fontSize: (size ?? 1) + "em",
      textAlign: align ?? "left",
      fontFamily: weight === "light" ? "Proxima Nova Lt" : "Proxima Nova Rg",
      fontWeight: weight ?? "normal",
      whiteSpace: wrap ? undefined : "nowrap",
      color: color,
    }),
    [align, size, weight, wrap, color]
  );

  return preformatted ? (
    <pre className={styles.Text}>{text}</pre>
  ) : (
    <div
      className={[styles.Text, ellipsis ? styles.ellipsis : ""].join(" ")}
      style={style}
    >
      {text}
    </div>
  );
}
