import { LoaderProps } from "tal-web-theme-api";

export default function Loader({ max, value }: LoaderProps) {
  return <progress max={max} value={value} />;
}
