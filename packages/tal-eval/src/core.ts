import { RuntimeContext } from './RuntimeContext';
import { IRNode } from './ir-node';

export type NativeFunctionBinding = {
  parameters: [{ name: string }];
  call: (
    ctx: RuntimeContext,
    kwargs: Record<string, unknown>,
    args: unknown[]
  ) => unknown;
  callAsync: (
    ctx: RuntimeContext,
    kwargs: Record<string, unknown>,
    args: unknown[]
  ) => Promise<unknown>;
};

export type ParameterDef = {
  name: string;
  onlyNamed?: boolean;
};

export type FunctionDef = {
  parameters: ParameterDef[];
  body: IRNode;
};

export type Program = { [key: string]: FunctionDef };

export type Closure = {
  name: string;
  ctx: RuntimeContext;
};

export type AnyForNever = any;

export type TODO_ANY = any;
