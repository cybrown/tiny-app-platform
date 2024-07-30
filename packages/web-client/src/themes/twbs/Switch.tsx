import { useId } from "react";
import { SwitchProps } from "../../theme";

export default function Switch({
  disabled,
  onChange,
  value,
  label,
}: SwitchProps) {
  const id = useId();
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
