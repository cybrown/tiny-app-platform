import { ViewProps, useTheme } from "../../theme";
import styles from "./View.module.css";

function computeViewStyles(d: ViewProps, baseSize: number) {
  return {
    ...{ gap: (d.gap ?? 0.5) * baseSize },
    ...(d.padding ? { padding: d.padding * baseSize } : {}),
    ...(d.backgroundColor ? { backgroundColor: d.backgroundColor } : {}),
    ...(d.width
      ? { width: typeof d.width == "number" ? d.width * baseSize : d.width }
      : {}),
    ...(d.height
      ? { height: typeof d.height == "number" ? d.height * baseSize : d.height }
      : {}),
  };
}

export default function View({ children, ...d }: ViewProps) {
  const theme = useTheme();
  const baseSize = theme.baseSize ?? 12;
  const isRow = d.layout === "flex-row";

  return (
    <div
      className={`${isRow ? styles.directionRow : styles.directionColumn} ${
        d.wrap ? styles.wrap : ""
      } ${d.scroll ? styles.scroll : ""} ${d.className ?? ""}`}
      style={computeViewStyles(d, baseSize)}
    >
      {children}
    </div>
  );
}
