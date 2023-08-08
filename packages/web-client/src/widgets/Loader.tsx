import { useCallback, useEffect, useState } from "react";
import { Expression } from "tal-parser";
import RenderExpression from "../runtime/RenderExpression";
import { RuntimeContext, TalValue, WidgetDocumentation } from "tal-eval";

type LoaderProps = {
  ctx: RuntimeContext;
  data: Expression;
  view: Expression;
  watch: Expression;
  error?: Expression;
};

function useForceRefresh(): [unknown, () => void] {
  const [forceRefreshToken, toto] = useState(0);
  const refresh = useCallback(() => toto(Math.random()), []);
  return [forceRefreshToken, refresh];
}

function checkArrayEquality(a: any[], b: any[]): boolean {
  if (a === b) {
    return true;
  }
  if (a == null || b == null) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let index = 0; index < a.length; index++) {
    if (a[index] !== b[index]) {
      return false;
    }
  }
  return true;
}

function useWatch(ctx: RuntimeContext, watch: Expression) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [forceRefreshToken, forceRefresh] = useForceRefresh();

  const [oldWatchResult, setOldWatchResult] = useState<null | TalValue>(null);

  useEffect(() => {
    const listener = () => {
      try {
        if (oldWatchResult == null) {
          setOldWatchResult(ctx.evaluate(watch));
          forceRefresh();
        } else {
          const watchResult = ctx.evaluate(watch);
          if (watchResult.kind !== "array") {
            throw new Error('Watch result must be an array');
          }
          if (oldWatchResult.kind !== "array") {
            throw new Error('Watch result must be an array');
          }
          if (!checkArrayEquality(oldWatchResult.value, watchResult.value)) {
            forceRefresh();
            setOldWatchResult(watchResult);
          }
        }
      } catch (err) {
        console.error("Error while watching", err);
        forceRefresh();
        setOldWatchResult(null);
      }
    };
    ctx.registerStateChangedListener(listener);
    return () => ctx.unregisterStateChangedListener(listener);
  }, [ctx, oldWatchResult, watch, forceRefresh]);

  return forceRefreshToken;
}

export default function Loader({ ctx, data, view, watch, error }: LoaderProps) {
  const [currentState, setCurrentState] = useState<
    "null" | "loading" | "ok" | "error"
  >("null");
  const [latestNominalResult, setLatestNominalResult] = useState<any>(null);
  const [latestErrorResult, setLatestErrorResult] = useState<any>(null);

  const watchToken = useWatch(ctx, watch);

  useEffect(() => {
    setCurrentState("loading");
    console.log("compute data");
    ctx.evaluateAsync(data).then(
      (result) => {
        setLatestNominalResult(
          <RenderExpression
            ctx={ctx.createChild({ data: result })}
            expression={view}
          />
        );
        setCurrentState("ok");
      },
      (err) => {
        setCurrentState("error");
        setLatestErrorResult(
          error ? (
            <RenderExpression
              ctx={ctx.createChild({ error: err })}
              expression={error}
            />
          ) : (
            <div>error</div>
          )
        );
        console.log(err);
      }
    );
  }, [ctx, data, view, watchToken, error]);

  return currentState === "null" ? (
    <div>nothing</div>
  ) : currentState === "loading" ? (
    <div>Loading</div>
  ) : currentState === "ok" ? (
    latestNominalResult
  ) : currentState === "error" ? (
    latestErrorResult
  ) : (
    <div>None</div>
  );
}

export const LoaderDocumentation: WidgetDocumentation<LoaderProps> = {
  description: "Load data declaratively",
  props: {
    data: "Function to evaluate to generate the data",
    error: "Function to render when an error occurs",
    view: "Function to render to show the data",
    watch: "Expression to track changes to recompute the data",
  },
};
