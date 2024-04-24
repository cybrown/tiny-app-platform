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
  _ctx: RuntimeContext,
  value: { [key: string]: any }
) {
  const response = await mongodbDeleteOne({
    uri: getUri(value.uri),
    collection: getCollection(value.collection),
    query: value.query,
    options: value.options,
  });
  return response;
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
  _ctx: RuntimeContext,
  value: { [key: string]: any }
) {
  const response = await mongodbQuery({
    uri: getUri(value.uri),
    collection: getCollection(value.collection),
    query: value.query,
    options: value.options,
  });
  return response;
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
  _ctx: RuntimeContext,
  value: { [key: string]: any }
) {
  const response = await mongodbInsertOne({
    uri: getUri(value.uri),
    collection: getCollection(value.collection),
    data: value.data,
    options: value.options,
  });
  return response;
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
  _ctx: RuntimeContext,
  value: { [key: string]: any }
) {
  const response = await mongodbUpdateOne({
    uri: getUri(value.uri),
    collection: getCollection(value.collection),
    query: value.query,
    data: value.data,
    options: value.options,
  });
  return response;
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
