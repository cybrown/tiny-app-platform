import { WindowFrameProps } from "../../theme";

export default function WindowFrame({
  title,
  children,
  onClose,
}: WindowFrameProps) {
  return (
    <div className="window">
      <div className="title-bar">
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className="window-body">{children}</div>
    </div>
  );
}
