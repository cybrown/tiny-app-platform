import { WindowFrameProps } from "../../theme";
import styles from "./WindowFrame.module.css";

export function WindowFrame({
  title,
  children,
  onClose,
  position,
}: WindowFrameProps) {
  const isDrawer = position !== "center";
  return (
    <div className={"modal " + styles.CustomStyles} tabIndex={-1}>
      <div
        className={`modal-dialog ${styles.WindowCustomStyles} ${
          isDrawer ? styles.drawer : ""
        }`}
        style={{ height: "100%" }}
      >
        <div className={`modal-content ${isDrawer ? styles.drawer : ""}`}>
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
