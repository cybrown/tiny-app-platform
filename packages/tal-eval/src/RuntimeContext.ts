import { Closure, Program } from './core';
import { run, runAsync } from './interpreter';

class GetLocalError extends Error {
  constructor(localName: string) {
    super('Local not found: ' + localName);
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
  source: string | null;
}

export interface SourceFetcher {
  fetch(path: string): Promise<FetchedSource>;
  normalizePath(path: string): Promise<string>;
}

let globalContextCount = 0;

export class RuntimeContext {
  public id: string;
  private childIdCounter = 0;

  constructor(
    onStateChange: () => void,
    private _locals: { [key: string]: unknown } = {},
    private parent?: RuntimeContext,
    private extendable: boolean = true
  ) {
    this.stateChangedListeners.add(onStateChange);
    this._moduleCache = !parent ? new Map<string, unknown>() : undefined;
    this.id = parent
      ? parent.id + '/' + parent.childIdCounter++
      : String(globalContextCount++);
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

  public get ctxForWidgetState(): RuntimeContext | null {
    if (this._isWidgetState) {
      return this;
    }
    if (this.parent) {
      return this.parent.ctxForWidgetState;
    }
    return null;
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

  private destructors: (Closure | (() => void))[] = [];

  public addDestructor(func: Closure | (() => void)) {
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
      if (typeof destructor === 'function') {
        try {
          destructor();
        } catch (err) {
          this.notify(
            'An error occurred while destroying a widget, check devtools for details'
          );
          this.log('error', err);
        }
      } else {
        this.callFunctionAsync(destructor, []).catch(err => {
          this.notify(
            'An error occurred while destroying a widget, check devtools for details'
          );
          this.log('error', err);
        });
      }
    });
  }

  private stateChangedListeners: Set<() => void> = new Set();
  private isValueRedeclarationAllowed = false;
  private mutableLocals = new Set<string>();
  private _isWidgetState = false;

  forceRefresh() {
    this.triggerStateChangedListeners();
  }

  private triggerStateChangedListeners() {
    if (this.parent) {
      this.parent.triggerStateChangedListeners();
    }
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
    if (this.parent) {
      this.parent.registerStateChangedListener(stateChangedListener);
      return;
    }
    this.stateChangedListeners.add(stateChangedListener);
  }

  unregisterStateChangedListener(stateChangedListener: () => void) {
    if (this.parent) {
      this.parent.unregisterStateChangedListener(stateChangedListener);
      return;
    }
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
    try {
      return run(func.ctx, func.name, kwargs, args);
    } catch (e) {
      this.log('error', e);
      throw e;
    }
  }

  async callFunctionAsync(
    func: Closure,
    args: unknown[],
    kwargs: { [name: string]: unknown } = {}
  ) {
    if (!this.program) throw new Error('missing program');
    try {
      return await runAsync(func.ctx, func.name, kwargs, args);
    } catch (e) {
      this.log('error', e);
      throw e;
    }
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

  private _logs: LogItem<unknown>[] = [];

  public get logs(): LogItem<unknown>[] {
    if (this.parent) {
      return this.parent.logs;
    }
    return this._logs;
  }

  log<T>(type: string, value: T): LogItem<T> {
    if (this.parent) {
      return this.parent.log(type, value);
    }
    const logItem: LogItem<T> = {
      id: Math.random()
        .toString(16)
        .slice(2, 8),
      timestamp: Date.now(),
      type,
      data: value,
      isDisplayed: true,
    };
    this._logs.push(logItem);
    while (this._logs.length > 100) {
      const item = this._logs.shift();
      item && (item.isDisplayed = false);
    }
    return logItem;
  }

  public _notificationController: {
    notify: (message: string) => void;
  } | null = null;

  notify(message: string) {
    if (this.parent) {
      this.parent.notify(message);
      return;
    }
    this._notificationController?.notify(message);
  }
}

export type LogItem<T> = {
  id: string;
  type: string;
  timestamp: number;
  data: T;
  isDisplayed: boolean;
};

type ParameterDeclaration<T extends string> = {
  name: T;
  onlyNamed?: boolean;
};

export function defineFunction<T extends string>(
  name: string,
  parameters: ParameterDeclaration<T>[],
  synchronousImplementation?: (
    ctx: RuntimeContext,
    namedArguments: { [key in T]: any },
    positionalArguments: any[]
  ) => any,
  asynchronousImplementation?: (
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
  if (synchronousImplementation) {
    result.call = (ctx, namedArguments, positionalArguments) => {
      return synchronousImplementation(
        ctx,
        namedArguments,
        positionalArguments ?? []
      );
    };
  }
  if (asynchronousImplementation) {
    result.callAsync = (ctx, namedArguments, positionalArguments) => {
      return asynchronousImplementation(
        ctx,
        namedArguments,
        positionalArguments ?? []
      );
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
