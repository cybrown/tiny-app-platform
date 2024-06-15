import { Opcode, RuntimeContext, WidgetDocumentation } from "tal-eval";
import RenderExpression from "../runtime/RenderExpression";
import styles from "./View.module.css";
import { useTheme } from "../theme";
import { metadataGet } from "tal-eval";

type ViewDescription = {
  layout?: "flex-row" | "flex-column";
  gap?: number;
  width?: string | number;
  height?: string | number;
  padding?: number;
  wrap?: boolean;
  scroll?: boolean;
  backgroundColor?: string;
};

export type ViewProps = {
  ctx: RuntimeContext;
  children: Opcode[];
} & ViewDescription;

function computeViewStyles(d: ViewDescription, baseSize: number) {
  return {
    ...(d.padding ? { padding: d.padding * baseSize } : {}),
    ...(d.backgroundColor ? { backgroundColor: d.backgroundColor } : {}),
    ...(d.height
      ? { width: typeof d.width == "number" ? d.width * baseSize : d.width }
      : {}),
    ...(d.height
      ? { height: typeof d.height == "number" ? d.height * baseSize : d.height }
      : {}),
  };
}

function computeChildStyles(
  index: number,
  d: ViewDescription,
  baseSize: number,
  meta: any
) {
  const isRow = d.layout === "flex-row";
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

export default function View({ ctx, children, ...d }: ViewProps) {
  const childContext = ctx.createChild({});
  const isRow = d.layout === "flex-row";
  const theme = useTheme();
  const baseSize = theme.baseSize ?? 12;

  return (
    <div
      className={`${isRow ? styles.directionRow : styles.directionColumn} ${
        d.wrap ? styles.wrap : ""
      } ${d.scroll ? styles.scroll : ""}`}
      style={computeViewStyles(d, baseSize)}
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

export const ViewDocumentation: WidgetDocumentation<ViewProps> = {
  description: "A View to contain and layout multiple widgets",
  props: {
    children: "Widgets to render",
    backgroundColor: "Background color",
    layout: "Layout to apply to children: flex-row | flex-column",
    gap: "Space between children",
    padding: "Space around children",
    wrap: "Return to avoid scrolling",
    scroll: "Scroll content on overflow",
    height: "Height, standard unit as a number or a CSS string",
    width: "Width, standard unit as a number or a CSS string",
  },
};
