import { ButtonProps } from "../../theme";
import styles from "./Button.module.css";

export default function Button({
  onClick,
  disabled,
  text,
  secondary,
  outline,
}: ButtonProps) {
  return (
    <button
      className={[
        styles.Button,
        secondary ? styles.secondary : "",
        outline ? styles.outline : "",
      ].join(" ")}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
