import { parse } from 'tal-parser';
import { RuntimeContext } from './RuntimeContext';
import { AnyForNever, Closure, ParameterDef, TODO_ANY } from './core';
import { Opcode, OpcodeByKind } from './opcodes';
import { compile } from './compiler';
import { lower } from './lowerer';

export class EvaluationError extends Error {
  constructor(
    public readonly detailedMessage: string,
    public readonly node: Opcode,
    public readonly cause: Error
  ) {
    super('Evaluation error');
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
  catchLabel?: string;
  endTryLabel: string;
  ctxStackLength: number;
  stackLength: number;
};

export type VmExit = VmExitFinished | VmExitPending | VmExitError;

type FrameState = {
  currentFunction: string;
  currentLabel: string;
  pc: number;
  stack: unknown[];
  tryStack: TryState[];
  ctx: RuntimeContext;
  ctxStack: RuntimeContext[];
  keepUpmostStack: boolean;
};

export class VM {
  // TODO: Find a better way to initialize a VM only for sync evaluation
  onlySync = false;

  // Frame data
  private currentFunctionName: string;
  private currentLabelName: string;
  private stack: unknown[] = [];
  private pc: number = 0;
  private tryStack: TryState[] = [];
  private ctx: RuntimeContext;
  private ctxStack: RuntimeContext[] = [];
  // TODO: Find a better way to handle test runner and inside widget
  keepUpmostStack = false;

  private frameStack: FrameState[] = [];

  private pushFrame(functionName: string, ctx: RuntimeContext) {
    this.frameStack.push({
      currentFunction: this.currentFunctionName,
      currentLabel: this.currentLabelName,
      pc: this.pc,
      stack: this.stack,
      tryStack: this.tryStack,
      ctxStack: this.ctxStack,
      ctx: this.ctx,
      keepUpmostStack: this.keepUpmostStack,
    });
    this.resetFrameData(functionName);
    this.ctx = ctx;
    this.ctxStack = [this.ctx];
  }

  private jumpToLabel(name: string) {
    this.currentLabelName = name;
    this.pc = 0;
  }

  private resetFrameData(functionName: string) {
    this.currentFunctionName = functionName;
    this.currentLabelName = 'entry';
    this.pc = 0;
    this.stack = [];
    this.tryStack = [];
    this.ctxStack = [];
    this.keepUpmostStack = false;
  }

  private hasFrame(): boolean {
    return !!this.frameStack.length;
  }

  private popFrame() {
    const topFrame = this.frameStack.pop();
    if (topFrame == undefined) {
      throw new Error('Stack from underflow');
    }
    this.currentFunctionName = topFrame.currentFunction;
    this.currentLabelName = topFrame.currentLabel;
    this.pc = topFrame.pc;
    this.stack = topFrame.stack;
    this.tryStack = topFrame.tryStack;
    this.ctxStack = topFrame.ctxStack;
    this.ctx = topFrame.ctx;
    this.keepUpmostStack = topFrame.keepUpmostStack;
  }

  constructor(ctx: RuntimeContext, private verbose = false) {
    this.ctx = ctx;
    this.ctxStack = [this.ctx];
    this.currentFunctionName = 'main';
    this.currentLabelName = 'entry';
  }

  private currentFunction() {
    const currentFunction = this.ctx.program![this.currentFunctionName];
    if (!currentFunction) {
      throw new Error('Unknown function: ' + this.currentFunctionName);
    }
    return currentFunction;
  }

  private currentLabel() {
    const currentLabel = this.currentFunction().body[this.currentLabelName];
    if (!currentLabel) {
      throw new Error(
        'Unknown label: ' +
          this.currentLabelName +
          ' in function: ' +
          this.currentFunctionName
      );
    }
    return currentLabel;
  }

  private currentOpcode(): Opcode {
    return this.currentLabel()[this.pc];
  }

  runMain(): VmExit {
    this.pc = 0;
    return this.run();
  }

  runFunction(functionName: string): VmExit {
    this.currentFunctionName = functionName;
    return this.run();
  }

  runFunctionWithArgs(
    functionName: string,
    namedArgs: Record<string, unknown>,
    positionalArgs: unknown[]
  ): VmExit {
    const closure: Closure = { ctx: this.ctx, name: functionName };
    this.currentFunctionName = functionName;
    const [namedArguments /* positionalArguments */] = resolveArgumentNames(
      this.ctx.program![closure.name],
      namedArgs,
      positionalArgs
    );
    this.ctx = closure.ctx.createChild(namedArguments, false).createChild({});
    this.ctxStack.push(this.ctx);
    return this.run();
  }

  resume(state: VmPendingState, result: unknown): VmExit {
    this.restoreVmPendingState(state);
    this.stack.push(result);
    return this.run();
  }

  resumeError(state: VmPendingState, err: unknown): VmExit {
    this.restoreVmPendingState(state);

    const errorResult = this.handleError(err);
    if (errorResult == null) {
      return this.run();
    }
    return errorResult;
  }

  private restoreVmPendingState(state: VmPendingState) {
    this.currentFunctionName = state.func;
    this.currentLabelName = state.label;
    this.pc = state.pc;
  }

  private run(): VmExit {
    while (true) {
      while (this.pc < this.currentLabel().length) {
        try {
          if (this.verbose) {
            const { location, ...opcode } = this.currentOpcode();
            console.log(opcode);
          }
          const exit = this.runOpcode(this.currentOpcode());
          this.verbose && console.log(this.stack);
          if (exit) {
            return exit;
          }
        } catch (err) {
          const errorResult = this.handleError(err);
          if (errorResult == null) {
            continue;
          }
          return errorResult;
        }
      }
      if (this.frameStack.length) {
        const lastValue = this.stack.pop();
        this.popFrame();
        this.stack.push(lastValue);
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

  private latestError: unknown;

  private handleError(err: unknown): VmExit | null {
    const currentOpcode = this.currentOpcode();

    while (true) {
      // Get top most try state and jump to its catch or end label if present
      const previousTryState = this.tryStack.pop();
      if (previousTryState) {
        if (previousTryState.catchLabel) {
          this.latestError = err;
        }
        this.jumpToLabel(
          previousTryState.catchLabel ?? previousTryState.endTryLabel
        );
        this.ctxStack.length = previousTryState.ctxStackLength;
        this.stack.length = previousTryState.stackLength;
        return null;
      }

      // No try state found on current frame, pop current frame
      // If this is the top most frame, return a result with an ERROR kind
      if (this.hasFrame()) {
        this.verbose && console.log('Exception: pop stack');
        this.popFrame();
        this.pc++;
      } else {
        return {
          kind: 'ERROR',
          error:
            err instanceof EvaluationError
              ? err
              : new EvaluationError(
                  typeof err == 'object' && err ? (err as any).message : '',
                  currentOpcode,
                  err instanceof Error ? err : new Error(String(err))
                ),
        };
      }
    }
  }

  private runOpcode(node: Opcode): VmExit | undefined {
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
            .createChild({});
          this.pushFrame(closure.name, childContext);
        } else {
          if (
            closure.call &&
            ((this.onlySync && closure.callAsync) || !closure.callAsync)
          ) {
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
              promise: closure.callAsync(
                this.ctx,
                namedArguments,
                positionalArguments
              ),
              state: {
                func: this.currentFunctionName,
                label: this.currentLabelName,
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
        this.stack.push(null);
        this.pc++;
        break;
      }
      case 'FunctionRef': {
        this.stack.push({ name: node.name, ctx: this.ctx });
        this.pc++;
        break;
      }
      case 'Import': {
        return {
          kind: 'PENDING',
          promise: resolveModule(this.ctx, node.path),
          state: {
            func: this.currentFunctionName,
            label: this.currentLabelName,
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
        this.jumpToLabel(node.label);
        break;
      }
      case 'JumpTrue': {
        const value = this.stack.pop();
        if (value) {
          this.jumpToLabel(node.label);
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
      case 'MakeArrayForBlock': {
        if (this.keepUpmostStack) {
          const array = [];
          for (let i = 0; i < node.count; i++) {
            array.unshift(this.stack.pop());
          }
          this.stack.push(array);
        }
        this.pc++;
        break;
      }
      case 'MakeRecord': {
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
        if (!node.inBlock || !this.keepUpmostStack) {
          this.stack.pop();
        }
        this.pc++;
        break;
      }
      case 'ScopeEnter': {
        const newCtx = this.ctx.createChild({});
        this.pushContext(newCtx);
        this.pc++;
        break;
      }
      case 'ScopeLeave': {
        this.popContext();
        if (node.inBlock && this.keepUpmostStack) {
          const array = [];
          for (let i = 0; i < node.count; i++) {
            array.unshift(this.stack.pop());
          }
          this.stack.push(array);
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
        const index = this.popStringOrNumber();
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
          catchLabel: node.catchLabel,
          endTryLabel: node.endTryLabel,
          ctxStackLength: this.ctxStack.length,
          stackLength: this.stack.length,
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
      case 'PushLatestError': {
        this.stack.push(this.latestError);
        this.latestError = null;
        this.pc++;
        break;
      }
      default: {
        const _: never = node;
        _;
        throw new Error('Unreachable case: ' + (node as AnyForNever).kind);
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
    node: OpcodeByKind['Intrinsic']
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
  // TODO: Throw if only sync
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

  if (!moduleSource) {
    throw new Error('Source not found: ' + path);
  }

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

  const moduleReturnValue = await runAsync(moduleContext, path + 'main');
  ctx.moduleCache.set(normalizedPath, moduleReturnValue);
  return moduleReturnValue;
}

// TODO: find better API
export async function runAsync(
  ctx: RuntimeContext,
  functionName = 'main',
  kwargs?: Record<string, unknown>,
  args?: unknown[]
) {
  const vm = new VM(ctx);
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
    const resultPending = result;
    try {
      result = vm.resume(result.state, await result.promise);
    } catch (err) {
      result = vm.resumeError(resultPending.state, err);
    }
  }
}

// TODO: find better API
export function run(
  ctx: RuntimeContext,
  functionName = 'main',
  kwargs?: Record<string, unknown>,
  args?: unknown[]
) {
  const vm = new VM(ctx);
  vm.onlySync = true;
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

// TODO: find better API
export function runForAllStack(
  ctx: RuntimeContext,
  functionName = 'main',
  kwargs?: Record<string, unknown>,
  args?: unknown[]
) {
  const vm = new VM(ctx);
  vm.onlySync = true;
  vm.keepUpmostStack = true;
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
