import { RadioProps } from "../../theme";
import styles from "./Radio.module.css";
import Text from "./Text";

export default function Radio({
  disabled,
  onChange,
  value,
  option,
  secondary,
  label,
}: RadioProps) {
  return (
    <div className={styles.RadioContainer}>
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
      <Text text={label ?? ""} />
    </div>
  );
}
