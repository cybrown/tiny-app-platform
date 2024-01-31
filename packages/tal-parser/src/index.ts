import { stringify as s } from './stringifier';
import * as parser from './parser';
import { Expression } from './expression';

export const stringify = s;
export const parse = (source: string, path: string) => {
  return parser.parse(source, { path }) as Expression[];
};
export * from './expression';
