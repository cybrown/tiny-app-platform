import { ContainerProps } from "../../theme";
import styles from "./Container.module.css";

const map = {
  "1": "height1",
  "2": "height2",
  "3": "height3",
  "4": "height4",
  "5": "height5",
  "6": "height6",
  "7": "height7",
  "8": "height8",
} as Record<string, string>;

export default function Container({ height, children }: ContainerProps) {
  return (
    <div className={`${styles.Container} ${styles[map["" + height]]}`}>
      {children}
    </div>
  );
}
