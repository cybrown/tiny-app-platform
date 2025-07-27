import {
  BinaryOperatorNode,
  BlockNode,
  CallNode,
  DeclareLocalNode,
  Node,
  FunctionNode,
  IfNode,
  isNode,
  KindedRecordNode,
  LiteralNode,
  RecordNode,
  PipeNode,
  AssignNode,
  NestedNode,
  TryNode,
  UnaryOperatorNode,
  SwitchNode,
  ImportNode,
  ExportNode,
  CommentNode,
  WhileNode,
  TypeNode,
} from './ast';

export function stringify(value: Node[]): string {
  return new Stringifier().stringify(value, true);
}

class Stringifier {
  stringify(value: Node | Node[], isRoot = false): string {
    if (Array.isArray(value)) {
      return this.stringifyArray(value, isRoot);
    } else {
      return this.stringifyKind(value);
    }
  }

  stringifyCustomKind(value: Node): string {
    const result = this.stringifyCustomKindSingleLine(value);
    if (result.length > 80 || result.includes('\n')) {
      return this.stringifyCustomKindMultiLine(value);
    }
    return result;
  }

  stringifyCustomKindSingleLine(value: Node): string {
    return (
      '%' +
      value.kind +
      ' { ' +
      Object.entries(value)
        .filter(([key]) => key !== 'kind' && key !== 'location')
        .map(([key, value]) => key + ': ' + this.stringify(value as Node))
        .join(', ') +
      ' }'
    );
  }

  stringifyCustomKindMultiLine(value: Node): string {
    let result = '%' + value.kind + ' {\n';
    this.incrementDepth();
    const argsToStringify = Object.entries(value).filter(
      ([key]) => key !== 'kind' && key !== 'location'
    );
    const maxKeyLength = Math.max(
      ...argsToStringify.map(([key]) => key.length)
    );
    argsToStringify.forEach(
      ([key, value]) =>
        (result +=
          this.depthSpace() +
          key +
          ': ' +
          padSpaces(maxKeyLength - key.length) +
          this.stringify(value as Node) +
          '\n')
    );
    this.decrementDepth();
    result += this.depthSpace() + '}';
    return result;
  }

  escapeString(str: string): string {
    return str
      .replaceAll('\\', '\\\\')
      .replaceAll('\n', '\\n')
      .replaceAll('\0', '\\0')
      .replaceAll('\n', '\\n')
      .replaceAll('\t', '\\t')
      .replaceAll('\v', '\\v')
      .replaceAll('\f', '\\f')
      .replaceAll('\r', '\\r');
  }

  stringifyKind(obj: Node): string {
    switch (obj.kind) {
      case 'Literal':
        return this.stringifyLiteral(obj);
      case 'Local':
        return obj.name;
      case 'UnaryOperator':
        return this.stringifyUnaryOperator(obj);
      case 'BinaryOperator':
        return this.stringifyBinaryOperator(obj);
      case 'Call':
        return this.stringifyCall(obj);
      case 'If':
        return this.stringifyIf(obj);
      case 'While':
        return this.stringifyWhile(obj);
      case 'Switch':
        return this.stringifySwitch(obj);
      case 'Try':
        return this.stringifyTry(obj);
      case 'Nested':
        return this.stringifyNested(obj);
      case 'Pipe':
        return this.stringifyPipe(obj);
      case 'Function':
        return this.stringifyFunction(obj);
      case 'Block':
        return this.stringifyBlock(obj);
      case 'DeclareLocal':
        return this.stringifyDeclareLocal(obj);
      case 'Assign':
        return this.stringifyAssign(obj);
      case 'Index':
        return (
          this.stringify(obj.value) + '[' + this.stringify(obj.index) + ']'
        );
      case 'Attribute':
        return this.stringify(obj.value) + '.' + obj.key;
      case 'Array':
        return this.stringifyArray(obj.value, false);
      case 'Record':
        return this.stringifyRecord(obj);
      case 'KindedRecord':
        return this.stringifyKindedRecord(obj);
      case 'Import':
        return this.stringifyImport(obj);
      case 'Export':
        return this.stringifyExport(obj);
      case 'Comment':
        return this.stringifyComment(obj);
      case 'AttributeLambdaSugar':
        return '.' + obj.key;
      case 'TypeAlias':
        return 'type ' + obj.name + ' = ' + this.stringifyType(obj.type);
      case 'Identifier':
        return obj.name;
      case 'Intrinsic':
      case 'SwitchBranch':
      case 'KindedRecordEntry':
      case 'RecordEntry':
      case 'PositionalArgument':
      case 'NamedArgument':
        throw new Error('Failed to stringify kind: ' + obj.kind);
      default:
        const _: never = obj;
        _;
        throw new Error('Failed to stringify kind: ' + (obj as any).kind);
    }
  }

  stringifyLiteral(obj: LiteralNode): string {
    if (obj.text) {
      return obj.text;
    } else if (obj.value == null) {
      return 'null';
    } else if (typeof obj.value === 'boolean') {
      return String(obj.value);
    } else if (typeof obj.value === 'number') {
      return String(obj.value);
    } else if (typeof obj.value === 'string') {
      return this.stringifyRawString(obj.value);
    } else {
      throw new Error('Literal type not handled: ' + typeof obj.value);
    }
  }

  stringifyRawString(str: string): string {
    // TODO: find a better way to escape quotes
    if (str.includes('"')) {
      return "'" + this.escapeString(str) + "'";
    }
    return '"' + this.escapeString(str) + '"';
  }

  stringifyUnaryOperator(obj: UnaryOperatorNode): string {
    let result = obj.operator;
    if (isNode(obj.operand, 'UnaryOperator')) {
      result += ' ';
    }
    result += this.stringify(obj.operand);
    return result;
  }

  stringifyBinaryOperator(obj: BinaryOperatorNode): string {
    return (
      this.stringify(obj.left) +
      ' ' +
      obj.operator +
      ' ' +
      this.stringify(obj.right)
    );
  }

  stringifyDeclareLocal(obj: DeclareLocalNode): string {
    if (isNode(obj.value, 'Function')) {
      return this.stringifyNamedFunction(obj, obj.value);
    }
    let result = (obj.mutable ? 'var' : 'let') + ' ' + obj.name;
    if (obj.type) {
      result += this.stringifyTypeAnnotation(obj.type);
    }
    if (obj.value !== undefined) {
      result += ' = ' + this.stringify(obj.value);
    }
    return result;
  }

  stringifyNamedFunction(obj: DeclareLocalNode, func: FunctionNode): string {
    let argList =
      '(' +
      func.parameters
        .map(
          (p) => this.stringify(p.name) + this.stringifyTypeAnnotation(p.type)
        )
        .join(', ') +
      ')' +
      this.stringifyTypeAnnotation(func.returnType) +
      ' ';
    if (argList.length > 60) {
      argList = '(';
      this.incrementDepth();
      for (let parameter of func.parameters) {
        argList +=
          '\n' +
          this.depthSpace() +
          this.stringify(parameter.name) +
          this.stringifyTypeAnnotation(parameter.type);
      }
      this.decrementDepth();
      argList += '\n' + this.depthSpace() + ') ';
    }
    return 'fun ' + obj.name + argList + this.stringify(func.body);
  }

  stringifyTypeAnnotation(obj: TypeNode | null | undefined): string {
    return obj ? ': ' + this.stringifyType(obj) : '';
  }

  stringifyType(obj: TypeNode): string {
    switch (obj.kind) {
      case 'named':
        return obj.name;
      case 'kinded-record':
        return 'kinded-record';
      case 'array':
        return 'array<' + this.stringifyType(obj.item) + '>';
      case 'union':
        return obj.types.map((t) => this.stringifyType(t)).join(' | ');
      case 'record':
        return (
          '{' +
          Object.entries(obj.fields)
            .map((entry) => entry[0] + ': ' + this.stringifyType(entry[1]))
            .join(', ') +
          '}'
        );
      case 'nested':
        return '(' + this.stringifyType(obj.type) + ')';
      case 'function':
        return (
          '(' +
          obj.parameters
            .map(
              (param) => param.name.name + ': ' + this.stringifyType(param.type)
            )
            .join(', ') +
          ') => ' +
          this.stringifyType(obj.returnType)
        );
      case 'dict':
        return `dict<${this.stringifyType(obj.item)}>`;
      default:
        const _: never = obj;
        _;
        throw new Error('Unknown kind to stringify: ' + (obj as any)?.kind);
    }
  }

  stringifyNested(obj: NestedNode): string {
    return '(' + this.stringify(obj.node) + ')';
  }

  stringifyPipe(obj: PipeNode): string {
    const result = this.stringifyPipeSingleline(obj);
    if (result.length > 80 || result.includes('\n')) {
      return this.stringifyPipeMultiline(obj);
    }
    return result;
  }

  stringifyPipeSingleline(obj: PipeNode): string {
    let result = this.stringify(obj.first);
    for (let i = 0; i < obj.values.length; i++) {
      result += ' | ' + this.stringify(obj.values[i]);
    }
    return result;
  }

  stringifyPipeMultiline(obj: PipeNode): string {
    let result = '';
    const isLeftKindedRecord = obj.first.kind == 'KindedRecord';
    if (!isLeftKindedRecord) {
      this.incrementDepth();
      this.incrementDepth();
    }
    result += this.stringify(obj.first);
    if (!isLeftKindedRecord) {
      this.decrementDepth();
    }
    for (let index = 0; index < obj.values.length; index++) {
      const value = obj.values[index];
      if (isLeftKindedRecord) {
        if (index != 0) {
          result += '\n';
          result += this.depthSpace();
        }
      } else {
        result += '\n';
        result += this.depthSpace();
      }
      result += (isLeftKindedRecord ? (index == 0 ? ' ' : '  ') : ' ') + '| ';
      this.incrementDepth();
      result += this.stringify(value);
      this.decrementDepth();
    }
    if (!isLeftKindedRecord) {
      this.decrementDepth();
    }
    return result;
  }

  stringifyFunction(obj: FunctionNode): string {
    let result = '';
    if (obj.parameters.length === 0) {
      result += '()';
    } else if (obj.parameters.length === 1 && obj.parameters[0].type == null) {
      result += this.stringify(obj.parameters[0].name);
    } else {
      result +=
        '(' +
        (obj.parameters ?? [])
          .map(
            (p) => this.stringify(p.name) + this.stringifyTypeAnnotation(p.type)
          )
          .join(', ') +
        ')';
    }
    return result + ' => ' + this.stringify(obj.body);
  }

  stringifyBlock(obj: BlockNode): string {
    if (obj.children.length > 1) {
      return this.stringifyBlockMultiLine(obj);
    }
    const result = this.stringifyBlockOneLine(obj);
    if (result.length > 80 || result.includes('\n')) {
      return this.stringifyBlockMultiLine(obj);
    }
    return result;
  }

  stringifyBlockOneLine(obj: BlockNode): string {
    return (
      '{ ' + obj.children.map((child) => this.stringify(child)).join(' ') + ' }'
    );
  }

  stringifyBlockMultiLine(obj: BlockNode): string {
    let result = '{\n';
    this.incrementDepth();
    (obj.children ?? []).forEach((e) => {
      result += this.depthSpace() + this.stringify(e) + '\n';
      if (e.newLines) {
        for (let i = 0; i < e.newLines - 1; i++) {
          result += '\n';
        }
      }
    });
    this.decrementDepth();
    result += this.depthSpace() + '}';
    return result;
  }

  stringifyAssign(obj: AssignNode): string {
    return (
      'set ' + this.stringify(obj.address) + ' = ' + this.stringify(obj.value)
    );
  }

  stringifyImport(obj: ImportNode): string {
    return 'import ' + this.stringifyRawString(obj.path);
  }

  stringifyExport(obj: ExportNode): string {
    return 'export ' + this.stringify(obj.node);
  }

  stringifyComment(obj: CommentNode): string {
    let result = '//' + obj.text + '\n' + this.depthSpace();
    if (obj.node) {
      result += this.stringify(obj.node);
    }
    return result;
  }

  // TODO: Deprecated
  stringifyKindedRecord(obj: KindedRecordNode): string {
    const result = this.stringify(obj.kindOfRecord) + ' ';
    let bodyResult = this.stringifyKindedRecordBodySingleline(obj);
    if (bodyResult.includes('\n') || bodyResult.length > 40) {
      bodyResult = this.stringifyKindedRecordBodyMultiline(obj);
    }
    return result + bodyResult;
  }

  stringifyKindedRecordBodySingleline(obj: KindedRecordNode): string {
    if (obj.entries.length === 0 && obj.children.length === 0) {
      return '{}';
    }
    let result = '{ ';
    const entriesArray = [];
    const namedAttributesStringified = obj.entries
      .map(({ key, value, short }) => {
        const stringifiedKey = this.stringifyRecordKey(key);
        if (short != null) {
          return '-' + (short ? '-' : '!') + stringifiedKey;
        }
        return stringifiedKey + ': ' + this.stringify(value);
      })
      .join(', ');
    if (namedAttributesStringified !== '') {
      entriesArray.push(namedAttributesStringified);
    }
    if (
      obj.children &&
      Array.isArray(obj.children) &&
      obj.children.length > 0
    ) {
      entriesArray.push(
        obj.children.map((child) => this.stringify(child)).join(', ')
      );
    }
    result += entriesArray.join(', ');
    result += ' }';
    return result;
  }

  stringifyKindedRecordBodyMultiline(obj: KindedRecordNode): string {
    let result = '';
    if (obj.entries.length === 0 && obj.children.length === 0) {
      result += '{}';
      return result;
    }
    let longestEntry = 0;
    for (let entry of obj.entries) {
      if (entry.short != null) continue;
      longestEntry = Math.max(
        longestEntry,
        this.stringifyRecordKey(entry.key).length
      );
    }
    result = '{\n';
    this.incrementDepth();
    let hasNamedAttributes = false;
    obj.entries.forEach(({ key, value, short }) => {
      const stringifiedKey = this.stringifyRecordKey(key);
      hasNamedAttributes = true;
      if (short != null) {
        result +=
          this.depthSpace() + '-' + (short ? '-' : '!') + stringifiedKey + '\n';
      } else {
        result +=
          this.depthSpace() +
          stringifiedKey +
          ': ' +
          padSpaces(longestEntry - stringifiedKey.length) +
          this.stringify(value as any) +
          '\n';
      }
    });
    if (obj.children && Array.isArray(obj.children)) {
      obj.children.forEach((child, index) => {
        const content = this.stringify(child);
        if (hasNamedAttributes && index === 0) {
          result += '\n';
        }
        result += this.depthSpace() + content + '\n';
        if (child.newLines) {
          for (let i = 0; i < child.newLines - 1; i++) {
            result += '\n';
          }
        }
      });
    }
    this.decrementDepth();
    result += this.depthSpace() + '}';
    return result;
  }

  stringifyCall(obj: CallNode) {
    if (obj.shell) return this.stringifyCallShellLike(obj);
    // Maybe optimize this to not stringify twice ?
    if (obj.args.length > 3) {
      return this.stringifyCallMultiLine(obj);
    }
    const result = this.stringifyCallOneLine(obj);
    if ((result.includes('\n') || result.length > 60) && obj.args.length > 1) {
      return this.stringifyCallMultiLine(obj);
    }
    return result;
  }

  stringifyCallShellLike(obj: CallNode) {
    return (
      this.stringify(obj.value) +
      ' ' +
      obj.args
        .map((arg) => {
          if (arg.kind == 'NamedArgument') {
            if (arg.short != null) {
              return (
                '-' +
                (arg.short ? '-' : '!') +
                this.stringifyRecordKey(this.stringify(arg.name))
              );
            }
            return (
              this.stringifyRecordKey(this.stringify(arg.name)) +
              ': ' +
              this.stringify(arg.value)
            );
          }
          return this.stringify(arg.value);
        })
        .join(' ')
    );
  }

  stringifyCallOneLine(obj: CallNode) {
    return (
      this.stringify(obj.value) +
      '(' +
      obj.args
        .map((arg) => {
          if (arg.kind === 'NamedArgument') {
            if (arg.short != null) {
              return (
                '-' +
                (arg.short ? '-' : '!') +
                this.stringifyRecordKey(this.stringify(arg.name))
              );
            }
            return (
              this.stringifyRecordKey(this.stringify(arg.name)) +
              ': ' +
              this.stringify(arg.value)
            );
          }
          if (arg.kind === 'PositionalArgument') {
            return this.stringify(arg.value);
          }
          throw new Error('Unexpected argument kind: ' + (arg as any).kind);
        })
        .join(', ') +
      ')'
    );
  }

  stringifyIf(obj: IfNode) {
    const result = this.stringifyIfOneLine(obj);
    if (result.includes('\n') || result.length > 60) {
      return this.stringifyIfMultiLine(obj);
    }
    return result;
  }

  stringifyIfOneLine(obj: IfNode) {
    let result =
      'if (' +
      this.stringify(obj.condition) +
      ') ' +
      this.stringify(obj.ifTrue);
    if (obj.ifFalse) {
      const ifFalse = obj.ifFalse;
      if (isNode(ifFalse, 'If')) {
        result += ' else ' + this.stringifyIfOneLine(ifFalse);
      } else {
        result += ' else ' + this.stringify(ifFalse);
      }
    }
    return result;
  }

  stringifyIfMultiLine(obj: IfNode) {
    let result = 'if (' + this.stringify(obj.condition) + ') ';
    const ifTrue = obj.ifTrue;
    if (isNode(ifTrue, 'Block')) {
      result += this.stringifyBlockMultiLine(ifTrue);
    } else {
      result += this.stringify(ifTrue);
    }

    if (obj.ifFalse) {
      if (isNode(ifTrue, 'Block')) {
        result += ' ';
      } else {
        result += '\n' + this.depthSpace();
      }
      const ifFalse = obj.ifFalse;
      if (isNode(ifFalse, 'Block')) {
        result += 'else ' + this.stringifyBlockMultiLine(ifFalse);
      } else if (isNode(ifFalse, 'If')) {
        result += 'else ' + this.stringifyIfMultiLine(ifFalse);
      } else {
        result += 'else ' + this.stringify(ifFalse);
      }
    }
    return result;
  }

  stringifyWhile(obj: WhileNode) {
    const result = this.stringifyWhileOneLine(obj);
    if (result.includes('\n') || result.length > 60) {
      return this.stringifyWhileMultiLine(obj);
    }
    return result;
  }

  stringifyWhileOneLine(obj: WhileNode) {
    return (
      'while (' +
      this.stringify(obj.condition) +
      ') ' +
      this.stringify(obj.body)
    );
  }

  stringifyWhileMultiLine(obj: WhileNode) {
    let result = 'while (' + this.stringify(obj.condition) + ') ';
    const body = obj.body;
    if (isNode(body, 'Block')) {
      result += this.stringifyBlockMultiLine(body);
    } else {
      result += this.stringify(body);
    }
    return result;
  }

  stringifyWithIndent(obj: Node) {
    this.incrementDepth();
    const result = this.stringify(obj);
    this.decrementDepth();
    return result;
  }

  stringifySwitch(obj: SwitchNode) {
    let result = 'switch';
    if (obj.value) {
      result += ' (' + this.stringify(obj.value) + ')';
    }
    result += ' {\n';
    this.incrementDepth();
    const stringifiedBranches = obj.branches.map(
      (branch) =>
        [
          this.stringify(branch.comparator),
          this.stringifyWithIndent(branch.value),
        ] as const
    );
    const longestComparator = stringifiedBranches
      .map(([comparator]) => comparator.length)
      .reduce((prev, longest) => Math.max(prev, longest), 0);
    if (obj.defaultBranch) {
      stringifiedBranches.push([
        '_',
        this.stringifyWithIndent(obj.defaultBranch.value),
      ]);
    }
    stringifiedBranches.forEach(([comparator, value]) => {
      result += this.depthSpace() + comparator;
      result += padSpaces(longestComparator - comparator.length);
      result += ' => ';
      this.incrementDepth();
      result += value + '\n';
      this.decrementDepth();
    });
    this.decrementDepth();
    result += this.depthSpace() + '}';
    return result;
  }

  stringifyTry(obj: TryNode) {
    const result = this.stringifyTryOneLine(obj);
    if (result.includes('\n') || result.length > 60) {
      return this.stringifyTryMultiLine(obj);
    }
    return result;
  }

  stringifyTryOneLine(obj: TryNode) {
    let result =
      (obj.hasOnlyCatchKeyword ? '' : 'try ') + this.stringify(obj.node);
    if (obj.catchNode) {
      result += ' catch ' + this.stringify(obj.catchNode);
    }
    return result;
  }

  stringifyTryMultiLine(obj: TryNode) {
    let result = obj.hasOnlyCatchKeyword ? '' : 'try ';
    if (isNode(obj.node, 'Block')) {
      result += this.stringifyBlockMultiLine(obj.node);
    } else {
      result += this.stringify(obj.node);
    }

    if (obj.catchNode) {
      if (isNode(obj.catchNode, 'Block')) {
        result += ' catch ' + this.stringifyBlockMultiLine(obj.catchNode);
      } else {
        result += ' catch ' + this.stringify(obj.catchNode);
      }
    }
    return result;
  }

  stringifyCallMultiLine(obj: CallNode) {
    let result = this.stringify(obj.value) + '(\n';
    this.incrementDepth();
    let longestEntry = 0;
    for (let entry of obj.args) {
      if (entry.kind === 'NamedArgument') {
        if (entry.short != null) continue;
        longestEntry = Math.max(
          longestEntry,
          this.stringifyRecordKey(this.stringify(entry.name)).length
        );
      }
    }
    obj.args.forEach((arg) => {
      if (arg.kind === 'NamedArgument') {
        const identifier = this.stringifyRecordKey(this.stringify(arg.name));
        if (arg.short != null) {
          result +=
            this.depthSpace() +
            '-' +
            (arg.short ? '-' : '!') +
            this.stringifyRecordKey(this.stringify(arg.name)) +
            '\n';
        } else {
          result +=
            this.depthSpace() +
            identifier +
            ': ' +
            padSpaces(longestEntry - identifier.length) +
            this.stringify(arg.value) +
            '\n';
        }
      } else {
        result += this.depthSpace() + this.stringify(arg.value) + '\n';
      }
    });
    this.decrementDepth();
    result += this.depthSpace() + ')';
    return result;
  }

  stringifyArray(value: Node[], isRoot: boolean): string {
    // Maybe optimize this to not stringify twice ?
    if (value.length > 3 || this.depthCounter === 0) {
      return this.stringifyArrayMultiline(value, isRoot);
    }
    const result = this.stringifyArraySingleline(value);
    if (result.includes('\n') || result.length > 60) {
      return this.stringifyArrayMultiline(value, isRoot);
    }
    return result;
  }

  stringifyArraySingleline(value: Node[]): string {
    if (value.length === 0) {
      return '[]';
    }
    return '[' + value.map((child) => this.stringify(child)).join(', ') + ']';
  }

  stringifyArrayMultiline(value: Node[], isRoot: boolean): string {
    if (value.length === 0) {
      return '[]';
    }
    let result = '';
    if (!isRoot) {
      result = '[\n';
      this.incrementDepth();
    }
    value.forEach((child) => {
      const stringifiedElement = this.stringify(child);
      result += this.depthSpace() + stringifiedElement + '\n';
      if (child.newLines) {
        for (let i = 0; i < child.newLines - 1; i++) {
          result += '\n';
        }
      }
    });
    if (!isRoot) {
      this.decrementDepth();
      result += this.depthSpace() + ']';
    }
    return result;
  }

  stringifyRecord(obj: RecordNode): string {
    if (Object.entries(obj.entries).length > 3) {
      return this.stringifyRecordMultiline(obj);
    }
    const result = this.stringifyRecordSingleline(obj);
    if (result.includes('\n') || result.length > 60) {
      return this.stringifyRecordMultiline(obj);
    }
    return result;
  }

  stringifyRecordSingleline(obj: RecordNode): string {
    if (obj.entries.length === 0) {
      return '{}';
    }
    let result = '{';
    result += obj.entries
      .map(({ key, value }) => {
        const identifier = this.stringifyRecordKey(key);
        return identifier + ': ' + this.stringify(value);
      })
      .join(', ');
    result += '}';
    return result;
  }

  stringifyRecordMultiline(obj: RecordNode): string {
    let longestEntry = 0;
    for (let entry of obj.entries) {
      longestEntry = Math.max(
        longestEntry,
        this.stringifyRecordKey(entry.key).length
      );
    }
    let result = '{\n';
    this.incrementDepth();
    obj.entries.forEach(({ key, value }) => {
      const identifier = this.stringifyRecordKey(key);
      result +=
        this.depthSpace() +
        identifier +
        ': ' +
        padSpaces(longestEntry - identifier.length) +
        this.stringify(value) +
        '\n';
    });
    this.decrementDepth();
    result += this.depthSpace() + '}';
    return result;
  }

  stringifyRecordKey(id: string) {
    // TODO: check this regex is the same as in parser
    if (id.match(/^[A-Za-z_$][A-Za-z_$0-9]*$/)) {
      return id;
    }
    return `"${id}"`;
  }

  incrementDepth() {
    this.depthCounter++;
  }

  decrementDepth() {
    this.depthCounter--;
  }

  private depthCounter = 0;

  depthSpace(): string {
    let result = '';
    for (let i = 0; i < this.depthCounter; i++) {
      result += '  ';
    }
    return result;
  }
}

function padSpaces(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ' ';
  }
  return result;
}
