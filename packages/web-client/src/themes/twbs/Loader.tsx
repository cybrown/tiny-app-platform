import { LoaderProps } from "../../theme";

export default function Loader({ primary, secondary, size }: LoaderProps) {
  const sizeToUse = size ?? "md";
  return (
    <div
      className={`spinner-border ${primary ? "text-primary" : ""} ${
        secondary ? "text-secondary" : ""
      } spinner-border-${sizeToUse}`}
      role="status"
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );
}
