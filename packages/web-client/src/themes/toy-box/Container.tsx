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
  "9": "height9",
  "10": "height10",
  "11": "height11",
  "12": "height12",
  "13": "height13",
  "14": "height14",
  "15": "height15",
  "16": "height16",
} as Record<string, string>;

export default function Container({ height, children }: ContainerProps) {
  return (
    <div className={`${styles.Container} ${height ? styles[map[height]] : ""}`}>
      {children}
    </div>
  );
}
