import { stringify as s } from './stringifier';
import * as parser from './parser';
import { Node } from './ast';

export const stringify = s;
export const parse = (source: string, path: string) => {
  return parser.parse(source, { path }) as Node[];
};
export * from './ast';
export * from './walker';
