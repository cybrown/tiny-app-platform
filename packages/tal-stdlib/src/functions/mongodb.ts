import { customRpc } from '../util/custom-rpc';
import { defineFunction, RuntimeContext } from 'tal-eval';

export const mongodb_find = defineFunction(
  'mongodb_find',
  [
    { name: 'uri', onlyNamed: true },
    { name: 'collection', onlyNamed: true },
    { name: 'query' },
    { name: 'options' },
  ],
  undefined,
  mongodb_find_impl
);

export const mongodb_insert_one = defineFunction(
  'mongodb_insert_one',
  [
    { name: 'uri', onlyNamed: true },
    { name: 'collection', onlyNamed: true },
    { name: 'data' },
    { name: 'options' },
  ],
  undefined,
  mongodb_insert_one_impl
);

export const mongodb_update_one = defineFunction(
  'mongodb_update_one',
  [
    { name: 'uri', onlyNamed: true },
    { name: 'collection', onlyNamed: true },
    { name: 'query' },
    { name: 'data' },
    { name: 'options' },
  ],
  undefined,
  mongodb_update_one_impl
);

export const mongodb_delete_one = defineFunction(
  'mongodb_delete_one',
  [
    { name: 'uri', onlyNamed: true },
    { name: 'collection', onlyNamed: true },
    { name: 'query' },
    { name: 'options' },
  ],
  undefined,
  mongodb_delete_one_impl
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
  return withLog(ctx, 'delete-one', value, () =>
    mongodbDeleteOne({
      uri: getUri(value.uri),
      collection: getCollection(value.collection),
      query: value.query,
      options: value.options,
    })
  );
}

async function mongodbDeleteOne(params: {
  uri: string;
  collection: string;
  query: unknown;
  options: unknown;
}) {
  const response = await customRpc('mongodb-delete-one', params);
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
  return withLog(ctx, 'find', value, () =>
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
  return withLog(ctx, 'insert-one', value, () =>
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
  return withLog(ctx, 'update-one', value, () =>
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
    data: unknown;
  };
  stage: 'pending' | 'fulfilled' | 'rejected';
  result?: unknown;
};

async function withLog(
  ctx: RuntimeContext,
  operation: string,
  query: any,
  fn: () => Promise<any>
) {
  const logItemData: MongoLogItemData = {
    query: {
      ...query,
      operation,
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
