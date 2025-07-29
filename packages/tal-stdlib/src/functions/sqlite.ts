import {
  defineFunction3,
  typeAny,
  typeBoolean,
  typeDict,
  typeFunction,
  typeNull,
  typeString,
  typeUnion,
} from 'tal-eval';
import { customRpc } from '../util/custom-rpc';

export type SqliteLogItemData = {
  uri: string;
  query: string;
  params: unknown;
  forceResult: unknown;
  result?: unknown;
  stage: 'pending' | 'fulfilled' | 'rejected';
};

export const sqlite_query = defineFunction3(
  'sqlite_query',
  [
    { name: 'uri' },
    { name: 'query' },
    { name: 'params' },
    { name: 'forceResult' },
  ],
  typeFunction(
    [
      { name: 'uri', type: typeString() },
      { name: 'query', type: typeString() },
      { name: 'params', type: typeUnion(typeNull(), typeDict(typeAny())) },
      { name: 'forceResult', type: typeUnion(typeNull(), typeBoolean()) },
    ],
    [],
    typeAny()
  ),
  undefined,
  async (_ctx, value) => {
    const params = Array.isArray(value.params)
      ? value.params
      : value.params == null
      ? []
      : [value.params];
    const logItemData: SqliteLogItemData = {
      uri: value.uri,
      params: params,
      query: value.query,
      forceResult: value.forceResult,
      stage: 'pending',
    };
    const logItem = _ctx.log('sqlite', logItemData);
    try {
      const response = await sqliteQuery({
        uri: value.uri,
        query: value.query,
        forceResult: value.forceResult,
        params: params,
      });
      logItem.data.result = response;
      logItem.data.stage = 'fulfilled';
      return response;
    } catch (e) {
      logItem.data.stage = 'rejected';
      throw e;
    }
  },
  {
    description: 'Run any sqlite query',
    parameters: {
      uri: 'Path to database, only local files are supported',
      query: 'Query to execute',
      params: 'Query parameters',
      forceResult:
        'Force result mode, only select queries are in select mode by default, enable this in case I forgot other kinds of queries that return data',
    },
    returns:
      'Array for select statements, object having a changes and lastInsertRowid keys for any other queries',
    parameterExamples: {
      forceResult: 'false',
      params: '[]',
      query: 'select * from users',
      uri: '/test.db',
    },
  }
);

async function sqliteQuery(params: {
  uri: string;
  query: string;
  params: unknown;
  forceResult: unknown;
}) {
  const response = await customRpc('sqlite-query', params);
  if (response.status === 500) {
    const errorJson = await response.json();
    throw new Error(errorJson.message);
  }
  return response.json();
}
