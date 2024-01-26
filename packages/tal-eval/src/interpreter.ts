import { parse } from 'tal-parser';
import { RuntimeContext } from './RuntimeContext';
import {
  Closure,
  NativeFunctionBinding,
  ParameterDef,
  Program,
  TODO_ANY,
} from './core';
import { compile } from './compiler';
import { IRNode, IRNodeIntrinsic } from './ir-node';

const IRNODES_WITH_LAZY_CHILDREN: IRNode['kind'][] = [
  'Condition',
  'Try',
  'Kinded',
  'Provide',
];

export function run(
  ctx: RuntimeContext,
  program: Program,
  entryPoint: string,
  returnAllBlockValues = false
): unknown {
  const currentFunction = program[entryPoint];
  if (currentFunction.body.kind == 'Block' && returnAllBlockValues) {
    return currentFunction.body.children.map(node => {
      try {
        return runNode(ctx, program, node);
      } catch (err) {
        return err;
      }
    });
  }
  return runNode(ctx, program, currentFunction.body);
}

export function runCall(
  closure: Closure,
  program: Program,
  args: unknown[],
  kwargs: Record<string, unknown>,
  parentStackContext: RuntimeContext
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
    .createChildWithProvideParent({}, parentStackContext);
  return runNode(childContext, program, func.body);
}

export function runNode(
  ctx: RuntimeContext,
  program: Program,
  node: IRNode,
  returnArrayFromBlock = false
): unknown {
  try {
    let stack: unknown[] = [];
    if (!IRNODES_WITH_LAZY_CHILDREN.includes(node.kind) && 'children' in node) {
      const ctxToUse = node.kind == 'Block' ? ctx.createChild({}) : ctx;
      stack = node.children.map(n =>
        runNode(ctxToUse, program, n, returnArrayFromBlock)
      );
    }
    switch (node.kind) {
      case 'Literal':
        return node.value;
      case 'Local':
        return ctx.getLocal(node.name);
      case 'MakeArray':
        return stack;
      case 'MakeObject': {
        const result: Record<string, unknown> = {};
        for (let i = 0; i < stack.length; i += 2) {
          result[stack[i] as string] = stack[i + 1];
        }
        return result;
      }
      case 'Call': {
        const [closure, args, kwargs] = stack as [
          Closure,
          unknown[],
          Record<string, unknown>
        ];
        const functionName = closure.name;
        if (program[functionName]) {
          return runCall(closure, program, args, kwargs, ctx);
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
      case 'Intrinsic': {
        return computeIntrinsic(stack, node);
      }
      case 'FunctionRef': {
        return {
          name: node.name,
          ctx: ctx,
        };
      }
      case 'DeclareLocal': {
        ctx.declareLocal(node.name, {
          mutable: node.mutable,
          initialValue: stack[0],
        });
        return;
      }
      case 'Block':
        if (returnArrayFromBlock) {
          return stack.filter(s => s !== null);
        }
        return stack[stack.length - 1];
      case 'Index':
        return (stack[1] as any[])[stack[0] as any];
      case 'Attribute': {
        return (stack[0] as any)[node.name];
      }
      case 'SetLocal': {
        ctx.setLocal(node.name as any, stack[0]);
        return stack[0];
      }
      case 'SetIndex': {
        (stack[1] as any)[stack[0] as any] = stack[2];
        if (node.forceRender) {
          ctx.forceRefresh();
        }
        return stack[2];
      }
      case 'SetAttribute': {
        (stack[0] as any)[node.name] = stack[1];
        if (node.forceRender) {
          ctx.forceRefresh();
        }
        return stack[1];
      }
      case 'Condition': {
        const conditionResult = runNode(ctx, program, node.children[0]);
        if (conditionResult) {
          return runNode(ctx, program, node.children[1], returnArrayFromBlock);
        } else if (node.children.length > 2) {
          return runNode(ctx, program, node.children[2], returnArrayFromBlock);
        } else {
          return null;
        }
      }
      case 'Try': {
        try {
          return runNode(ctx, program, node.children[0], returnArrayFromBlock);
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
      case 'Provide': {
        const keyIr = node.children[0];
        const valueIr = node.children[1];
        const bodyIr = node.children[2];

        const key = runNode(ctx, program, keyIr);
        const value = runNode(ctx, program, valueIr);

        const childContext = ctx.createChildWithProvider(key, value);

        return runNode(childContext, program, bodyIr, returnArrayFromBlock);
      }
      case 'Provided': {
        return ctx.getProvidedValue(stack[0]);
      }
      case 'Kinded': {
        const kindIr = node.children[0];
        const childrenIr = node.children[1];
        const propsIr = node.children[2];
        return {
          ctx,
          kind: kindIr,
          children: childrenIr,
          props: propsIr,
        };
      }
      case 'CtxRender':
        ctx.forceRefresh();
        return;
      case 'Import':
        throw new EvaluationError(
          'import not allowed in synchronous expression',
          node,
          null
        );
      default: {
        const n: never = node; // If this does not compile, you forgot a case
        throw new Error('Unknown node kind: ' + (n as TODO_ANY).kind);
      }
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
  if (currentFunction.body.kind == 'Block' && returnAllBlockValues) {
    const node = currentFunction.body;
    let stack: unknown[] = [];
    for (let n of node.children) {
      try {
        stack.push(await runNodeAsync(ctx, program, n));
      } catch (err) {
        stack.push(err);
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
  kwargs: Record<string, unknown>,
  parentStackContext: RuntimeContext
) {
  const func = program[closure.name];
  const [namedArguments /* positionalArguments */] = resolveArgumentNames(
    func,
    kwargs,
    args
  );
  const childContext = closure.ctx
    .createChild(namedArguments, false)
    .createChildWithProvideParent({}, parentStackContext);
  return await runNodeAsync(childContext, program, func.body);
}

export async function runNodeAsync(
  ctx: RuntimeContext,
  program: Program,
  node: IRNode
): Promise<unknown> {
  try {
    let stack: unknown[] = [];
    if (!IRNODES_WITH_LAZY_CHILDREN.includes(node.kind) && 'children' in node) {
      const ctxToUse = node.kind == 'Block' ? ctx.createChild({}) : ctx;
      for (let n of node.children) {
        stack.push(await runNodeAsync(ctxToUse, program, n));
      }
    }
    switch (node.kind) {
      case 'Literal':
        return node.value;
      case 'Local':
        return ctx.getLocal(node.name);
      case 'MakeArray':
        return stack;
      case 'MakeObject': {
        const result: Record<string, unknown> = {};
        for (let i = 0; i < stack.length; i += 2) {
          result[stack[i] as string] = stack[i + 1];
        }
        return result;
      }
      case 'Call': {
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
            providedNamedArguments,
            ctx
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
      case 'Intrinsic': {
        return computeIntrinsic(stack, node);
      }
      case 'FunctionRef': {
        return {
          name: node.name,
          ctx: ctx,
        };
      }
      case 'DeclareLocal': {
        ctx.declareLocal(node.name, {
          mutable: node.mutable,
          initialValue: stack[0],
        });
        return;
      }
      case 'Block':
        return stack[stack.length - 1];
      case 'Index':
        return (stack[1] as any[])[stack[0] as any];
      case 'Attribute': {
        return (stack[0] as any)[node.name];
      }
      case 'SetLocal': {
        ctx.setLocal(node.name as any, stack[0]);
        return stack[0];
      }
      case 'SetIndex': {
        (stack[1] as any)[stack[0] as any] = stack[2];
        if (node.forceRender) {
          ctx.forceRefresh();
        }
        return stack[2];
      }
      case 'SetAttribute': {
        (stack[0] as any)[node.name] = stack[1];
        if (node.forceRender) {
          ctx.forceRefresh();
        }
        return stack[1];
      }
      case 'Condition': {
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
      case 'Try': {
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
      case 'Provide': {
        const keyIr = node.children[0];
        const valueIr = node.children[1];
        const bodyIr = node.children[2];

        const key = await runNodeAsync(ctx, program, keyIr);
        const value = await runNodeAsync(ctx, program, valueIr);

        const childContext = ctx.createChildWithProvider(key, value);

        return await runNodeAsync(childContext, program, bodyIr);
      }
      case 'Provided': {
        return ctx.getProvidedValue(stack[0]);
      }
      case 'Kinded': {
        const kindIr = node.children[0];
        const childrenIr = node.children[1];
        const propsIr = node.children[2];
        return {
          ctx,
          kind: kindIr,
          children: childrenIr,
          props: propsIr,
        };
      }
      case 'CtxRender':
        ctx.forceRefresh();
        return;
      case 'Import': {
        return await resolveModule(ctx, node.path);
      }
      default: {
        const n: never = node; // If this does not compile, you forgot a case
        throw new Error('Unknown node kind: ' + (n as TODO_ANY).kind);
      }
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

function computeIntrinsic(stack: unknown[], n: IRNodeIntrinsic) {
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
  const moduleSource = await ctx.fetchSource(path);
  const ast = parse(moduleSource);
  const module = compile(ast, path);
  Object.entries(module).forEach(([name, func]) => {
    if (name != 'main' && ctx.program) {
      ctx.program[name] = func;
    }
  });
  const moduleContext = ctx.createWithSameRootLocals();
  moduleContext.program = module;
  return await runAsync(moduleContext, module, 'main', false);
}
