import { SelectProps } from "../../theme";
import styles from "./Select.module.css";

export default function Select({
  options,
  placeholder,
  onChange,
  value,
  disabled,
  showEmpty,
}: SelectProps) {
  return (
    <select
      className={styles.Select}
      onChange={(e) => onChange && onChange(e.target.selectedIndex)}
      value={value}
      disabled={disabled}
    >
      {showEmpty ? <option>{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
