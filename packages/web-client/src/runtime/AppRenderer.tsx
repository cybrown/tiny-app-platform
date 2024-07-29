import { RuntimeContext, Program, runAsync } from "tal-eval";
import RenderExpression from "./RenderExpression";
import { useCallback, useEffect, useState } from "react";
import { APP_DEBUG_MODE_ENV } from "./constants";
import RenderError from "./RenderError";
import { useNotificationController } from "./notifications";
import { Text } from "../theme";

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
  const notificationController = useNotificationController();

  useEffect(() => {
    async function run() {
      try {
        if (!app) return;
        // TODO: Do not assign _notificationController to ctx here
        ctx._notificationController = {
          notify: (message: string) =>
            notificationController.notify(<Text text={message} wrap />),
        };
        // TODO: Do not assign program to ctx here
        ctx.program = app;
        ctx.beginReinit();
        // TODO: Move that elsewhere later
        ctx.declareLocal(APP_DEBUG_MODE_ENV, { mutable: true });

        const exports = (await runAsync(ctx)) as any;

        ctx.endReinit();

        if (typeof exports != "object" || exports == null) {
          throw new Error("toto");
        }

        if (!exports.App) {
          setLastError(
            new Error("No function called App found in exported values")
          );
          return;
        }

        setAppUi({
          ctx: exports.App.ctx,
          kind: exports.App,
          children: [],
          props: {},
        });
        setLastError(null);
      } catch (err) {
        ctx.log("error", err);
        setLastError(err);
        setAppUi(null);
      }
    }
    run();
  }, [app, ctx, notificationController]);
  return lastError ? (
    <RenderError
      ctx={ctx}
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
