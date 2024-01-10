import { WidgetDocumentation } from "tal-eval";
import Layout, { LayoutDocumentation, LayoutProps } from "./Layout";

type RowProps = Omit<LayoutProps, "direction">;

export default function Row({
  wrap,
  scroll,
  ...props
}: Exclude<LayoutProps, "direction">) {
  const doWrap = wrap ?? false;
  const doScroll = scroll ?? !wrap;
  return <Layout wrap={doWrap} scroll={doScroll} {...props} direction="row" />;
}

const { direction, ...propsDocumentation } = LayoutDocumentation.props;

export const RowDocumentation: WidgetDocumentation<RowProps> = {
  description:
    "Show content in a horizontal layout, scrolls by default if it does not wrap",
  props: propsDocumentation,
};
