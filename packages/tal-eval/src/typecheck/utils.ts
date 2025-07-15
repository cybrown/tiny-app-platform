import { Type } from './types';

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
