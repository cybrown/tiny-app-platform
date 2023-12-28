import { ButtonProps } from "../../theme";

export default function Button({
  onClick,
  disabled,
  text,
  secondary,
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`tap-button ${secondary ? "is-secondary" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
