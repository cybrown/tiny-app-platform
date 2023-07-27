import { defineFunction } from 'tal-eval';

function expectString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Expected string');
  }
}

export const regex_match = defineFunction(
  'regex_match',
  [{ name: 'source' }, { name: 'search' }],
  (_ctx, { source, search }) => {
    expectString(source);
    expectString(search);
    const result = source.match(search);
    if (result == null) {
      return [];
    }
    return [...result];
  }
);
