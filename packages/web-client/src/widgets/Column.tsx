import { WidgetDocumentation } from "tal-eval";
import Layout, { LayoutDocumentation, LayoutProps } from "./Layout";

type ColumnProps = Omit<LayoutProps, "direction">;

export default function Column(props: Exclude<LayoutProps, "direction">) {
  return <Layout {...props} direction="column" />;
}

const { direction, ...propsDocumentation } = LayoutDocumentation.props;

export const ColumnDocumentation: WidgetDocumentation<ColumnProps> = {
  description: "Show content in a vertical layout",
  props: propsDocumentation,
};
