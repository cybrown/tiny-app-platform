import { WidgetDocumentation } from "tal-eval";
import View, { ViewDocumentation, ViewProps } from "./View";

type RowProps = Omit<ViewProps, "layout">;

export default function Row({
  wrap,
  scroll,
  ...props
}: Exclude<ViewProps, "layout">) {
  const doWrap = wrap ?? false;
  const doScroll = scroll ?? !wrap;
  return <View wrap={doWrap} scroll={doScroll} {...props} layout="flex-row" />;
}

const { layout, ...propsDocumentation } = ViewDocumentation.props;

export const RowDocumentation: WidgetDocumentation<RowProps> = {
  description:
    "Show content in a horizontal layout, scrolls by default if it does not wrap",
  props: propsDocumentation,
};
