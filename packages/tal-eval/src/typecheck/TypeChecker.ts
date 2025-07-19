import { Node, TypeNode } from 'tal-parser';
import { AnyForNever } from '../core';
import {
  Type,
  typeAliased,
  typeAny,
  TypeAny,
  typeArray,
  TypeArray,
  typeBoolean,
  typeBytes,
  typeFunction,
  TypeFunction,
  TypeGenericPlaceholder,
  typeGenericPlaceholder,
  typeGenericPlaceholderLateInit,
  typeKindedRecord,
  typeNull,
  typeNumber,
  typeRecord,
  TypeRecord,
  typeString,
  TypeUnion,
  typeUnion,
} from './types';
import { SymbolTable } from './SymbolTable';
import { typeToString } from './utils';

export class TypeChecker {
  private types = new Map<Node, Type>();
  private _errors: [Node, string][] = [];
  private symbolTable = new SymbolTable();

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

  public declareSymbol(name: string, type: Type): boolean {
    return this.symbolTable.declare(name, type, false);
  }

  public pushSymbolTable(): void {
    this.symbolTable.push();
  }

  public popSymbolTable(): void {
    this.symbolTable.pop();
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
        const valueType = node.value
          ? this.check(node.value)
          : node.type
          ? mapTypeAst(
              (e) => this.defError(node, e),
              this.symbolTable,
              node.type
            )
          : typeNull();

        if (node.type) {
          const assignementResult = typeIsAssignableTo(
            mapTypeAst(
              (e) => this.defError(node, e),
              this.symbolTable,
              node.type
            ),
            valueType,
            this.symbolTable
          );
          if (!assignementResult.result) {
            this.defError(
              node,
              `Declared type ${
                node.type.kind
              } is not compatible with value type ${
                valueType.kind
              }: ${assignmentFailureText(assignementResult)}`
            );
          }
        }

        const symbolIsDeclared = this.symbolTable.declare(
          node.name,
          valueType,
          node.mutable
        );
        if (!symbolIsDeclared) {
          this.defError(node, 'Symbol already declared: ' + node.name);
        }
        return this.defType(node, typeNull());
      case 'BinaryOperator': {
        const left = this.check(node.left);
        const right = this.check(node.right);

        if (isAny(left) && isAny(right)) {
          switch (node.operator) {
            case '==':
            case '!=':
            case '<=':
            case '>=':
            case '<':
            case '>':
              return this.defType(node, typeBoolean());
            case '+':
              return this.defType(
                node,
                mergeTypes(node, typeNumber(), typeString(), this.symbolTable)
              );
            case '-':
            case '*':
            case '/':
            case '%':
              return this.defType(node, typeNumber());
          }
          this.defError(node, `Binary perator ${node.operator} unknown`);
          return this.defType(node, typeAny());
        }

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
        this.symbolTable.push();
        if (node.children.length == 0) {
          return this.defType(node, typeNull());
        }
        let lastType: Type;
        for (const child of node.children) {
          lastType = this.check(child);
        }
        this.symbolTable.pop();
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

        return this.defType(
          node,
          mergeTypes(node, trueType, falseType, this.symbolTable)
        );
      }
      case 'Local': {
        const type = this.symbolTable.get(node.name);
        if (type == null) {
          this.defError(node, 'Unknown symbol: ' + node.name);
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
        const type = this.symbolTable.get(node.address.name);
        if (!type) {
          this.defError(node, 'Unknown symbol: ' + node.address.name);
          return this.defType(node, typeAny());
        }

        if (!type.mutable) {
          this.defError(node, 'Assignement of non mutable local');
        }

        const isAssignable = typeIsAssignableTo(
          type.type,
          valueType,
          this.symbolTable
        );
        if (!isAssignable.result) {
          this.defError(
            node,
            'Type of expression is not compatible during assignment: ' +
              isAssignable.reasons.join(', ')
          );
        }
        return type.type;
      }
      case 'Try': {
        const tryType = this.check(node.node);
        const catchType = node.catchNode
          ? this.check(node.catchNode)
          : typeNull();

        return this.defType(
          node,
          mergeTypes(node, tryType, catchType, this.symbolTable)
        );
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
                .reduce((a, b) => mergeTypes(node, a, b, this.symbolTable));
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
        // TODO: When parameter type is missing, infer from expected type (eg: for lambdas)
        this.symbolTable.push();

        if (node.genericParameters) {
          for (const genericParameter of node.genericParameters) {
            this.symbolTable.declareTypeAlias(
              genericParameter.name,
              typeGenericPlaceholder(genericParameter.name)
            );
          }
        }

        const parametersType = node.parameters.map((parameter) => ({
          name: parameter.name,
          type: parameter.type
            ? mapTypeAst(
                (e) => this.defError(node, e),
                this.symbolTable,
                parameter.type
              )
            : typeAny(),
        }));
        parametersType.forEach((parameter) => {
          this.symbolTable.declare(parameter.name, parameter.type, true);
        });

        // TODO: Check parameter type

        const computedReturnType = this.check(node.body);
        const declaredReturnType = node.returnType;

        if (declaredReturnType) {
          const isAssignable = typeIsAssignableTo(
            mapTypeAst(
              (e) => this.defError(node, e),
              this.symbolTable,
              declaredReturnType
            ),
            computedReturnType,
            this.symbolTable
          );
          if (!isAssignable.result) {
            this.defError(
              node,
              'Return type not compatible: ' +
                assignmentFailureText(isAssignable)
            );
          }
        }

        const result = this.defType(
          node,
          typeFunction(
            parametersType.map((a) => ({
              name: a.name,
              type: a.type,
            })),
            node.genericParameters
              ? node.genericParameters.map((p) =>
                  typeGenericPlaceholder(p.name)
                )
              : [],
            declaredReturnType
              ? mapTypeAst(
                  (e) => this.defError(node, e),
                  this.symbolTable,
                  declaredReturnType
                )
              : computedReturnType
          )
        );

        this.symbolTable.pop();

        return result;
      }
      case 'Call': {
        const funTypeWithGenerics = this.check(node.value);

        if (!isAssignableToFunction(funTypeWithGenerics)) {
          this.defError(node, 'Expression is not of type function');
          return this.defType(node, typeAny());
        }

        if (!isFunction(funTypeWithGenerics)) {
          // Type any
          return this.defType(node, typeAny());
        }

        this.symbolTable.push();

        // TODO: Handle positional type parameter without a name

        const genArgs = Object.fromEntries(
          funTypeWithGenerics.genericParameters.map(
            (typeGenericPlaceholder) => [
              typeGenericPlaceholder.name,
              (node.typeArgs ?? {})[typeGenericPlaceholder.name]
                ? mapTypeAst(
                    (e) => this.defError(node, e),
                    this.symbolTable,
                    (node.typeArgs ?? {})[typeGenericPlaceholder.name]
                  )
                : typeGenericPlaceholderLateInit(typeGenericPlaceholder.name),
            ]
          )
        );

        const allGenericParams = new Set(
          funTypeWithGenerics.genericParameters.map((a) => a.name)
        );
        for (const typeParameterName of Object.keys(node.typeArgs ?? {})) {
          if (!allGenericParams.has(typeParameterName)) {
            this.defError(node, 'Unknown type parameter: ' + typeParameterName);
          }
        }

        for (const a of Object.entries(genArgs)) {
          this.symbolTable.declareTypeAlias(a[0], a[1]);
        }

        const funType = instantiateGenericFunction(
          funTypeWithGenerics,
          genArgs
        );

        const paramsByName = new Map<string, Type>();

        for (let param of funType.parameters) {
          paramsByName.set(param.name, param.type);
        }

        let remainingParams = funType.parameters.map((p) => p.name);

        for (let arg of node.args) {
          if (remainingParams.length == 0) {
            this.defError(node, `Too many arguments for function call`);
            this.symbolTable.pop();
            return this.defType(node, typeAny());
          }
          if (arg.kind == 'NamedArgument') {
            remainingParams = remainingParams.filter((p) => p != arg.name);
            if (!paramsByName.has(arg.name)) {
              this.defError(
                node,
                `Unknown parameter name: ${arg.name} in function call`
              );
              this.symbolTable.pop();
              return this.defType(node, typeAny());
            }

            const isAssignable = typeIsAssignableTo(
              paramsByName.get(arg.name) ?? typeAny(),
              this.check(arg.value),
              this.symbolTable
            );
            if (!isAssignable.result) {
              this.defError(
                node,
                `Argument ${
                  arg.name
                } is not assignable: ${assignmentFailureText(isAssignable)}`
              );
            }
          }
        }

        for (let arg of node.args) {
          if (arg.kind == 'PositionalArgument') {
            if (remainingParams.length == 0) {
              this.defError(node, `Too many arguments for function call`);
              this.symbolTable.pop();
              return this.defType(node, typeAny());
            }
            const currentParamName = remainingParams.shift()!; // Ok to ! because we checked length above

            const isAssignable = typeIsAssignableTo(
              paramsByName.get(currentParamName) ?? typeAny(),
              this.check(arg.value),
              this.symbolTable
            );
            if (!isAssignable.result) {
              this.defError(
                node,
                `Argument ${currentParamName} is not assignable: ${assignmentFailureText(
                  isAssignable
                )}`
              );
            }
          }
        }

        for (const remainingParam of remainingParams) {
          const paramType = paramsByName.get(remainingParam);
          if (paramType && !isNullable(paramType)) {
            this.defError(
              node,
              `Missing argument for parameter ${remainingParam}`
            );
          }
        }

        // TODO: Check args compatibility

        // Consider substitution returns the same type when a function type is substituted
        const funType2 = substituteLateInit(
          funType,
          this.symbolTable
        ) as TypeFunction;

        const result = this.defType(node, funType2.returnType);

        this.symbolTable.pop();

        return result;
      }
      case 'TypeAlias': {
        this.symbolTable.declareTypeAlias(
          node.name,
          mapTypeAst((e) => this.defError(node, e), this.symbolTable, node.type)
        );
        return this.defType(node, typeNull());
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

function isGenericPlaceholder(type: Type): type is TypeGenericPlaceholder {
  return type.kind == 'generic-placeholder';
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
function mergeTypes(
  node: Node,
  type1: Type,
  type2: Type,
  symbolTable: SymbolTable
): Type {
  /**
   * Rules to merge types:
   * If one type is compatible with another but not the other way, return the most compatible type
   * If types are not compatible, return union type
   */
  if (isAny(type1) || isAny(type2)) {
    return typeAny();
  }
  if (typeIsAssignableTo(type1, type2, symbolTable).result) {
    return type1;
  }
  if (typeIsAssignableTo(type2, type1, symbolTable).result) {
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

type AssignableResult =
  | {
      result: true;
    }
  | {
      result: false;
      reasons: string[];
    };

const AssignableResult_TRUE: AssignableResult = {
  result: true,
};

function typeIsAssignableTo(
  type1: Type,
  type2: Type,
  symbolTable: SymbolTable
): AssignableResult {
  // Resolve aliased types
  // I would have use a while loop to resolve all aliases, but typescript
  // does not narrow the type of a parameter when reassigned.
  if (type1.kind == 'aliased') {
    return typeIsAssignableTo(type1.type, type2, symbolTable);
  }
  if (type2.kind == 'aliased') {
    return typeIsAssignableTo(type1, type2.type, symbolTable);
  }

  /*
  if (type1.kind == 'generic-placeholder') {
    const foundType = symbolTable.getTypeAlias(type1.name);
    if (!foundType) {
      return {
        result: false,
        reasons: [`Generic placeholder <${type1.name}> not found`],
      };
    }
    return typeIsAssignableTo(foundType, type2, symbolTable);
  }
  if (type2.kind == 'generic-placeholder') {
    const foundType = symbolTable.getTypeAlias(type2.name);
    if (!foundType) {
      return {
        result: false,
        reasons: [`Generic placeholder <${type2.name}> not found`],
      };
    }
    return typeIsAssignableTo(type1, foundType, symbolTable);
  }
  */

  // Any is assignable to anything and anything is assignable to any
  if (isAny(type1) || isAny(type2)) {
    return AssignableResult_TRUE;
  }

  // All types of 2 must be assignable to at least one type of 1
  if (isUnion(type1) && isUnion(type2)) {
    for (let typeOf2 of type2.types) {
      const assignmentResult = typeIsAssignableTo(type1, typeOf2, symbolTable);
      if (!assignmentResult.result) {
        return assignmentResult;
      }
    }
    return AssignableResult_TRUE;
  }

  // 2 must be assignable to at least one type of 1
  if (isUnion(type1)) {
    for (let type of type1.types) {
      if (typeIsAssignableTo(type, type2, symbolTable).result) {
        return AssignableResult_TRUE;
      }
    }
    return {
      result: false,
      reasons: [
        `Type ${typeToString(
          type2
        )} is not assignable to any of the union types ${type1.types
          .map((t) => typeToString(t))
          .join(', ')}`,
      ],
    };
  }

  // A union type is not assignable to a non union type
  if (isUnion(type2)) {
    return {
      result: false,
      reasons: [
        `Type ${type2.kind} is a union type and cannot be assigned to ${type1.kind}`,
      ],
    };
  }

  const type1IsRecord = isRecord(type1);
  const type2IsRecord = isRecord(type2);

  if (type1IsRecord != type2IsRecord) {
    // If one is a record and the other is not, they are not assignable
    return {
      result: false,
      reasons: [
        `Type ${typeToString(type2)} is not assignable to ${typeToString(
          type1
        )}`,
      ],
    };
  }

  if (type1IsRecord && type2IsRecord) {
    // TODO: Add option for extra fields ?
    for (const key in type1.fields) {
      if (!(key in type2.fields) && !isNullable(type1.fields[key])) {
        return {
          result: false,
          reasons: [`Non nullable field ${key} is missing`],
        };
      }
      const fieldType1 = type1.fields[key];
      const fieldType2 = type2.fields[key] ?? typeNull();
      const assignResult = typeIsAssignableTo(
        fieldType1,
        fieldType2,
        symbolTable
      );
      if (!assignResult.result) {
        return {
          result: false,
          reasons: [
            `Field ${key} is not assignable: ${assignmentFailureText(
              assignResult
            )}`,
          ],
        };
      }
    }
    return AssignableResult_TRUE;
  }

  const type1IsArray = isArray(type1);
  const type2IsArray = isArray(type2);
  if (type1IsArray != type2IsArray) {
    // If one is an array and the other is not, they are not assignable
    return {
      result: false,
      reasons: [
        `Type ${typeToString(type2)} is not assignable to ${typeToString(
          type1
        )}`,
      ],
    };
  }
  if (type1IsArray && type2IsArray) {
    // If both are arrays, check item types
    const itemType1 = type1.item;
    const itemType2 = type2.item;
    const assignResult = typeIsAssignableTo(itemType1, itemType2, symbolTable);
    if (!assignResult.result) {
      return {
        result: false,
        reasons: [
          `Item type ${typeToString(
            itemType2
          )} is not assignable to ${typeToString(
            itemType1
          )}: ${assignmentFailureText(assignResult)}`,
        ],
      };
    }
    return AssignableResult_TRUE;
  }

  const type1IsGenericPlaceholder = isGenericPlaceholder(type1);
  const type2IsGenericPlaceholder = isGenericPlaceholder(type2);
  if (type1IsGenericPlaceholder != type2IsGenericPlaceholder) {
    // TODO: When generic boundaries are implented, generic and non generics may be assignable
    return {
      result: false,
      reasons: [
        `Type ${typeToString(type2)} is not assignable to ${typeToString(
          type1
        )}`,
      ],
    };
  }
  if (type1IsGenericPlaceholder && type2IsGenericPlaceholder) {
    if (type1.name == type2.name) {
      // TODO: Be carefull with nested generic definition, they might use the same name !
      return {
        result: true,
      };
    }
    // TODO: When generic boundaries are implemented, different generics may be assignable
    return {
      result: false,
      reasons: [
        `Type ${typeToString(type2)} is not assignable to ${typeToString(
          type1
        )}`,
      ],
    };
  }

  // TODO: Handle functions properly

  if (type1.kind == 'generic-placeholder-late-init') {
    symbolTable.declareLateInit(type1.name, type2);
    return {
      result: true,
    };
  }

  // TODO: Handle late init types when on the assignee side

  // For non union types other than any, their kinds must be the same
  return type1.kind == type2.kind
    ? AssignableResult_TRUE
    : {
        result: false,
        reasons: [
          `Type ${typeToString(type2)} is not assignable to ${typeToString(
            type1
          )}`,
        ],
      };
}

function isNullable(type: Type): boolean {
  if (type.kind == 'null' || type.kind == 'any') {
    return true;
  }

  if (isUnion(type)) {
    return type.types.some((t) => isNullable(t));
  }

  return false;
}

function assignmentFailureText(isAssignable: AssignableResult): string {
  if (isAssignable.result) {
    return 'No reason';
  }
  return isAssignable.reasons.length > 0
    ? isAssignable.reasons.join(', ')
    : 'Unknown reason';
}

function mapTypeAst(
  defError: (err: string) => void,
  symtab: SymbolTable,
  typeAst: TypeNode
): Type {
  switch (typeAst.kind) {
    case 'named':
      switch (typeAst.name) {
        case 'any':
          return typeAny();
        case 'null':
          return typeNull();
        case 'number':
          return typeNumber();
        case 'string':
          return typeString();
        case 'bytes':
          return typeBytes();
        case 'boolean':
          return typeBoolean();
        case 'kinded-record':
          return typeKindedRecord();
      }
      const aliasedType = symtab.getTypeAlias(typeAst.name);
      if (aliasedType) {
        return typeAliased(typeAst.name, aliasedType);
      }
      defError(`Unknown type alias: ${typeAst.name}`);
      return typeAny();
    case 'kinded-record':
      return typeKindedRecord();
    case 'union':
      return typeUnion(
        ...typeAst.types.map((a) => mapTypeAst(defError, symtab, a))
      );
    case 'array':
      return typeArray(mapTypeAst(defError, symtab, typeAst.item));
    case 'record':
      return typeRecord(
        Object.fromEntries(
          Object.entries(typeAst.fields).map(([key, value]) => [
            key,
            mapTypeAst(defError, symtab, value),
          ])
        )
      );
    case 'nested':
      return mapTypeAst(defError, symtab, typeAst.type);
    case 'function':
      return typeFunction(
        typeAst.parameters.map((p) => ({
          name: p.name,
          type: mapTypeAst(defError, symtab, p.type),
        })),
        [], // TODO: Update this when generic parameters are supported for type expressions
        mapTypeAst(defError, symtab, typeAst.returnType)
      );
    default:
      const _: never = typeAst;
      _;
      throw new Error(
        'Unknown type ast kind: ' + (typeAst as AnyForNever).kind
      );
  }
}

function instantiateGenericFunction(
  funType: TypeFunction,
  definitions: Record<string, Type>
): TypeFunction {
  const { genericParameters, ...result } = funType;
  // Consider substitute will always return a function when passed a function
  return substituteGenericPlaceholders(
    { ...result, genericParameters: [] },
    definitions
  ) as TypeFunction;
}

function substituteGenericPlaceholders(
  type: Type,
  definitions: Record<string, Type>
): Type {
  switch (type.kind) {
    case 'array':
      return typeArray(substituteGenericPlaceholders(type.item, definitions));
    case 'generic-placeholder': {
      // TODO: Make definition hold late references for missing types
      // TODO: Define late reference to desired type the first time encountered
      const result = definitions[type.name];
      if (!result) {
        throw new Error(
          `Generic placeholder with name <${type.name}> is not defined`
        );
      }
      return result;
    }
    case 'union':
      return typeUnion(
        ...type.types.map((type) =>
          substituteGenericPlaceholders(type, definitions)
        )
      );
    case 'record':
      return typeRecord(
        Object.fromEntries(
          Object.entries(type.fields).map((t) => [
            t[0],
            substituteGenericPlaceholders(t[1], definitions),
          ])
        )
      );
    case 'function': {
      const subGenericTypes = new Set(
        type.genericParameters.map((g) => g.name)
      );
      return typeFunction(
        type.parameters.map((p) =>
          subGenericTypes.has(p.name)
            ? p
            : {
                name: p.name,
                type: substituteGenericPlaceholders(p.type, definitions),
              }
        ),
        type.genericParameters,
        substituteGenericPlaceholders(type.returnType, definitions)
      );
    }
    case 'aliased':
      // TODO: Handle type alias generic parameters when available
      if (type.type.kind == 'generic-placeholder') {
        return substituteGenericPlaceholders(type.type, definitions);
      }
      return typeAliased(
        type.name,
        substituteGenericPlaceholders(type.type, definitions)
      );
    case 'generic-placeholder-late-init':
    case 'any':
    case 'number':
    case 'null':
    case 'boolean':
    case 'string':
    case 'bytes':
    case 'kinded-record':
      return type;
    default:
      const _: never = type;
      _;
      throw new Error('Unknown type kind: ' + (type as AnyForNever).kind);
  }
}

function substituteLateInit(type: Type, symbolTable: SymbolTable): Type {
  switch (type.kind) {
    case 'array':
      return typeArray(substituteLateInit(type.item, symbolTable));
    case 'generic-placeholder-late-init': {
      const result = symbolTable.getTypeAlias(type.name);
      if (!result) {
        throw new Error(`Late init with name <${type.name}> is not defined`);
      }
      return result;
    }
    case 'union':
      return typeUnion(
        ...type.types.map((type) => substituteLateInit(type, symbolTable))
      );
    case 'record':
      return typeRecord(
        Object.fromEntries(
          Object.entries(type.fields).map((t) => [
            t[0],
            substituteLateInit(t[1], symbolTable),
          ])
        )
      );
    case 'function': {
      const subGenericTypes = new Set(
        type.genericParameters.map((g) => g.name)
      );
      return typeFunction(
        type.parameters.map((p) =>
          subGenericTypes.has(p.name)
            ? p
            : {
                name: p.name,
                type: substituteLateInit(p.type, symbolTable),
              }
        ),
        type.genericParameters,
        substituteLateInit(type.returnType, symbolTable)
      );
    }
    case 'aliased':
      if (type.type.kind == 'generic-placeholder-late-init') {
        return substituteLateInit(type.type, symbolTable);
      }
      return typeAliased(type.name, substituteLateInit(type.type, symbolTable));
    case 'generic-placeholder':
      throw new Error('Unknown placeholder: ' + type.name);
    case 'any':
    case 'number':
    case 'null':
    case 'boolean':
    case 'string':
    case 'bytes':
    case 'kinded-record':
      return type;
    default:
      const _: never = type;
      _;
      throw new Error('Unknown type kind: ' + (type as AnyForNever).kind);
  }
}
