export type TypeAny = {
  kind: 'any';
};

export type TypeNull = {
  kind: 'null';
};

export type TypeNumber = {
  kind: 'number';
};

export type TypeString = {
  kind: 'string';
};

export type TypeBytes = {
  kind: 'bytes';
};

export type TypeBoolean = {
  kind: 'boolean';
};

export type TypeKindedRecord = {
  kind: 'kinded-record';
};

export type TypeUnion = {
  kind: 'union';
  types: Type[];
};

export type TypeArray = {
  kind: 'array';
  item: Type;
};

export type TypeDict = {
  kind: 'dict';
  item: Type;
};

export type TypeRecord = {
  kind: 'record';
  fields: Record<string, Type>;
};

export type TypeGenericPlaceholder = {
  kind: 'generic-placeholder';
  name: string;
};

export type TypeGenericPlaceholderLateInit = {
  kind: 'generic-placeholder-late-init';
  name: string;
  type?: Type;
};

export type TypeResolved = {
  kind: 'unresolved';
  type?: Type;
};

export type TypeParameter = {
  name: string;
  type: Type;
};

export type TypeFunction = {
  kind: 'function';
  parameters: TypeParameter[];
  genericParameters: string[];
  returnType: Type;
};

export type TypeAliased = {
  kind: 'aliased';
  name: string;
  type: Type;
};

export function typeNull(): TypeNull {
  return {
    kind: 'null',
  };
}

export function typeAny(): TypeAny {
  return {
    kind: 'any',
  };
}

export function typeNumber(): TypeNumber {
  return {
    kind: 'number',
  };
}

export function typeString(): TypeString {
  return {
    kind: 'string',
  };
}

export function typeBytes(): TypeBytes {
  return {
    kind: 'bytes',
  };
}

export function typeBoolean(): TypeBoolean {
  return {
    kind: 'boolean',
  };
}

export function typeKindedRecord(): TypeKindedRecord {
  return {
    kind: 'kinded-record',
  };
}

export function typeAliased(name: string, type: Type): TypeAliased {
  return {
    kind: 'aliased',
    name,
    type,
  };
}

export function typeArray(itemType: Type): TypeArray {
  return {
    kind: 'array',
    item: itemType,
  };
}

export function typeDict(itemType: Type): TypeDict {
  return {
    kind: 'dict',
    item: itemType,
  };
}

export function typeFunction(
  parametersType: TypeParameter[],
  genericParameters: string[],
  returnType: Type
): TypeFunction {
  return {
    kind: 'function',
    parameters: parametersType,
    genericParameters: genericParameters,
    returnType: returnType,
  };
}

export function typeUnion(...types: Type[]): Type {
  for (let type of types) {
    if (type.kind == 'any') {
      return typeAny();
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

export function typeRecord(fields: Record<string, Type>): TypeRecord {
  return {
    kind: 'record',
    fields,
  };
}

export function typeGenericPlaceholder(name: string): TypeGenericPlaceholder {
  return {
    kind: 'generic-placeholder',
    name,
  };
}

export function typeGenericPlaceholderLateInit(
  name: string
): TypeGenericPlaceholderLateInit {
  return {
    kind: 'generic-placeholder-late-init',
    name,
  };
}

export function typeUnresolved(): TypeResolved {
  return {
    kind: 'unresolved',
  };
}

export type Type =
  | TypeNumber
  | TypeString
  | TypeBoolean
  | TypeNull
  | TypeKindedRecord
  | TypeAny
  | TypeUnion
  | TypeArray
  | TypeDict
  | TypeRecord
  | TypeFunction
  | TypeBytes
  | TypeAliased
  | TypeGenericPlaceholder
  | TypeGenericPlaceholderLateInit
  | TypeResolved;
