import { CheckBoxProps } from "../../theme";
import { useMakeId } from "../utils";

export default function CheckBox({
  disabled,
  onChange,
  value,
  label,
}: CheckBoxProps) {
  const id = useMakeId();
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
