import { stringify as s } from './stringifier';
import * as parser from './parser';
import { Node } from './ast';

export const stringify = s;
export const parse = (
  source: string,
  path: string,
  onNode?: (node: Node) => void
) => {
  return parser.parse(source, { path, onNode }) as Node[];
};
export * from './ast';
export * from './walker';
