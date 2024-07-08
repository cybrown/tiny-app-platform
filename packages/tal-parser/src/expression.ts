export type LocalExpression = ExpressionMetadata & {
  kind: 'Local';
  name: string;
};

export type AttributeExpression = ExpressionMetadata & {
  kind: 'Attribute';
  key: string;
  value: Expression;
};

export type IndexExpression = ExpressionMetadata & {
  kind: 'Index';
  index: Expression;
  value: Expression;
};

export type AddressableExpression =
  | LocalExpression
  | AttributeExpression
  | IndexExpression;

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

export type ExpressionMetadata = {
  location?: ExpressionLocation;
  newLines?: number;
};

export type LiteralExpression = ExpressionMetadata & {
  kind: 'Literal';
  value: null | boolean | number | string;
  doRemoveFromBlock?: boolean;
};

export type IfExpression = ExpressionMetadata & {
  kind: 'If';
  condition: Expression;
  ifTrue: Expression;
  ifFalse: Expression | undefined;
};

export type SwitchExpression = ExpressionMetadata & {
  kind: 'Switch';
  value: Expression | null;
  branches: {
    comparator: Expression;
    value: Expression;
  }[];
  defaultBranch: {
    value: Expression;
  };
};

export type TryExpression = ExpressionMetadata & {
  kind: 'Try';
  expr: Expression;
  catchExpr: Expression | undefined;
};

export type CallExpression = ExpressionMetadata & {
  kind: 'Call';
  value: Expression;
  args: ArgumentExpression[];
};

export type ArgumentExpression =
  | {
      argKind: 'Positional';
      value: Expression;
    }
  | { argKind: 'Named'; name: string; value: Expression };

export type RecordExpression = ExpressionMetadata & {
  kind: 'Record';
  value: Record<string, Expression>;
};

export type AssignExpression = ExpressionMetadata & {
  kind: 'Assign';
  address: AddressableExpression;
  value: Expression;
};

export type SubExpressionExpression = ExpressionMetadata & {
  kind: 'SubExpression';
  expr: Expression;
};

export type PipeExpression = ExpressionMetadata & {
  kind: 'Pipe';
  first: Expression;
  values: Expression[];
};

export type UnaryOperatorExpression = ExpressionMetadata & {
  kind: 'UnaryOperator';
  operator: UnaryOperator;
  operand: Expression;
};

export type BinaryOperatorExpression = ExpressionMetadata & {
  kind: 'BinaryOperator';
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
};

export type BlockOfExpressionsExpression = ExpressionMetadata & {
  kind: 'BlockOfExpressions';
  children: Expression[];
  forceNotWidget?: boolean;
  // Used by function calls when the body is directly a block of expression
  // There's no need to create a child context in those cases
  mustKeepContext?: boolean;
};

export type DeclareLocalExpression = ExpressionMetadata & {
  kind: 'DeclareLocal';
  name: string;
  value?: Expression;
  mutable: boolean;
};

export type KindedRecordExpression = ExpressionMetadata & {
  kind: 'KindedRecord';
  value: {
    kind: Expression;
    children?: Expression[];
    [key: string]: Expression | Expression[] | undefined;
  };
};

export type ArrayExpression = ExpressionMetadata & {
  kind: 'Array';
  value: Expression[];
};

export type FunctionExpression = ExpressionMetadata & {
  kind: 'Function';
  name?: string;
  parameters: string[];
  body: Expression;
};

export type CommentExpression = ExpressionMetadata & {
  kind: 'Comment';
  text: string;
  expr?: Expression;
};

export type ExpressionLocation = ExpressionMetadata & {
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

export type ImportExpression = ExpressionMetadata & {
  kind: 'Import';
  path: string;
};

export type ExportExpression = ExpressionMetadata & {
  kind: 'Export';
  expr: Expression;
};

export type IntrinsicExpression = ExpressionMetadata & {
  kind: 'Intrinsic';
  op: 'ForceRender';
};

export type ExpressionByKind = {
  Literal: LiteralExpression;
  Addressable: AddressableExpression;
  Array: ArrayExpression;
  Record: RecordExpression;
  If: IfExpression;
  Switch: SwitchExpression;
  Try: TryExpression;
  Assign: AssignExpression;
  Function: FunctionExpression;
  Call: CallExpression;
  SubExpression: SubExpressionExpression;
  Pipe: PipeExpression;
  UnaryOperator: UnaryOperatorExpression;
  BinaryOperator: BinaryOperatorExpression;
  BlockOfExpressions: BlockOfExpressionsExpression;
  DeclareLocal: DeclareLocalExpression;
  KindedRecord: KindedRecordExpression;
  Import: ImportExpression;
  Export: ExportExpression;
  Comment: CommentExpression;
  Intrinsic: IntrinsicExpression;
};

export type Expression = ExpressionByKind[keyof ExpressionByKind];

export function isExpr<Kind extends keyof ExpressionByKind>(
  expr: Expression | null | undefined,
  kind: Kind
): expr is ExpressionByKind[Kind] {
  return expr !== null && typeof expr == 'object' && expr.kind == kind;
}

export function isAddressableExpression(
  expr: Expression
): expr is AddressableExpression {
  return (
    expr.kind === 'Local' || expr.kind === 'Index' || expr.kind === 'Attribute'
  );
}
