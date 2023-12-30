const metadataRegistry = new WeakMap<object, object>();

export function metadataSet(value: object, metadata: object) {
  if (metadataRegistry.has(value)) {
    const currentMetadata = metadataRegistry.get(value);
    metadataRegistry.set(value, { ...currentMetadata, ...metadata });
  } else {
    metadataRegistry.set(value, { ...metadata });
  }
}

export function metadataGet(value: object): object | undefined {
  return metadataRegistry.get(value);
}
