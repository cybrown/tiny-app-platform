import { RuntimeContext } from "tal-eval";
import RenderExpression, { RenderError } from "./runtime/RenderExpression";
import { Expression } from "tal-parser";
import { useCallback, useEffect, useState } from "react";
import { APP_DEBUG_MODE_ENV } from "./constants";

function AppRenderer({
  app,
  ctx,
}: {
  app: Expression[] | null;
  ctx: RuntimeContext;
}) {
  const [appUi, setAppUi] = useState(null as Expression | null);
  const [lastError, setLastError] = useState<unknown>(null);
  const retry = useCallback(() => ctx.forceRefresh(), [ctx]);

  useEffect(() => {
    async function run() {
      try {
        if (!app) return;
        ctx.beginReinit();
        // TODO: Move that elsewhere later
        ctx.declareLocal(APP_DEBUG_MODE_ENV, { mutable: true });
        for (let expression of app.slice(0, -1)) {
          await ctx.evaluateAsync(expression);
        }
        ctx.endReinit();
        const lastExpr = app.at(-1);
        setAppUi({
          kind: "KindedObject" as const,
          value: {
            kind: "Column",
            children: Array.isArray(lastExpr) ? lastExpr : [lastExpr],
          },
        });
        setLastError(null);
      } catch (err) {
        setLastError(err);
        setAppUi(null);
      }
    }
    run();
  }, [app, ctx]);
  return lastError ? (
    <RenderError expression={null} err={lastError} isStartup retry={retry} />
  ) : appUi ? (
    <RenderExpression ctx={ctx} expression={appUi} />
  ) : null;
}

export default AppRenderer;
