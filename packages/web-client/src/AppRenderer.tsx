import { RuntimeContext, Program, runAsync, Closure } from "tal-eval";
import RenderExpression from "./runtime/RenderExpression";
import { useCallback, useEffect, useState } from "react";
import { APP_DEBUG_MODE_ENV } from "./constants";
import RenderError from "./runtime/RenderError";

function AppRenderer({
  app,
  ctx,
}: {
  app: Program | null;
  ctx: RuntimeContext;
}) {
  const [appUi, setAppUi] = useState(null as unknown);
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

        const uiClosure: Closure = await runAsync(ctx) as any;

        ctx.endReinit();
        const ui: any = await runAsync(uiClosure.ctx, uiClosure.name);
        setAppUi(ui);
        setLastError(null);
      } catch (err) {
        setLastError(err);
        setAppUi(null);
      }
    }
    run();
  }, [app, ctx]);
  return lastError ? (
    <RenderError
      expression={null}
      err={lastError}
      phase="startup"
      retry={retry}
    />
  ) : appUi ? (
    <RenderExpression ctx={ctx} ui={appUi} />
  ) : null;
}

export default AppRenderer;
