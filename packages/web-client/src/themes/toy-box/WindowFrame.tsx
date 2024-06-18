import { WindowFrameProps } from "../../theme";
import styles from "./WindowFrame.module.css";

export function WindowFrame({ children, position }: WindowFrameProps) {
  return (
    <div
      className={`${styles.WindowFrame} ${
        position === "center" ? styles.center : ""
      }`}
    >
      {children}
    </div>
  );
}
