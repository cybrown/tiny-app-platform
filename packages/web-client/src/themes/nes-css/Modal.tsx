import { ModalProps } from "../../theme";
import styles from "./Modal.module.css";

export default function Modal({ header, body, footer, onClose }: ModalProps) {
  return (
    <div
      className={styles.modalBackgroundMask}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <dialog className="nes-dialog" open>
        <div className={styles.modalHeader}>{header}</div>
        <div className={styles.modalBody}>{body}</div>
        <div className={styles.modalButtons}>{footer}</div>
      </dialog>
    </div>
  );
}
