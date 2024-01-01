import { CheckBoxProps } from "../../theme";
import styles from "./CheckBox.module.css";

export default function CheckBox({ disabled, onChange, value }: CheckBoxProps) {
  return (
    <>
      <div
        className={styles.CheckBox + (disabled ? " " + styles.disabled : "")}
      >
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange && onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={styles.checkMark}>
          <div className={styles.checkMarkInner} />
        </div>
      </div>
    </>
  );
}
