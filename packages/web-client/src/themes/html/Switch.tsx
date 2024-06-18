import { SwitchProps } from "../../theme";
import { useMakeId } from "../utils";

export default function Switch({
  disabled,
  onChange,
  value,
  secondary,
  label,
}: SwitchProps) {
  const id = useMakeId();
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
