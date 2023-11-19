import { IRNode, RuntimeContext, WidgetDocumentation } from "tal-eval";
import RenderExpression from "../runtime/RenderExpression";
import styles from "./Row.module.css";
import React from "react";

type RowProps = {
  ctx: RuntimeContext;
  children: IRNode[];
  noWrap?: boolean;
};

export default function Row({ ctx, children, noWrap }: RowProps) {
  const childContext = ctx.createChild({});
  return (
    <div className={`${styles.Row} ${noWrap ? "" : styles.wrap}`}>
      {children
        .flatMap((child) => (
          <RenderExpression ctx={childContext} evaluatedUI={child} />
        ))
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
    noWrap: "Do not wrap elements",
  },
};
