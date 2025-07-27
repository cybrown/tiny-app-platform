import {
  defineFunction3,
  typeAny,
  typeBytes,
  typeFunction,
  typeNull,
  typeString,
  typeUnion,
} from 'tal-eval';
import { search } from 'jmespath';
import { bytes_to_string_impl } from '../util/bytes';

export const json_parse = defineFunction3(
  'json_parse',
  [{ name: 'input' }],
  typeFunction(
    [{ name: 'input', type: typeUnion(typeNull(), typeString(), typeBytes()) }],
    [],
    typeAny()
  ),
  (_ctx, { input }) => {
    if (input == null) return null;
    let strToParse: string;
    if (input instanceof ArrayBuffer) {
      strToParse = bytes_to_string_impl(input);
    } else if (typeof input === 'string') {
      strToParse = input;
    } else {
      throw new Error('Not supported type for json parsing');
    }
    return JSON.parse(strToParse);
  },
  undefined,
  {
    description: 'Parse a JSON string or bytes into a JavaScript object',
    parameters: {
      input: 'JSON input as string or bytes',
    },
    returns: 'Parsed JavaScript object',
  }
);

export const json_stringify = defineFunction3(
  'json_stringify',
  [{ name: 'input' }, { name: 'format' }],
  typeFunction([{ name: 'input', type: typeAny() }], [], typeString()),
  (_ctx, { input, format }) => {
    if (format) {
      return JSON.stringify(input, null, '  ');
    }
    return JSON.stringify(input);
  },
  undefined,
  {
    description:
      'Convert a JavaScript value to a JSON string, optionally formatted',
    parameters: {
      input: 'Value to stringify',
      format: 'Whether to pretty-print with indentation',
    },
    returns: 'JSON string representation of the input',
  }
);

export const jmespath_search = defineFunction3(
  'jmespath_search',
  [{ name: 'json' }, { name: 'query' }],
  typeFunction(
    [
      { name: 'json', type: typeAny() },
      { name: 'query', type: typeString() },
    ],
    [],
    typeAny()
  ),
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
