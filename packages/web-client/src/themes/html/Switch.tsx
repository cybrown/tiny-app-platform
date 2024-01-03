import { SwitchProps } from "../../theme";

export default function Switch({
  disabled,
  onChange,
  value,
  secondary,
}: SwitchProps) {
  return (
    <input
      className={`tap-checkbox ${secondary ? "is-secondary" : ""}`}
      checked={value}
      onChange={(e) => onChange && onChange(e.target.checked)}
      disabled={disabled}
    />
  );
}
