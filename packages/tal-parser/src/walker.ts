import { Expression } from './expression';

export function* walk(
  expression: Expression | Expression[]
): Iterable<Expression> {
  if (Array.isArray(expression)) {
    yield* walkArray(expression);
  } else {
    yield* walkSingle(expression);
  }
}

function* walkArray(expression: Expression[]): Iterable<Expression> {
  for (const e of expression) {
    yield* walkSingle(e);
  }
}

function* walkSingle(expression: Expression): Iterable<Expression> {
  yield expression;
  switch (expression.kind) {
    case 'Array':
      yield* walkArray(expression.value);
      break;
    case 'DeclareLocal':
      yield* walk(expression.value);
      break;
    case 'BlockOfExpressions':
      yield* walk(expression.children);
      break;
    case 'Call':
      yield* walk(expression.value);
      yield* walk(expression.args.map(arg => arg.value));
      break;
    case 'KindedRecord':
      yield* walk(expression.value.kind);
      if (expression.value.children) {
        yield* walk(expression.value.children);
      }
      for (const key in expression.value) {
        if (key === 'kind' || key === 'children') {
          continue;
        }
        const value = expression.value[key];
        if (!value) {
          continue;
        }
        yield* walk(value);
      }
      break;
    case 'Function':
      yield* walk(expression.body);
      break;
    case 'Attribute':
      yield* walk(expression.value);
      break;
    case 'Assign':
      yield* walk(expression.address);
      yield* walk(expression.value);
      break;
    case 'BinaryOperator':
      yield* walk(expression.left);
      yield* walk(expression.right);
      break;
    case 'Export':
      yield* walk(expression.expr);
      break;
    case 'If':
      yield* walk(expression.condition);
      yield* walk(expression.ifTrue);
      if (expression.ifFalse) {
        yield* walk(expression.ifFalse);
      }
      break;
    case 'Index':
      yield* walk(expression.index);
      yield* walk(expression.value);
      break;
    case 'Pipe':
      yield* walk(expression.first);
      for (const value of expression.values) {
        yield* walk(value);
      }
      break;
    case 'Record':
      break;
    case 'SubExpression':
      yield* walk(expression.expr);
      break;
    case 'Switch':
      if (expression.value) {
        yield* walk(expression.value);
      }
      for (const branch of expression.branches) {
        yield* walk(branch.comparator);
        yield* walk(branch.value);
      }
      if (expression.defaultBranch) {
        yield* walk(expression.defaultBranch.value);
      }
      break;
    case 'Try':
      yield* walk(expression.expr);
      if (expression.catchExpr) {
        yield* walk(expression.catchExpr);
      }
      break;
    case 'UnaryOperator':
      yield* walk(expression.operand);
      break;

    // Leaves
    case 'Literal':
      break;
    case 'Local':
      break;
    case 'Comment':
      break;
    case 'Import':
      break;
    case 'Intrinsic':
      break;
    default:
      const mustBeNever: never = expression;
      console.log('Unknown expression to walk', mustBeNever);
  }
}
