import { TODO_ANY } from './core';
import { ExpressionLocation } from 'tal-parser';

export type IRNodeMetadata = {
  location?: ExpressionLocation;
};

export type IRNodeLiteral = {
  value: unknown;
  // Remove this literal from array ending, for comments
  removeFromBlock?: boolean;
} & IRNodeMetadata;

export type IRNodeMakeArray = {} & IRNodeMetadata;

export type IRNodeMakeObject = {} & IRNodeMetadata;

export type IRNodeLocal = {
  name: string;
} & IRNodeMetadata;

export type IRNodeDeclareLocal = {
  name: string;
  mutable: boolean;
  hasInitialValue: boolean;
} & IRNodeMetadata;

export type IRNodeSetLocal = {
  name: string;
} & IRNodeMetadata;

export type IRNodeFunctionRef = {
  name: string;
} & IRNodeMetadata;

export type IRNodeJump = {
  label: string;
} & IRNodeMetadata;

export type IRNodeJumpTrue = {
  label: string;
} & IRNodeMetadata;

export type IRNodeTry = {
  catchLabel: string | undefined;
  endTryLabel: string;
} & IRNodeMetadata;

export type IRNodeTryPop = {} & IRNodeMetadata;

export type IRNodeCall = {} & IRNodeMetadata;

export type IRNodeAttribute = {
  name: string;
} & IRNodeMetadata;

export type IRNodeSetAttribute = {
  name: string;
  forceRender: boolean;
} & IRNodeMetadata;

export type IRNodeIndex = {} & IRNodeMetadata;

export type IRNodeSetIndex = {
  forceRender: boolean;
} & IRNodeMetadata;

export type IRNodeIntrinsic = {
  operation: IRIntrinsicOperator;
} & IRNodeMetadata;

export type IRNodeScopeEnter = {} & IRNodeMetadata;

export type IRNodeScopeLeave = (
  | { inBlock: false; count?: undefined }
  | { inBlock: true; count: number }
) &
  IRNodeMetadata;

export type IRNodePop = { inBlock: boolean } & IRNodeMetadata;

export type IRNodeKinded = {} & IRNodeMetadata;

export type IRNodeCtxRender = {} & IRNodeMetadata;

export type IRNodeProvide = {} & IRNodeMetadata;

export type IRNodeGetProvided = {} & IRNodeMetadata;

export type IRNodeImport = {
  path: string;
} & IRNodeMetadata;

export type IRNodeMakeArrayForBlock = { count: number } & IRNodeMetadata;

export type IRNodeByKind2 = {
  Literal: IRNodeLiteral;
  MakeArray: IRNodeMakeArray;
  MakeObject: IRNodeMakeObject;
  Local: IRNodeLocal;
  DeclareLocal: IRNodeDeclareLocal;
  SetLocal: IRNodeSetLocal;
  FunctionRef: IRNodeFunctionRef;
  Jump: IRNodeJump;
  JumpTrue: IRNodeJumpTrue;
  Try: IRNodeTry;
  TryPop: IRNodeTryPop;
  Call: IRNodeCall;
  Attribute: IRNodeAttribute;
  SetAttribute: IRNodeSetAttribute;
  Index: IRNodeIndex;
  SetIndex: IRNodeSetIndex;
  Intrinsic: IRNodeIntrinsic;
  ScopeEnter: IRNodeScopeEnter;
  ScopeLeave: IRNodeScopeLeave;
  Pop: IRNodePop;
  Kinded: IRNodeKinded;
  CtxRender: IRNodeCtxRender;
  Provide: IRNodeProvide;
  GetProvided: IRNodeGetProvided;
  Import: IRNodeImport;
  MakeArrayForBlock: IRNodeMakeArrayForBlock;
};

export type IRNodeByKind = {
  [T in keyof IRNodeByKind2]: { kind: T } & IRNodeByKind2[T] & IRNodeMetadata;
};

export type IRNode = IRNodeByKind[keyof IRNodeByKind];

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
  | 'INTRINSIC_OR'
  | 'INTRINSIC_FORCE_RENDER';

export function buildIRNode<Kind extends IRNode['kind']>(
  kind: Kind,
  location: IRNode['location'] | undefined,
  value: Omit<IRNodeByKind[Kind], 'kind'>
): IRNodeByKind[Kind] {
  return { kind, location, ...value } as TODO_ANY;
}
