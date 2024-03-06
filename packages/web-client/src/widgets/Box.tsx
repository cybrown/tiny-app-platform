import React from "react";
import RenderExpression from "../runtime/RenderExpression";
import { Opcode, RuntimeContext, WidgetDocumentation } from "tal-eval";
import styles from "./Box.module.css";

type BoxProps = {
  ctx: RuntimeContext;
  width?: string | number;
  height?: string | number;
  flex?: number;
  backgroundColor?: string;
  children?: Opcode[];
};

export default function Box({
  ctx,
  width,
  height,
  children,
  flex,
  backgroundColor,
}: BoxProps) {
  const childContext = ctx.createChild({});
  return (
    <div
      className={styles.Box}
      style={{
        width,
        height,
        flexGrow: flex ?? 0,
        backgroundColor: backgroundColor,
      }}
    >
      {children
        ? children
            .flatMap((child) => (
              <RenderExpression ctx={childContext} ui={child} />
            ))
            .map((child, index) => (
              <React.Fragment key={index}>{child}</React.Fragment>
            ))
        : null}
    </div>
  );
}

export const BoxDocumentation: WidgetDocumentation<BoxProps> = {
  description: "A customizable Box to wrap more content",
  props: {
    backgroundColor: "Background color",
    children: "Content",
    flex: "Weight of free space to use",
    height: "Height like in CSS",
    width: "Width like in CSS",
  },
};
