import { ButtonProps } from "../../theme";
import styles from "./Button.module.css";

export default function Button({
  onClick,
  disabled,
  text,
  secondary,
}: ButtonProps) {
  return (
    <button
      className={[styles.Button, secondary ? styles.secondary : ""].join(" ")}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
