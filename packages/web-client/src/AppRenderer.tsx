import { IRNode, RuntimeContext, Program, buildIRNode } from "tal-eval";
import RenderExpression, { RenderError } from "./runtime/RenderExpression";
import { useCallback, useEffect, useState } from "react";
import { APP_DEBUG_MODE_ENV } from "./constants";

function AppRenderer({
  app,
  ctx,
}: {
  app: Program | null;
  ctx: RuntimeContext;
}) {
  const [appUi, setAppUi] = useState(null as IRNode | null);
  const [lastError, setLastError] = useState<unknown>(null);
  const retry = useCallback(() => ctx.forceRefresh(), [ctx]);

  useEffect(() => {
    async function run() {
      try {
        if (!app) return;
        // TODO: Do not assign program to ctx here
        ctx.program = app;
        ctx.beginReinit();
        // TODO: Move that elsewhere later
        ctx.declareLocal(APP_DEBUG_MODE_ENV, { mutable: true });
        const irNodes = (app["main"].body as IRNode<"BLOCK">).children;
        for (let expression of irNodes.slice(0, -1)) {
          await ctx.evaluateAsync(expression);
        }
        ctx.endReinit();
        const lastExpr = irNodes.at(-1);
        setAppUi({
          kind: "KINDED",
          children: [
            buildIRNode("LITERAL", lastExpr?.location, { value: "Column" }),
            buildIRNode("MAKE_ARRAY", lastExpr?.location, {
              children: lastExpr ? [lastExpr] : [],
            }),
          ],
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
