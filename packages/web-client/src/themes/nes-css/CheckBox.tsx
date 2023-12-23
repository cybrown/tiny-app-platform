import { CheckBoxProps } from "../../theme";

export default function CheckBox({ disabled, onChange, value }: CheckBoxProps) {
  return (
    <label>
      <input
        type="checkbox"
        className="nes-checkbox"
        checked={value}
        onChange={(e) => onChange && onChange(e.target.checked)}
        disabled={disabled}
      />
      <span></span>
    </label>
  );
}
