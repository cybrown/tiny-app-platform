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
      className={`btn btn-sm btn${outline ? "-outline" : ""}-${
        secondary ? "secondary" : "primary"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
