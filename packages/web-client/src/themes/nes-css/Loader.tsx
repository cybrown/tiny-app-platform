import { useEffect, useState } from "react";
import { LoaderProps } from "../../theme";

export default function Loader(props: LoaderProps) {
  const [value, setValue] = useState(1);
  useEffect(() => {
    const interval = setInterval(() => {
      setValue((value) => (value === 1 ? 2 : 1));
    }, 1000);
    return () => clearInterval(interval);
  });
  return (
    <progress
      className="nes-progress is-pattern"
      value={value}
      max="3"
    ></progress>
  );
}
