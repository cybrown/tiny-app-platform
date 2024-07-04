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
  [{ name: 'record' }, { name: 'key' }],
  (_ctx, { record, key }) => {
    return record[key];
  }
);

export const record_has = defineFunction(
  'record_has',
  [{ name: 'record' }, { name: 'key' }],
  (_ctx, { record, key }) => {
    return record.hasOwnProperty(key);
  }
);

export const record_delete = defineFunction(
  'record_delete',
  [{ name: 'record' }, { name: 'key' }],
  (_ctx, { record, key }) => {
    delete record[key];
    return record;
  },
  undefined,
  {
    description: 'Remove a key of a record',
    parameters: {
      record: 'Record to remove the key from',
      key: 'Name of the key to remove',
    },
    returns: 'The updated record',
  }
);

export const record_exclude = defineFunction(
  'record_exclude',
  [{ name: 'record' }, { name: 'key' }],
  (_ctx, { record, key }) => {
    const { ...rest } = record;
    delete rest[key];
    return rest;
  },
  undefined,
  {
    description: 'Creates a record excluding a key',
    parameters: {
      record: 'Base record',
      key: 'Name of the key to exclude',
    },
    returns: 'The new record without the excluded key',
  }
);

export const record_set = defineFunction(
  'record_set',
  [{ name: 'record' }, { name: 'key' }, { name: 'value' }],
  (_ctx, { record, key, value }) => {
    return { ...record, [key]: value };
  },
  undefined,
  {
    description: 'Creates a record with a new key',
    parameters: {
      record: 'Base record',
      key: 'New key',
      value: 'Value to associate to the key',
    },
    returns: 'The new record with the added key',
  }
);

export const record_merge = defineFunction(
  'record_merge',
  [{ name: 'record' }, { name: 'other' }],
  (_ctx, { record, other }) => {
    return { ...record, ...other };
  },
  undefined,
  {
    description:
      "Return a new record that's a shallow merge of two other records",
    parameters: {
      record: 'Base record, its keys will be overwritten by the other record',
      other: 'Other record',
    },
    returns: 'A new record with both keys',
  }
);
