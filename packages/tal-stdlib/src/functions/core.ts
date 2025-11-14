import {
  RuntimeContext,
  defineFunction,
  defineFunction3,
  typeAny,
  typeBoolean,
  typeDict,
  typeFunction,
  typeGenericPlaceholder,
  typeNull,
  typeNumber,
  typeString,
  typeUnion,
} from 'tal-eval';
import { Node } from 'tal-parser';
import { customRpc } from '../util/custom-rpc';

export const on_create = defineFunction3(
  'on_create',
  [{ name: 'handler' }],
  typeFunction(
    [{ name: 'handler', type: typeFunction([], [], typeAny()) }],
    [],
    typeNull()
  ),
  (ctx, { handler }) => {
    try {
      const ctxForWidget = ctx.ctxForWidgetState;
      if (!ctxForWidget) {
        throw new Error('on_create is only usable inside Widgets');
      }
      if (!ctxForWidget.isCreated) {
        ctx.callFunctionAsync(handler, []).catch(() => {
          ctx.notify(
            'An error occurred while creating a widget, check devtools for details'
          );
          ctx.forceRefresh();
        });
      }
    } catch (err) {
      ctx.notify(
        'An error occurred while creating a widget, check devtools for details'
      );
      ctx.log('error', err);
    }
  },
  undefined,
  {
    description:
      'Run a function when the widget is created, only available inside Widgets',
    parameters: {
      handler: 'The function to run',
    },
    returns: 'Never',
  }
);

export const on_destroy = defineFunction3(
  'on_destroy',
  [{ name: 'handler' }],
  typeFunction(
    [{ name: 'handler', type: typeFunction([], [], typeAny()) }],
    [],
    typeNull()
  ),
  (ctx, { handler }) => {
    const ctxForWidget = ctx.ctxForWidgetState;
    if (!ctxForWidget) {
      throw new Error('on_destroy is only usable inside Widgets');
    }
    if (ctxForWidget.isCreated) return;
    ctxForWidget.addDestructor(handler);
  },
  undefined,
  {
    description:
      'Run a function when the widget is destroyed, only available inside Widgets',
    parameters: {
      handler: 'The function to run',
    },
    returns: 'Never',
  }
);

const watches = new WeakMap<RuntimeContext, Map<Node, unknown>>();

export const watch = defineFunction3(
  'watch',
  [{ name: 'expr' }, { name: 'action' }],
  typeFunction(
    [
      { name: 'expr', type: typeFunction([], [], typeGenericPlaceholder('T')) },
      {
        name: 'action',
        type: typeFunction(
          [
            {
              name: 'oldValue',
              type: typeUnion(typeNull(), typeGenericPlaceholder('T')),
            },
            {
              name: 'newValue',
              type: typeGenericPlaceholder('T'),
            },
            {
              name: 'first',
              type: typeBoolean(),
            },
          ],
          [],
          typeAny()
        ),
      },
    ],
    ['T'],
    typeNull()
  ),
  (ctx, { expr, action }) => {
    const ctxForWidget = ctx.ctxForWidgetState;
    if (!ctxForWidget) {
      throw new Error('watch is only usable inside Widgets');
    }
    if (ctxForWidget.isCreated) {
      return;
    }
    let currentCtxMap = watches.get(ctxForWidget);
    if (!currentCtxMap) {
      currentCtxMap = new Map();
      watches.set(ctxForWidget, currentCtxMap);
    }
    try {
      currentCtxMap.set(expr, ctx.callFunction(expr, []));
    } catch (err) {
      ctx.notify(
        'An error occurred while watching an expression, check devtools for details'
      );
      ctx.log('error', err);
      return;
    }

    function run(
      currentCtxMap: Map<Node, unknown>,
      oldValue: unknown,
      newValue: unknown
    ) {
      currentCtxMap.set(expr, newValue);
      ctx
        .callFunctionAsync(action, [oldValue, newValue, oldValue === undefined])
        .catch((err) => {
          ctx.notify(
            'An error occurred while watching an expression, check devtools for details'
          );
          ctx.log('error', err);
        });
    }

    const handler = () => {
      if (!currentCtxMap) return;
      const oldValue = currentCtxMap.get(expr);
      let newValue;
      try {
        newValue = ctx.callFunction(expr, []);
      } catch (err) {
        ctx.notify(
          'An error occurred while watching an expression, check devtools for details'
        );
        ctx.log('error', err);
        return;
      }
      if (!currentCtxMap.has(expr)) {
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
    };

    ctxForWidget.registerStateChangedListener(handler);
    ctxForWidget.addDestructor(() => {
      ctxForWidget.unregisterStateChangedListener(handler);
    });
  },
  undefined,
  {
    description:
      'Run a function when an expression changes, only available inside Widgets',
    parameters: {
      expr: 'The expression to watch',
      action: 'The function to run when the expression changes',
    },
    returns: 'Never',
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
      const type = typeof value;
      return type === 'object' ? 'record' : type;
    }
  },
  undefined,
  {
    description: 'Returns the type of a value',
    parameters: {
      value: 'The value to get the type of',
    },
    returns:
      'The type of the value: number, string, boolean, array, record, null',
  }
);

export const default$ = defineFunction3(
  'default',
  [{ name: 'value' }, { name: 'orElse' }],
  typeFunction(
    [
      { name: 'value', type: typeGenericPlaceholder('T') },
      { name: 'orElse', type: typeGenericPlaceholder('T') },
    ],
    ['T'],
    typeGenericPlaceholder('T')
  ),
  (_ctx, { value, orElse }) => value ?? orElse,
  undefined,
  {
    description: 'Returns the first non null value',
    parameters: {
      value: 'Value if not null',
      orElse: 'Value if value is null',
    },
    returns: 'The first non null value or null if all are null',
  }
);

export const throw$ = defineFunction(
  'throw',
  [{ name: 'error' }],
  (_ctx, { error }) => {
    throw error instanceof Error ? error : new Error(error);
  },
  undefined,
  {
    description: 'Throws an error',
    parameters: {
      error: 'The error to throw',
    },
    returns: 'Never',
  }
);

export const log = defineFunction3(
  'log',
  [{ name: 'value' }],
  typeFunction(
    [{ name: 'value', type: typeGenericPlaceholder('T') }],
    ['T'],
    typeGenericPlaceholder('T')
  ),
  (ctx, { value }, args) => {
    ctx.log('log', value);
    for (const arg of args) {
      ctx.log('log', arg);
    }
    console.log(value, ...args);
    return value;
  },
  undefined,
  {
    description:
      'Log all its arguments to the console, and returns the first argument',
    parameters: {
      value: 'The argument to return',
    },
    returns: 'The first argument  was logged',
  }
);

export const copy = defineFunction3(
  'copy',
  [{ name: 'text' }],
  typeFunction([{ name: 'text', type: typeString() }], [], typeString()),
  (_ctx, { text }) => {
    navigator.clipboard.writeText(text);
    return text;
  },
  undefined,
  {
    description: 'Copy text to the clipboard',
    parameters: {
      text: 'The text to copy',
    },
    returns: 'The text that was copied',
  }
);

export const set_system_property = defineFunction3(
  'set_system_property',
  [{ name: 'key' }, { name: 'value' }],
  typeFunction(
    [
      { name: 'key', type: typeString() },
      { name: 'value', type: typeString() },
    ],
    [],
    typeNull()
  ),
  (_ctx, { key, value }) => {
    setSystemProperty(key, value);
    return null;
  },
  undefined,
  {
    description: 'Set a system property',
    parameters: {
      key: 'The property to set: theme, useSystemBrowser, title...',
      value: 'The value to set the property to',
    },
    returns: 'null',
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

export const eval_js = defineFunction3(
  'eval_js',
  [{ name: 'code' }, { name: 'context' }],
  typeFunction(
    [
      { name: 'code', type: typeString() },
      { name: 'context', type: typeDict(typeAny()) },
    ],
    [],
    typeAny()
  ),
  (_ctx, { code, context }) => {
    return new Function(...Object.keys(context), `return (${code})`)(
      ...Object.values(context)
    );
  },
  undefined,
  {
    description:
      'Evaluate JavaScript code with given local variables, JavaScript version depends on your runtime.',
    parameters: {
      code: 'The JavaScript code to evaluate, must be an expression, no statement allowed',
      context: 'The local variables',
    },
    returns: 'The result of the evaluation',
  }
);

export const exit = defineFunction3(
  'exit',
  [{ name: 'code' }],
  typeFunction([{ name: 'code', type: typeNumber() }], [], typeNull()),
  (_ctx, { code }) => {
    try {
      if (typeof window != 'undefined' && (window as any).electronAPI) {
        (window as any).electronAPI.exit();
      } else if (typeof process != 'undefined') {
        process.exit(code);
      } else {
        console.error(
          'Failed to exit, make sure it is running on Electron or command line'
        );
      }
    } catch (err) {
      console.error(
        'Failed to exit, make sure it is running on Electron or command line',
        err
      );
    }
  },
  undefined,
  {
    description:
      'Exit the application, only available on Electron and command line',
    parameters: { code: 'Error code to return, only for command line' },
    returns: 'Never',
  }
);

export const rpc = defineFunction(
  'rpc',
  [
    { name: 'command' },
    { name: 'body' },
    { name: 'headers' },
    { name: 'kind' },
  ],
  undefined,
  async (_ctx, { command, headers, body }) => {
    /*
    const logItemData: SqliteLogItemData = {
      uri: value.uri,
      params: params,
      query: value.query,
      forceResult: value.forceResult,
      stage: 'pending',
    };
    const logItem = _ctx.log('sqlite', logItemData);
    */
    try {
      const response = await customRpc(command, body, headers ?? undefined);
      if (response.status === 500) {
        const errorJson = await response.json();
        throw new Error(errorJson.message);
      }
      const responseJson = await response.json();
      //logItem.data.result = responseJson;
      //logItem.data.stage = 'fulfilled';
      return responseJson;
    } catch (e) {
      //logItem.data.stage = 'rejected';
      throw e;
    }
  },
  {
    description: 'Call a raw rpc method',
    parameters: {
      command: 'Command to call',
      headers: 'Headers to add to call',
      body: 'Body to send',
      kind: 'Kind of log to display in the console',
    },
    returns: 'Raw response of the rpc call parsed as JSON',
  }
);
