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
    case 'bytes':
      return 'bytes';
    case 'kinded-record':
      return 'kinded-record';
    case 'union':
      return type.types
        .map((t) => {
          if (t.kind == 'function' && t.returnType.kind == 'union') {
            return `(${typeToString(t)})`;
          }
          return typeToString(t);
        })
        .join(' | ');
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
    case 'aliased':
      return `${type.name} (alias of ${typeToString(type.type)})`;
    default:
      const _: never = type;
      _;
      throw new Error(`Unknown type kind: ${(type as any).kind}`);
  }
}
