import { ModalBackdrop, ModalProps } from "../../theme";
import styles from "./Modal.module.css";

export default function Modal({ header, body, footer, onClose }: ModalProps) {
  return (
    <ModalBackdrop onClose={onClose}>
      <div className={styles.modalFrame}>
        <div className={styles.modalHeader}>{header}</div>
        <div className={styles.modalBody}>{body}</div>
        <div className={styles.modalButtons}>{footer}</div>
      </div>
    </ModalBackdrop>
  );
}
