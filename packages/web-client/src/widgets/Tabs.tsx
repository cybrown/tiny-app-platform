import {
  Closure,
  RuntimeContext,
  typeAny,
  typeArray,
  typeFunction,
  typeKindedRecord,
  typeNull,
  typeNumber,
  typeRecord,
  typeString,
  typeUnion,
  WidgetDocumentation,
} from "tal-eval";
import { useCallback } from "react";
import RenderExpression from "../runtime/RenderExpression";
import SemanticTabs, { TabOptions } from "./semantic/Tabs";

type TabsProps = {
  ctx: RuntimeContext;
  value?: string;
  onChange?: Closure;
  options?: TabOptions[];
  after?: unknown;
};

export default function Tabs({
  ctx,
  onChange,
  after,
  ...commonProps
}: TabsProps) {
  const onChangeHandler = useCallback(
    (newTab: string) => {
      if (!onChange) return;
      return ctx.callFunctionAsync(onChange, [newTab]);
    },
    [ctx, onChange]
  );

  return (
    <SemanticTabs
      onChange={onChangeHandler}
      after={<RenderExpression ctx={ctx} ui={after} />}
      {...commonProps}
    />
  );
}

export const TabsDocumentation: WidgetDocumentation<TabsProps> = {
  description:
    "A link to navigate elsewhere, use system properties to configure the context where to navigate",
  props: {
    value: "Current selected tab",
    onChange: "Set new selected tab",
    options: "Tabs to display: {value: string, label: string}[]",
    after: "Widget to show in the free space after the tabs",
  },
  type: typeFunction(
    [
      { name: "value", type: typeString() },
      {
        name: "onChange",
        type: typeFunction(
          [{ name: "value", type: typeNumber() }],
          [],
          typeAny()
        ),
      },
      {
        name: "options",
        type: typeArray(
          typeRecord({ value: typeString(), label: typeString() })
        ),
      },
      {
        name: "after",
        type: typeUnion(typeNull(), typeKindedRecord()),
      },
    ],
    [],
    typeKindedRecord()
  ),
};
