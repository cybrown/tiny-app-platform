import { LoaderProps } from "../../theme";

export default function Loader({
  primary,
  secondary,
  size,
  value,
  label,
  max,
}: LoaderProps) {
  const sizeToUse = size ?? "md";

  if (!value) {
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

  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemax={max}
    >
      <div
        className="progress-bar"
        style={{ width: `${(value / (max ?? 100)) * 100}%` }}
      />
    </div>
  );
}
