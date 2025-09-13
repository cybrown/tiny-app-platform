import { WindowFrameProps } from "../../theme";
import { ELECTRON_DRAG, ELECTRON_NO_DRAG } from "../utils";
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
      <p className="title" style={drag ? ELECTRON_DRAG : {}}>
        {onClose ? (
          <>
            <i
              className="nes-icon close is-small"
              onClick={onClose}
              style={ELECTRON_NO_DRAG}
            ></i>
            {"\u00A0"}
          </>
        ) : null}
        {title}
      </p>
      <div className={styles.Body}>{children}</div>
    </div>
  );
}
