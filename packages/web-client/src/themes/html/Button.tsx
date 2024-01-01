import { ButtonProps } from "../../theme";

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
      className={`tap-button ${secondary ? "is-secondary" : ""} ${
        outline ? "is-outline" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
