import { Expression } from "tal-parser";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import renderExpression from "../runtime/renderExpression";
import styles from "./Row.module.css";
import React from "react";

type RowProps = {
  ctx: RuntimeContext;
  children: Expression[];
};

export default function Row({ ctx, children }: RowProps) {
  const childContext = ctx.createChild({});
  return (
    <div className={styles.Row}>
      {children
        .flatMap((child) => renderExpression(childContext, child))
        .map((child, index) => (
          <React.Fragment key={index}>{child}</React.Fragment>
        ))}
    </div>
  );
}

export const RowDocumentation: WidgetDocumentation<RowProps> = {
  description: "Show content in a horizontal layout",
  props: {
    children: "Widgets to render in line",
  },
};
