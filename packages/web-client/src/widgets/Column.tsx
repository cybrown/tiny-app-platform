import { Expression } from "tal-parser";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import RenderExpression from "../runtime/RenderExpression";
import styles from "./Column.module.css";
import React from "react";

type ColumnProps = {
  ctx: RuntimeContext;
  flexShrink?: number;
  children: Expression[];
};

export default function Column({
  ctx,
  flexShrink,
  children = [],
}: ColumnProps) {
  const childContext = ctx.createChild({});
  return (
    <div className={styles.Column} style={{ flexShrink }}>
      {children
        .flatMap((child) => (
          <RenderExpression ctx={childContext} expression={child} />
        ))
        .map((child, index) => (
          <React.Fragment key={index}>{child}</React.Fragment>
        ))}
    </div>
  );
}

export const ColumnDocumentation: WidgetDocumentation<ColumnProps> = {
  description: "Show many widgets in a vertical layout",
  props: {
    children: "Widgets to render inside this column",
    flexShrink: "Allow this widget to take less space verticaly",
  },
};
