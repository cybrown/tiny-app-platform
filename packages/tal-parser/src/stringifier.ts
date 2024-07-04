import {
  BinaryOperatorExpression,
  BlockOfExpressionsExpression,
  CallExpression,
  DeclareLocalExpression,
  Expression,
  FunctionExpression,
  IfExpression,
  isExpr,
  KindedRecordExpression,
  LiteralExpression,
  RecordExpression,
  PipeExpression,
  AssignExpression,
  SubExpressionExpression,
  TryExpression,
  UnaryOperatorExpression,
  SwitchExpression,
  ImportExpression,
  ExportExpression,
  CommentExpression,
} from './expression';

export function stringify(value: Expression[]): string {
  return new Stringifier().stringify(value, true);
}

class Stringifier {
  stringify(value: Expression | Expression[], isRoot = false): string {
    if (Array.isArray(value)) {
      return this.stringifyArray(value, isRoot);
    } else {
      return this.stringifyKind(value);
    }
  }

  stringifyCustomKind(value: Expression): string {
    const result = this.stringifyCustomKindSingleLine(value);
    if (result.length > 80 || result.includes('\n')) {
      return this.stringifyCustomKindMultiLine(value);
    }
    return result;
  }

  stringifyCustomKindSingleLine(value: Expression): string {
    return (
      '%' +
      value.kind +
      ' { ' +
      Object.entries(value)
        .filter(([key]) => key !== 'kind' && key !== 'location')
        .map(([key, value]) => key + ': ' + this.stringify(value as Expression))
        .join(', ') +
      ' }'
    );
  }

  stringifyCustomKindMultiLine(value: Expression): string {
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
          this.stringify(value as Expression) +
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

  stringifyKind(obj: Expression): string {
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
      case 'Switch':
        return this.stringifySwitch(obj);
      case 'Try':
        return this.stringifyTry(obj);
      case 'SubExpression':
        return this.stringifySubExpression(obj);
      case 'Pipe':
        return this.stringifyPipe(obj);
      case 'Function':
        return this.stringifyFunction(obj);
      case 'BlockOfExpressions':
        return this.stringifyBlockOfExpressions(obj);
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
      default:
        return this.stringifyCustomKind(obj);
    }
  }

  stringifyLiteral(obj: LiteralExpression): string {
    if (obj.value == null) {
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

  stringifyUnaryOperator(obj: UnaryOperatorExpression): string {
    let result = obj.operator;
    if (isExpr(obj.operand, 'UnaryOperator')) {
      result += ' ';
    }
    result += this.stringify(obj.operand);
    return result;
  }

  stringifyBinaryOperator(obj: BinaryOperatorExpression): string {
    return (
      this.stringify(obj.left) +
      ' ' +
      obj.operator +
      ' ' +
      this.stringify(obj.right)
    );
  }

  stringifyDeclareLocal(obj: DeclareLocalExpression): string {
    if (isExpr(obj.value, 'Function')) {
      return this.stringifyNamedFunction(obj, obj.value);
    }
    let result = (obj.mutable ? 'var' : 'let') + ' ' + obj.name;
    if (obj.value !== undefined) {
      result += ' = ' + this.stringify(obj.value);
    }
    return result;
  }

  stringifyNamedFunction(
    obj: DeclareLocalExpression,
    func: FunctionExpression
  ): string {
    let argList = '(' + func.parameters.join(', ') + ') ';
    if (argList.length > 60) {
      argList = '(';
      this.incrementDepth();
      for (let parameter of func.parameters) {
        argList += '\n' + this.depthSpace() + parameter;
      }
      this.decrementDepth();
      argList += '\n' + this.depthSpace() + ') ';
    }
    return 'fun ' + obj.name + argList + this.stringify(func.body);
  }

  stringifySubExpression(obj: SubExpressionExpression): string {
    return '(' + this.stringify(obj.expr) + ')';
  }

  stringifyPipe(obj: PipeExpression): string {
    const result = this.stringifyPipeSingleline(obj);
    if (result.length > 80 || result.includes('\n')) {
      return this.stringifyPipeMultiline(obj);
    }
    return result;
  }

  stringifyPipeSingleline(obj: PipeExpression): string {
    let result = this.stringify(obj.first);
    for (let i = 0; i < obj.values.length; i++) {
      result += ' | ' + this.stringify(obj.values[i]);
    }
    return result;
  }

  stringifyPipeMultiline(obj: PipeExpression): string {
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

  stringifyFunction(obj: FunctionExpression): string {
    let result = '';
    if (obj.parameters.length === 0) {
      result += '()';
    } else if (obj.parameters.length === 1) {
      result += obj.parameters[0];
    } else {
      result += '(' + (obj.parameters ?? []).join(', ') + ')';
    }
    return result + ' => ' + this.stringify(obj.body);
  }

  stringifyBlockOfExpressions(obj: BlockOfExpressionsExpression): string {
    if (obj.children.length > 1) {
      return this.stringifyBlockOfExpressionsMultiLine(obj);
    }
    const result = this.stringifyBlockOfExpressionsOneLine(obj);
    if (result.length > 80 || result.includes('\n')) {
      return this.stringifyBlockOfExpressionsMultiLine(obj);
    }
    return result;
  }

  stringifyBlockOfExpressionsOneLine(
    obj: BlockOfExpressionsExpression
  ): string {
    return (
      '{ ' + obj.children.map(child => this.stringify(child)).join(' ') + ' }'
    );
  }

  stringifyBlockOfExpressionsMultiLine(
    obj: BlockOfExpressionsExpression
  ): string {
    let result = '{\n';
    this.incrementDepth();
    (obj.children ?? []).forEach(e => {
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

  stringifyAssign(obj: AssignExpression): string {
    return (
      'set ' + this.stringify(obj.address) + ' = ' + this.stringify(obj.value)
    );
  }

  stringifyImport(obj: ImportExpression): string {
    return 'import ' + this.stringifyRawString(obj.path);
  }

  stringifyExport(obj: ExportExpression): string {
    return 'export ' + this.stringify(obj.expr);
  }

  stringifyComment(obj: CommentExpression): string {
    let result = '//' + obj.text + '\n' + this.depthSpace();
    if (obj.expr) {
      result += this.stringify(obj.expr);
    }
    return result;
  }

  // TODO: Deprecated
  stringifyKindedRecord(obj: KindedRecordExpression): string {
    const result = this.stringify(obj.value.kind) + ' ';
    let bodyResult = this.stringifyKindedRecordBodySingleline(obj);
    if (bodyResult.includes('\n') || bodyResult.length > 40) {
      bodyResult = this.stringifyKindedRecordBodyMultiline(obj);
    }
    return result + bodyResult;
  }

  stringifyKindedRecordBodySingleline(obj2: KindedRecordExpression): string {
    const obj = obj2.value;
    const entries = Object.entries(obj);
    if (
      entries.length === 1 ||
      (entries.length === 2 &&
        Array.isArray(obj.children) &&
        obj.children.length === 0)
    ) {
      return '{}';
    }
    let result = '{ ';
    const entriesArray = [];
    const namedAttributesStringified = entries
      .filter(entry => entry[0] !== 'kind')
      .filter(
        entry =>
          entry[0] !== 'children' ||
          (entry[0] === 'children' && !Array.isArray(obj.children))
      )
      .map(([key, value]) => {
        const stringifiedKey = this.stringifyRecordKey(key);
        return stringifiedKey + ': ' + this.stringify(value as any);
      })
      .join(', ');
    if (namedAttributesStringified !== '') {
      entriesArray.push(namedAttributesStringified);
    }
    if (obj.children && Array.isArray(obj.children)) {
      entriesArray.push(
        obj.children.map((child: any) => this.stringify(child)).join(', ')
      );
    }
    result += entriesArray.join(', ');
    result += ' }';
    return result;
  }

  stringifyKindedRecordBodyMultiline(obj2: KindedRecordExpression): string {
    const obj = obj2.value;
    const entries = Object.entries(obj);
    let result = '';
    if (
      entries.length === 1 ||
      (entries.length === 2 &&
        Array.isArray(obj.children) &&
        obj.children.length === 0)
    ) {
      result += '{}';
      return result;
    }
    let longestEntry = 0;
    for (let entry of entries) {
      if (entry[0] === 'children' || entry[0] === 'kind') {
        continue;
      }
      longestEntry = Math.max(
        longestEntry,
        this.stringifyRecordKey(entry[0]).length
      );
    }
    result = '{\n';
    this.incrementDepth();
    let hasNamedAttributes = false;
    entries
      .filter(entry => entry[0] !== 'kind')
      .filter(
        entry =>
          entry[0] !== 'children' ||
          (entry[0] === 'children' && !Array.isArray(obj.children))
      )
      .forEach(([key, value]) => {
        const stringifiedKey = this.stringifyRecordKey(key);
        hasNamedAttributes = true;
        result +=
          this.depthSpace() +
          stringifiedKey +
          ': ' +
          padSpaces(longestEntry - stringifiedKey.length) +
          this.stringify(value as any) +
          '\n';
      });
    if (obj.children && Array.isArray(obj.children)) {
      (obj.children as Expression[]).forEach((child, index) => {
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

  stringifyCall(obj: CallExpression) {
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

  stringifyCallOneLine(obj: CallExpression) {
    return (
      this.stringify(obj.value) +
      '(' +
      obj.args
        .map((arg: any) => {
          if (arg.argKind === 'Named') {
            return (
              this.stringifyRecordKey(arg.name) +
              ': ' +
              this.stringify(arg.value)
            );
          } else if (arg.argKind === 'Positional') {
            return this.stringify(arg.value);
          } else {
            return this.stringify(arg);
          }
        })
        .join(', ') +
      ')'
    );
  }

  stringifyIf(obj: IfExpression) {
    const result = this.stringifyIfOneLine(obj);
    if (result.includes('\n') || result.length > 60) {
      return this.stringifyIfMultiLine(obj);
    }
    return result;
  }

  stringifyIfOneLine(obj: IfExpression) {
    let result = 'if (' + this.stringify(obj.condition) + ') ';
    const ifTrue = obj.ifTrue;
    if (isExpr(ifTrue, 'BlockOfExpressions')) {
      result += this.stringifyBlockOfExpressionsOneLine(ifTrue);
    } else {
      result += this.stringify(ifTrue);
    }
    if (obj.ifFalse) {
      const ifFalse = obj.ifFalse;
      if (isExpr(ifFalse, 'BlockOfExpressions')) {
        result += ' else ' + this.stringifyBlockOfExpressionsOneLine(ifFalse);
      } else if (isExpr(ifFalse, 'If')) {
        result += ' else ' + this.stringifyIfOneLine(ifFalse);
      } else {
        throw new Error('Unreachable');
      }
    }
    return result;
  }

  stringifyIfMultiLine(obj: IfExpression) {
    let result = 'if (' + this.stringify(obj.condition) + ') ';
    const ifTrue = obj.ifTrue;
    if (isExpr(ifTrue, 'BlockOfExpressions')) {
      result += this.stringifyBlockOfExpressionsMultiLine(ifTrue);
    } else {
      throw new Error('Unreachable');
    }

    if (obj.ifFalse) {
      const ifFalse = obj.ifFalse;
      if (isExpr(ifFalse, 'BlockOfExpressions')) {
        result += ' else ' + this.stringifyBlockOfExpressionsMultiLine(ifFalse);
      } else if (isExpr(ifFalse, 'If')) {
        result += ' else ' + this.stringifyIfMultiLine(ifFalse);
      } else {
        throw new Error('Unreachable');
      }
    }
    return result;
  }

  stringifyWithIndent(obj: Expression) {
    this.incrementDepth();
    const result = this.stringify(obj);
    this.decrementDepth();
    return result;
  }

  stringifySwitch(obj: SwitchExpression) {
    let result = 'switch';
    if (obj.value) {
      result += ' (' + this.stringify(obj.value) + ')';
    }
    result += ' {\n';
    this.incrementDepth();
    const stringifiedBranches = obj.branches.map(
      branch =>
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

  stringifyTry(obj: TryExpression) {
    const result = this.stringifyTryOneLine(obj);
    if (result.includes('\n') || result.length > 60) {
      return this.stringifyTryMultiLine(obj);
    }
    return result;
  }

  stringifyTryOneLine(obj: TryExpression) {
    let result = 'try ';
    if (isExpr(obj.expr, 'BlockOfExpressions')) {
      result += this.stringifyBlockOfExpressionsOneLine(obj.expr);
    } else {
      result += this.stringify(obj.expr);
    }
    if (obj.catchExpr) {
      if (isExpr(obj.catchExpr, 'BlockOfExpressions')) {
        result +=
          ' catch ' + this.stringifyBlockOfExpressionsOneLine(obj.catchExpr);
      } else {
        result += ' catch ' + this.stringify(obj.catchExpr);
      }
    }
    return result;
  }

  stringifyTryMultiLine(obj: TryExpression) {
    let result = 'try ';
    if (isExpr(obj.expr, 'BlockOfExpressions')) {
      result += this.stringifyBlockOfExpressionsMultiLine(obj.expr);
    } else {
      result += this.stringify(obj.expr);
    }

    if (obj.catchExpr) {
      if (isExpr(obj.catchExpr, 'BlockOfExpressions')) {
        result +=
          ' catch ' + this.stringifyBlockOfExpressionsMultiLine(obj.catchExpr);
      } else {
        result += ' catch ' + this.stringify(obj.catchExpr);
      }
    }
    return result;
  }

  stringifyCallMultiLine(obj: CallExpression) {
    let result = this.stringify(obj.value) + '(\n';
    this.incrementDepth();
    let longestEntry = 0;
    for (let entry of obj.args) {
      if (entry.argKind === 'Named') {
        longestEntry = Math.max(
          longestEntry,
          this.stringifyRecordKey(entry.name).length
        );
      }
    }
    obj.args.forEach((arg: any) => {
      if (arg.argKind === 'Named') {
        const identifier = this.stringifyRecordKey(arg.name);
        result +=
          this.depthSpace() +
          identifier +
          ': ' +
          padSpaces(longestEntry - identifier.length) +
          this.stringify(arg.value) +
          '\n';
      } else {
        result += this.depthSpace() + this.stringify(arg.value) + '\n';
      }
    });
    this.decrementDepth();
    result += this.depthSpace() + ')';
    return result;
  }

  stringifyArray(value: Expression[], isRoot: boolean): string {
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

  stringifyArraySingleline(value: Expression[]): string {
    if (value.length === 0) {
      return '[]';
    }
    return '[' + value.map(child => this.stringify(child)).join(', ') + ']';
  }

  stringifyArrayMultiline(value: Expression[], isRoot: boolean): string {
    if (value.length === 0) {
      return '[]';
    }
    let result = '';
    if (!isRoot) {
      result = '[\n';
      this.incrementDepth();
    }
    value.forEach(child => {
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

  stringifyRecord(obj: RecordExpression): string {
    if (Object.entries(obj.value).length > 3) {
      return this.stringifyRecordMultiline(obj);
    }
    const result = this.stringifyRecordSingleline(obj);
    if (result.includes('\n') || result.length > 60) {
      return this.stringifyRecordMultiline(obj);
    }
    return result;
  }

  stringifyRecordSingleline(obj: RecordExpression): string {
    const entries = Object.entries(obj.value);
    if (entries.length === 0) {
      return '{}';
    }
    let result = '{';
    result += entries
      .map(([key, value]) => {
        const identifier = this.stringifyRecordKey(key);
        return identifier + ': ' + this.stringify(value);
      })
      .join(', ');
    result += '}';
    return result;
  }

  stringifyRecordMultiline(obj: RecordExpression): string {
    const entries = Object.entries(obj.value);
    let longestEntry = 0;
    for (let entry of entries) {
      longestEntry = Math.max(
        longestEntry,
        this.stringifyRecordKey(entry[0]).length
      );
    }
    let result = '{\n';
    this.incrementDepth();
    entries.forEach(([key, value]) => {
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
