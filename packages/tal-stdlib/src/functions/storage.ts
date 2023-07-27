import { defineFunction } from "tal-eval";

interface StorageDriver {
  read(key: string): Promise<unknown>;
  write(key: string, value: unknown): Promise<void>;
  list(): Promise<string[]>;
  remove(key: string): Promise<void>;
}

class LocalStorageDriver implements StorageDriver {
  private static PREFIX = "$tal_";

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
  "storage_read",
  [{ name: "key" }],
  undefined,
  async (_ctx, { key }) => {
    return getStorageDriver().read(key);
  }
);

export const storage_write = defineFunction(
  "storage_write",
  [{ name: "key" }, { name: "value" }],
  undefined,
  async (_ctx, { key, value }) => {
    return getStorageDriver().write(key, value);
  }
);

export const storage_list = defineFunction(
  "storage_list",
  [],
  undefined,
  async () => {
    return getStorageDriver().list();
  }
);

export const storage_remove = defineFunction(
  "storage_remove",
  [{ name: "key" }],
  undefined,
  async (_ctx, { key }) => {
    return getStorageDriver().remove(key);
  }
);
