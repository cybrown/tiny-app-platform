import { defineFunction } from 'tal-eval';
import { bytes_to_string_impl } from '../util/bytes';

export const bytes_to_string = defineFunction(
  'bytes_to_string',
  [{ name: 'bytes' }, { name: 'encoding' }],
  (ctx, { bytes, encoding }) => bytes_to_string_impl(bytes, encoding),
  undefined,
  {
    description: 'Converts bytes to a string using the specified encoding',
    parameters: {
      bytes: 'The bytes to convert',
      encoding: 'The encoding to use: utf-8 (default), base64, base64url',
    },
    returns: 'The string representation of the bytes',
  }
);
