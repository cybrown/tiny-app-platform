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
      className={`mc-button mc-button--s ${
        secondary ? "mc-button--solid-primary-02" : ""
      } ${outline ? "mc-button--bordered" : ""}${
        secondary ? "-primary-02" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
