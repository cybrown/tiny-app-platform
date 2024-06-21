import { WindowFrameProps } from "../../theme";
import styles from "./WindowFrame.module.css";

export default function WindowFrame({
  title,
  children,
  onClose,
  drag,
}: WindowFrameProps) {
  return (
    <div className={`window ${styles.WindowFrame}`}>
      <div
        className="title-bar"
        style={drag ? ({ "-webkit-app-region": "drag" } as any) : {}}
      >
        <div className="title-bar-text">{title}</div>
        <div
          className="title-bar-controls"
          style={{ "-webkit-app-region": "no-drag" } as any}
        >
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className={styles.Body}>
        <div className="window-body">{children}</div>
      </div>
    </div>
  );
}
