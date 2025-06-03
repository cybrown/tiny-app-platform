import { defineFunction } from 'tal-eval';

export const record_keys = defineFunction(
  'record_keys',
  [{ name: 'record' }],
  (_ctx, { record }) => {
    return Object.keys(record);
  },
  undefined,
  {
    description:
      'Create an array of string containing all the keys of the record',
    parameters: {
      record: 'Record to find the keys from',
    },
    returns: 'The array of string of all keys',
  }
);

export const record_values = defineFunction(
  'record_values',
  [{ name: 'record' }],
  (_ctx, { record }) => {
    return Object.values(record);
  },
  undefined,
  {
    description:
      'Create an array of string containing all the values of the record',
    parameters: {
      record: 'Record to find the values from',
    },
    returns: 'The array of all values',
  }
);

export const record_entries = defineFunction(
  'record_entries',
  [{ name: 'record' }],
  (_ctx, { record }) => {
    return Object.entries(record);
  },
  undefined,
  {
    description:
      'Create an array of string containing all the entries of the record, as two arrays of two values',
    parameters: {
      record: 'Record to find the entries from',
    },
    returns: 'The array of all entries',
  }
);

export const record_from_entries = defineFunction(
  'record_from_entries',
  [{ name: 'entries' }],
  (_ctx, { entries }) => {
    return Object.fromEntries(entries);
  },
  undefined,
  {
    description:
      'Create a record containing all the entries of the array, as two arrays of two values',
    parameters: {
      entries: 'Array of key/values tuples',
    },
    returns: 'The record with all entries',
  }
);

export const record_get = defineFunction(
  'record_get',
  [{ name: 'record' }, { name: 'key' }],
  (_ctx, { record, key }) => {
    return record[key];
  },
  undefined,
  {
    description: 'Get the value of a record at the specified key',
    parameters: {
      record: 'Record to get the value from',
      key: 'Name of the key',
    },
    returns: 'The value contained at the specified key',
  }
);

export const record_has = defineFunction(
  'record_has',
  [{ name: 'record' }, { name: 'key' }],
  (_ctx, { record, key }) => {
    return record.hasOwnProperty(key);
  },
  undefined,
  {
    description: 'Returns true if a record has a key',
    parameters: {
      record: 'Record to search the key from',
      key: 'Name of the key to find',
    },
    returns: 'True if the key is found, else false',
  }
);

export const record_delete = defineFunction(
  'record_delete',
  [{ name: 'record' }, { name: 'key' }],
  (ctx, { record, key }) => {
    delete record[key];
    ctx.forceRefresh();
    return record;
  },
  undefined,
  {
    description: 'Mutates a record by removing a key',
    parameters: {
      record: 'Record to remove the key from',
      key: 'Name of the key to remove',
    },
    returns: 'The mutated record',
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
    description: "Creates a record that's a shallow merge of two other records",
    parameters: {
      record: 'Base record, its keys will be overwritten by the other record',
      other: 'Other record',
    },
    returns: 'The new record with both keys',
  }
);
