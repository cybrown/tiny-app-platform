import { WindowFrameProps } from "../../theme";
import { ELECTRON_DRAG, ELECTRON_NO_DRAG, useMakeId } from "../utils";
import styles from "./WindowFrame.module.css";

export function WindowFrame({
  children,
  onClose,
  title,
  footer,
  drag,
}: WindowFrameProps) {
  const id = useMakeId();

  return (
    <div
      className={`mc-modal__dialog is-open ${styles.WindowFrame} ${styles.fixMaxDimensions}`}
      role="document"
    >
      <header
        className="mc-modal__header mc-divider-bottom mc-divider-bottom--light"
        style={drag ? ELECTRON_DRAG : {}}
      >
        <h2 className="mc-modal__title" id={id}>
          {title}
        </h2>
        <button
          className="mc-modal__close"
          onClick={onClose}
          type="button"
          style={ELECTRON_NO_DRAG}
        >
          <span className="mc-modal__close-text">Close</span>
        </button>
      </header>
      <main className="mc-modal__body">
        <article className="mc-modal__content">{children}</article>
      </main>
      <footer className="mc-modal__footer">{footer}</footer>
    </div>
  );
}
