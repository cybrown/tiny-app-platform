import { PropsWithChildren } from "react";
import styles from "./ViewChild.module.css";

type MetaProps = {
  flexGrow?: number;
  backgroundColor?: string;
  scroller?: boolean;
};

export type ViewChildProps = MetaProps & PropsWithChildren;

export default function ViewChild({ children, ...meta }: ViewChildProps) {
  return (
    <div className={styles.child} style={computeChildStyles(meta)}>
      {children}
    </div>
  );
}

function computeChildStyles(meta: MetaProps) {
  return {
    ...(meta.flexGrow ? { flexGrow: meta.flexGrow } : {}),
    ...(meta.backgroundColor ? { backgroundColor: meta.backgroundColor } : {}),
    ...(meta.scroller ? { overflowY: "auto" as const } : {}),
  };
}
