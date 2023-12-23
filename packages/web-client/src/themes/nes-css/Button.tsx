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
      className={`nes-btn ${secondary ? "" : "is-primary"} ${
        disabled ? "is-disabled" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
