import {
  evaluateAsyncExpression,
  evaluateCall,
  evaluateExpression,
} from './evaluation';
import {
  Expression,
  AddressableExpression,
  FunctionExpression,
  CallExpression,
  ArgumentExpression,
  isExpr,
} from 'tal-parser';

class GetLocalError extends Error {
  constructor(localName: string) {
    super('Local not found: ' + localName);
  }
}

class GetEnvError extends Error {
  constructor(localName: string) {
    super('Env value not found: ' + localName);
  }
}

type DeclareLocalOptions = {
  initialValue?: unknown;
  mutable?: boolean;
};

export type WidgetDocumentation<T> = {
  description: string;
  props: {
    [K in Exclude<keyof T, 'ctx'>]: string;
  };
};

export class RuntimeContext {
  constructor(
    onStateChange: () => void,
    private _locals: { [key: string]: unknown } = {},
    private parent?: RuntimeContext,
    private extendable: boolean = true
  ) {
    this.stateChangedListeners.add(onStateChange);
  }

  private stateChangedListeners: Set<() => void> = new Set();
  private isValueRedeclarationAllowed = false;
  private mutableLocals = new Set<string>();
  private isWidgetState = false;

  private triggerStateChangedListeners() {
    this.stateChangedListeners.forEach(listener => listener());
  }

  beginReinit() {
    this.isValueRedeclarationAllowed = true;
    this.mutableLocals.clear();
  }

  endReinit() {
    this.isValueRedeclarationAllowed = false;
  }

  registerStateChangedListener(stateChangedListener: () => void) {
    this.stateChangedListeners.add(stateChangedListener);
  }

  unregisterStateChangedListener(stateChangedListener: () => void) {
    this.stateChangedListeners.delete(stateChangedListener);
  }

  declareLocal(name: string, options: DeclareLocalOptions = {}): void {
    if (!this.extendable) {
      if (this.parent) {
        return this.parent.declareLocal(name, options);
      } else {
        throw new Error(
          'Not possible to declare new locals on a non extendable scope: ' +
            name
        );
      }
    }
    if (
      this._locals.hasOwnProperty(name) &&
      !this.isValueRedeclarationAllowed &&
      !this.isWidgetState
    ) {
      throw new Error('Local already declared: ' + name);
    }

    if (options.hasOwnProperty('initialValue')) {
      this._locals[name] = options.initialValue;
    } else if (!this._locals.hasOwnProperty(name)) {
      this._locals[name] = null;
    }
    if (options.mutable) {
      this.mutableLocals.add(name);
    }
  }

  setLocal(name: string, value: unknown): void {
    if (!this._locals.hasOwnProperty(name)) {
      if (this.parent) {
        return this.parent.setLocal(name, value);
      } else {
        throw new Error('Set undeclared local: ' + name);
      }
    }
    if (!this.mutableLocals.has(name)) {
      throw new Error('Tried to set a not mutable local: ' + name);
    }
    this._locals[name] = value;
    this.triggerStateChangedListeners();
  }

  getLocal(name: string): unknown {
    if (!this.hasLocal(name)) {
      throw new GetLocalError(name);
    }
    if (this._locals.hasOwnProperty(name)) {
      return this._locals[name];
    } else if (this.parent) {
      return this.parent.getLocal(name);
    }
    throw new GetLocalError(name);
  }

  getEnv(name: string): unknown {
    if (!this.hasLocal(name)) {
      throw new GetEnvError(name);
    }
    if (this._locals.hasOwnProperty(name)) {
      return this._locals[name];
    } else if (this.parent) {
      return this.parent.getLocal(name);
    }
    throw new GetEnvError(name);
  }

  getEnvOr(name: string, defaultValue: unknown): unknown {
    if (!this.hasLocal(name)) {
      return defaultValue;
    }
    if (this._locals.hasOwnProperty(name)) {
      return this._locals[name];
    } else if (this.parent) {
      return this.parent.getLocal(name);
    }
    throw new GetEnvError(name);
  }

  // TODO: To remove
  getLocalOr(name: string, value: unknown): unknown {
    return this.hasLocal(name) ? this.getLocal(name) : value;
  }

  // TODO: To remove
  hasLocal(name: string): boolean {
    const hasLocal = this._locals.hasOwnProperty(name);
    if (hasLocal) {
      return true;
    }
    if (this.parent != null) {
      return this.parent.hasLocal(name);
    }
    return false;
  }

  setValue(address: AddressableExpression, value: unknown): void {
    if (!address || typeof address != 'object' || !address.kind) {
      throw new Error(
        'Unknown node to address value of type: ' +
          (address == null ? 'null' : typeof address)
      );
    }
    switch (address.kind) {
      case 'Attribute': {
        const object = this.evaluate(address.value);
        (object as any)[address.key] = value;
        break;
      }
      case 'Index': {
        const object = this.evaluate(address.value);
        (object as any)[this.evaluate(address.index) as any] = value;
        break;
      }
      case 'Local': {
        this.setLocal(address.name, value);
        break;
      }
      case 'Deref': {
        this.setValue(this.evaluate(address.value) as any, value);
        break;
      }
      default:
        throw new Error(
          'Unknown node to address value: ' + (address as any).kind
        );
    }
    this.triggerStateChangedListeners();
  }

  hasValue(address: Expression): boolean {
    try {
      this.evaluate(address);
    } catch (err) {
      if (err instanceof GetLocalError) {
        return false;
      }
      throw err;
    }
    return true;
  }

  evaluate(expr: Expression): unknown {
    return evaluateExpression(this, expr);
  }

  evaluateAsync(expr: Expression): Promise<unknown> {
    return evaluateAsyncExpression(this, expr);
  }

  evaluateOr(expr: Expression, alternative: unknown): unknown {
    try {
      return this.evaluate(expr) ?? alternative;
    } catch (err) {
      if (err instanceof GetLocalError) {
        return alternative;
      }
      throw err;
    }
  }

  callFunction(
    func: FunctionValue,
    args: unknown[],
    kwargs: { [name: string]: unknown } = {}
  ) {
    const argsForCall = args
      .map(
        arg =>
          ({
            argKind: 'Positional',
            value: { kind: 'Value', value: arg },
          } as ArgumentExpression)
      )
      .concat(
        Object.entries(kwargs).map(([name, value]) => {
          return {
            argKind: 'Named',
            name,
            value: { kind: 'Value', value },
          } as ArgumentExpression;
        })
      );
    return evaluateCall(this, func, argsForCall);
  }

  async callFunctionAsync(
    func: FunctionValue,
    args: unknown[],
    kwargs: { [name: string]: unknown } = {}
  ) {
    const node: CallExpression = {
      kind: 'Call',
      args: args
        .map(
          arg =>
            ({
              argKind: 'Positional',
              value: { kind: 'Value', value: arg },
            } as ArgumentExpression)
        )
        .concat(
          Object.entries(kwargs).map(([name, value]) => {
            return {
              argKind: 'Named',
              name,
              value,
            } as ArgumentExpression;
          })
        ),
      value: func.func,
    };
    return this.evaluateAsync(node);
  }

  createChild(
    initialValues: { [x: string]: unknown },
    extendable?: boolean
  ): RuntimeContext {
    return new RuntimeContext(
      () => this.triggerStateChangedListeners(),
      initialValues,
      this,
      extendable
    );
  }

  listLocals(): [string, unknown][] {
    return Object.entries(this._locals);
  }

  private eventHandlers: {
    [key: string]: [unknown, () => Promise<void>][];
  } = {};

  on(eventName: string, callback: Expression | (() => Promise<void>)): void {
    if (this.parent) {
      return this.parent.on(eventName, callback);
    }

    if (!this.eventHandlers.hasOwnProperty(eventName)) {
      this.eventHandlers[eventName] = [];
    }
    if (this.eventHandlers[eventName].find(([cb]) => cb === callback) != null) {
      return;
    }
    if (typeof callback == 'function') {
      this.eventHandlers[eventName].push([
        callback,
        async () => {
          await callback();
        },
      ]);
    } else {
      this.eventHandlers[eventName].push([
        callback,
        async () => {
          await this.evaluateAsync(callback);
        },
      ]);
    }
  }

  off(eventName: string, value: unknown): void {
    if (this.parent) {
      return this.parent.off(eventName, value);
    }

    if (this.eventHandlers.hasOwnProperty(eventName)) {
      this.eventHandlers[eventName] = this.eventHandlers[eventName].filter(
        ([callback]) => callback !== value
      );
    }
  }

  async trigger(eventName: string): Promise<void> {
    if (this.parent) {
      return this.parent.trigger(eventName);
    }
    // TODO: Run all handlers in concurrency ?
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (let [_, handler] of this.eventHandlers[eventName] ?? []) {
      await handler();
    }
  }

  private widgets: { [key: string]: (props: any) => JSX.Element | null } = {};
  private widgetsDocumentation: {
    [key: string]: WidgetDocumentation<any>;
  } = {};

  getWidgetByKind(kind: string): ((props: any) => JSX.Element | null) | null {
    const widget = this.widgets[kind];
    if (widget) {
      return widget;
    }
    if (this.parent) {
      return this.parent.getWidgetByKind(kind);
    }
    return null;
  }

  registerWidget<T>(
    kind: string,
    widget: (props: T) => JSX.Element | null,
    doc: WidgetDocumentation<T>
  ) {
    this.widgets[kind] = widget;
    this.widgetsDocumentation[kind] = doc;
  }

  listWidgets() {
    return this.widgetsDocumentation;
  }

  defineFunction(
    name: string,
    parameters: ParameterDeclaration[],
    func?: (
      ctx: RuntimeContext,
      namedArguments: { [key: string]: any },
      positionalArguments: any[]
    ) => any,
    funcAsync?: (
      ctx: RuntimeContext,
      namedArguments: { [key: string]: any },
      positionalArguments: any[]
    ) => any
  ) {
    const result = defineFunction(name, parameters, func, funcAsync);
    this.declareLocal(result.name, { initialValue: result });
  }

  registerFunction(func: RegisterableFunction) {
    this.declareLocal(func.name, {
      initialValue: func,
    });
  }
}

export type FunctionValue = {
  __kind: 'FunctionValue';
  func: FunctionExpression;
  ctx: RuntimeContext;
};

export function isFunctionValue(value: any): value is FunctionValue {
  return !!(
    value &&
    typeof value == 'object' &&
    '__kind' in value &&
    value.__kind === 'FunctionValue' &&
    'func' in value &&
    isExpr(value.func as Expression, 'Function')
  );
}

type ParameterDeclaration = {
  name: string;
  lazy?: boolean;
  env?: string;
};

export function defineFunction(
  name: string,
  parameters: ParameterDeclaration[],
  func?: (
    ctx: RuntimeContext,
    namedArguments: { [key: string]: any },
    positionalArguments: any[]
  ) => any,
  funcAsync?: (
    ctx: RuntimeContext,
    namedArguments: { [key: string]: any },
    positionalArguments: any[]
  ) => any
) {
  // TODO: Define one parameter as the pipe entry point
  const result: RegisterableFunction = {
    name,
    parameters,
    parametersByName: parameters.reduce((prev, cur) => {
      prev[cur.name] = cur;
      return prev;
    }, {} as RegisterableFunction['parametersByName']),
  };
  if (func) {
    result.call = (ctx, namedArguments, positionalArguments) => {
      return func(ctx, namedArguments, positionalArguments ?? []);
    };
  }
  if (funcAsync) {
    result.callAsync = (ctx, namedArguments, positionalArguments) => {
      return funcAsync(ctx, namedArguments, positionalArguments ?? []);
    };
  }
  return result;
}

export type RegisterableFunction = {
  name: string;
  parameters: ParameterDeclaration[];
  parametersByName: {
    [argName: string]: {
      name: string;
      lazy?: boolean;
      exported?: boolean;
    };
  };
  call?: (
    ctx: RuntimeContext,
    namedArguments: { [key: string]: any },
    positionalArguments?: any[]
  ) => any;
  callAsync?: (
    ctx: RuntimeContext,
    namedArguments: { [key: string]: any },
    positionalArguments?: any[]
  ) => any;
};
