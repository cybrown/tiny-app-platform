import { useMemo } from "react";
import { TextProps } from "../../theme";

export default function Text({
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

  const style = useMemo<React.CSSProperties>(
    () => ({
      fontSize: (size ?? 1) + "em",
      textAlign: align ?? "left",
      fontWeight: weight ?? "normal",
      whiteSpace: wrap ? undefined : "nowrap",
      color: color,
    }),
    [align, size, weight, wrap, color]
  );

  return preformatted ? <pre>{text}</pre> : <div style={style}>{text}</div>;
}
