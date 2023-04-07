import { Expression } from "tal-parser";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import renderExpression from "../runtime/renderExpression";
import styles from "./HorizontalLayout.module.css";

type HorizontalLayoutProps = {
  ctx: RuntimeContext;
  children: Expression[];
  weights?: number[];
};

export default function HorizontalLayout({
  ctx,
  children,
  weights,
}: HorizontalLayoutProps) {
  console.log("DEPRECATED, use Row instead");
  return (
    <div className={styles.HorizontalLayout}>
      {children
        .flatMap((child) => renderExpression(ctx, child))
        .map((child, index) => (
          <div
            className={styles.HorizontalLayoutChild}
            style={{ flexGrow: (weights ?? [])[index] ?? 0 }}
            key={index}
          >
            {child}
          </div>
        ))}
    </div>
  );
}

export const HorizontalLayoutDocumentation: WidgetDocumentation<HorizontalLayoutProps> = {
  description: "DEPRECATED, use Row widget instead",
  props: {
    children: "Content to show",
    weights: "How much each child can use free space",
  },
};
