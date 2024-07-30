import { useId } from "react";
import { RadioProps } from "../../theme";

export default function Radio({
  disabled,
  onChange,
  value,
  option,
  label,
}: RadioProps) {
  const id = useId();
  return (
    <div className="form-check">
      <input
        id={id}
        className="form-check-input"
        type="radio"
        checked={value === option}
        onChange={() => onChange && onChange()}
        disabled={disabled}
      />
      <label htmlFor={id} className="form-check-label">
        {label}
      </label>
    </div>
  );
}
