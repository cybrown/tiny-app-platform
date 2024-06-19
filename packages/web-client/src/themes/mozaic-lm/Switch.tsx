import { SwitchProps } from "../../theme";
import { useMakeId } from "../utils";
import styles from "./Switch.module.css";

export default function Switch({
  disabled,
  onChange,
  value,
  secondary,
  label,
}: SwitchProps) {
  const id = useMakeId();
  return (
    <div className={`mc-toggle mc-toggle--s ${styles.Switch}`}>
      <input
        id={id}
        className={`mc-toggle__input ${secondary ? "is-secondary" : ""}`}
        type="checkbox"
        checked={value}
        onChange={(e) => onChange && onChange(e.target.checked)}
        disabled={disabled}
      />
      <label htmlFor={id} className="mc-toggle__label">
        <span>{label}</span>
      </label>
    </div>
  );
}
