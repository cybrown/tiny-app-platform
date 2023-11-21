import { RuntimeContext } from './RuntimeContext';
import { Closure, IRNode, NativeFunctionBinding, ParameterDef, Program } from './core';

export function run(
  ctx: RuntimeContext,
  program: Program,
  entryPoint: string,
  returnAllBlockValues = false
): unknown {
  const currentFunction = program[entryPoint];
  if (currentFunction.body.kind == 'BLOCK' && returnAllBlockValues) {
    const node = currentFunction.body;
    let stack: unknown[] = [];
    if ('children' in node) {
      stack = node.children.map(n => {
        try {
          return runNode(ctx, program, n);
        } catch (err) {
          return err;
        }
      });
    }
    return stack;
  }
  return runNode(ctx, program, currentFunction.body);
}

export function runCall(
  closure: Closure,
  program: Program,
  args: unknown[],
  kwargs: Record<string, unknown>
) {
  const functionName = closure.name;
  const func = program[functionName];
  const [namedArguments /*positionalArguments*/] = resolveArgumentNames(
    func,
    kwargs,
    args
  );
  const childContext = closure.ctx
    .createChild(namedArguments, false)
    .createChild({});
  return runNode(childContext, program, func.body);
}

export function runNode(
  ctx: RuntimeContext,
  program: Program,
  node: IRNode
): unknown {
  try {
    let stack: unknown[] = [];
    if (
      !['CONDITION', 'TRY', 'KINDED'].includes(node.kind) &&
      'children' in node
    ) {
      const ctxToUse = node.kind == 'BLOCK' ? ctx.createChild({}) : ctx;
      stack = node.children.map(n => runNode(ctxToUse, program, n));
    }
    switch (node.kind) {
      case 'LITERAL':
        return (node as IRNode<'LITERAL'>).value;
      case 'LOCAL':
        return ctx.getLocal((node as IRNode<'LOCAL'>).name);
      case 'MAKE_ARRAY':
        return stack;
      case 'MAKE_OBJECT': {
        const result: Record<string, unknown> = {};
        for (let i = 0; i < stack.length; i += 2) {
          result[stack[i] as string] = stack[i + 1];
        }
        return result;
      }
      case 'CALL': {
        const [closure, args, kwargs] = stack as [
          Closure,
          unknown[],
          Record<string, unknown>
        ];
        const functionName = closure.name;
        if (program[functionName]) {
          return runCall(closure, program, args, kwargs);
        } else {
          const nativeFuncValue = ctx.getLocal(
            functionName
          ) as NativeFunctionBinding;
          const [namedArguments, positionalArguments] = resolveArgumentNames(
            nativeFuncValue,
            kwargs,
            args
          );
          if (!nativeFuncValue.call) {
            throw new Error('Function not allowed in synchronous context');
          }
          return nativeFuncValue.call(ctx, namedArguments, positionalArguments);
        }
      }
      case 'INTRINSIC': {
        const n = node as IRNode<'INTRINSIC'>;
        return computeIntrinsic(stack, n);
      }
      case 'FUNCTION_REF': {
        const n = node as IRNode<'FUNCTION_REF'>;
        return {
          name: n.name,
          ctx: ctx,
        };
      }
      case 'DECLARE_LOCAL': {
        const n = node as IRNode<'DECLARE_LOCAL'>;
        ctx.declareLocal(n.name, {
          mutable: n.mutable,
          initialValue: stack[0],
        });
        return;
      }
      case 'BLOCK':
        return stack[stack.length - 1];
      case 'INDEX':
        return (stack[1] as any[])[stack[0] as any];
      case 'ATTRIBUTE': {
        const n = node as IRNode<'ATTRIBUTE'>;
        return (stack[0] as any)[n.name];
      }
      case 'SET_LOCAL': {
        const n = node as IRNode<'SET_LOCAL'>;
        ctx.setLocal(n.name as any, stack[0]);
        return stack[0];
      }
      case 'SET_INDEX': {
        const n = node as IRNode<'SET_INDEX'>;
        (stack[1] as any)[stack[0] as any] = stack[2];
        if (n.forceRender) {
          ctx.forceRefresh();
        }
        return stack[2];
      }
      case 'SET_ATTRIBUTE': {
        const n = node as IRNode<'SET_ATTRIBUTE'>;
        (stack[0] as any)[n.name] = stack[1];
        if (n.forceRender) {
          ctx.forceRefresh();
        }
        return stack[1];
      }
      case 'CONDITION': {
        if ('children' in node) {
          const conditionResult = runNode(ctx, program, node.children[0]);
          if (conditionResult) {
            return runNode(ctx, program, node.children[1]);
          } else if (node.children.length > 2) {
            return runNode(ctx, program, node.children[2]);
          } else {
            return null;
          }
        }
        throw new Error('Unreachable');
      }
      case 'TRY': {
        if ('children' in node) {
          try {
            return runNode(ctx, program, node.children[0]);
          } catch (error) {
            if (node.children.length <= 1) {
              return null;
            }
            return runNode(
              ctx.createChild({ error }, false),
              program,
              node.children[1]
            );
          }
        }
        throw new Error('Unreachable');
      }
      case 'KINDED': {
        const n = node as IRNode<'KINDED'>;
        if (!('children' in n)) {
          return null;
        }
        const kindIr = n.children[0];
        const childrenIr = n.children[1];
        const propsIr = n.children[2];
        return {
          ctx,
          kind: kindIr,
          children: childrenIr,
          props: propsIr,
        };
      }
      case 'CTX_RENDER':
        ctx.forceRefresh();
        return;
      default:
        throw new Error('Unknown node kind: ' + node.kind);
    }
  } catch (error) {
    if (error instanceof EvaluationError) {
      throw error;
    }
    throw new EvaluationError((error as any)?.message, node, error);
  }
}

export async function runAsync(
  ctx: RuntimeContext,
  program: Program,
  entryPoint: string,
  returnAllBlockValues = false
): Promise<unknown> {
  const currentFunction = program[entryPoint];
  if (currentFunction.body.kind == 'BLOCK' && returnAllBlockValues) {
    const node = currentFunction.body;
    let stack: unknown[] = [];
    if ('children' in node) {
      for (let n of node.children) {
        try {
          stack.push(await runNodeAsync(ctx, program, n));
        } catch (err) {
          stack.push(err);
        }
      }
    }
    return stack;
  }
  return await runNodeAsync(ctx, program, currentFunction.body);
}

export async function runCallAsync(
  closure: Closure,
  program: Program,
  args: unknown[],
  kwargs: Record<string, unknown>
) {
  const func = program[closure.name];
  const [namedArguments /* positionalArguments */] = resolveArgumentNames(
    func,
    kwargs,
    args
  );
  const childContext = closure.ctx
    .createChild(namedArguments, false)
    .createChild({});
  return await runNodeAsync(childContext, program, func.body);
}

export async function runNodeAsync(
  ctx: RuntimeContext,
  program: Program,
  node: IRNode
): Promise<unknown> {
  try {
    let stack: unknown[] = [];
    if (
      !['CONDITION', 'TRY', 'KINDED'].includes(node.kind) &&
      'children' in node
    ) {
      const ctxToUse = node.kind == 'BLOCK' ? ctx.createChild({}) : ctx;
      for (let n of node.children) {
        stack.push(await runNodeAsync(ctxToUse, program, n));
      }
    }
    switch (node.kind) {
      case 'LITERAL':
        return (node as IRNode<'LITERAL'>).value;
      case 'LOCAL':
        return ctx.getLocal((node as IRNode<'LOCAL'>).name);
      case 'MAKE_ARRAY':
        return stack;
      case 'MAKE_OBJECT': {
        const result: Record<string, unknown> = {};
        for (let i = 0; i < stack.length; i += 2) {
          result[stack[i] as string] = stack[i + 1];
        }
        return result;
      }
      case 'CALL': {
        const [
          closure,
          providedPositionalArguments,
          providedNamedArguments,
        ] = stack as [any, unknown[], Record<string, unknown>];
        const functionName = closure.name;
        if (program[functionName]) {
          return runCallAsync(
            closure,
            program,
            providedPositionalArguments,
            providedNamedArguments
          );
        } else {
          const func = ctx.getLocal(functionName) as NativeFunctionBinding;
          const [namedArguments, positionalArguments] = resolveArgumentNames(
            func,
            providedNamedArguments,
            providedPositionalArguments
          );
          return func.callAsync
            ? await func.callAsync(ctx, namedArguments, positionalArguments)
            : func.call(ctx, namedArguments, positionalArguments);
        }
      }
      case 'INTRINSIC': {
        const n = node as IRNode<'INTRINSIC'>;
        return computeIntrinsic(stack, n);
      }
      case 'FUNCTION_REF': {
        const n = node as IRNode<'FUNCTION_REF'>;
        return {
          name: n.name,
          ctx: ctx,
        };
      }
      case 'DECLARE_LOCAL': {
        const n = node as IRNode<'DECLARE_LOCAL'>;
        ctx.declareLocal(n.name, {
          mutable: n.mutable,
          initialValue: stack[0],
        });
        return;
      }
      case 'BLOCK':
        return stack[stack.length - 1];
      case 'INDEX':
        return (stack[1] as any[])[stack[0] as any];
      case 'ATTRIBUTE': {
        const n = node as IRNode<'ATTRIBUTE'>;
        return (stack[0] as any)[n.name];
      }
      case 'SET_LOCAL': {
        const n = node as IRNode<'SET_LOCAL'>;
        ctx.setLocal(n.name as any, stack[0]);
        return stack[0];
      }
      case 'SET_INDEX': {
        const n = node as IRNode<'SET_INDEX'>;
        (stack[1] as any)[stack[0] as any] = stack[2];
        if (n.forceRender) {
          ctx.forceRefresh();
        }
        return stack[2];
      }
      case 'SET_ATTRIBUTE': {
        const n = node as IRNode<'SET_ATTRIBUTE'>;
        (stack[0] as any)[n.name] = stack[1];
        if (n.forceRender) {
          ctx.forceRefresh();
        }
        return stack[1];
      }
      case 'CONDITION': {
        if ('children' in node) {
          const conditionResult = await runNodeAsync(
            ctx,
            program,
            node.children[0]
          );
          if (conditionResult) {
            return await runNodeAsync(ctx, program, node.children[1]);
          } else if (node.children.length > 2) {
            return await runNodeAsync(ctx, program, node.children[2]);
          } else {
            return null;
          }
        }
        throw new Error('Unreachable');
      }
      case 'TRY': {
        if ('children' in node) {
          try {
            return await runNodeAsync(ctx, program, node.children[0]);
          } catch (error) {
            if (node.children.length <= 1) {
              return null;
            }
            return await runNodeAsync(
              ctx.createChild({ error }, false),
              program,
              node.children[1]
            );
          }
        }
        throw new Error('Unreachable');
      }
      case 'KINDED': {
        const n = node as IRNode<'KINDED'>;
        if (!('children' in n)) {
          return null;
        }
        const kindIr = n.children[0];
        const childrenIr = n.children[1];
        const propsIr = n.children[2];
        return {
          ctx,
          kind: kindIr,
          children: childrenIr,
          props: propsIr,
        };
      }
      case 'CTX_RENDER':
        ctx.forceRefresh();
        return;
      default:
        throw new Error('Unknown node kind: ' + node.kind);
    }
  } catch (error) {
    if (error instanceof EvaluationError) {
      throw error;
    }
    throw new EvaluationError((error as any)?.message, node, error);
  }
}

export class EvaluationError extends Error {
  constructor(
    message: string,
    public readonly node: IRNode,
    public readonly cause: unknown
  ) {
    super(message);
  }
}

function computeIntrinsic(stack: unknown[], n: IRNode<'INTRINSIC'>) {
  switch (n.operation) {
    case 'INTRINSIC_ADD':
      return (stack[0] as any) + (stack[1] as any);
    case 'INTRINSIC_SUBSTRACT':
      return (stack[0] as any) - (stack[1] as any);
    case 'INTRINSIC_MULTIPLY':
      return (stack[0] as any) * (stack[1] as any);
    case 'INTRINSIC_DIVIDE':
      return (stack[0] as any) / (stack[1] as any);
    case 'INTRINSIC_MODULO':
      return (stack[0] as any) % (stack[1] as any);
    case 'INTRINSIC_LESSER':
      return (stack[0] as any) < (stack[1] as any);
    case 'INTRINSIC_LESSER_OR_EQUAL':
      return (stack[0] as any) <= (stack[1] as any);
    case 'INTRINSIC_GREATER':
      return (stack[0] as any) > (stack[1] as any);
    case 'INTRINSIC_GREATER_OR_EQUAL':
      return (stack[0] as any) >= (stack[1] as any);
    case 'INTRINSIC_EQUAL':
      return (stack[0] as any) == (stack[1] as any);
    case 'INTRINSIC_NOT_EQUAL':
      return (stack[0] as any) != (stack[1] as any);
    case 'INTRINSIC_EQUAL_STRICT':
      return (stack[0] as any) === (stack[1] as any);
    case 'INTRINSIC_NOT_EQUAL_STRICT':
      return (stack[0] as any) !== (stack[1] as any);
    case 'INTRINSIC_EQUAL':
      return (stack[0] as any) == (stack[1] as any);
    case 'INTRINSIC_NOT_EQUAL':
      return (stack[0] as any) != (stack[1] as any);
    case 'INTRINSIC_POSITIF':
      return +(stack[0] as any);
    case 'INTRINSIC_NOT':
      return !(stack[0] as any);
    case 'INTRINSIC_NEGATE':
      return -(stack[0] as any);
    default:
      throw new Error('Unknown intrinsic: ' + n.operation);
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
  func.parameters.forEach(({ name }) => {
    if (!(name in namedArgs)) {
      namedArgs[name] = args.length ? args.shift() : null;
    }
  });
  return [namedArgs, args];
}
