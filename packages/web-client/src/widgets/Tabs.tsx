import {
  Closure,
  IRNode,
  RuntimeContext,
  WidgetDocumentation,
  metadataGet,
} from "tal-eval";
import { Tabs as ThemedTabs } from "../theme";
import { useCallback, useState } from "react";
import ErrorPopin from "./internal/ErrorPopin";
import RenderExpression from "../runtime/RenderExpression";

type TabsProps = {
  ctx: RuntimeContext;
  value: string;
  onChange: Closure;
  children: IRNode[];
};

export default function Tabs({ ctx, value, onChange, children }: TabsProps) {
  const [lastError, setLastError] = useState<unknown>(null);

  const handleOnChange = useCallback(
    async (newTab: string) => {
      try {
        await ctx.callFunctionAsync(onChange, [newTab]);
      } catch (err) {
        setLastError(err);
      }
    },
    [ctx, onChange]
  );

  return (
    <>
      <ThemedTabs
        value={value}
        onChange={handleOnChange}
        tabs={children.flat(Infinity).map((child) => {
          const metadata = metadataGet(child);
          if (!metadata) throw new Error("Metadata missing");
          return {
            id: (metadata as any).tab.id,
            title: (metadata as any).tab.title,
            content: () => <RenderExpression ctx={ctx} evaluatedUI={child} />,
          };
        })}
      />
      <ErrorPopin lastError={lastError} setLastError={setLastError} />
    </>
  );
}

export const TabsDocumentation: WidgetDocumentation<TabsProps> = {
  description:
    "A link to navigate elsewhere, use system properties to configure the context where to navigate",
  props: {
    value: "Current selected tab",
    onChange: "Set new selected tab",
    children: "Tabs to render",
  },
};
