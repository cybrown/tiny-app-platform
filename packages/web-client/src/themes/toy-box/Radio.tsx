import { RadioProps } from "../../theme";
import styles from "./Radio.module.css";

export default function Radio({
  disabled,
  onChange,
  value,
  option,
}: RadioProps) {
  return (
    <>
      <div className={styles.Radio + (disabled ? " " + styles.disabled : "")}>
        <input
          type="checkbox"
          checked={option === value}
          onChange={() => onChange && onChange()}
          disabled={disabled}
        />
        <div className={styles.checkMark}></div>
      </div>
    </>
  );
}
