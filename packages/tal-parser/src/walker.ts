import { Node } from './ast';

export type NodeWithParents = {
  node: Node;
  mode: 'enter' | 'leave' | 'visit';
};

export function* walk(node: Node | Node[]): Iterable<NodeWithParents> {
  if (Array.isArray(node)) {
    yield* walkArray(node);
  } else {
    yield* walkSingle(node);
  }
}

function* walkArray(node: Node[]): Iterable<NodeWithParents> {
  for (const e of node) {
    yield* walkSingle(e);
  }
}

const LEAVE_KINDS = ['Literal', 'Local', 'Import', 'Intrinsic'];

function* walkSingle(node: Node): Iterable<NodeWithParents> {
  if (!LEAVE_KINDS.includes(node.kind)) {
    yield { node, mode: 'enter' };
  }
  switch (node.kind) {
    case 'Array':
      yield* walkArray(node.value);
      break;
    case 'DeclareLocal':
      if (node.value) {
        yield* walk(node.value);
      }
      break;
    case 'Block':
      yield* walk(node.children);
      break;
    case 'Call':
      yield* walk(node.value);
      yield* walk(node.args.map(arg => arg.value));
      break;
    case 'KindedRecord':
      yield* walk(node.kindOfRecord);
      if (node.children) {
        yield* walk(node.children);
      }
      for (const entry of node.entries) {
        yield* walk(entry);
      }
      break;
    case 'Function':
      yield* walk(node.body);
      break;
    case 'Attribute':
      yield* walk(node.value);
      break;
    case 'Assign':
      yield* walk(node.address);
      yield* walk(node.value);
      break;
    case 'BinaryOperator':
      yield* walk(node.left);
      yield* walk(node.right);
      break;
    case 'Export':
      yield* walk(node.node);
      break;
    case 'If':
      yield* walk(node.condition);
      yield* walk(node.ifTrue);
      if (node.ifFalse) {
        yield* walk(node.ifFalse);
      }
      break;
    case 'Index':
      yield* walk(node.index);
      yield* walk(node.value);
      break;
    case 'Pipe':
      yield* walk(node.first);
      for (const value of node.values) {
        yield* walk(value);
      }
      break;
    case 'Record':
      for (const entry of node.entries) {
        yield* walk(entry);
      }
      break;
    case 'Nested':
      yield* walk(node.node);
      break;
    case 'Switch':
      if (node.value) {
        yield* walk(node.value);
      }
      for (const branch of node.branches) {
        yield* walk(branch.comparator);
        yield* walk(branch.value);
      }
      if (node.defaultBranch) {
        yield* walk(node.defaultBranch.value);
      }
      break;
    case 'Try':
      yield* walk(node.node);
      if (node.catchNode) {
        yield* walk(node.catchNode);
      }
      break;
    case 'UnaryOperator':
      yield* walk(node.operand);
      break;

    case 'KindedRecordEntry':
      if (node.value) {
        yield* walk(node.value);
      }
      break;
    case 'PositionalArgument':
      yield* walk(node.value);
      break;
    case 'NamedArgument':
      yield* walk(node.value);
      break;
    case 'RecordEntry':
      yield* walk(node.value);
      break;
    case 'SwitchBranch':
      yield* walk(node.comparator);
      yield* walk(node.value);
      break;
    case 'Comment':
      if (node.node) {
        yield* walk(node.node);
      }
      break;

    // Leaves
    case 'Literal':
    case 'Local':
    case 'Import':
    case 'Intrinsic':
      yield { node, mode: 'visit' };
      break;
    default:
      const _: never = node;
      _;
      throw new Error('Unreachable case: ' + (node as any).kind);
  }
  if (!LEAVE_KINDS.includes(node.kind)) {
    yield { node, mode: 'leave' };
  }
}
