import { defineFunction, metadataSet } from 'tal-eval';

export const flex = defineFunction(
  'flex',
  [{ name: 'value' }, { name: 'flexValue' }],
  (_ctx, { value, flexValue }) => {
    metadataSet(value, { flex: flexValue });
    return value;
  }
);
