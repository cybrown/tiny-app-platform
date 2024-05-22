import { defineFunction } from 'tal-eval';
import { search } from 'jmespath';

export const json_parse = defineFunction(
  'json_parse',
  [{ name: 'string' }],
  (_ctx, { string }) => {
    return JSON.parse(string);
  }
);

export const json_stringify = defineFunction(
  'json_stringify',
  [{ name: 'any' }, { name: 'format' }],
  (_ctx, { any, format }) => {
    if (format) {
      return JSON.stringify(any, null, '  ');
    }
    return JSON.stringify(any);
  }
);

export const jmespath_search = defineFunction(
  'jmespath_search',
  [{ name: 'json' }, { name: 'query' }],
  (_ctx, { json, query }) => {
    return search(json, query as string);
  }
);
