import { SwitchProps } from "../../theme";
import { useMakeId } from "../utils";

export default function Switch({
  disabled,
  onChange,
  value,
  label,
}: SwitchProps) {
  const id = useMakeId();
  return (
    <div className="form-check form-switch">
      <input
        id={id}
        type="checkbox"
        className="form-check-input"
        checked={value}
        onChange={(e) => onChange && onChange(e.target.checked)}
        disabled={disabled}
      />
      <label htmlFor={id} className="form-check-label">
        {label}
      </label>
    </div>
  );
}
