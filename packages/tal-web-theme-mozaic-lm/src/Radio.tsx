import { useId } from "react";
import { RadioProps } from "tal-web-theme-api";

export default function Radio({
  disabled,
  onChange,
  value,
  option,
  label,
}: RadioProps) {
  const id = useId();
  return (
    <div className="mc-radio">
      <input
        id={id}
        className="mc-radio__input"
        type="radio"
        checked={value === option}
        onChange={() => onChange && onChange()}
        disabled={disabled}
      />
      <label htmlFor={id} className="mc-radio__label">
        {label}
      </label>
    </div>
  );
}
