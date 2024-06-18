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
    <div>
      <input
        id={id}
        className="tap-radio"
        type="radio"
        checked={value === option}
        onChange={() => onChange && onChange()}
        disabled={disabled}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
