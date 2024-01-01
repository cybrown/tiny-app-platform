import { useCallback } from "react";
import styles from "./Select.module.css";
import { SelectProps } from "../../theme";

export default function Select({
  options,
  placeholder,
  onChange,
  value,
  disabled,
  showEmpty,
}: SelectProps) {
  const onChangeHandler = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.selectedIndex);
      }
    },
    [onChange]
  );

  return (
    <>
      <select
        className={[styles.Select, showEmpty ? styles.selectDisabled : ""].join(
          " "
        )}
        onChange={onChangeHandler}
        value={value ?? ""}
        disabled={disabled}
      >
        {showEmpty ? (
          <option className={styles.optionDisabled}>{placeholder}</option>
        ) : null}
        {options.map((option) => (
          <option
            className={styles.option}
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
}
