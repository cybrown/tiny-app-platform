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
      <dialog className={styles.dialogReset} open>
        <div className="window">
          <div className="title-bar">
            <div className="title-bar-text">{header}</div>
            <div className="title-bar-controls">
              <button aria-label="Close" onClick={onClose}></button>
            </div>
          </div>
          <div className="window-body">
            <div className={styles.modalBody}>{body}</div>
            <div className={styles.modalButtons}>{footer}</div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
