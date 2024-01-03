import { defineFunction, metadataGet, metadataSet } from 'tal-eval';

export const metadata_set = defineFunction(
  'metadata_set',
  [{ name: 'value' }, { name: 'metadata' }],
  (_ctx, { value, metadata }: any) => {
    metadataSet(value, metadata);
    return value;
  }
);

export const metadata_get = defineFunction(
  'metadata_get',
  [{ name: 'value' }],
  (_ctx, { value }: any) => {
    return metadataGet(value);
  }
);
