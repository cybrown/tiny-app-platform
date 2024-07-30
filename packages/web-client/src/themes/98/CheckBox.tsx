import { useId } from "react";
import { CheckBoxProps } from "../../theme";

export default function CheckBox({
  disabled,
  onChange,
  value,
  label,
}: CheckBoxProps) {
  const id = useId();
  return (
    <div>
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={(e) => onChange && onChange(e.target.checked)}
        disabled={disabled}
      />
      <label htmlFor={id}>{label || "\u00A0"}</label>
    </div>
  );
}
