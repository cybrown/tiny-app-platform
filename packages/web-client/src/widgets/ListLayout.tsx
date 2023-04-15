import { Expression } from "tal-parser";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import RenderExpression from "../runtime/RenderExpression";
import styles from "./ListLayout.module.css";

type ListLayoutProps = {
  ctx: RuntimeContext;
  children: Expression[];
};

export default function ListLayout({ ctx, children }: ListLayoutProps) {
  return (
    <div className={styles.ListLayout}>
      {children
        .flatMap((child) => <RenderExpression ctx={ctx} expression={child} />)
        .map((child, index) => (
          <div className={styles.ListLayoutChild} key={index}>
            {child}
          </div>
        ))}
    </div>
  );
}

export const ListLayoutDocumentation: WidgetDocumentation<ListLayoutProps> = {
  description: "DEPRECATED, use Column widget instead",
  props: {
    children: "Content to render",
  },
};
