import { ButtonProps } from "../../theme";
import styles from './Button.module.css';

export default function Button({
  onClick,
  disabled,
  text,
  secondary,
  outline,
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`tap-button ${styles.Button} ${secondary ? "is-secondary" : ""} ${
        outline ? "is-outline" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
