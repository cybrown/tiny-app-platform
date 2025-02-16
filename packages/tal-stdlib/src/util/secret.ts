import { RuntimeContext } from 'tal-eval';
import { base64_to_bytes, bytes_to_base64 } from '../util/base64';

const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const UNLOCK_KEY_SALT = base64_to_bytes('TUqmuN0i/8qUfdw7Kpjpxw==');

type KeySaltPair = {
  key: CryptoKey;
  salt: Uint8Array;
};

async function unlockKey(password: string): Promise<ArrayBuffer> {
  const importedPassword = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  return await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      iterations: 100000,
      hash: 'SHA-256',
      salt: UNLOCK_KEY_SALT,
    },
    importedPassword,
    256
  );
}

async function deriveKey(
  unlockKey: ArrayBuffer,
  salt: Uint8Array
): Promise<KeySaltPair> {
  const key = await crypto.subtle.importKey('raw', unlockKey, 'PBKDF2', false, [
    'deriveKey',
  ]);

  return {
    key: await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        iterations: 100000,
        hash: 'SHA-256',
        salt,
      },
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    ),
    salt,
  };
}

async function encrypt(
  unlockKey: ArrayBuffer,
  data: Uint8Array
): Promise<ArrayBuffer> {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const key = await deriveKey(unlockKey, salt);

    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key.key,
      data
    );
    const result = new Uint8Array(
      encrypted.byteLength + IV_LENGTH + SALT_LENGTH
    );
    result.set(iv, 0);
    result.set(salt, IV_LENGTH);
    result.set(new Uint8Array(encrypted), IV_LENGTH + SALT_LENGTH);
    return result.buffer;
  } catch (e) {
    throw new Error('Failed to encrypt data');
  }
}

export async function decrypt(
  unlockKey: ArrayBuffer,
  data: ArrayBuffer
): Promise<ArrayBuffer> {
  if (data.byteLength < IV_LENGTH + SALT_LENGTH) {
    throw new Error('Invalid encrypted data');
  }

  try {
    const salt = new Uint8Array(data.slice(IV_LENGTH, IV_LENGTH + SALT_LENGTH));
    const key = await deriveKey(unlockKey, salt);

    return await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(data.slice(0, IV_LENGTH)),
      },
      key.key,
      new Uint8Array(data.slice(IV_LENGTH + SALT_LENGTH)).buffer
    );
  } catch (e) {
    throw new Error('Failed to decrypt data');
  }
}

export async function getKey(ctx: RuntimeContext) {
  const base64keyFromLocalStorage = localStorage.getItem('$tap-unlockKey');
  let key: ArrayBuffer | null = null;
  if (!base64keyFromLocalStorage) {
    const passwordPrompter = ctx.promptPassword;
    if (!passwordPrompter) {
      throw new Error('No password prompter available');
    }
    const password = await passwordPrompter();
    if (!password) {
      return null;
    }
    key = await unlockKey(password);
    const base64key = bytes_to_base64(key);
    localStorage.setItem('$tap-unlockKey', base64key);
  } else {
    key = base64_to_bytes(base64keyFromLocalStorage);
  }
  return key;
}

export async function secretCreate(ctx: RuntimeContext, data: string) {
  const key = await getKey(ctx);
  if (!key) return null;
  return bytes_to_base64(await encrypt(key, new TextEncoder().encode(data)));
}
