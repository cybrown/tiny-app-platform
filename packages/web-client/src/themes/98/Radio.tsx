import { RadioProps } from "../../theme";
import { useMakeId } from "./utils";

export default function Radio({
  disabled,
  onChange,
  value,
  option,
}: RadioProps) {
  const id = useMakeId();
  return (
    <>
      <input
        id={id}
        type="radio"
        checked={value === option}
        onChange={() => onChange && onChange()}
        disabled={disabled}
      />
      <label htmlFor={id}>{"\u00A0"}</label>
    </>
  );
}
