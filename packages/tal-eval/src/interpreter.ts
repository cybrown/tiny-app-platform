import { parse } from 'tal-parser';
import { RuntimeContext } from './RuntimeContext';
import { AnyForNever, Closure, ParameterDef, TODO_ANY } from './core';
import { IRNode, IRNodeByKind } from './ir-node';
import { compile } from './compiler';
import { lower } from './lowerer';

export class EvaluationError extends Error {
  constructor(
    message: string,
    public readonly node: IRNode,
    public readonly cause: unknown
  ) {
    super(message);
  }
}

type VmExitFinished = {
  kind: 'FINISHED';
  result: unknown;
};

type VmExitError = {
  kind: 'ERROR';
  error: EvaluationError;
};

type VmExitPending = {
  kind: 'PENDING';
  promise: Promise<unknown>;
  state: VmPendingState;
};

type VmPendingState = {
  func: string;
  label: string;
  pc: number;
};

type TryState = {
  label?: string;
};

export type VmExit = VmExitFinished | VmExitPending | VmExitError;

type FrameState = {
  currentFunction: string;
  currentLabel: string;
  stack: unknown[];
  pc: number;
  tryStack: TryState[];
  isInsideWidget: boolean;
  widgetStateFlagConsumed: boolean;
};

export class VM {
  private ctx: RuntimeContext;
  private ctxStack: RuntimeContext[] = [];

  // Frame data
  private currentFunction: string;
  private currentLabel: string;
  private stack: unknown[] = [];
  private pc: number = 0;
  private tryStack: TryState[] = [];
  private isInsideWidget = false;
  private widgetStateFlagConsumed = false;

  private frameStack: FrameState[] = [];

  private pushFrame(functionName: string) {
    this.frameStack.push({
      currentFunction: this.currentFunction,
      currentLabel: this.currentLabel,
      pc: this.pc,
      stack: this.stack,
      tryStack: this.tryStack,
      isInsideWidget: this.isInsideWidget,
      widgetStateFlagConsumed: this.widgetStateFlagConsumed,
    });
    this.resetFrameData(functionName);
  }

  private resetFrameData(functionName: string) {
    this.currentFunction = functionName;
    this.currentLabel = 'entry';
    this.pc = 0;
    this.stack = [];
    this.tryStack = [];
    this.isInsideWidget = false;
    this.widgetStateFlagConsumed = false;
  }

  private hasFrame(): boolean {
    return !!this.frameStack.length;
  }

  private popFrame() {
    const topFrame = this.frameStack.pop();
    if (topFrame == undefined) {
      throw new Error('Stack from underflow');
    }
    this.currentFunction = topFrame.currentFunction;
    this.currentLabel = topFrame.currentLabel;
    this.pc = topFrame.pc;
    this.stack = topFrame.stack;
    this.tryStack = topFrame.tryStack;
  }

  constructor(ctx: RuntimeContext, private verbose = false) {
    this.ctx = ctx;
    this.isInsideWidget = this.ctx.isWidgetState;
    this.currentFunction = 'main';
    this.currentLabel = 'entry';
  }

  keepUpmostStack = false;

  private current() {
    const currentFunction = this.ctx.program![this.currentFunction];
    if (!currentFunction) {
      throw new Error('Unknown function: ' + this.currentFunction);
    }
    const currentLabel = currentFunction.body[this.currentLabel];
    if (!currentLabel) {
      throw new Error(
        'Unknown label: ' +
          this.currentLabel +
          ' in function: ' +
          this.currentFunction
      );
    }
    return currentLabel;
  }

  runMain(): VmExit {
    this.pc = 0;
    return this.run();
  }

  runFunction(currentFunction: string): VmExit {
    this.currentFunction = currentFunction;
    return this.run();
  }

  runFunctionWithArgs(
    currentFunction: string,
    namedArgs: Record<string, unknown>,
    positionalArgs: unknown[]
  ): VmExit {
    const closure: Closure = { ctx: this.ctx, name: currentFunction };
    this.currentFunction = currentFunction;
    const [namedArguments /* positionalArguments */] = resolveArgumentNames(
      this.ctx.program![closure.name],
      namedArgs,
      positionalArgs
    );
    this.ctx = closure.ctx
      .createChild(namedArguments, false)
      .createChildWithProvideParent({}, this.ctx);
    return this.run();
  }

  resume(state: VmPendingState): VmExit {
    // TODO: Resume from rejected promise
    this.currentFunction = state.func;
    this.currentLabel = state.label;
    this.pc = state.pc;
    return this.run();
  }

  private run(): VmExit {
    while (true) {
      while (this.pc < this.current().length) {
        try {
          if (this.verbose) {
            const { location, ...opcode } = this.current()[this.pc];
            console.log(opcode);
          }
          const exit = this.runOpcode(this.current()[this.pc]);
          this.verbose && console.log(this.stack);
          if (exit) {
            return exit;
          }
        } catch (err) {
          this.verbose && console.log('Exception: jumping to catch block');
          let catchBlockDefined = false;
          while (!catchBlockDefined) {
            while (this.tryStack.length) {
              const previousTryState = this.tryStack.pop()!;
              if (!previousTryState.label) {
                this.verbose && console.log('Exception: try without catch');
                continue;
              }
              this.verbose && console.log('Exception: catch block found');
              this.currentLabel = previousTryState.label;
              this.pc = 0;
              catchBlockDefined = true;
              break;
            }
            if (catchBlockDefined) {
              break;
            }
            if (this.hasFrame()) {
              this.verbose && console.log('Exception: pop stack');
              this.popFrame();
              this.popContext();
              this.pc++;
            } else {
              this.verbose && console.log('Exception: uncaught');
              return {
                kind: 'ERROR',
                error:
                  err instanceof EvaluationError
                    ? err
                    : new EvaluationError(
                        'Uncaught exception',
                        this.current()[this.pc],
                        err
                      ),
              };
            }
          }
        }
      }
      if (this.frameStack.length) {
        const lastValue = this.stack.pop();
        this.popFrame();
        this.stack.push(lastValue);
        this.popContext();
        this.pc++;
      } else {
        break;
      }
    }
    return {
      kind: 'FINISHED',
      result: this.keepUpmostStack ? this.stack : this.stack.pop(),
    };
  }

  private runOpcode(node: IRNode): VmExit | undefined {
    switch (node.kind) {
      case 'Literal':
        this.stack.push(node.value);
        this.pc++;
        break;
      case 'Attribute': {
        const value = this.popObject();
        this.stack.push(value[node.name]);
        this.pc++;
        break;
      }
      case 'Call': {
        const closure = this.popClosure(); // TODO: Handle native functions
        const namedArgs = this.popObject();
        const positionalArgs = this.popArray();

        if ('ctx' in closure) {
          const [
            namedArguments /* positionalArguments */,
          ] = resolveArgumentNames(
            this.ctx.program![closure.name],
            namedArgs,
            positionalArgs
          );
          const childContext = closure.ctx
            .createChild(namedArguments, false)
            .createChildWithProvideParent({}, this.ctx);
          this.pushFrame(closure.name);
          this.pushContext(childContext);
        } else {
          if (closure.call) {
            const [namedArguments, positionalArguments] = resolveArgumentNames(
              closure,
              namedArgs,
              positionalArgs
            );
            const result = closure.call(
              this.ctx,
              namedArguments,
              positionalArguments
            );
            this.stack.push(result);
            this.pc++;
          } else if (closure.callAsync) {
            const [namedArguments, positionalArguments] = resolveArgumentNames(
              closure,
              namedArgs,
              positionalArgs
            );
            return {
              kind: 'PENDING',
              promise: closure
                .callAsync(this.ctx, namedArguments, positionalArguments)
                .then(result => {
                  this.stack.push(result);
                }),
              state: {
                func: this.currentFunction,
                label: this.currentLabel,
                pc: this.pc + 1,
              },
            };
          } else {
            throw new Error('Native function must implement call or callAsync');
          }
        }
        break;
      }
      case 'CtxRender': {
        this.ctx.forceRefresh();
        this.pc++;
        break;
      }
      case 'DeclareLocal': {
        let initialValue: unknown;
        if (node.hasInitialValue) {
          initialValue = this.stack.pop();
        }
        this.ctx.declareLocal(node.name, {
          mutable: node.mutable,
          initialValue: initialValue,
        });
        this.stack.push(undefined);
        this.pc++;
        break;
      }
      case 'FunctionRef': {
        this.stack.push({ name: node.name, ctx: this.ctx });
        this.pc++;
        break;
      }
      case 'GetProvided': {
        const providedKey = this.stack.pop();
        this.stack.push(this.ctx.getProvidedValue(providedKey));
        this.pc++;
        break;
      }
      case 'Import': {
        return {
          kind: 'PENDING',
          promise: resolveModule(this.ctx, node.path).then(module => {
            this.stack.push(module);
          }),
          state: {
            func: this.currentFunction,
            label: this.currentLabel,
            pc: this.pc + 1,
          },
        };
      }
      case 'Index': {
        const value = this.popArrayOrObject();
        if (Array.isArray(value)) {
          const index = this.popNumber();
          this.stack.push(value[index]);
        } else {
          const index = this.popString();
          this.stack.push(value[index]);
        }
        this.pc++;
        break;
      }
      case 'Intrinsic': {
        this.handleIntrinsic(this.ctx, node);
        this.pc++;
        break;
      }
      case 'Jump': {
        this.currentLabel = node.label;
        this.pc = 0;
        break;
      }
      case 'JumpTrue': {
        const value = this.stack.pop();
        if (value) {
          this.currentLabel = node.label;
          this.pc = 0;
        } else {
          this.pc++;
        }
        break;
      }
      case 'Local': {
        this.stack.push(this.ctx.getLocal(node.name));
        this.pc++;
        break;
      }
      case 'MakeArray': {
        const length = this.popNumber();
        const array = [];
        for (let i = 0; i < length; i++) {
          array.unshift(this.stack.pop());
        }
        this.stack.push(array);
        this.pc++;
        break;
      }
      case 'MakeObject': {
        const length = this.popNumber();
        const intermediateResult: [string, unknown][] = [];
        for (let i = 0; i < length; i++) {
          const value = this.stack.pop();
          const key = this.popString();
          intermediateResult.push([key, value]);
        }
        // FIXME: Keys are reversed only for tests
        this.stack.push(Object.fromEntries(intermediateResult.reverse()));
        this.pc++;
        break;
      }
      case 'Pop': {
        if (
          !(
            this.keepUpmostStack &&
            this.frameStack.length == 0 &&
            this.ctxStack.length == 0
          )
        ) {
          this.stack.pop();
        }
        this.pc++;
        break;
      }
      case 'Provide': {
        const length = this.popNumber();
        let newCtx = this.ctx;
        for (let i = 0; i < length; i++) {
          const value = this.stack.pop();
          const key = this.stack.pop();
          newCtx = newCtx.createChildWithProvider(key, value);
          this.pushContext(newCtx);
        }
        this.pc++;
        break;
      }
      case 'ScopeEnter': {
        // First scope inside a widget is the initial function call, do not create a new context for it
        if (this.isInsideWidget && !this.widgetStateFlagConsumed) {
          this.widgetStateFlagConsumed = true;
        } else {
          const newCtx = this.ctx.createChild({});
          this.pushContext(newCtx);
        }
        this.pc++;
        break;
      }
      case 'ScopeLeave': {
        if (this.ctxStack.length === 0 && this.widgetStateFlagConsumed) {
          this.widgetStateFlagConsumed = false;
        } else {
          this.popContext();
        }
        this.pc++;
        break;
      }
      case 'SetAttribute': {
        const value = this.stack.pop();
        const target = this.popObject();
        target[node.name] = value;
        this.stack.push(value);
        if (node.forceRender) {
          this.ctx.forceRefresh();
        }
        this.pc++;
        break;
      }
      case 'SetIndex': {
        const value = this.stack.pop();
        const target = this.popObject();
        const index = this.popNumber();
        target[index] = value;
        this.stack.push(value);
        if (node.forceRender) {
          this.ctx.forceRefresh();
        }
        this.pc++;
        break;
      }
      case 'SetLocal': {
        const value = this.stack.pop();
        this.ctx.setLocal(node.name, value);
        this.stack.push(value);
        this.pc++;
        break;
      }
      case 'Try': {
        this.tryStack.push({
          label: node.catchLabel,
        });
        this.pc++;
        break;
      }
      case 'TryPop': {
        this.tryStack.pop();
        this.pc++;
        break;
      }
      case 'Kinded': {
        const props = this.popObject();
        const children = this.popArray();
        const kind = this.stack.pop();
        this.stack.push({
          ctx: this.ctx,
          kind,
          children,
          props,
        });
        this.pc++;
        break;
      }
      default: {
        const nodeNever: never = node; // Error if missing kind in switch
        throw new Error(
          'Failed to compile node with kind: ' + (nodeNever as AnyForNever).kind
        );
      }
    }
    return;
  }

  private pushContext(ctx: RuntimeContext) {
    this.ctxStack.push(this.ctx);
    this.ctx = ctx;
  }

  private popContext() {
    const oldCtx = this.ctxStack.pop();
    if (!oldCtx) {
      throw new Error('Context stack underflow');
    }
    this.ctx = oldCtx;
  }

  private handleIntrinsic(
    ctx: RuntimeContext,
    node: IRNodeByKind['Intrinsic']
  ) {
    switch (node.operation) {
      case 'INTRINSIC_ADD': {
        const operand2 = this.popStringOrNumber();
        if (typeof operand2 === 'string') {
          const operand1 = this.popString();
          this.stack.push(operand1 + operand2);
        } else {
          const operand1 = this.popNumber();
          this.stack.push(operand1 + operand2);
        }
        break;
      }
      case 'INTRINSIC_MULTIPLY': {
        const operand2 = this.popNumber();
        const operand1 = this.popNumber();
        this.stack.push(operand1 * operand2);
        break;
      }
      case 'INTRINSIC_DIVIDE': {
        const operand2 = this.popNumber();
        const operand1 = this.popNumber();
        this.stack.push(operand1 / operand2);
        break;
      }
      case 'INTRINSIC_MODULO': {
        const operand2 = this.popNumber();
        const operand1 = this.popNumber();
        this.stack.push(operand1 % operand2);
        break;
      }
      case 'INTRINSIC_SUBSTRACT': {
        const operand2 = this.popNumber();
        const operand1 = this.popNumber();
        this.stack.push(operand1 - operand2);
        break;
      }
      case 'INTRINSIC_LESSER': {
        const operand2 = this.popNumber();
        const operand1 = this.popNumber();
        this.stack.push(operand1 < operand2);
        break;
      }
      case 'INTRINSIC_LESSER_OR_EQUAL': {
        const operand2 = this.popNumber();
        const operand1 = this.popNumber();
        this.stack.push(operand1 <= operand2);
        break;
      }
      case 'INTRINSIC_GREATER': {
        const operand2 = this.popNumber();
        const operand1 = this.popNumber();
        this.stack.push(operand1 > operand2);
        break;
      }
      case 'INTRINSIC_GREATER_OR_EQUAL': {
        const operand2 = this.popNumber();
        const operand1 = this.popNumber();
        this.stack.push(operand1 >= operand2);
        break;
      }
      case 'INTRINSIC_EQUAL': {
        const operand2 = this.stack.pop();
        const operand1 = this.stack.pop();
        this.stack.push(operand1 == operand2);
        break;
      }
      case 'INTRINSIC_NOT_EQUAL': {
        const operand2 = this.stack.pop();
        const operand1 = this.stack.pop();
        this.stack.push(operand1 != operand2);
        break;
      }
      case 'INTRINSIC_EQUAL_STRICT': {
        const operand2 = this.stack.pop();
        const operand1 = this.stack.pop();
        this.stack.push(operand1 === operand2);
        break;
      }
      case 'INTRINSIC_NOT_EQUAL_STRICT': {
        const operand2 = this.stack.pop();
        const operand1 = this.stack.pop();
        this.stack.push(operand1 !== operand2);
        break;
      }
      case 'INTRINSIC_NEGATE': {
        const operand = this.popNumber();
        this.stack.push(-operand);
        break;
      }
      case 'INTRINSIC_POSITIF': {
        const operand = this.popNumber();
        this.stack.push(+operand);
        break;
      }
      case 'INTRINSIC_NOT': {
        const operand = this.stack.pop();
        this.stack.push(!operand);
        break;
      }
      case 'INTRINSIC_FORCE_RENDER': {
        ctx.forceRefresh();
        break;
      }
    }
  }

  private popArrayOrObject(): unknown[] | Record<string, unknown> {
    const value = this.stack.pop();
    if (Array.isArray(value) || (typeof value == 'object' && value != null))
      return value as TODO_ANY;
    throw new Error('Expected array or object');
  }

  private popArray(): unknown[] {
    const value = this.stack.pop();
    if (Array.isArray(value)) return value;
    throw new Error('Expected array');
  }

  private popObject(): Record<string, unknown> {
    const value = this.stack.pop();
    if (typeof value == 'object' && value != null) return value as TODO_ANY;
    throw new Error('Expected object');
  }

  private popNumber(): number {
    const value = this.stack.pop();
    if (typeof value === 'number') return value;
    throw new Error('Expected number');
  }

  private popString(): string {
    const value = this.stack.pop();
    if (typeof value === 'string') return value;
    throw new Error('Expected string');
  }

  private popStringOrNumber(): string | number {
    const value = this.stack.pop();
    if (typeof value === 'string' || typeof value === 'number') return value;
    throw new Error('Expected string or number');
  }

  private popClosure(): { name: string } & (
    | { ctx: RuntimeContext }
    | {
        parameters: { name: string }[];
        parametersByName: Record<string, { name: string }>;
        call?: (
          ctx: RuntimeContext,
          kwargs: Record<string, unknown>,
          args: unknown[]
        ) => unknown;
        callAsync?: (
          ctx: RuntimeContext,
          kwargs: Record<string, unknown>,
          args: unknown[]
        ) => Promise<unknown>;
      }
  ) {
    const value = this.stack.pop();
    if (typeof value !== 'object' || value == null || !('name' in value)) {
      throw new Error('Expected closure');
    }
    if ('ctx' in value) {
      const { name, ctx } = value as TODO_ANY; // Type this
      if (typeof name === 'string' && ctx instanceof RuntimeContext) {
        return { name, ctx };
      }
    } else if ('parameters' in value && 'parametersByName' in value) {
      // TODO: Type this, maybe add a tag type to native functions
      return value as TODO_ANY;
    }
    throw new Error('Expected closure');
  }
}

function resolveArgumentNames(
  func: { parameters: ParameterDef[] },
  providedNamedArguments: Record<string, unknown>,
  providedArguments: unknown[]
): [Record<string, unknown>, unknown[]] {
  const args = providedArguments.slice();
  const namedArgs = Object.fromEntries(
    func.parameters
      .map(({ name }) => {
        return [name, providedNamedArguments[name]];
      })
      .filter(([, value]) => value !== undefined)
  );
  func.parameters
    .filter(({ onlyNamed }) => !onlyNamed)
    .forEach(({ name }) => {
      if (!(name in namedArgs)) {
        namedArgs[name] = args.length ? args.shift() : null;
      }
    });
  return [namedArgs, args];
}

async function resolveModule(
  ctx: RuntimeContext,
  path: string
): Promise<unknown> {
  if (!ctx.program) {
    return;
  }
  const normalizedPath = await ctx.getSourceFetcher().normalizePath(path);
  if (ctx.moduleCache.has(normalizedPath)) {
    return ctx.moduleCache.get(normalizedPath);
  }

  const {
    source: moduleSource,
    path: modulePath,
  } = await ctx.getSourceFetcher().fetch(path);
  const ast = lower(parse(moduleSource, modulePath));
  const module = compile(ast, path);
  Object.entries(module).forEach(([name, func]) => {
    // TODO: Remove this check with TypeScript 5.4
    if (!ctx.program) {
      throw new Error('Unreachable code');
    }
    ctx.program[name] = func;
  });
  const moduleContext = ctx.createWithSameRootLocals().createChild({});
  moduleContext.program = ctx.program;

  const vm = new VM(moduleContext);
  const moduleReturnValue = await runAsync(vm, path + 'main');
  console.log('RETURN', moduleReturnValue);
  ctx.moduleCache.set(normalizedPath, moduleReturnValue);
  return moduleReturnValue;
}

// TODO: find better API
export async function runAsync(
  vm: VM,
  functionName = 'main',
  kwargs?: Record<string, unknown>,
  args?: unknown[]
) {
  let result: VmExit;
  if (kwargs && args) {
    result = vm.runFunctionWithArgs(functionName, kwargs, args);
  } else {
    result = vm.runFunction(functionName);
  }
  while (true) {
    if (result.kind == 'FINISHED') {
      return result.result;
    }
    if (result.kind == 'ERROR') {
      throw result.error;
    }
    await result.promise;
    result = vm.resume(result.state);
  }
}

// TODO: find better API
export function run(
  vm: VM,
  functionName = 'main',
  kwargs?: Record<string, unknown>,
  args?: unknown[]
) {
  let result: VmExit;
  if (kwargs && args) {
    result = vm.runFunctionWithArgs(functionName, kwargs, args);
  } else {
    result = vm.runFunction(functionName);
  }
  if (result.kind == 'ERROR') {
    throw result.error;
  }
  if (result.kind == 'PENDING') {
    throw new Error('Unexpected async result');
  }
  return result.result;
}
