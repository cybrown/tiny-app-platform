import { RuntimeContext } from './RuntimeContext';
import { Opcode } from './opcodes';

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
};

export type FunctionBody = {
  entry: Opcode[];
  [key: string]: Opcode[];
};

export type FunctionDef = {
  parameters: ParameterDef[];
  body: FunctionBody;
};

export type Program = { [key: string]: FunctionDef };

export type Closure = {
  name: string;
  ctx: RuntimeContext;
};

export type AnyForNever = any;

export type TODO_ANY = any;
