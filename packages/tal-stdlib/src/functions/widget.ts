import { defineFunction, metadataSet } from 'tal-eval';

export const flex = defineFunction(
  'flex',
  [{ name: 'value' }, { name: 'flexValue' }],
  (_ctx, { value, flexValue }) => {
    metadataSet(value, { flexGrow: flexValue });
    return value;
  }
);

export const scroller = defineFunction(
  'scroller',
  [{ name: 'value' }],
  (_ctx, { value }) => {
    metadataSet(value, { flexGrow: 1, flexShrink: 1, scroller: true });
    return value;
  }
);

export const tab = defineFunction(
  'tab',
  [{ name: 'value' }, { name: 'id' }, { name: 'title' }],
  (_ctx, { value, id, title }) => {
    metadataSet(value, { tab: { id, title } });
    return value;
  }
);
