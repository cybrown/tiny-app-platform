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

export const bytes_from = defineFunction(
  'bytes_from',
  [],
  (ctx, {}, bytes) => {
    if (!Array.isArray(bytes)) {
      throw new Error('Array expected');
    }

    const buffer = new ArrayBuffer(bytes.length);
    const u8 = new Uint8Array(buffer);
    const s8 = new Int8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
      const num = bytes[i];
      if (typeof num != 'number' || num < -128 || num > 255) {
        throw new Error('Expected number between -128 and 255 included');
      }
      if (num < 0) {
        s8[i] = bytes[i];
      } else {
        u8[i] = bytes[i];
      }
    }
    return buffer;
  },
  undefined,
  {
    description:
      'Creates a new bytes buffer with initial values. Pass all values as argument without array as number >= -128 and <= 255',
    parameters: {},
    returns: 'An initialized byte buffer',
  }
);
