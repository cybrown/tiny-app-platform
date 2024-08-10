import { useEffect, useState } from "react";
import { LoaderProps } from "../../theme";

export default function Loader(props: LoaderProps) {
  const [valueWhenNull, setValueWhenNull] = useState(props.value);
  useEffect(() => {
    if (props.value != null) return;
    const interval = setInterval(() => {
      setValueWhenNull((value) => (value === 1 ? 2 : 1));
    }, 1000);
    return () => clearInterval(interval);
  });
  return (
    <progress
      className={`nes-progress ${
        props.value == null
          ? "is-pattern"
          : props.primary
          ? "is-primary"
          : props.secondary
          ? "is-pattern"
          : ""
      }`}
      value={props.value ?? valueWhenNull}
      max={props.max ?? 3}
    ></progress>
  );
}
