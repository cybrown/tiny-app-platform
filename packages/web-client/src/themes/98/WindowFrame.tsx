import { WindowFrameProps } from "../../theme";
import { ELECTRON_DRAG, ELECTRON_NO_DRAG } from "../utils";
import styles from "./WindowFrame.module.css";

export default function WindowFrame({
  title,
  children,
  onClose,
  drag,
}: WindowFrameProps) {
  return (
    <div className={`window ${styles.WindowFrame}`}>
      <div className="title-bar" style={drag ? ELECTRON_DRAG : {}}>
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls" style={ELECTRON_NO_DRAG}>
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className={styles.Body}>
        <div className="window-body">{children}</div>
      </div>
    </div>
  );
}
