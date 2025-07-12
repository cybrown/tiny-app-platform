import { defineFunction } from 'tal-eval';

interface StorageDriver {
  read(key: string): Promise<unknown>;
  write(key: string, value: unknown): Promise<void>;
  list(): Promise<string[]>;
  remove(key: string): Promise<void>;
}

class LocalStorageDriver implements StorageDriver {
  private static PREFIX = '$tal_';

  async read(key: string): Promise<unknown> {
    const valueFromStorage = localStorage.getItem(
      LocalStorageDriver.PREFIX + key
    );
    return valueFromStorage == null ? null : JSON.parse(valueFromStorage);
  }

  async write(key: string, value: unknown): Promise<void> {
    localStorage.setItem(
      LocalStorageDriver.PREFIX + key,
      JSON.stringify(value)
    );
  }

  async list(): Promise<string[]> {
    return Object.keys(localStorage).filter((key) =>
      key.startsWith(LocalStorageDriver.PREFIX)
    );
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(LocalStorageDriver.PREFIX + key);
  }
}

function getStorageDriver(): StorageDriver {
  return new LocalStorageDriver();
}

export const storage_read = defineFunction(
  'storage_read',
  [{ name: 'key' }],
  undefined,
  async (_ctx, { key }) => {
    return getStorageDriver().read(key);
  },
  {
    description: 'Read a value from the storage by key',
    parameters: {
      key: 'Key of the item to read',
    },
    returns: 'Value associated with the key, or undefined if not found',
  }
);

export const storage_write = defineFunction(
  'storage_write',
  [{ name: 'key' }, { name: 'value' }],
  undefined,
  async (_ctx, { key, value }) => {
    return getStorageDriver().write(key, value);
  },
  {
    description: 'Write a value to the storage under a given key',
    parameters: {
      key: 'Key under which to store the value',
      value: 'Value to store',
    },
    returns: 'Nothing',
  }
);

export const storage_list = defineFunction(
  'storage_list',
  [],
  undefined,
  async () => {
    return getStorageDriver().list();
  },
  {
    description: 'List all keys currently stored',
    parameters: {},
    returns: 'Array of stored keys',
  }
);

export const storage_remove = defineFunction(
  'storage_remove',
  [{ name: 'key' }],
  undefined,
  async (_ctx, { key }) => {
    return getStorageDriver().remove(key);
  },
  {
    description: 'Remove a value from the storage by key',
    parameters: {
      key: 'Key of the item to remove',
    },
    returns: 'Nothing',
  }
);
