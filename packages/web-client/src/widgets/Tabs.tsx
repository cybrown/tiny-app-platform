import { Closure, RuntimeContext, WidgetDocumentation } from "tal-eval";
import { Tabs as ThemedTabs } from "../theme";
import { useCallback, useState } from "react";
import ErrorPopin from "./internal/ErrorPopin";

type TabOptions = {
  value: string;
  label: string;
};

type TabsProps = {
  ctx: RuntimeContext;
  value: string;
  onChange: Closure;
  options: TabOptions[];
};

export default function Tabs({ ctx, value, onChange, options }: TabsProps) {
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
        tabs={options.map((child) => ({
          value: child.value,
          label: child.label,
        }))}
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
    options: "Tabs to display: {value: string, label: string}[]",
  },
};
