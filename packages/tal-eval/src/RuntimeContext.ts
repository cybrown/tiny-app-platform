import { Closure, Program } from './core';
import { run, runAsync } from './interpreter';

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

export interface FetchedSource {
  path: string;
  source: string;
}

export interface SourceFetcher {
  fetch(path: string): Promise<FetchedSource>;
  normalizePath(path: string): Promise<string>;
}

export class RuntimeContext {
  constructor(
    onStateChange: () => void,
    private _locals: { [key: string]: unknown } = {},
    private parent?: RuntimeContext,
    private extendable: boolean = true
  ) {
    this.stateChangedListeners.add(onStateChange);
    this._moduleCache = !parent ? new Map<string, unknown>() : undefined;
  }

  private sourceFetcher?: SourceFetcher;

  private readonly _moduleCache?: Map<string, unknown>;

  public get moduleCache(): Map<string, unknown> {
    if (this.parent) {
      return this.parent.moduleCache;
    }
    return this._moduleCache!;
  }

  public getSourceFetcher(): SourceFetcher {
    if (this.sourceFetcher) {
      return this.sourceFetcher;
    } else if (this.parent) {
      return this.parent.getSourceFetcher();
    }
    throw new Error('source fetch not set on context');
  }

  public setSourceFetcher(importer: SourceFetcher | undefined) {
    this.sourceFetcher = importer;
  }

  private _program?: Program;

  public get program(): Program | undefined {
    if (this.parent) {
      return this.parent.program;
    }
    return this._program;
  }

  public set program(value: Program | undefined) {
    if (this.parent) {
      this.parent.program = value;
    } else {
      this._program = value;
    }
  }

  private _isCreated = false;

  public get isCreated() {
    return this._isCreated;
  }

  public setCreated() {
    this._isCreated = true;
  }

  private _onCreateError: unknown;

  public get onCreateError() {
    return this._onCreateError;
  }

  public set onCreateError(error: unknown) {
    this._onCreateError = error;
  }

  private destructors: Closure[] = [];

  public addDestructor(func: Closure) {
    if (!this._isWidgetState) {
      this.parent?.addDestructor(func);
      return;
    }
    this.destructors.push(func);
  }

  public triggerDestructors() {
    if (!this._isWidgetState) {
      this.parent?.triggerDestructors();
      return;
    }
    this.destructors.forEach(destructor => {
      this.callFunctionAsync(destructor, []);
    });
  }

  private stateChangedListeners: Set<() => void> = new Set();
  private isValueRedeclarationAllowed = false;
  private mutableLocals = new Set<string>();
  private _isWidgetState = false;

  public get isWidgetState() {
    return this._isWidgetState;
  }

  forceRefresh() {
    this.triggerStateChangedListeners();
  }

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
      !this._isWidgetState
    ) {
      throw new Error('Local already declared: ' + name);
    }

    if (!this._locals.hasOwnProperty(name)) {
      if (options.hasOwnProperty('initialValue')) {
        this._locals[name] = options.initialValue;
      } else {
        this._locals[name] = null;
      }
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

  setOwnLocalWithoutRender(name: string, value: unknown): void {
    this._locals[name] = value;
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

  private providedKey: unknown;
  private providedValue: unknown;
  private providedParent?: RuntimeContext;

  createChildWithProvider(key: unknown, value: unknown): RuntimeContext {
    const childContext = this.createChild({});
    childContext.providedKey = key;
    childContext.providedValue = value;
    childContext.providedParent = this;
    return childContext;
  }

  getProvidedValue(key: unknown): unknown {
    if (this.providedKey === key) {
      return this.providedValue;
    }
    if (this.providedParent) {
      return this.providedParent.getProvidedValue(key);
    }
    if (this.parent) {
      return this.parent.getProvidedValue(key);
    }
    return null;
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

  callFunction(
    func: Closure,
    args: unknown[] = [],
    kwargs: { [name: string]: unknown } = {}
  ) {
    if (!this.program) throw new Error('missing program');
    return run(func.ctx, func.name, kwargs, args);
  }

  async callFunctionAsync(
    func: Closure,
    args: unknown[],
    kwargs: { [name: string]: unknown } = {}
  ) {
    if (!this.program) throw new Error('missing program');
    return runAsync(func.ctx, func.name, kwargs, args);
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

  createChildWithProvideParent(
    initialValue: Record<string, unknown>,
    parentCtx: RuntimeContext
  ) {
    const childCtx = this.createChild(initialValue);
    childCtx.providedParent = parentCtx;
    return childCtx;
  }

  createChildForWidget(initialValues: {
    [x: string]: unknown;
  }): RuntimeContext {
    const ctx = new RuntimeContext(
      () => this.triggerStateChangedListeners(),
      initialValues,
      this,
      true
    );
    ctx._isWidgetState = true;
    return ctx;
  }

  createWithSameRootLocals(): RuntimeContext {
    return new RuntimeContext(
      () => null,
      this.rootParent._locals,
      undefined,
      false
    );
  }

  get rootParent(): RuntimeContext {
    if (this.parent) {
      return this.parent.rootParent;
    }
    return this;
  }

  listLocals(): [string, unknown][] {
    return Object.entries(this._locals);
  }

  private widgetsDocumentation: {
    [key: string]: WidgetDocumentation<any>;
  } = {};

  registerWidget<T>(
    kind: string,
    widget: (props: T) => JSX.Element | null,
    doc: WidgetDocumentation<T>
  ) {
    this._locals[kind] = widget;
    this.widgetsDocumentation[kind] = doc;
  }

  listWidgets() {
    return this.widgetsDocumentation;
  }

  defineFunction<T extends string>(
    name: string,
    parameters: ParameterDeclaration<T>[],
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

  registerFunction<T extends string>(func: RegisterableFunction<T>) {
    this.declareLocal(func.name, {
      initialValue: func,
    });
  }
}

type ParameterDeclaration<T extends string> = {
  name: T;
  onlyNamed?: boolean;
};

export function defineFunction<T extends string>(
  name: string,
  parameters: ParameterDeclaration<T>[],
  func?: (
    ctx: RuntimeContext,
    namedArguments: { [key in T]: any },
    positionalArguments: any[]
  ) => any,
  funcAsync?: (
    ctx: RuntimeContext,
    namedArguments: { [key in T]: any },
    positionalArguments: any[]
  ) => any
) {
  // TODO: Define one parameter as the pipe entry point
  const result: RegisterableFunction<T> = {
    name,
    parameters,
    parametersByName: parameters.reduce((prev, cur) => {
      prev[cur.name] = cur;
      return prev;
    }, {} as RegisterableFunction<T>['parametersByName']),
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

export type RegisterableFunction<T extends string> = {
  name: string;
  parameters: ParameterDeclaration<T>[];
  parametersByName: Record<T, ParameterDeclaration<T>>;
  call?: (
    ctx: RuntimeContext,
    namedArguments: { [key in T]: any },
    positionalArguments?: any[]
  ) => any;
  callAsync?: (
    ctx: RuntimeContext,
    namedArguments: { [key in T]: any },
    positionalArguments?: any[]
  ) => any;
};
