import { RadioProps } from "../../theme";
import { useMakeId } from "../utils";

export default function Radio({
  disabled,
  onChange,
  value,
  option,
  label,
}: RadioProps) {
  const id = useMakeId();
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
