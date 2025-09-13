import { WindowFrameProps } from "../../theme";
import Link from "../html/Link";
import { ELECTRON_DRAG, ELECTRON_NO_DRAG } from "../utils";
import Text from "./Text";
import styles from "./WindowFrame.module.css";

export function WindowFrame({
  children,
  position,
  onClose,
  title,
  footer,
  modal,
  drag,
  size,
}: WindowFrameProps) {
  return (
    <div
      className={`${styles.WindowFrame} ${
        position === "center" ? styles.center : ""
      } ${!modal ? styles.noBackdrop : ""} ${size ? styles[size] : ""}`}
    >
      <div className={styles.Header} style={drag ? ELECTRON_DRAG : {}}>
        {title ? <Text text={title} size={1.2} /> : null}
        {onClose ? (
          <div style={ELECTRON_NO_DRAG}>
            <Link text="Close" onClick={onClose} url="#" />
          </div>
        ) : null}
      </div>
      <div className={styles.Body}>{children}</div>
      {footer ? <div className={styles.Footer}>{footer}</div> : null}
    </div>
  );
}
