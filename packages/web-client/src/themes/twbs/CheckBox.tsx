import { useId } from "react";
import { CheckBoxProps } from "../../theme";

export default function CheckBox({
  disabled,
  onChange,
  value,
  label,
}: CheckBoxProps) {
  const id = useId();
  return (
    <div className="form-check">
      <input
        id={id}
        className="form-check-input"
        type="checkbox"
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
