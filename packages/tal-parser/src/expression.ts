export type LocalExpression = { kind: 'Local'; name: string };

export type DerefExpression = { kind: 'Deref'; value: Expression };

export type AttributeExpression = {
  kind: 'Attribute';
  key: string;
  value: Expression;
};

export type IndexExpression = {
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
  | '&&'
  | '||';

export type LiteralExpression = {
  kind: 'Literal';
  value: null | boolean | number | string;
};

export type CallExpression = {
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

export type ValueExpression = {
  kind: 'Value';
  value: unknown;
};

export type ObjectExpression = { kind: 'Object'; value: object };

export type SetValueExpression = {
  kind: 'SetValue';
  address: AddressableExpression;
  value: Expression;
};

export type QuoteExpression = { kind: 'Quote'; children: Expression[] };

export type SubExpressionExpression = {
  kind: 'SubExpression';
  expr: Expression;
};

export type PipeExpression = {
  kind: 'Pipe';
  first: Expression;
  values: { value: Expression; pipeKind: '|' | '|?' | '|!' }[];
};

export type UnaryOperatorExpression = {
  kind: 'UnaryOperator';
  operator: UnaryOperator;
  operand: Expression;
};

export type BinaryOperatorExpression = {
  kind: 'BinaryOperator';
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
};

export type BlockOfExpressionsExpression = {
  kind: 'BlockOfExpressions';
  children: Expression[];
  // Used by function calls when the body is directly a block of expression
  // There's no need to create a child context in those cases
  mustKeepContext?: boolean;
};

export type DeclareLocalExpression = {
  kind: 'DeclareLocal';
  name: string;
  value: Expression;
  mutable: boolean;
};

export type KindedObjectExpression = {
  kind: 'KindedObject';
  value: { [key: string]: unknown };
};

export type ArrayExpression = {
  kind: 'Array';
  value: Expression[];
};

export type FunctionExpression = {
  kind: 'Function';
  parameters: string[];
  body: Expression;
};

export type ExpressionLocation = {
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
  Object: ObjectExpression;
  SetValue: SetValueExpression;
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

export type Expression = (
  | LiteralExpression
  | AddressableExpression
  | ValueExpression
  | ArrayExpression
  | ObjectExpression
  | SetValueExpression
  | QuoteExpression
  | FunctionExpression
  | CallExpression
  | SubExpressionExpression
  | PipeExpression
  | UnaryOperatorExpression
  | BinaryOperatorExpression
  | BlockOfExpressionsExpression
  | DeclareLocalExpression
  | KindedObjectExpression
) & {
  location?: ExpressionLocation;
};

export function isExpr<Kind extends keyof ExpressionByKind>(
  expr: Expression,
  kind: Kind
): expr is ExpressionByKind[Kind] {
  return expr !== null && typeof expr == 'object' && expr.kind == kind;
}
