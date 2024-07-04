import { defineFunction } from 'tal-eval';

export const record_keys = defineFunction(
  'record_keys',
  [{ name: 'record' }],
  (_ctx, { record }) => {
    return Object.keys(record);
  }
);

export const record_values = defineFunction(
  'record_values',
  [{ name: 'record' }],
  (_ctx, { record }) => {
    return Object.values(record);
  }
);

export const record_entries = defineFunction(
  'record_entries',
  [{ name: 'record' }],
  (_ctx, { record }) => {
    return Object.entries(record);
  }
);

export const record_get = defineFunction(
  'record_get',
  [{ name: 'record' }, { name: 'member' }],
  (_ctx, { record, member }) => {
    return record[member];
  }
);

export const record_has = defineFunction(
  'record_has',
  [{ name: 'record' }, { name: 'member' }],
  (_ctx, { record, member }) => {
    return record.hasOwnProperty(member);
  }
);

export const record_set = defineFunction(
  'record_set',
  [{ name: 'record' }, { name: 'key' }, { name: 'value' }],
  (_ctx, { record, key, value }) => {
    return { ...record, [key]: value };
  }
);

export const record_merge = defineFunction(
  'record_merge',
  [{ name: 'record' }, { name: 'other' }],
  (_ctx, { record, other }) => {
    return { ...record, ...other };
  }
);
