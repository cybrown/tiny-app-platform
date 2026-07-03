import { ButtonProps } from "tal-web-theme-api";
import styles from "./Button.module.css";

export default function Button({ onClick, disabled, text }: ButtonProps) {
  return (
    <button
      className={styles.Button}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
