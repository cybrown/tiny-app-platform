import { WindowFrameProps } from "../../theme";
import styles from "./WindowFrame.module.css";

export function WindowFrame({
  children,
  position,
  title,
  onClose,
  drag,
}: WindowFrameProps) {
  const isLayer = position !== "center";
  return (
    <div
      className={`nes-container is-rounded ${styles.WindowFrame} ${
        isLayer ? styles.drawer : ""
      } ${title != null ? "with-title" : ""}`}
    >
      <p
        className="title"
        style={drag ? ({ "-webkit-app-region": "drag" } as any) : {}}
      >
        <i
          className="nes-icon close is-small"
          onClick={onClose}
          style={{ "-webkit-app-region": "no-drag" } as any}
        ></i>
        {"\u00A0"}
        {title}
      </p>

      {children}
    </div>
  );
}
