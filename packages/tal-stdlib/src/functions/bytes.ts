import { defineFunction } from 'tal-eval';
import { bytes_to_base64 } from '../util/base64';

export const bytes_to_string = defineFunction(
  'bytes_to_string',
  [{ name: 'bytes' }, { name: 'encoding' }],
  (_ctx, { bytes, encoding }) => {
    switch (encoding ?? 'utf-8') {
      case 'base64':
        return bytes_to_base64(bytes);
      case 'base64url':
        return bytes_to_base64(bytes, true);
      case 'utf-8':
        return new TextDecoder().decode(bytes);
      default:
        throw new Error('Encoding not supported: ' + encoding);
    }
  }
);
