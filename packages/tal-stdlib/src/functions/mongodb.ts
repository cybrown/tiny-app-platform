import { customRpc } from '../util/custom-rpc';
import { defineFunction, RuntimeContext } from 'tal-eval';

export const mongodb_find = defineFunction(
  'mongodb_find',
  [
    { name: 'uri' },
    { name: 'collection' },
    { name: 'query' },
    { name: 'options' },
  ],
  undefined,
  mongodb_find_impl,
  {
    description: 'Find documents in a MongoDB collection',
    parameters: {
      uri: 'MongoDB connection URI',
      collection: 'Name of the collection',
      query: 'Filter query object',
      options: 'Query options (projection, sort, etc.)',
    },
    returns: 'Array of matching documents',
  }
);

export const mongodb_insert_one = defineFunction(
  'mongodb_insert_one',
  [
    { name: 'uri' },
    { name: 'collection' },
    { name: 'data' },
    { name: 'options' },
  ],
  undefined,
  mongodb_insert_one_impl,
  {
    description: 'Insert a single document into a MongoDB collection',
    parameters: {
      uri: 'MongoDB connection URI',
      collection: 'Name of the collection',
      data: 'Document to insert',
      options: 'Insert options (e.g., write concern)',
    },
    returns: 'Result of the insertion operation',
  }
);

export const mongodb_update_one = defineFunction(
  'mongodb_update_one',
  [
    { name: 'uri' },
    { name: 'collection' },
    { name: 'query' },
    { name: 'data' },
    { name: 'options' },
  ],
  undefined,
  mongodb_update_one_impl,
  {
    description: 'Update a single document in a MongoDB collection',
    parameters: {
      uri: 'MongoDB connection URI',
      collection: 'Name of the collection',
      query: 'Filter to select the document',
      data: 'Update operations object',
      options: 'Update options (e.g., upsert)',
    },
    returns: 'Result of the update operation',
  }
);

export const mongodb_delete_one = defineFunction(
  'mongodb_delete_one',
  [
    { name: 'uri' },
    { name: 'collection' },
    { name: 'query' },
    { name: 'options' },
  ],
  undefined,
  mongodb_delete_one_impl,
  {
    description: 'Delete a single document from a MongoDB collection',
    parameters: {
      uri: 'MongoDB connection URI',
      collection: 'Name of the collection',
      query: 'Filter to select the document',
      options: 'Delete options',
    },
    returns: 'Result of the delete operation',
  }
);

export const mongodb_delete_many = defineFunction(
  'mongodb_delete_many',
  [
    { name: 'uri' },
    { name: 'collection' },
    { name: 'query' },
    { name: 'options' },
    { name: 'confirm' },
  ],
  undefined,
  mongodb_delete_many_impl,
  {
    description: 'Delete many documents from a MongoDB collection',
    parameters: {
      uri: 'MongoDB connection URI',
      collection: 'Name of the collection',
      query: 'Filter to select the document',
      options: 'Delete options',
      confirm: 'Whether to skip confirmation prompt (default: true)',
    },
    returns: 'Result of the delete operation',
  }
);

function getUri(uri: string) {
  return uri;
}

function getCollection(collection: string) {
  return collection;
}

async function mongodb_delete_one_impl(
  ctx: RuntimeContext,
  value: { [key: string]: any }
) {
  return withLog(ctx, 'delete-one', value, value.options, () =>
    mongodbDelete({
      uri: getUri(value.uri),
      collection: getCollection(value.collection),
      query: value.query,
      options: value.options,
      many: false,
    })
  );
}

async function mongodb_delete_many_impl(
  ctx: RuntimeContext,
  value: { [key: string]: any }
) {
  if (
    (value.confirm ?? true) &&
    !(await ctx.dispatch('confirm', {
      message:
        'Are you sure you want to delete MANY documents? This action cannot be undone.',
    }))
  ) {
    return;
  }
  return withLog(ctx, 'delete-many', value, value.options, () =>
    mongodbDelete({
      uri: getUri(value.uri),
      collection: getCollection(value.collection),
      query: value.query,
      options: value.options,
      many: true,
    })
  );
}

async function mongodbDelete(params: {
  uri: string;
  collection: string;
  query: unknown;
  options: unknown;
  many: boolean;
}) {
  const response = await customRpc('mongodb-delete', params);
  if (response.status === 500) {
    const errorJson = await response.json();
    throw new Error(errorJson.message);
  }
  return response.json();
}

async function mongodb_find_impl(
  ctx: RuntimeContext,
  value: { [key: string]: any }
) {
  return withLog(ctx, 'find', value, value.options, () =>
    mongodbQuery({
      uri: getUri(value.uri),
      collection: getCollection(value.collection),
      query: value.query,
      options: value.options,
    })
  );
}

async function mongodbQuery(params: {
  uri: string;
  collection: string;
  query: unknown;
  options: unknown;
}) {
  const response = await customRpc('mongodb-find', params);
  if (response.status === 500) {
    const errorJson = await response.json();
    throw new Error(errorJson.message);
  }
  return response.json();
}

async function mongodb_insert_one_impl(
  ctx: RuntimeContext,
  value: { [key: string]: any }
) {
  return withLog(ctx, 'insert-one', value, value.options, () =>
    mongodbInsertOne({
      uri: getUri(value.uri),
      collection: getCollection(value.collection),
      data: value.data,
      options: value.options,
    })
  );
}

async function mongodbInsertOne(params: {
  uri: string;
  collection: string;
  data: unknown;
  options: unknown;
}) {
  const response = await customRpc('mongodb-insert-one', params);
  if (response.status === 500) {
    const errorJson = await response.json();
    throw new Error(errorJson.message);
  }
  return response.json();
}

async function mongodb_update_one_impl(
  ctx: RuntimeContext,
  value: { [key: string]: any }
) {
  return withLog(ctx, 'update-one', value, value.options, () =>
    mongodbUpdateOne({
      uri: getUri(value.uri),
      collection: getCollection(value.collection),
      query: value.query,
      data: value.data,
      options: value.options,
    })
  );
}

async function mongodbUpdateOne(params: {
  uri: string;
  collection: string;
  query: unknown;
  data: unknown;
  options: unknown;
}) {
  const response = await customRpc('mongodb-update-one', params);
  if (response.status === 500) {
    const errorJson = await response.json();
    throw new Error(errorJson.message);
  }
  return response.json();
}

export type MongoLogItemData = {
  query: {
    operation: string;
    uri: string;
    collection: string;
    query: unknown;
    options: unknown;
    data: unknown;
  };
  stage: 'pending' | 'fulfilled' | 'rejected';
  result?: unknown;
};

async function withLog(
  ctx: RuntimeContext,
  operation: string,
  query: any,
  options: any,
  fn: () => Promise<any>
) {
  const logItemData: MongoLogItemData = {
    query: {
      ...query,
      operation,
      options,
    },
    stage: 'pending',
  };
  const logItem = ctx.log('mongo', logItemData);
  try {
    const response = await fn();
    logItem.data.result = response;
    logItem.data.stage = 'fulfilled';
    return response;
  } catch (err) {
    logItem.data.stage = 'rejected';
    throw err;
  }
}
