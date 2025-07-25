import { typeFunction, typeKindedRecord, WidgetDocumentation } from "tal-eval";
import View, { ViewDocumentation, ViewProps, viewPropTypes } from "./View";

type ColumnProps = Omit<ViewProps, "layout">;

export default function Column(props: Exclude<ViewProps, "layout">) {
  return <View {...props} layout="flex-column" />;
}

const { layout, ...propsDocumentation } = ViewDocumentation.props;

export const ColumnDocumentation: WidgetDocumentation<ColumnProps> = {
  description: "Show content in a vertical layout",
  props: propsDocumentation,
  type: typeFunction(viewPropTypes, [], typeKindedRecord()),
};
