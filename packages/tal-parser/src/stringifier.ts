import {
  BinaryOperatorExpression,
  BlockOfExpressionsExpression,
  CallExpression,
  DeclareLocalExpression,
  DerefExpression,
  Expression,
  FunctionExpression,
  isExpr,
  KindedObjectExpression,
  ObjectExpression,
  PipeExpression,
  QuoteExpression,
  SetValueExpression,
  SubExpressionExpression,
  UnaryOperatorExpression,
} from './expression';

export function stringify(value: Expression[]): string {
  return new Stringifier().stringify(value, true);
}

class Stringifier {
  stringify(value: Expression | Expression[], isRoot = false): string {
    if (value === null) {
      return 'null';
    } else if (Array.isArray(value)) {
      return this.stringifyArray(value, isRoot);
    } else if (typeof value == 'object') {
      return this.stringifyKind(value);
    } else if (typeof value == 'string') {
      // TODO: find a better way to escape quotes
      if (value.includes('"')) {
        return "'" + this.escapeString(value) + "'";
      }
      return '"' + this.escapeString(value) + '"';
    } else if (typeof value == 'number') {
      return String(value);
    } else if (typeof value == 'boolean') {
      return String(value);
    }
    throw new Error('Expression kind not supported for serialization');
  }

  stringifyCustomKind(value: Expression & object): string {
    const result = this.stringifyCustomKindSingleLine(value);
    if (result.length > 80 || result.includes('\n')) {
      return this.stringifyCustomKindMultiLine(value);
    }
    return result;
  }

  stringifyCustomKindSingleLine(value: Expression & object): string {
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

  stringifyCustomKindMultiLine(value: Expression & object): string {
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
    return str.replace('\n', '\\n');
  }

  stringifyKind(obj: Expression & object): string {
    switch (obj.kind) {
      case 'Local':
        return obj.name;
      case 'UnaryOperator':
        return this.stringifyUnaryOperator(obj);
      case 'BinaryOperator':
        return this.stringifyBinaryOperator(obj);
      case 'Call':
        return this.stringifyCall(obj);
      case 'Deref':
        return this.stringifyDeref(obj);
      case 'SubExpression':
        return this.stringifySubExpression(obj);
      case 'Pipe':
        return this.stringifyPipe(obj);
      case 'Quote':
        return this.stringifyQuote(obj);
      case 'Function':
        return this.stringifyFunction(obj);
      case 'BlockOfExpressions':
        return this.stringifyBlockOfExpressions(obj);
      case 'DeclareLocal':
        return this.stringifyDeclareLocal(obj);
      case 'SetValue':
        return this.stringifySetValue(obj);
      case 'Index':
        return (
          this.stringify(obj.value) + '[' + this.stringify(obj.index) + ']'
        );
      case 'Attribute':
        return this.stringify(obj.value) + '.' + obj.key;
      case 'Array':
        return this.stringifyArray(obj.value, false);
      case 'Object':
        return this.stringifyObject(obj);
      case 'Value':
        return this.stringify(obj.value as any);
      case 'KindedObject':
        return this.stringifyKindedObject(obj);
      default:
        return this.stringifyCustomKind(obj);
    }
  }

  stringifyDeref(obj: DerefExpression): string {
    return 'deref ' + this.stringify(obj.value);
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
      result +=
        ' ' +
        obj.values[i].pipeKind +
        ' ' +
        this.stringify(obj.values[i].value);
    }
    return result;
  }

  stringifyPipeMultiline(obj: PipeExpression): string {
    let result = '';
    this.incrementDepth();
    this.incrementDepth();
    result += this.stringify(obj.first);
    this.decrementDepth();
    for (let index = 0; index < obj.values.length; index++) {
      const value = obj.values[index];
      result += '\n';
      result += this.depthSpace();
      result += value.pipeKind + (value.pipeKind === '|' ? ' ' : '') + ' ';
      this.incrementDepth();
      result += this.stringify(value.value);
      this.decrementDepth();
    }
    this.decrementDepth();
    return result;
  }

  stringifyQuote(obj: QuoteExpression): string {
    return '() => ' + this.stringify(obj.children[0]);
  }

  stringifyFunction(obj: FunctionExpression): string {
    return (
      '(' +
      (obj.parameters ?? []).join(', ') +
      ') => ' +
      this.stringify(obj.body)
    );
  }

  stringifyBlockOfExpressions(obj: BlockOfExpressionsExpression): string {
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
    ((obj.children ?? []) as any[]).forEach(e => {
      result += this.depthSpace() + this.stringify(e) + '\n';
    });
    this.decrementDepth();
    result += this.depthSpace() + '}';
    return result;
  }

  stringifySetValue(obj: SetValueExpression): string {
    return (
      'set ' + this.stringify(obj.address) + ' = ' + this.stringify(obj.value)
    );
  }

  // TODO: Deprecated
  stringifyKindedObject(obj: KindedObjectExpression): string {
    const result = obj.value.kind + ' ';
    let bodyResult = this.stringifyKindedObjectBodySingleline(obj);
    if (bodyResult.includes('\n') || bodyResult.length > 40) {
      bodyResult = this.stringifyKindedObjectBodyMultiline(obj);
    }
    return result + bodyResult;
  }

  stringifyKindedObjectBodySingleline(obj2: KindedObjectExpression): string {
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
        const stringifiedKey = this.stringifyObjectKey(key);
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

  stringifyKindedObjectBodyMultiline(obj2: KindedObjectExpression): string {
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
        this.stringifyObjectKey(entry[0]).length
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
        const stringifiedKey = this.stringifyObjectKey(key);
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
      let previousChildContent: string | null = null;
      (obj.children as any[]).forEach((child, index) => {
        const content = this.stringify(child);
        // Add an empty line when one of this conditions match :
        //  Current is a multiline block
        //  The current kinded object has attributes and the current child is the first one
        //  The previous child is a multiline block
        if (
          (index !== 0 && content.endsWith('}') && content.includes('\n')) ||
          (index === 0 && hasNamedAttributes) ||
          (previousChildContent != null &&
            previousChildContent.endsWith('}') &&
            previousChildContent.includes('\n'))
        ) {
          result += '\n';
        }
        result += this.depthSpace() + content + '\n';
        previousChildContent = content;
      });
    }
    this.decrementDepth();
    result += this.depthSpace() + '}';
    return result;
  }

  stringifyCall(obj: CallExpression) {
    if (isExpr(obj.value, 'Local') && obj.value.name == 'if') {
      return this.stringifyIf(obj);
    }
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
              this.stringifyObjectKey(arg.name) +
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

  stringifyIf(obj: CallExpression) {
    const result = this.stringifyIfOneLine(obj);
    if ((result.includes('\n') || result.length > 60) && obj.args.length > 1) {
      return this.stringifyIfMultiLine(obj);
    }
    return result;
  }

  stringifyIfOneLine(obj: CallExpression) {
    let result = 'if (' + this.stringify(obj.args[0].value) + ') ';
    const ifTrue = obj.args[1].value;
    if (isExpr(ifTrue, 'BlockOfExpressions')) {
      result += this.stringifyBlockOfExpressionsOneLine(ifTrue);
    } else {
      result += this.stringify(ifTrue);
    }
    if (obj.args.length > 1 && obj.args[2]) {
      const ifFalse = obj.args[2].value;
      if (isExpr(ifFalse, 'BlockOfExpressions')) {
        result += ' else ' + this.stringifyBlockOfExpressionsOneLine(ifFalse);
      } else if (
        isExpr(ifFalse, 'Call') &&
        isExpr(ifFalse.value, 'Local') &&
        ifFalse.value.name == 'if'
      ) {
        result += ' else ' + this.stringifyIfOneLine(ifFalse);
      } else {
        result += ' else ' + this.stringify(ifFalse);
      }
    }
    return result;
  }

  stringifyIfMultiLine(obj: CallExpression) {
    let result = 'if (' + this.stringify(obj.args[0].value) + ') ';
    const ifTrue = obj.args[1].value;
    if (isExpr(ifTrue, 'BlockOfExpressions')) {
      result += this.stringifyBlockOfExpressionsMultiLine(ifTrue);
    } else {
      result += this.stringify(ifTrue);
    }

    if (obj.args.length > 1 && obj.args[2]) {
      const ifFalse = obj.args[2].value;
      if (isExpr(ifFalse, 'BlockOfExpressions')) {
        result += ' else ' + this.stringifyBlockOfExpressionsMultiLine(ifFalse);
      } else if (
        isExpr(ifFalse, 'Call') &&
        isExpr(ifFalse.value, 'Local') &&
        ifFalse.value.name == 'if'
      ) {
        result += ' else ' + this.stringifyIfMultiLine(ifFalse);
      } else {
        result += ' else ' + this.stringify(ifFalse);
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
          this.stringifyObjectKey(entry.name).length
        );
      }
    }
    obj.args.forEach((arg: any) => {
      if (arg.argKind === 'Named') {
        const identifier = this.stringifyObjectKey(arg.name);
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
    value.forEach((child: any, index) => {
      const stringifiedElement = this.stringify(child);
      result += this.depthSpace() + stringifiedElement + '\n';
      if (index !== value.length - 1 && stringifiedElement.at(-1) === '}') {
        result += '\n';
      }
    });
    if (!isRoot) {
      this.decrementDepth();
      result += this.depthSpace() + ']';
    }
    return result;
  }

  stringifyObject(obj: ObjectExpression): string {
    if (Object.entries(obj.value).length > 3) {
      return this.stringifyObjectMultiline(obj);
    }
    const result = this.stringifyObjectSingleline(obj);
    if (result.includes('\n') || result.length > 60) {
      return this.stringifyObjectMultiline(obj);
    }
    return result;
  }

  stringifyObjectSingleline(obj: ObjectExpression): string {
    const entries = Object.entries(obj.value);
    if (entries.length === 0) {
      return '{}';
    }
    let result = '{';
    result += entries
      .map(([key, value]) => {
        const identifier = this.stringifyObjectKey(key);
        return identifier + ': ' + this.stringify(value);
      })
      .join(', ');
    result += '}';
    return result;
  }

  stringifyObjectMultiline(obj: ObjectExpression): string {
    const entries = Object.entries(obj.value);
    let longestEntry = 0;
    for (let entry of entries) {
      longestEntry = Math.max(
        longestEntry,
        this.stringifyObjectKey(entry[0]).length
      );
    }
    let result = '{\n';
    this.incrementDepth();
    entries.forEach(([key, value]) => {
      const identifier = this.stringifyObjectKey(key);
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

  stringifyObjectKey(id: string) {
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
