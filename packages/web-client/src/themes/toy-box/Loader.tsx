import { LoaderProps } from "../../theme";
import styles from "./Loader.module.css";

export default function Loader({ primary, secondary, size }: LoaderProps) {
  const sizeToApply = size ?? "md";
  return (
    <div
      className={`${styles.Loader} ${primary ? styles.primary : ""} ${
        secondary ? styles.secondary : ""
      } ${styles[sizeToApply]}`}
    />
  );
}
