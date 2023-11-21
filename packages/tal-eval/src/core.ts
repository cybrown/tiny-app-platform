import { RuntimeContext } from './RuntimeContext';

export type IRNode<K extends keyof IRNodes = keyof IRNodes> = {
  kind: K;
  location?: {
    start: {
      offset: number;
      line: number;
      column: number;
    };
    end: {
      offset: number;
      line: number;
      column: number;
    };
  };
} & IRNodes[K];

export type IRNodes = {
  LITERAL: {
    value: unknown;
  };
  MAKE_ARRAY: {
    children: IRNode[];
  };
  MAKE_OBJECT: {
    children: IRNode[];
  };
  LOCAL: {
    name: string;
  };
  DECLARE_LOCAL: {
    name: string;
    mutable: boolean;
    children: IRNode[];
  };
  SET_LOCAL: {
    name: string;
    children: IRNode[];
  };
  FUNCTION_REF: {
    name: string;
  };
  CONDITION: {
    children: IRNode[];
  };
  TRY: {
    children: IRNode[];
  };
  CALL: {
    children: IRNode[];
  };
  ATTRIBUTE: {
    name: string;
    children: IRNode[];
  };
  SET_ATTRIBUTE: {
    name: string;
    children: IRNode[];
  };
  INDEX: {
    children: IRNode[];
  };
  SET_INDEX: {
    children: IRNode[];
  };
  INTRINSIC: {
    operation: IRIntrinsicOperator;
    children: IRNode[];
  };
  BLOCK: {
    children: IRNode[];
  };
  KINDED: {
    children: IRNode[];
  };
  CTX_RENDER: {};
};

export type IRIntrinsicOperator =
  | 'INTRINSIC_NEGATE'
  | 'INTRINSIC_POSITIF'
  | 'INTRINSIC_NOT'
  | 'INTRINSIC_MULTIPLY'
  | 'INTRINSIC_DIVIDE'
  | 'INTRINSIC_MODULO'
  | 'INTRINSIC_ADD'
  | 'INTRINSIC_SUBSTRACT'
  | 'INTRINSIC_LESSER'
  | 'INTRINSIC_LESSER_OR_EQUAL'
  | 'INTRINSIC_GREATER'
  | 'INTRINSIC_GREATER_OR_EQUAL'
  | 'INTRINSIC_EQUAL'
  | 'INTRINSIC_NOT_EQUAL'
  | 'INTRINSIC_EQUAL_STRICT'
  | 'INTRINSIC_NOT_EQUAL_STRICT'
  | 'INTRINSIC_AND'
  | 'INTRINSIC_OR';

export function buildIRNode<Kind extends keyof IRNodes>(
  kind: Kind,
  location: IRNode['location'] | undefined,
  value: IRNodes[Kind]
): IRNodes[Kind] & { kind: Kind } {
  return { kind, location, ...value } as TODO_ANY;
}

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
