import { Closure, RuntimeContext, WidgetDocumentation } from "tal-eval";
import { Tabs as ThemedTabs } from "../theme";
import { useCallback, useRef, useState } from "react";
import ErrorPopover from "./internal/ErrorPopover";
import RenderExpression from "../runtime/RenderExpression";
import commonStyles from "./common.module.css";

type TabOptions = {
  value: string;
  label: string;
};

type TabsProps = {
  ctx: RuntimeContext;
  value: string;
  onChange: Closure;
  options: TabOptions[];
  after: unknown;
};

export default function Tabs({
  ctx,
  value,
  onChange,
  options,
  after,
}: TabsProps) {
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

  const popoverTargetRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={commonStyles.refWrapper} ref={popoverTargetRef}>
      <ThemedTabs
        value={value}
        onChange={handleOnChange}
        tabs={options.map((child) => ({
          value: child.value,
          label: child.label,
        }))}
        after={<RenderExpression ctx={ctx} ui={after} />}
      />
      <ErrorPopover
        target={popoverTargetRef.current}
        lastError={lastError}
        setLastError={setLastError}
      />
    </div>
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
};
