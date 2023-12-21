import { SwitchProps } from "../../theme";

export default function Switch({ disabled, onChange, value }: SwitchProps) {
  return (
    <div className="form-switch">
      <input
        type="checkbox"
        className="form-check-input"
        checked={value}
        onChange={(e) => onChange && onChange(e.target.checked)}
        disabled={disabled}
      />
    </div>
  );
}
