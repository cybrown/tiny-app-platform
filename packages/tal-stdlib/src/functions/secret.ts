import { defineFunction } from 'tal-eval';
import { decrypt, getKey, secretCreate } from '../util/secret';
import { base64_to_bytes } from '../util/base64';

export const secret = defineFunction(
  'secret',
  [{ name: 'data' }],
  undefined,
  async (ctx, { data }) => {
    const key = await getKey(ctx);
    if (!key) return null;
    return new TextDecoder().decode(await decrypt(key, base64_to_bytes(data)));
  },
  {
    description:
      'Convert a secret string to a readable string, prompts your password if needed',
    parameters: { data: 'The string to decrypt' },
    returns: 'The decrypted string',
  }
);

export const secret_create = defineFunction(
  'secret_create',
  [{ name: 'data' }],
  undefined,
  async (ctx, { data }) => await secretCreate(ctx, data),
  {
    description:
      'Convert a readable string to a secret string, prompts your password if needed',
    parameters: { data: 'The secret string to encrypt' },
    returns: 'The secret string to save in your file',
  }
);
