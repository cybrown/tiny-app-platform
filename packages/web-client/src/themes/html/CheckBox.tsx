import { CheckBoxProps } from "../../theme";

export default function CheckBox({
  disabled,
  onChange,
  value,
  secondary,
}: CheckBoxProps) {
  return (
    <input
      className={`tap-checkbox ${secondary ? "is-secondary" : ""}`}
      type="checkbox"
      checked={value}
      onChange={(e) => onChange && onChange(e.target.checked)}
      disabled={disabled}
    />
  );
}
