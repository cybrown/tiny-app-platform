import styles from "./Switch.module.css";
import { SwitchProps } from "../../theme";

export default function Switch({
  onChange,
  value,
  disabled,
  secondary,
}: SwitchProps) {
  return (
    <>
      <div
        className={`${styles.SwitchContainer} ${
          secondary ? styles.secondary : ""
        }`}
      >
        <input
          className={styles.Switch}
          type="checkbox"
          checked={value}
          onChange={(e) => onChange && onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={
            styles.background +
            (disabled ? " " + styles.backgroundDisabled : "")
          }
        ></div>
        <div
          className={
            styles.switch + (disabled ? " " + styles.switchDisabled : "")
          }
        ></div>
      </div>
    </>
  );
}
