import { WidgetDocumentation } from "tal-eval";
import Layout, { LayoutDocumentation, LayoutProps } from "./Layout";

type RowProps = Omit<LayoutProps, "direction">;

export default function Row(props: Exclude<LayoutProps, "direction">) {
  return <Layout {...props} direction="row" />;
}

const { direction, ...propsDocumentation } = LayoutDocumentation.props;

export const RowDocumentation: WidgetDocumentation<RowProps> = {
  description: "Show content in a horizontal layout",
  props: propsDocumentation,
};
