import { TODO_ANY } from './core';
import { NodeLocation } from 'tal-parser';

type OpcodeMetadata = {
  location?: NodeLocation;
};

type OpcodeLiteral = {
  value: unknown;
  // Remove this literal from array ending, for comments
  removeFromBlock?: boolean;
} & OpcodeMetadata;

type OpcodeMakeArray = {} & OpcodeMetadata;

type OpcodeMakeRecord = {} & OpcodeMetadata;

type OpcodeLocal = {
  name: string;
} & OpcodeMetadata;

type OpcodeDeclareLocal = {
  name: string;
  mutable: boolean;
  hasInitialValue: boolean;
} & OpcodeMetadata;

type OpcodeSetLocal = {
  name: string;
} & OpcodeMetadata;

type OpcodeFunctionRef = {
  name: string;
} & OpcodeMetadata;

type OpcodeJump = {
  label: string;
} & OpcodeMetadata;

type OpcodeJumpTrue = {
  label: string;
} & OpcodeMetadata;

type OpcodeTry = {
  catchLabel: string | undefined;
  endTryLabel: string;
} & OpcodeMetadata;

type OpcodeTryPop = {} & OpcodeMetadata;

type OpcodeCall = {} & OpcodeMetadata;

type OpcodeAttribute = {
  name: string;
} & OpcodeMetadata;

type OpcodeSetAttribute = {
  name: string;
  forceRender: boolean;
} & OpcodeMetadata;

type OpcodeIndex = {} & OpcodeMetadata;

type OpcodeSetIndex = {
  forceRender: boolean;
} & OpcodeMetadata;

type OpcodeIntrinsic = {
  operation: OpcodeIntrinsicOperator;
} & OpcodeMetadata;

type OpcodeScopeEnter = {} & OpcodeMetadata;

type OpcodeScopeLeave = (
  | { inBlock: false; count?: undefined }
  | { inBlock: true; count: number }
) &
  OpcodeMetadata;

type OpcodePop = { inBlock: boolean } & OpcodeMetadata;

type OpcodeKinded = {} & OpcodeMetadata;

type OpcodeCtxRender = {} & OpcodeMetadata;

type OpcodeImport = {
  path: string;
} & OpcodeMetadata;

type OpcodeMakeArrayForBlock = { count: number } & OpcodeMetadata;

type OpcodePushLatestError = {} & OpcodeMetadata;

type OpcodeByKind2 = {
  Literal: OpcodeLiteral;
  MakeArray: OpcodeMakeArray;
  MakeRecord: OpcodeMakeRecord;
  Local: OpcodeLocal;
  DeclareLocal: OpcodeDeclareLocal;
  SetLocal: OpcodeSetLocal;
  FunctionRef: OpcodeFunctionRef;
  Jump: OpcodeJump;
  JumpTrue: OpcodeJumpTrue;
  Try: OpcodeTry;
  TryPop: OpcodeTryPop;
  Call: OpcodeCall;
  Attribute: OpcodeAttribute;
  SetAttribute: OpcodeSetAttribute;
  Index: OpcodeIndex;
  SetIndex: OpcodeSetIndex;
  Intrinsic: OpcodeIntrinsic;
  ScopeEnter: OpcodeScopeEnter;
  ScopeLeave: OpcodeScopeLeave;
  Pop: OpcodePop;
  Kinded: OpcodeKinded;
  CtxRender: OpcodeCtxRender;
  Import: OpcodeImport;
  MakeArrayForBlock: OpcodeMakeArrayForBlock;
  PushLatestError: OpcodePushLatestError;
};

export type OpcodeByKind = {
  [T in keyof OpcodeByKind2]: { kind: T } & OpcodeByKind2[T] & OpcodeMetadata;
};

export type Opcode = OpcodeByKind[keyof OpcodeByKind];

type OpcodeIntrinsicOperator =
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

export function buildOpcode<Kind extends Opcode['kind']>(
  kind: Kind,
  location: Opcode['location'] | undefined,
  value: Omit<OpcodeByKind[Kind], 'kind'>
): OpcodeByKind[Kind] {
  return { kind, location, ...value } as TODO_ANY;
}
