import { LoaderProps } from "../../theme";

export default function Loader({ max, value }: LoaderProps) {
  return <progress max={max} value={value} />;
}
