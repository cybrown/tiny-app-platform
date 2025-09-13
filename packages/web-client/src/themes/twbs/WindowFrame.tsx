import { WindowFrameProps } from "../../theme";
import { ELECTRON_DRAG, ELECTRON_NO_DRAG } from "../utils";
import styles from "./WindowFrame.module.css";

export function WindowFrame({
  title,
  children,
  onClose,
  position,
  drag,
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
          <div className="modal-header" style={drag ? ELECTRON_DRAG : {}}>
            <h5 className="modal-title">{title}</h5>
            {onClose ? (
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={onClose}
                style={ELECTRON_NO_DRAG}
              ></button>
            ) : null}
          </div>
          <div className={`modal-body ${styles.Body}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}
