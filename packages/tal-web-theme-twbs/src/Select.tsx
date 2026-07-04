import { SelectProps } from "tal-web-theme-api";

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
      className="form-select form-select-sm"
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
