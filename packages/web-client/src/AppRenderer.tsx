import { RuntimeContext } from "tal-eval";
import renderExpression, { RenderError } from "./runtime/renderExpression";
import { Expression, TemplateExpression } from "tal-parser";
import { useEffect, useMemo, useRef, useState } from "react";
import { APP_DEBUG_MODE_ENV } from "./constants";
import { compileTemplate } from "tal-ui";

function AppRenderer({
  app,
  ctx,
}: {
  app: Expression[] | null;
  ctx: RuntimeContext;
}) {
  const [appUi, setAppUi] = useState(null as Expression | null);
  const [lastError, setLastError] = useState<unknown>(null);
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
        const lastExpr = app.at(-1)!;
        setAppUi(ctx.evaluate(lastExpr) as any);
        setLastError(null);
      } catch (err) {
        setLastError(err);
        setAppUi(null);
      }
    }
    run();
  }, [app, ctx]);
  return lastError ? (
    <RenderError expression={null} err={lastError} isStartup />
  ) : appUi ? (
    //<>{renderExpression(ctx, appUi)}</>
    <RenderTemplate ctx={ctx} template={appUi as any} />
  ) : null;
}

function RenderTemplate({
  ctx,
  template,
}: {
  ctx: RuntimeContext;
  template: TemplateExpression;
}) {
  const domRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const currentDomRef = domRef.current;
    const compiledElement = compileTemplate(ctx, document, template);
    domRef.current?.appendChild(compiledElement);
    return () => {
      currentDomRef?.removeChild(compiledElement);
      // TODO: inflater.destroy();
    };
  }, [ctx, template]);
  return <div ref={domRef}></div>;
}

export default AppRenderer;
