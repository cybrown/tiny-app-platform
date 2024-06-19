import { ModalProps } from "../../theme";
import LowLevelOverlay from "../../widgets/internal/LowLevelOverlay";
import { WindowFrame } from "./WindowFrame";

export default function Modal({ header, body, footer, onClose }: ModalProps) {
  return (
    <LowLevelOverlay modal position="center" onClose={onClose}>
      <WindowFrame
        onClose={onClose}
        position="center"
        title={header}
        footer={footer}
      >
        {body}
      </WindowFrame>
    </LowLevelOverlay>
  );
}
