import { Opcode, RuntimeContext, WidgetDocumentation } from "tal-eval";
import RenderExpression from "../runtime/RenderExpression";
import styles from "./Layout.module.css";
import { useTheme } from "../theme";
import { metadataGet } from "tal-eval";

type LayoutDescription = {
  direction?: "row" | "column";
  gap?: number;
  padding?: number;
  wrap?: boolean;
  scroll?: boolean;
};

export type LayoutProps = {
  ctx: RuntimeContext;
  children: Opcode[];
} & LayoutDescription;

function computeLayoutStyles(d: LayoutDescription, baseSize: number) {
  return {
    ...(d.padding ? { padding: d.padding * baseSize } : {}),
  };
}

function computeChildStyles(
  index: number,
  d: LayoutDescription,
  baseSize: number,
  meta: any
) {
  const isRow = d.direction === "row";
  return {
    ...(index > 0
      ? isRow
        ? { paddingLeft: (d.gap ?? 0.5) * baseSize }
        : { paddingTop: (d.gap ?? 0.5) * baseSize }
      : {}),
    ...(meta.flexGrow ? { flexGrow: meta.flexGrow } : {}),
    ...(meta.backgroundColor ? { backgroundColor: meta.backgroundColor } : {}),
    ...(meta.scroller ? { overflowY: "auto" as const } : {}),
  };
}

export default function Layout({ ctx, children, ...d }: LayoutProps) {
  const childContext = ctx.createChild({});
  const isRow = d.direction === "row";
  const theme = useTheme();
  const baseSize = theme.baseSize ?? 12;

  return (
    <div
      className={`${isRow ? styles.directionRow : styles.directionColumn} ${
        d.wrap ? styles.wrap : ""
      } ${d.scroll ? styles.scroll : ""}`}
      style={computeLayoutStyles(d, baseSize)}
    >
      {children
        .flat(Infinity)
        .filter((child) => child)
        .map((child) => ({
          node: <RenderExpression ctx={childContext} ui={child} />,
          meta: metadataGet(child) ?? {},
        }))
        .map((child, index) => (
          <div
            className={styles.child}
            style={computeChildStyles(index, d, baseSize, child.meta)}
            key={index}
          >
            {child.node}
          </div>
        ))}
    </div>
  );
}

export const LayoutDocumentation: WidgetDocumentation<LayoutProps> = {
  description: "A Layout to contain and place multiple widgets",
  props: {
    children: "Widgets to render",
    direction: "row | column",
    gap: "Space between children",
    padding: "Space around children",
    wrap: "Return to avoid scrolling",
    scroll: "Scroll content on overflow",
  },
};
