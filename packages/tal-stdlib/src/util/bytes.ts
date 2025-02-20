import { bytes_to_base64 } from './base64';

export function bytes_to_string_impl(bytes: ArrayBuffer, encoding?: string) {
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
