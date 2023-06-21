import { RuntimeContext, defineFunction } from "tal-eval";
import { Expression } from "tal-parser";

const watches = new WeakMap<RuntimeContext, Map<Expression, unknown>>();

export const watch = defineFunction(
  "watch",
  [{ name: "expr", lazy: true }, { name: "action" }],
  (ctx, { expr, action }) => {
    let currentCtxMap = watches.get(ctx);
    if (!currentCtxMap) {
      currentCtxMap = new Map();
      watches.set(ctx, currentCtxMap);
    }
    currentCtxMap.set(expr, ctx.evaluate(expr));

    function run(
      currentCtxMap: Map<Expression, unknown>,
      oldValue: unknown,
      newValue: unknown
    ) {
      currentCtxMap.set(expr, newValue);
      ctx.callFunctionAsync(action, [
        oldValue,
        newValue,
        oldValue === undefined,
      ]);
      // TODO: Show errors in UI
    }

    ctx.registerStateChangedListener(() => {
      if (!currentCtxMap) return;
      const oldValue = currentCtxMap.get(expr);
      const newValue = ctx.evaluate(expr);
      if (oldValue === undefined) {
        run(currentCtxMap, oldValue, newValue);
      } else if (
        Array.isArray(oldValue) &&
        Array.isArray(newValue) &&
        oldValue.length === newValue.length
      ) {
        for (let i = 0; i < oldValue.length; i++) {
          if (oldValue[i] !== newValue[i]) {
            run(currentCtxMap, oldValue, newValue);
            break;
          }
        }
      } else if (oldValue !== newValue) {
        run(currentCtxMap, oldValue, newValue);
      }
    });
  }
);

export const typeof$ = defineFunction(
  "typeof",
  [{ name: "value" }],
  (ctx, { value }) => {
    if (value === null) {
      return "null";
    } else if (Array.isArray(value)) {
      return "array";
    } else {
      return typeof value;
    }
  }
);

export const if$ = defineFunction(
  "if",
  [
    { name: "condition" },
    { name: "ifTrue", lazy: true },
    { name: "ifFalse", lazy: true },
  ],
  (ctx, { condition, ifTrue, ifFalse }) => {
    if (condition) {
      return ctx.evaluate(ifTrue);
    } else if (ifFalse) {
      return ctx.evaluate(ifFalse);
    }
    return null;
  },
  (ctx, { condition, ifTrue, ifFalse }) => {
    if (condition) {
      return ctx.evaluateAsync(ifTrue);
    } else if (ifFalse) {
      return ctx.evaluateAsync(ifFalse);
    }
    return null;
  }
);

export const try$ = defineFunction(
  "try",
  [
    { name: "expr", lazy: true },
    { name: "orElse", lazy: true },
  ],
  (ctx, { expr, orElse }) => {
    try {
      return ctx.evaluate(expr);
    } catch (error) {
      if (orElse) {
        return ctx.createChild({ error }, false).evaluate(orElse);
      }
      return null;
    }
  },
  async (ctx, { expr, orElse }) => {
    try {
      return await ctx.evaluateAsync(expr);
    } catch (error) {
      if (orElse) {
        return await ctx.createChild({ error }, false).evaluateAsync(orElse);
      }
      return null;
    }
  }
);

export const default$ = defineFunction("default", [], (ctx, kwargs, args) => {
  for (let arg of args) {
    if (arg != null) {
      return arg;
    }
  }
  return null;
});

export const throw$ = defineFunction(
  "throw",
  [{ name: "error" }],
  (ctx, { error }) => {
    throw error instanceof Error ? error : new Error(error);
  }
);

export const log = defineFunction(
  "log",
  [{ name: "value" }],
  (ctx, { value }, args) => {
    console.log(value, ...args);
    return value;
  }
);

export const expression_eval = defineFunction(
  "expression_eval",
  [{ name: "expression" }],
  (ctx, { expression }) => {
    return ctx.evaluate(expression);
  }
);

export const set_system_property = defineFunction(
  "set_system_property",
  [{ name: "key" }, { name: "value" }],
  (ctx, { key, value }) => {
    setSystemProperty(key, value);
    return null;
  }
);

function setSystemProperty(key: string, value: unknown) {
  switch (key) {
    case "title": {
      document.title = value as string;
      break;
    }
    case "useSystemBrowser": {
      if (!(window as any).electronAPI) {
        console.warn(
          "Can't set system property useSystemBrowser because it's exclusive to electron"
        );
        return;
      }
      (window as any).electronAPI.setProperty("useSystemBrowser", value);
      break;
    }
    default:
      throw new Error("Unknown property to set: " + key);
  }
}

export const is_defined = defineFunction(
  "is_defined",
  [{ name: "name" }],
  (ctx, { name }) => {
    return ctx.hasLocal(name);
  }
);

export const eval_js = defineFunction(
  "eval_js",
  [{ name: "code" }, { name: "context" }],
  (ctx, { code, context }) => {
    function evalInContext() {
      return function() {
        // eslint-disable-next-line no-eval
        return eval(code);
      }.call(context);
    }
    return evalInContext();
  }
);
