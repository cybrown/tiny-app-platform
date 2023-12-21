import { ButtonProps } from "../../theme";

export default function Button({ onClick, disabled, text }: ButtonProps) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
}
