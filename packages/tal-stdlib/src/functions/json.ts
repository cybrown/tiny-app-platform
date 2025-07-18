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
  },
  undefined,
  {
    description: 'Parse a JSON string or ArrayBuffer into a JavaScript object',
    parameters: {
      string: 'JSON input as string or ArrayBuffer',
    },
    returns: 'Parsed JavaScript object',
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
  },
  undefined,
  {
    description:
      'Convert a JavaScript value to a JSON string, optionally formatted',
    parameters: {
      any: 'Value to stringify',
      format: 'Whether to pretty-print with indentation',
    },
    returns: 'JSON string representation of the input',
  }
);

export const jmespath_search = defineFunction(
  'jmespath_search',
  [{ name: 'json' }, { name: 'query' }],
  (_ctx, { json, query }) => {
    return search(json, query as string);
  },
  undefined,
  {
    description: 'Run a JMESPath query against a JSON object',
    parameters: {
      json: 'Object to query',
      query: 'JMESPath query string',
    },
    returns: 'Result of the JMESPath query',
  }
);
