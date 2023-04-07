import { RuntimeContext } from "tal-eval";
import renderExpression from "./runtime/renderExpression";
import { Expression } from "tal-parser";
import { useEffect, useState } from "react";
import { APP_DEBUG_MODE_ENV } from "./constants";

function AppRenderer({
  app,
  ctx,
}: {
  app: Expression[] | null;
  ctx: RuntimeContext;
}) {
  const [appUi, setAppUi] = useState(null as Expression | null);
  useEffect(() => {
    async function run() {
      if (!app) return;
      ctx.beginReinit();
      // TODO: Move that elsewhere later
      ctx.declareLocal(APP_DEBUG_MODE_ENV, { mutable: true });
      for (let subApp of app.slice(0, -1)) {
        await ctx.evaluateAsync(subApp);
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
    }
    run();
  }, [app, ctx]);
  return appUi ? <>{renderExpression(ctx, appUi)}</> : null;
}

export default AppRenderer;
