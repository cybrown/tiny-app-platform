import { useId } from "react";
import { CheckBoxProps } from "../../theme";
import styles from "./CheckBox.module.css";

export default function CheckBox({
  disabled,
  onChange,
  value,
  label,
}: CheckBoxProps) {
  const id = useId();
  return (
    <div className={`mc-checkbox ${styles.CheckBox}`}>
      <input
        id={id}
        className={`mc-checkbox__input`}
        type="checkbox"
        checked={value}
        onChange={(e) => onChange && onChange(e.target.checked)}
        disabled={disabled}
      />
      <label className="`mc-checkbox__label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
}
