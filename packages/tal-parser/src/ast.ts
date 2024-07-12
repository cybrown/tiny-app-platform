export type LocalNode = NodeMetadata & {
  kind: 'Local';
  name: string;
};

export type AttributeNode = NodeMetadata & {
  kind: 'Attribute';
  key: string;
  value: Node;
};

export type IndexNode = NodeMetadata & {
  kind: 'Index';
  index: Node;
  value: Node;
};

export type AddressableNode = LocalNode | AttributeNode | IndexNode;

export type UnaryOperator = '-' | '+' | '!';

export type BinaryOperator =
  | '-'
  | '+'
  | '!'
  | '*'
  | '%'
  | '/'
  | '<'
  | '<='
  | '>'
  | '>='
  | '!='
  | '=='
  | '!=='
  | '==='
  | '&&'
  | '||';

export type NodeMetadata = {
  location?: NodeLocation;
  newLines?: number;
};

export type LiteralNode = NodeMetadata & {
  kind: 'Literal';
  value: null | boolean | number | string;
  doRemoveFromBlock?: boolean;
};

export type IfNode = NodeMetadata & {
  kind: 'If';
  condition: Node;
  ifTrue: Node;
  ifFalse: Node | undefined;
};

export type SwitchNode = NodeMetadata & {
  kind: 'Switch';
  value: Node | null;
  branches: SwitchBranchNode[];
  defaultBranch: {
    value: Node;
  };
};

export type SwitchBranchNode = NodeMetadata & {
  kind: 'SwitchBranch';
  comparator: Node;
  value: Node;
};

export type TryNode = NodeMetadata & {
  kind: 'Try';
  node: Node;
  catchNode: Node | undefined;
};

export type CallNode = NodeMetadata & {
  kind: 'Call';
  value: Node;
  args: (PositionalArgumentNode | NamedArgumentNode)[];
};

export type PositionalArgumentNode = NodeMetadata & {
  kind: 'PositionalArgument';
  value: Node;
};

export type NamedArgumentNode = NodeMetadata & {
  kind: 'NamedArgument';
  name: string;
  value: Node;
};

export type RecordNode = NodeMetadata & {
  kind: 'Record';
  entries: RecordEntryNode[];
};

export type RecordEntryNode = NodeMetadata & {
  kind: 'RecordEntry';
  key: string;
  value: Node;
};

export type AssignNode = NodeMetadata & {
  kind: 'Assign';
  address: AddressableNode;
  value: Node;
};

export type NestedNode = NodeMetadata & {
  kind: 'Nested';
  node: Node;
};

export type PipeNode = NodeMetadata & {
  kind: 'Pipe';
  first: Node;
  values: Node[];
};

export type UnaryOperatorNode = NodeMetadata & {
  kind: 'UnaryOperator';
  operator: UnaryOperator;
  operand: Node;
};

export type BinaryOperatorNode = NodeMetadata & {
  kind: 'BinaryOperator';
  operator: BinaryOperator;
  left: Node;
  right: Node;
};

export type BlockNode = NodeMetadata & {
  kind: 'Block';
  children: Node[];
  forceNotWidget?: boolean;
  // Used by function calls when the body is directly a block of nodes
  // There's no need to create a child context in those cases
  mustKeepContext?: boolean;
};

export type DeclareLocalNode = NodeMetadata & {
  kind: 'DeclareLocal';
  name: string;
  value?: Node;
  mutable: boolean;
};

export type KindedRecordNode = NodeMetadata & {
  kind: 'KindedRecord';
  kindOfRecord: Node;
  children: Node[];
  entries: KindedRecordEntryNode[];
};

export type KindedRecordEntryNode = NodeMetadata & {
  kind: 'KindedRecordEntry';
  key: string;
  value: Node | Node[];
};

export type ArrayNode = NodeMetadata & {
  kind: 'Array';
  value: Node[];
};

export type FunctionNode = NodeMetadata & {
  kind: 'Function';
  name?: string;
  parameters: string[];
  body: Node;
};

export type CommentNode = NodeMetadata & {
  kind: 'Comment';
  text: string;
  node?: Node;
};

export type NodeLocation = NodeMetadata & {
  path: string;
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

export type ImportNode = NodeMetadata & {
  kind: 'Import';
  path: string;
};

export type ExportNode = NodeMetadata & {
  kind: 'Export';
  node: Node;
};

export type IntrinsicNode = NodeMetadata & {
  kind: 'Intrinsic';
  op: 'ForceRender';
};

export type UseNode = NodeMetadata & {
  kind: 'Use';
  binding: string;
  call: Node;
  body: Node;
};

export type NodeByKind = {
  Literal: LiteralNode;
  Addressable: AddressableNode;
  Array: ArrayNode;
  Record: RecordNode;
  If: IfNode;
  Switch: SwitchNode;
  Try: TryNode;
  Assign: AssignNode;
  Function: FunctionNode;
  Call: CallNode;
  Nested: NestedNode;
  Pipe: PipeNode;
  UnaryOperator: UnaryOperatorNode;
  BinaryOperator: BinaryOperatorNode;
  Block: BlockNode;
  DeclareLocal: DeclareLocalNode;
  KindedRecord: KindedRecordNode;
  Import: ImportNode;
  Export: ExportNode;
  Comment: CommentNode;
  Intrinsic: IntrinsicNode;
  SwitchBranch: SwitchBranchNode;
  KindedRecordEntry: KindedRecordEntryNode;
  RecordEntry: RecordEntryNode;
  PositionalArgument: PositionalArgumentNode;
  NamedArgument: NamedArgumentNode;
  Use: UseNode;
};

export type Node = NodeByKind[keyof NodeByKind];

export function isNode<Kind extends keyof NodeByKind>(
  node: Node | null | undefined,
  kind: Kind
): node is NodeByKind[Kind] {
  return node !== null && typeof node == 'object' && node.kind == kind;
}

export function isAddressableNode(node: Node): node is AddressableNode {
  return (
    node.kind === 'Local' || node.kind === 'Index' || node.kind === 'Attribute'
  );
}
