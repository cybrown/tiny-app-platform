import { RadioProps } from "../../theme";

export default function Radio({
  disabled,
  onChange,
  value,
  option,
  label,
}: RadioProps) {
  return (
    <label>
      <input
        type="radio"
        className="nes-radio"
        checked={value === option}
        onChange={() => onChange && onChange()}
        disabled={disabled}
      />
      <span>{label}</span>
    </label>
  );
}
