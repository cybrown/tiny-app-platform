import { ModalBackdrop, ModalProps, Text } from "../../theme";
import style from "./Modal.module.css";

export default function Modal({ header, body, footer, onClose }: ModalProps) {
  return (
    <ModalBackdrop onClose={onClose}>
      <div className={style.Modal}>
        <Text text={header} size={1.4} weight="light" />
        <Text text={body} />
        <div className={style.ModalFooter}>{footer}</div>
      </div>
    </ModalBackdrop>
  );
}
