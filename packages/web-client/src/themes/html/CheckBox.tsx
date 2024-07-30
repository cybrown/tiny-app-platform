import { useId } from "react";
import { CheckBoxProps } from "../../theme";

export default function CheckBox({
  disabled,
  onChange,
  value,
  secondary,
  label,
}: CheckBoxProps) {
  const id = useId();
  return (
    <div>
      <input
        id={id}
        className={`tap-checkbox ${secondary ? "is-secondary" : ""}`}
        type="checkbox"
        checked={value}
        onChange={(e) => onChange && onChange(e.target.checked)}
        disabled={disabled}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
