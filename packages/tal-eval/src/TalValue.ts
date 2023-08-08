import { Expression, KindedObjectExpression } from 'tal-parser';
import { FunctionValue, RegisterableFunction } from './RuntimeContext';

type TalValueString = {
  kind: 'string';
  value: string;
};

type TalValueNumber = {
  kind: 'number';
  value: number;
};

type TalValueBoolean = {
  kind: 'boolean';
  value: boolean;
};

type TalValueNull = {
  kind: 'null';
};

type TalValueArray = {
  kind: 'array';
  value: TalValue[];
};

type TalValueObject = {
  kind: 'object';
  value: { [key: string]: TalValue };
};

type TalValueExpression = {
  kind: 'expression';
  value: Expression;
};

type TalValueFunction = {
  kind: 'function';
  value: FunctionValue;
};

type TalValueRegisterableFunction = {
  kind: 'registerable-function';
  value: RegisterableFunction<any>;
};

type TalValueKindedObject = {
  kind: 'kinded-object';
  value: KindedObjectExpression;
};

export type TalValue =
  | TalValueKindedObject
  | TalValueExpression
  | TalValueBoolean
  | TalValueNull
  | TalValueString
  | TalValueNumber
  | TalValueArray
  | TalValueFunction
  | TalValueRegisterableFunction
  | TalValueObject;

export const TAL_VALUE_NULL: TalValue = {
  kind: 'null',
};

export function toTalValue(
  value:
    | string
    | number
    | boolean
    | null
    | undefined
    | TalValue[]
    | { [key: string]: TalValue }
): TalValue {
  if (Array.isArray(value)) {
    return { kind: 'array', value };
  } else if (value == null) {
    return TAL_VALUE_NULL;
  } else {
    switch (typeof value) {
      case 'string':
        return { kind: 'string', value };
      case 'number':
        return { kind: 'number', value };
      case 'boolean':
        return { kind: 'boolean', value };
      case 'object':
        return { kind: 'object', value };
      default:
        throw new Error('Failed to convert to tal value');
    }
  }
}

export function toTalExpression(value: Expression): TalValueExpression {
  return {
    kind: 'expression',
    value,
  };
}

export function toTalFunction(value: FunctionValue): TalValueFunction {
  return {
    kind: 'function',
    value,
  };
}

export function toTalRegisterableFunction(
  value: RegisterableFunction<any>
): TalValueRegisterableFunction {
  return {
    kind: 'registerable-function',
    value,
  };
}

export function toTalKindedObject(
  value: any // TODO
): TalValueKindedObject {
  return {
    kind: 'kinded-object',
    value,
  };
}

export function talValueToBoolean(value: TalValue): boolean {
  if (value.kind === 'boolean') {
    return value.value;
  }
  throw new Error('not a boolean');
}

export function talValueToNumber(value: TalValue): number {
  if (value.kind === 'number') {
    return value.value;
  }
  throw new Error('not a number');
}

export function talValueToString(value: TalValue): string {
  if (value.kind === 'string') {
    return value.value;
  }
  throw new Error('not a string');
}

export function talValueToStringOpt<T extends null | undefined>(
  value: TalValue | T
): string | T {
  if (!value) {
    return value;
  }
  if (value.kind === 'string') {
    return value.value;
  }
  throw new Error('not a string');
}

export function talValueToStringEnumOpt<
  T extends null | undefined,
  S
>(value: TalValue | T, possibleValues: S[]): S | T {
  if (!value) {
    return value;
  }
  if (value.kind === 'string') {
    if (possibleValues.includes(value.value as any)) {
      return value.value as any;
    } else {
      throw new Error('String not in enum');
    }
  }
  throw new Error('not a string');
}
