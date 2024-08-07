import { Opcode, RuntimeContext, WidgetDocumentation } from "tal-eval";
import RenderExpression from "../runtime/RenderExpression";
import { View as ThemedView } from "../theme";
import { metadataGet } from "tal-eval";
import ViewChild from "./ViewChild";

export type ViewProps = {
  ctx: RuntimeContext;
  children: Opcode[];
  layout?: "flex-row" | "flex-column";
  gap?: number;
  width?: string | number;
  height?: string | number;
  padding?: number;
  wrap?: boolean;
  scroll?: boolean;
  backgroundColor?: string;
};

export default function View({ ctx, children, ...d }: ViewProps) {
  const childContext = ctx.createChild({});

  return (
    <ThemedView {...d}>
      {children
        .flat(Infinity)
        .filter((child) => child)
        .map((child) => ({
          node: <RenderExpression ctx={childContext} ui={child} />,
          meta: metadataGet(child) ?? {},
        }))
        .map((child, index) => (
          <ViewChild key={index} {...child.meta}>
            {child.node}
          </ViewChild>
        ))}
    </ThemedView>
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
