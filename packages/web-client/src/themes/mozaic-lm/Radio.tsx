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
    <div className="mc-radio">
      <input
        id={id}
        className="mc-radio__input"
        type="radio"
        checked={value === option}
        onChange={() => onChange && onChange()}
        disabled={disabled}
      />
      <label htmlFor={id} className="mc-radio__label">
        {label}
      </label>
    </div>
  );
}
