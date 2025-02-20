import { defineFunction } from 'tal-eval';
import { search } from 'jmespath';
import { bytes_to_string_impl } from '../util/bytes';

export const json_parse = defineFunction(
  'json_parse',
  [{ name: 'string' }],
  (_ctx, { string }) => {
    let strToParse: string;
    if (string instanceof ArrayBuffer) {
      strToParse = bytes_to_string_impl(string);
    } else if (typeof string === 'string') {
      strToParse = string;
    } else {
      throw new Error('Not supported type for json parsing');
    }
    return JSON.parse(strToParse);
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
