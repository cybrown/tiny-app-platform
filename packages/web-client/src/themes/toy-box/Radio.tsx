import { RadioProps } from "../../theme";
import styles from "./Radio.module.css";

export default function Radio({
  disabled,
  onChange,
  value,
  option,
  secondary,
}: RadioProps) {
  return (
    <>
      <div
        className={`${styles.Radio} ${
          secondary ? " " + styles.secondary : ""
        } ${disabled ? " " + styles.disabled : ""}`}
      >
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
