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
      type="button"
      className={`btn btn-sm ${styles.Button} btn${outline ? "-outline" : ""}-${
        secondary ? "secondary" : "primary"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
