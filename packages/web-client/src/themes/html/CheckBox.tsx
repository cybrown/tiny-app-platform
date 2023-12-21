import { CheckBoxProps } from "../../theme";

export default function CheckBox({ disabled, onChange, value }: CheckBoxProps) {
  return (
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => onChange && onChange(e.target.checked)}
      disabled={disabled}
    />
  );
}
