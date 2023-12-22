import { ModalProps } from "../../theme";
import styles from "./Modal.module.css";

export default function Modal({ header, body, footer, onClose }: ModalProps) {
  return (
    <div
      className={`modal ${styles.modalBackdrop}`}
      tabIndex={-1}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{header}</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={onClose}
            />
          </div>
          <div className="modal-body">{body}</div>
          <div className="modal-footer">{footer}</div>
        </div>
      </div>
    </div>
  );
}
