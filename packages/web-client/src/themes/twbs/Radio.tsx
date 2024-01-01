import { RadioProps } from "../../theme";

export default function Radio({
  disabled,
  onChange,
  value,
  option,
}: RadioProps) {
  return (
    <input
      className="form-check-input"
      type="radio"
      checked={value === option}
      onChange={() => onChange && onChange()}
      disabled={disabled}
    />
  );
}
