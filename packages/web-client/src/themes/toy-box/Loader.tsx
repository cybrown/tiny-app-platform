import { LoaderProps } from "../../theme";
import styles from "./Loader.module.css";

export default function Loader({
  label,
  primary,
  secondary,
  size,
  value,
  max,
}: LoaderProps) {
  const sizeToApply = size ?? "md";

  if (value == null) {
    return (
      <div role="progressbar" className={styles.Loader} aria-label={label}>
        <div
          className={`${styles.LoaderInnerSpinner} ${
            primary ? styles.primary : ""
          } ${secondary ? styles.secondary : ""} ${styles[sizeToApply]}`}
        />
      </div>
    );
  }

  return (
    <div
      role="progressbar"
      className={styles.LoaderProgress}
      aria-label={label}
      aria-valuenow={value}
      aria-valuemax={max}
    >
      <div
        style={{ width: `${(value / (max ?? 100)) * 100}%` }}
        className={`${styles.LoaderInnerProgress} ${
          primary ? styles.primary : ""
        } ${secondary ? styles.secondary : ""} ${styles[sizeToApply]}`}
      />
    </div>
  );
}
