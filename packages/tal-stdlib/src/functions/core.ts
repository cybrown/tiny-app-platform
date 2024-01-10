import { RuntimeContext, defineFunction } from 'tal-eval';
import { Expression } from 'tal-parser';

export const on_create = defineFunction(
  'on_create',
  [{ name: 'handler' }],
  (ctx, { handler }) => {
    if (!ctx.isCreated) {
      ctx.callFunctionAsync(handler, []).catch(err => {
        ctx.onCreateError = err;
        ctx.forceRefresh();
      });
    }
  }
);

export const on_destroy = defineFunction(
  'on_destroy',
  [{ name: 'handler' }],
  (ctx, { handler }) => {
    if (ctx.isCreated) return;
    ctx.addDestructor(handler);
  }
);

const watches = new WeakMap<RuntimeContext, Map<Expression, unknown>>();

export const watch = defineFunction(
  'watch',
  [{ name: 'expr' }, { name: 'action' }],
  (ctx, { expr, action }) => {
    let currentCtxMap = watches.get(ctx);
    if (!currentCtxMap) {
      currentCtxMap = new Map();
      watches.set(ctx, currentCtxMap);
    }
    currentCtxMap.set(expr, ctx.callFunction(expr, []));

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
      const newValue = ctx.callFunction(expr, []);
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
  'typeof',
  [{ name: 'value' }],
  (_ctx, { value }) => {
    if (value === null) {
      return 'null';
    } else if (Array.isArray(value)) {
      return 'array';
    } else {
      return typeof value;
    }
  }
);

export const default$ = defineFunction('default', [], (_ctx, _kwargs, args) => {
  for (let arg of args) {
    if (arg != null) {
      return arg;
    }
  }
  return null;
});

export const throw$ = defineFunction(
  'throw',
  [{ name: 'error' }],
  (_ctx, { error }) => {
    throw error instanceof Error ? error : new Error(error);
  }
);

export const log = defineFunction(
  'log',
  [{ name: 'value' }],
  (_ctx, { value }, args) => {
    console.log(value, ...args);
    return value;
  }
);

export const copy = defineFunction(
  'copy',
  [{ name: 'text' }],
  (_ctx, { text }) => {
    navigator.clipboard.writeText(text);
    return text;
  }
);

export const set_system_property = defineFunction(
  'set_system_property',
  [{ name: 'key' }, { name: 'value' }],
  (_ctx, { key, value }) => {
    setSystemProperty(key, value);
    return null;
  }
);

function setSystemProperty(key: string, value: unknown) {
  switch (key) {
    case 'title': {
      document.title = value as string;
      break;
    }
    case 'useSystemBrowser': {
      if (!(window as any).electronAPI) {
        console.warn(
          "Can't set system property useSystemBrowser because it's exclusive to electron"
        );
        return;
      }
      (window as any).electronAPI.setProperty('useSystemBrowser', value);
      break;
    }
    case 'theme': {
      const windowRef = window as { setTheme?: Function };
      if ('setTheme' in windowRef && typeof windowRef.setTheme === 'function') {
        windowRef.setTheme(value);
      }
      break;
    }
    default:
      throw new Error('Unknown property to set: ' + key);
  }
}

export const is_defined = defineFunction(
  'is_defined',
  [{ name: 'name' }],
  (ctx, { name }) => {
    return ctx.hasLocal(name);
  }
);

export const eval_js = defineFunction(
  'eval_js',
  [{ name: 'code' }, { name: 'context' }],
  (_ctx, { code, context }) => {
    function evalInContext() {
      return function() {
        // eslint-disable-next-line no-eval
        return eval(code);
      }.call(context);
    }
    return evalInContext();
  }
);
