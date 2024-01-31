import { TODO_ANY } from './core';
import { ExpressionLocation } from 'tal-parser';

export type IRNodeMetadata = {
  location?: ExpressionLocation;
};

export type IRNodeLiteral = {
  kind: 'Literal';
  value: unknown;
  // Remove this literal from array ending, for comments
  removeFromBlock?: boolean;
} & IRNodeMetadata;

export type IRNodeMakeArray = {
  kind: 'MakeArray';
  children: IRNode[];
} & IRNodeMetadata;

export type IRNodeMakeObject = {
  kind: 'MakeObject';
  children: IRNode[];
} & IRNodeMetadata;

export type IRNodeLocal = {
  kind: 'Local';
  name: string;
} & IRNodeMetadata;

export type IRNodeDeclareLocal = {
  kind: 'DeclareLocal';
  name: string;
  mutable: boolean;
  children: IRNode[];
} & IRNodeMetadata;

export type IRNodeSetLocal = {
  kind: 'SetLocal';
  name: string;
  children: IRNode[];
} & IRNodeMetadata;

export type IRNodeFunctionRef = {
  kind: 'FunctionRef';
  name: string;
} & IRNodeMetadata;

export type IRNodeCondition = {
  kind: 'Condition';
  children: IRNode[];
} & IRNodeMetadata;

export type IRNodeTry = {
  kind: 'Try';
  children: IRNode[];
} & IRNodeMetadata;

export type IRNodeCall = {
  kind: 'Call';
  children: IRNode[];
} & IRNodeMetadata;

export type IRNodeAttribute = {
  kind: 'Attribute';
  name: string;
  children: IRNode[];
} & IRNodeMetadata;

export type IRNodeSetAttribute = {
  kind: 'SetAttribute';
  name: string;
  forceRender: boolean;
  children: IRNode[];
} & IRNodeMetadata;

export type IRNodeIndex = {
  kind: 'Index';
  children: IRNode[];
} & IRNodeMetadata;

export type IRNodeSetIndex = {
  kind: 'SetIndex';
  forceRender: boolean;
  children: IRNode[];
} & IRNodeMetadata;

export type IRNodeIntrinsic = {
  kind: 'Intrinsic';
  operation: IRIntrinsicOperator;
  children: IRNode[];
} & IRNodeMetadata;

export type IRNodeBlock = {
  kind: 'Block';
  children: IRNode[];
} & IRNodeMetadata;

export type IRNodeKinded = {
  kind: 'Kinded';
  children: IRNode[];
} & IRNodeMetadata;

export type IRNodeCtxRender = {
  kind: 'CtxRender';
} & IRNodeMetadata;

export type IRNodeProvide = {
  kind: 'Provide';
  children: IRNode[];
} & IRNodeMetadata;

export type IRNodeProvided = {
  kind: 'Provided';
  children: IRNode[];
} & IRNodeMetadata;

export type IRNodeImport = {
  kind: 'Import';
  path: string;
} & IRNodeMetadata;

export type IRNode =
  | IRNodeLiteral
  | IRNodeMakeArray
  | IRNodeMakeObject
  | IRNodeLocal
  | IRNodeDeclareLocal
  | IRNodeSetLocal
  | IRNodeFunctionRef
  | IRNodeCondition
  | IRNodeTry
  | IRNodeCall
  | IRNodeAttribute
  | IRNodeSetAttribute
  | IRNodeIndex
  | IRNodeSetIndex
  | IRNodeIntrinsic
  | IRNodeBlock
  | IRNodeKinded
  | IRNodeCtxRender
  | IRNodeProvide
  | IRNodeProvided
  | IRNodeImport;

export type IRNodeByKind = {
  Literal: IRNodeLiteral;
  MakeArray: IRNodeMakeArray;
  MakeObject: IRNodeMakeObject;
  Local: IRNodeLocal;
  DeclareLocal: IRNodeDeclareLocal;
  SetLocal: IRNodeSetLocal;
  FunctionRef: IRNodeFunctionRef;
  Condition: IRNodeCondition;
  Try: IRNodeTry;
  Call: IRNodeCall;
  Attribute: IRNodeAttribute;
  SetAttribute: IRNodeSetAttribute;
  Index: IRNodeIndex;
  SetIndex: IRNodeSetIndex;
  Intrinsic: IRNodeIntrinsic;
  Block: IRNodeBlock;
  Kinded: IRNodeKinded;
  CtxRender: IRNodeCtxRender;
  Provide: IRNodeProvide;
  Provided: IRNodeProvided;
  Import: IRNodeImport;
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

export function buildIRNode<Kind extends IRNode['kind']>(
  kind: Kind,
  location: IRNode['location'] | undefined,
  value: Omit<IRNodeByKind[Kind], 'kind'>
): IRNodeByKind[Kind] {
  return { kind, location, ...value } as TODO_ANY;
}
