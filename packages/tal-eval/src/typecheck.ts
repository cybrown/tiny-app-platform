import { Node } from 'tal-parser';
import { AnyForNever } from './core';

type TypeAny = {
  kind: 'any';
};

type TypeNull = {
  kind: 'null';
};

type TypeNumber = {
  kind: 'number';
};

type TypeString = {
  kind: 'string';
};

type TypeBoolean = {
  kind: 'boolean';
};

type TypeKindedRecord = {
  kind: 'kinded-record';
};

type TypeUnion = {
  kind: 'union';
  types: Type[];
};

type TypeArray = {
  kind: 'array';
  item: Type;
};

type TypeRecord = {
  kind: 'record';
  fields: Record<string, Type>;
};

type TypeParameter = {
  name: string;
  type: Type;
};

type TypeFunction = {
  kind: 'function';
  parameters: TypeParameter[];
  returnType: Type;
};

function typeNull(): TypeNull {
  return {
    kind: 'null',
  };
}

function typeAny(): TypeAny {
  return {
    kind: 'any',
  };
}

function typeNumber(): TypeNumber {
  return {
    kind: 'number',
  };
}

function typeString(): TypeString {
  return {
    kind: 'string',
  };
}

function typeBoolean(): TypeBoolean {
  return {
    kind: 'boolean',
  };
}

function typeKindedRecord(): TypeKindedRecord {
  return {
    kind: 'kinded-record',
  };
}

function typeArray(itemType: Type): TypeArray {
  return {
    kind: 'array',
    item: itemType,
  };
}

function typeFunction(
  parametersType: TypeParameter[],
  returnType: Type
): TypeFunction {
  return {
    kind: 'function',
    parameters: parametersType,
    returnType: returnType,
  };
}

function typeUnion(...types: Type[]): TypeUnion {
  for (let type of types) {
    if (type.kind == 'any') {
      throw new Error("Can't build an union type with any");
    }
    if (type.kind == 'union') {
      throw new Error("Can't build an union type within an other union type");
    }
  }
  return {
    kind: 'union',
    types,
  };
}

function typeRecord(fields: Record<string, Type>): TypeRecord {
  return {
    kind: 'record',
    fields,
  };
}

type Type =
  | TypeNumber
  | TypeString
  | TypeBoolean
  | TypeNull
  | TypeKindedRecord
  | TypeAny
  | TypeUnion
  | TypeArray
  | TypeRecord
  | TypeFunction;

export class TypeChecker {
  private types = new Map<Node, Type>();
  private _errors: [Node, string][] = [];
  private currentContext: Record<string, { type: Type; mutable: boolean }> = {};
  private contextStack: Record<string, { type: Type; mutable: boolean }>[] = [];

  public get errors() {
    return this._errors;
  }

  public clearErrors() {
    this._errors.length = 0;
  }

  private defType(node: Node, type: Type): Type {
    this.types.set(node, type);
    return type;
  }

  private defError(node: Node, error: string): void {
    this._errors.push([node, error]);
  }

  private defValue(name: string, type: Type, mutable: boolean): Type {
    this.currentContext[name] = { type, mutable };
    return type;
  }

  private pushContext() {
    this.contextStack.push(this.currentContext);
    this.currentContext = {};
  }

  private popContext() {
    const newCurrentContext = this.contextStack.pop();
    if (!newCurrentContext) {
      throw new Error('type context underflow');
    }
    this.currentContext = newCurrentContext;
  }

  private getValueType(name: string): { type: Type; mutable: boolean } | null {
    if (Object.hasOwn(this.currentContext, name)) {
      return this.currentContext[name];
    }
    for (let ctx of this.contextStack.reverse()) {
      if (Object.hasOwn(ctx, name)) {
        return ctx[name];
      }
    }
    return null;
  }

  check(node: Node): Type {
    switch (node.kind) {
      case 'Literal':
        if (node.value == null) {
          return this.defType(node, typeNull());
        }
        if (typeof node.value == 'number') {
          return this.defType(node, typeNumber());
        }
        if (typeof node.value == 'string') {
          return this.defType(node, typeString());
        }
        if (typeof node.value == 'boolean') {
          return this.defType(node, typeBoolean());
        }
        this._errors.push([node, 'Unsupported literal']);
        return this.defType(node, typeAny());
      case 'DeclareLocal':
        if (node.value) {
          // TODO: Is has type annotation, check for compatibility and use it as value type
          this.defValue(node.name, this.check(node.value), node.mutable);
        } else {
          // TODO: set type annotation as type
          this.defValue(node.name, typeNull(), node.mutable);
        }
        return this.defType(node, typeNull());
      case 'BinaryOperator': {
        const left = this.check(node.left);
        const right = this.check(node.right);

        if (isAssignableToBoolean(left) && isAssignableToBoolean(right)) {
          if (!BINARY_OPERATOR_BOOLEAN.includes(node.operator)) {
            this.defError(
              node,
              `Operator ${node.operator} not compatible with type boolean`
            );
          }
          return this.defType(node, typeBoolean());
        }

        if (isAssignableToNumber(left) && isAssignableToNumber(right)) {
          if (!BINARY_OPERATOR_NUMBER.includes(node.operator)) {
            this.defError(
              node,
              `Operator ${node.operator} not compatible with type number`
            );
          }
          return this.defType(
            node,
            ['+', '-', '*', '/', '%'].includes(node.operator)
              ? typeNumber()
              : typeBoolean()
          );
        }

        if (isAssignableToString(left) && isAssignableToString(right)) {
          if (!BINARY_OPERATOR_STRING.includes(node.operator)) {
            this.defError(
              node,
              `Operator ${node.operator} not compatible with type string`
            );
          }
          return this.defType(
            node,
            node.operator == '+' ? typeString() : typeBoolean()
          );
        }

        if (isAssignableToNull(left) && isAssignableToNull(right)) {
          if (!BINARY_OPERATOR_NULL.includes(node.operator)) {
            this.defError(
              node,
              `Operator ${node.operator} not compatible with type null`
            );
          }
          return this.defType(node, typeBoolean());
        }

        this.defError(
          node,
          `Incompatible types for binary operator ${node.operator}`
        );
        return this.defType(node, typeAny());
      }
      case 'Block': {
        this.pushContext();
        if (node.children.length == 0) {
          return this.defType(node, typeNull());
        }
        let lastType: Type;
        for (const child of node.children) {
          lastType = this.check(child);
        }
        this.popContext();
        return this.defType(node, lastType!);
      }
      case 'If': {
        const conditionType = this.check(node.condition);
        if (
          !(
            isAssignableToBoolean(conditionType) ||
            isAssignableToNull(conditionType)
          )
        ) {
          this.defError(node, 'If condition must be of type boolean or null');
        }

        const trueType = this.check(node.ifTrue);
        const falseType = node.ifFalse ? this.check(node.ifFalse) : typeNull();

        return this.defType(node, mergeTypes(node, trueType, falseType));
      }
      case 'Local': {
        const type = this.getValueType(node.name);
        if (type == null) {
          this.defError(node, 'Local not found: ' + node.name);
          return this.defType(node, typeAny());
        }
        return this.defType(node, type.type);
      }
      case 'Assign': {
        // TODO: Handle other kind of adressable values
        if (node.address.kind != 'Local') {
          this.defError(
            node,
            'Only local variables are supported for Assignements'
          );
          return this.defType(node, typeAny());
        }
        const valueType = this.check(node.value);
        const type = this.getValueType(node.address.name);
        if (!type) {
          this.defError(node, 'Local not found: ' + node.address.name);
          return this.defType(node, typeAny());
        }

        if (!type.mutable) {
          this.defError(node, 'Assignement of non mutable local');
        }

        if (!typeIsAssignableTo(type.type, valueType)) {
          this.defError(
            node,
            'Type of expression is not compatible during assignment'
          );
        }
        return type.type;
      }
      case 'Try': {
        const tryType = this.check(node.node);
        const catchType = node.catchNode
          ? this.check(node.catchNode)
          : typeNull();

        return this.defType(node, mergeTypes(node, tryType, catchType));
      }
      case 'Intrinsic': {
        switch (node.op) {
          case 'ForceRender':
            return typeNull();
        }
        this.defError(node, 'Unknown intrinsic: ' + node.op);
        return this.defType(node, typeAny());
      }
      case 'While': {
        const conditionType = this.check(node.condition);
        if (!isAssignableToBoolean(conditionType)) {
          this.defError(node, 'If condition must be of type boolean');
        }

        return this.defType(node, this.check(node.body));
      }
      case 'UnaryOperator': {
        const operand = this.check(node.operand);

        if (isAssignableToBoolean(operand)) {
          if (!['!'].includes(node.operator)) {
            this.defError(
              node,
              `Unary operator ${node.operator} not compatible with type boolean`
            );
          }
          return this.defType(node, typeBoolean());
        }

        if (isAssignableToNumber(operand)) {
          if (!['+', '-'].includes(node.operator)) {
            this.defError(
              node,
              `Unary operator ${node.operator} not compatible with type number`
            );
          }
          return this.defType(node, typeNumber());
        }

        this.defError(
          node,
          `Incompatible types for unary operator ${node.operator}`
        );
        return this.defType(node, typeAny());
      }
      case 'Import': {
        // TODO: Handle import nodes
        return this.defType(node, typeAny());
      }
      case 'Array': {
        // TODO: Handle
        const arrayItemType =
          node.value.length == 0
            ? typeNull()
            : node.value
                .map((value) => this.check(value))
                .reduce((a, b) => mergeTypes(node, a, b));
        return this.defType(node, typeArray(arrayItemType));
      }
      case 'Index': {
        const indexType = this.check(node.index);
        const valueType = this.check(node.value);

        if (!isAssignableToArray(valueType)) {
          this.defError(node, 'Invalid type for index');
          return this.defType(node, typeAny());
        }

        if (!isAssignableToNumber(indexType)) {
          this.defError(node, 'Arrays are only indexable by number');
          return this.defType(node, typeAny());
        }

        if (isArray(valueType)) {
          return this.defType(node, valueType.item);
        }

        // In case we index an any value
        return this.defType(node, typeAny());
      }
      case 'Attribute': {
        const valueType = this.check(node.value);

        if (!isAssignableToRecord(valueType)) {
          this.defError(node, 'Invalid type for attribute');
          return this.defType(node, typeAny());
        }

        if (isRecord(valueType)) {
          const type = valueType.fields[node.key];
          if (!type) {
            this.defError(node, 'Key not found on record: ' + node.key);
            return this.defType(node, typeAny());
          }
          return this.defType(node, type);
        }

        // In case we get an attribute of an any value
        return this.defType(node, typeAny());
      }
      case 'Record': {
        return this.defType(
          node,
          typeRecord(
            Object.fromEntries(
              node.entries.map((entry) => [entry.key, this.check(entry.value)])
            )
          )
        );
      }
      case 'KindedRecord': {
        // TODO: Check each attribute is compatible
        for (let child of node.children) {
          this.check(child);
        }
        for (let entry of node.entries) {
          if (Array.isArray(entry.value)) {
            for (let entryChild of entry.value) {
              this.check(entryChild);
            }
          } else {
            this.check(entry.value);
          }
        }
        return this.defType(node, typeKindedRecord());
      }
      case 'Function': {
        const computedReturnType = this.check(node.body);
        const declaredReturnType = node.returnType;

        if (
          declaredReturnType &&
          !typeIsAssignableTo(declaredReturnType, computedReturnType)
        ) {
          this.defError(node, 'Return type not compatible');
        }

        // TODO: When parameter type is missing, infer from expected type (eg: for lambdas)
        const parametersType = node.parameters.map((parameter) => ({
          name: parameter.name,
          type: parameter.type ?? typeAny(),
        }));

        // TODO: Check parameter type

        return this.defType(
          node,
          typeFunction(parametersType, declaredReturnType ?? computedReturnType)
        );
      }
      case 'Call': {
        const funType = this.check(node.value);

        if (!isAssignableToFunction(funType)) {
          this.defError(node, 'Expression is not of type function');
          return this.defType(node, typeAny());
        }

        if (!isFunction(funType)) {
          // Type any
          return this.defType(node, typeAny());
        }

        // TODO: Check args compatibility

        return this.defType(node, funType.returnType);
      }
      case 'Export':
      case 'Switch':
      case 'Comment':
      case 'Pipe':
      case 'Nested':
      case 'KindedRecordEntry':
      case 'NamedArgument':
      case 'PositionalArgument':
      case 'RecordEntry':
      case 'SwitchBranch':
      case 'AttributeLambdaSugar':
        throw new Error('Unreachable node kind: ' + node.kind);
      default: {
        const _: never = node;
        _;
        this.defError(node, 'Unreachable case: ' + (node as AnyForNever).kind);
        return this.defType(node, typeAny());
      }
    }
  }
}

export function typeCheck(
  node: Node | Node[]
): [TypeChecker, Type | null, [Node, string][]] {
  const typeChecker = new TypeChecker();
  let lastType: Type | null = null;

  if (Array.isArray(node)) {
    for (let i of node) {
      lastType = typeChecker.check(i);
    }
  } else {
    lastType = typeChecker.check(node);
  }
  return [typeChecker, lastType, typeChecker.errors];
}

function isAssignableToBoolean(type: Type): boolean {
  return type.kind == 'boolean' || type.kind == 'any';
}

function isAssignableToNumber(type: Type): boolean {
  return type.kind == 'number' || type.kind == 'any';
}

function isAssignableToString(type: Type): boolean {
  return type.kind == 'string' || type.kind == 'any';
}

function isAssignableToNull(type: Type): boolean {
  return type.kind == 'null' || type.kind == 'any';
}

function isAssignableToArray(type: Type): boolean {
  return type.kind == 'array' || type.kind == 'any';
}

function isAssignableToRecord(type: Type): boolean {
  return type.kind == 'record' || type.kind == 'any';
}

function isAssignableToFunction(type: Type): boolean {
  return type.kind == 'function' || type.kind == 'any';
}

function isAny(type: Type): type is TypeAny {
  return type.kind == 'any';
}

function isUnion(type: Type): type is TypeUnion {
  return type.kind == 'union';
}

function isArray(type: Type): type is TypeArray {
  return type.kind == 'array';
}

function isRecord(type: Type): type is TypeRecord {
  return type.kind == 'record';
}

function isFunction(type: Type): type is TypeFunction {
  return type.kind == 'function';
}

let BINARY_OPERATOR_BOOLEAN = ['==', '!='];

let BINARY_OPERATOR_NUMBER = [
  '==',
  '!=',
  '<=',
  '>=',
  '<',
  '>',
  '+',
  '-',
  '*',
  '/',
  '%',
];

let BINARY_OPERATOR_STRING = ['==', '!=', '<=', '>=', '<', '>', '+'];

let BINARY_OPERATOR_NULL = ['==', '!='];

/**
 * Merge two types and return the most compatible type or an union type
 */
function mergeTypes(node: Node, type1: Type, type2: Type): Type {
  /**
   * Rules to merge types:
   * If one type is compatible with another but not the other way, return the most compatible type
   * If types are not compatible, return union type
   */
  if (isAny(type1) || isAny(type2)) {
    return typeAny();
  }
  if (typeIsAssignableTo(type1, type2)) {
    return type1;
  }
  if (typeIsAssignableTo(type2, type1)) {
    return type2;
  }
  if (isUnion(type1)) {
    return typeUnion(...type1.types, type2);
  }
  if (isUnion(type2)) {
    return typeUnion(type1, ...type2.types);
  }
  return typeUnion(type1, type2);
}

function typeIsAssignableTo(type1: Type, type2: Type): boolean {
  // Any is assignable to anything and anything is assignable to any
  if (isAny(type1) || isAny(type2)) {
    return true;
  }

  // All types of 2 must be assignable to at least one type of 1
  if (isUnion(type1) && isUnion(type2)) {
    for (let typeOf2 of type2.types) {
      if (!typeIsAssignableTo(type1, typeOf2)) {
        return false;
      }
    }
    return true;
  }

  // 2 must be assignable to at least one type of 1
  if (isUnion(type1)) {
    for (let type of type1.types) {
      if (typeIsAssignableTo(type, type2)) {
        return true;
      }
    }
    return false;
  }

  // A union type is not assignable to a non union type
  if (isUnion(type2)) {
    return false;
  }

  // For non union types other than any, their kinds must be the same
  return type1.kind == type2.kind;
}

export function typeToString(type: Type): string {
  switch (type.kind) {
    case 'any':
      return 'any';
    case 'null':
      return 'null';
    case 'boolean':
      return 'boolean';
    case 'number':
      return 'number';
    case 'string':
      return 'string';
    case 'kinded-record':
      return 'kinded-record';
    case 'union':
      return 'union<' + type.types.map((t) => typeToString(t)).join(', ') + '>';
    case 'array':
      return 'array<' + typeToString(type.item) + '>';
    case 'record':
      return (
        '{' +
        Object.entries(type.fields)
          .map((entry) => entry[0] + ': ' + typeToString(entry[1]))
          .join(', ') +
        '}'
      );
    case 'function':
      return (
        '(' +
        type.parameters
          .map((p) => p.name + ': ' + typeToString(p.type))
          .join(', ') +
        ') => ' +
        typeToString(type.returnType)
      );
  }
}
