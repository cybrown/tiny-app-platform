import { ButtonProps } from "../../theme";
import styles from './Button.module.css';

export default function Button({
  onClick,
  disabled,
  text,
  secondary,
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`nes-btn ${styles.Button} ${secondary ? "" : "is-primary"} ${
        disabled ? "is-disabled" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
