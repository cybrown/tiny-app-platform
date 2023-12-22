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
      className={"btn btn-sm " + (secondary ? "btn-secondary" : "btn-primary")}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
