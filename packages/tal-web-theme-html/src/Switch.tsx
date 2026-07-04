import { useId } from "react";
import { SwitchProps } from "tal-web-theme-api";

export default function Switch({
  disabled,
  onChange,
  value,
  secondary,
  label,
}: SwitchProps) {
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
