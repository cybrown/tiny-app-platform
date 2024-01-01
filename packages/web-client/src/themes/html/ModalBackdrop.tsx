import { ModalBackdropProps } from "../../theme";
import styles from "./ModalBackdrop.module.css";

export default function ModalBackdrop({
  onClose,
  children,
}: ModalBackdropProps) {
  return (
    <div
      className={styles.modalBackgroundMask}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}
