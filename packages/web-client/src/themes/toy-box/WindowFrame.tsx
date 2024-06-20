import { WindowFrameProps } from "../../theme";
import Link from "../html/Link";
import Text from "./Text";
import styles from "./WindowFrame.module.css";

export function WindowFrame({
  children,
  position,
  onClose,
  title,
  footer,
  modal,
}: WindowFrameProps) {
  return (
    <div
      className={`${styles.WindowFrame} ${
        position === "center" ? styles.center : ""
      } ${!modal ? styles.noBackdrop : ""}`}
    >
      <div className={styles.Header}>
        {title ? <Text text={title} size={1.2} /> : null}
        <Link text="Close" onClick={onClose} url="#" />
      </div>
      <div className={styles.Body}>{children}</div>
      {footer ? <div className={styles.Footer}>{footer}</div> : null}
    </div>
  );
}
