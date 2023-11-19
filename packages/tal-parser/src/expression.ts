export type LocalExpression = ExpressionMetadata & {
  kind: 'Local';
  name: string;
};

export type DerefExpression = ExpressionMetadata & {
  kind: 'Deref';
  value: Expression;
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
  | DerefExpression
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
};

export type IfExpression = ExpressionMetadata & {
  kind: 'If';
  condition: Expression;
  ifTrue: Expression;
  ifFalse: Expression | undefined;
};

export type TryExpression = ExpressionMetadata & {
  kind: 'Try';
  expr: Expression;
  catchBlock: Expression | undefined;
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

export type ValueExpression = ExpressionMetadata & {
  kind: 'Value';
  value: unknown;
};

export type ObjectExpression = ExpressionMetadata & {
  kind: 'Object';
  value: object;
};

export type AssignExpression = ExpressionMetadata & {
  kind: 'Assign';
  address: AddressableExpression;
  value: Expression;
};

export type QuoteExpression = ExpressionMetadata & {
  kind: 'Quote';
  children: Expression[];
};

export type SubExpressionExpression = ExpressionMetadata & {
  kind: 'SubExpression';
  expr: Expression;
};

export type PipeExpression = ExpressionMetadata & {
  kind: 'Pipe';
  first: Expression;
  values: { value: Expression; pipeKind: '|' | '|?' | '|!' }[];
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
  // Used by function calls when the body is directly a block of expression
  // There's no need to create a child context in those cases
  mustKeepContext?: boolean;
};

export type DeclareLocalExpression = ExpressionMetadata & {
  kind: 'DeclareLocal';
  name: string;
  value: Expression;
  mutable: boolean;
};

export type KindedObjectExpression = ExpressionMetadata & {
  kind: 'KindedObject';
  value: { [key: string]: unknown };
};

export type ArrayExpression = ExpressionMetadata & {
  kind: 'Array';
  value: Expression[];
};

export type FunctionExpression = ExpressionMetadata & {
  kind: 'Function';
  parameters: string[];
  body: Expression;
};

export type ExpressionLocation = ExpressionMetadata & {
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

export type ExpressionByKind = {
  Literal: LiteralExpression;
  Local: LocalExpression;
  Deref: DerefExpression;
  Attribute: AttributeExpression;
  Index: IndexExpression;
  Value: ValueExpression;
  Array: ArrayExpression;
  If: IfExpression;
  Object: ObjectExpression;
  Assign: AssignExpression;
  Quote: QuoteExpression;
  Function: FunctionExpression;
  Call: CallExpression;
  SubExpression: SubExpressionExpression;
  Pipe: PipeExpression;
  UnaryOperator: UnaryOperatorExpression;
  BinaryOperator: BinaryOperatorExpression;
  BlockOfExpressions: BlockOfExpressionsExpression;
  DeclareLocal: DeclareLocalExpression;
  KindedObject: KindedObjectExpression;
};

export type Expression =
  | LiteralExpression
  | AddressableExpression
  | ValueExpression
  | ArrayExpression
  | ObjectExpression
  | IfExpression
  | TryExpression
  | AssignExpression
  | QuoteExpression
  | FunctionExpression
  | CallExpression
  | SubExpressionExpression
  | PipeExpression
  | UnaryOperatorExpression
  | BinaryOperatorExpression
  | BlockOfExpressionsExpression
  | DeclareLocalExpression
  | KindedObjectExpression;

export function isExpr<Kind extends keyof ExpressionByKind>(
  expr: Expression,
  kind: Kind
): expr is ExpressionByKind[Kind] {
  return expr !== null && typeof expr == 'object' && expr.kind == kind;
}
