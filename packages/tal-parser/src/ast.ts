export type TypeNamedNode = NodeMetadata & {
  kind: 'named';
  name: string;
};

export type TypeKindedRecordNode = NodeMetadata & {
  kind: 'kinded-record';
};

export type TypeUnionNode = NodeMetadata & {
  kind: 'union';
  types: TypeNode[];
};

export type TypeArrayNode = NodeMetadata & {
  kind: 'array';
  item: TypeNode;
};

export type TypeDictNode = NodeMetadata & {
  kind: 'dict';
  item: TypeNode;
};

export type TypeRecordNode = NodeMetadata & {
  kind: 'record';
  fields: Record<string, TypeNode>;
};

export type TypeNested = NodeMetadata & {
  kind: 'nested';
  type: TypeNode;
};

export type TypeParameter = NodeMetadata & {
  name: IdentifierNode;
  type: TypeNode;
};

export type TypeFunctionNode = NodeMetadata & {
  kind: 'function';
  parameters: TypeParameter[];
  returnType: TypeNode;
};

export type TypeNode =
  | TypeNamedNode
  | TypeKindedRecordNode
  | TypeUnionNode
  | TypeArrayNode
  | TypeDictNode
  | TypeRecordNode
  | TypeFunctionNode
  | TypeNested;

export type LocalNode = NodeMetadata & {
  kind: 'Local';
  name: string;
};

export type AttributeNode = NodeMetadata & {
  kind: 'Attribute';
  key: IdentifierNode;
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
  | '&&'
  | '||';

export type NodeMetadata = {
  location?: NodeLocation;
  newLines?: number;
};

export type LiteralNode = NodeMetadata & {
  kind: 'Literal';
  value: null | boolean | number | string;
  text?: string;
  doRemoveFromBlock?: boolean;
};

export type IfNode = NodeMetadata & {
  kind: 'If';
  condition: Node;
  ifTrue: Node;
  ifFalse: Node | undefined;
};

export type WhileNode = NodeMetadata & {
  kind: 'While';
  condition: Node;
  body: Node;
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
  hasOnlyCatchKeyword?: true;
  catchNode: Node | undefined;
};

export type CallNode = NodeMetadata & {
  kind: 'Call';
  value: Node;
  shell?: boolean;
  args: (PositionalArgumentNode | NamedArgumentNode)[];
  typeArgs?: Record<string, TypeNode>;
};

export type PositionalArgumentNode = NodeMetadata & {
  kind: 'PositionalArgument';
  value: Node;
};

export type NamedArgumentNode = NodeMetadata & {
  kind: 'NamedArgument';
  name: IdentifierNode;
  value: Node;
  short?: boolean;
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
  type?: TypeNode;
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
  short?: boolean;
};

export type ArrayNode = NodeMetadata & {
  kind: 'Array';
  value: Node[];
};

export type GenericParameterNode = NodeMetadata & {
  name: string;
};

export type IdentifierNode = NodeMetadata & {
  kind: 'Identifier';
  name: string;
};

export type FunctionNode = NodeMetadata & {
  kind: 'Function';
  name?: string;
  parameters: { name: IdentifierNode; type: TypeNode }[];
  returnType?: TypeNode;
  genericParameters?: GenericParameterNode[];
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

export type TypeAliasNode = NodeMetadata & {
  kind: 'TypeAlias';
  name: string;
  type: TypeNode;
};

export type IntrinsicNode = NodeMetadata & {
  kind: 'Intrinsic';
  op: 'ForceRender';
};

export type AttributeLambdaSugarNode = NodeMetadata & {
  kind: 'AttributeLambdaSugar';
  key: IdentifierNode;
};

export type NodeByKind = {
  Literal: LiteralNode;
  Addressable: AddressableNode;
  Array: ArrayNode;
  Record: RecordNode;
  If: IfNode;
  While: WhileNode;
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
  AttributeLambdaSugar: AttributeLambdaSugarNode;
  TypeAlias: TypeAliasNode;
  Identifier: IdentifierNode;
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
