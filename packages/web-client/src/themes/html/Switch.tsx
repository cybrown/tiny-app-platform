import { SwitchProps } from "../../theme";

export default function Switch({ disabled, onChange, value }: SwitchProps) {
  return (
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => onChange && onChange(e.target.checked)}
      disabled={disabled}
    />
  );
}
