import { CheckBoxProps } from "../../theme";
import { useMakeId } from "./utils";

export default function CheckBox({ disabled, onChange, value }: CheckBoxProps) {
  const id = useMakeId();
  return (
    <>
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={(e) => onChange && onChange(e.target.checked)}
        disabled={disabled}
      />
      <label htmlFor={id}>{"\u00A0"}</label>
    </>
  );
}
