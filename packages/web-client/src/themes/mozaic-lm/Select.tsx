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
      className={`mc-field__input mc-select mc-select--s ${styles.Select}`}
      onChange={(e) => onChange && onChange(e.target.selectedIndex)}
      value={value}
      disabled={disabled}
    >
      {showEmpty ? <option>{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
