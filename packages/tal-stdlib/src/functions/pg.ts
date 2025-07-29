import { customRpc } from '../util/custom-rpc';
import {
  defineFunction3,
  RuntimeContext,
  typeAny,
  typeBoolean,
  typeDict,
  typeFunction,
  typeNull,
  typeString,
  typeUnion,
} from 'tal-eval';

export const pg_query = defineFunction3(
  'pg_query',
  [
    { name: 'uri' },
    { name: 'query' },
    { name: 'params' },
    { name: 'ssl' },
    { name: 'insecure' },
  ],
  typeFunction(
    [
      { name: 'uri', type: typeString() },
      { name: 'query', type: typeString() },
      { name: 'params', type: typeUnion(typeNull(), typeDict(typeAny())) },
      { name: 'ssl', type: typeUnion(typeNull(), typeBoolean()) },
      { name: 'insecure', type: typeUnion(typeNull(), typeBoolean()) },
    ],
    [],
    typeAny()
  ),
  undefined,
  pg_query_impl,
  {
    description:
      'Execute a parameterized SQL query against a PostgreSQL database',
    parameters: {
      uri: 'PostgreSQL connection URI',
      query: 'SQL query string with placeholders ($1, $2, ...)',
      params: 'Array of parameter values for the query',
      ssl: 'Whether to use SSL for the connection',
      insecure: 'Whether to allow insecure SSL connections',
    },
    returns: 'Result set of the query as JSON',
  }
);

function getUri(uri: string) {
  return uri;
}

export type PgLogItemData = {
  uri: string;
  query: string;
  params: unknown;
  result?: unknown;
  stage: 'pending' | 'fulfilled' | 'rejected';
};

async function pg_query_impl(
  _ctx: RuntimeContext,
  value: { [key: string]: any }
) {
  const logItemData: PgLogItemData = {
    uri: value.uri,
    params: value.params,
    query: value.query,
    stage: 'pending',
  };
  const logItem = _ctx.log('pg', logItemData);
  try {
    const response = await pgQuery({
      uri: getUri(value.uri),
      query: value.query,
      params: value.params,
      ssl: value.ssl,
      insecure: value.insecure,
    });
    logItem.data.result = response;
    logItem.data.stage = 'fulfilled';
    return response;
  } catch (e) {
    logItem.data.stage = 'rejected';
    throw e;
  }
}

async function pgQuery(params: {
  uri: string;
  query: string;
  params: unknown;
  ssl: boolean;
  insecure: boolean;
}) {
  const response = await customRpc('pg-query', params);
  if (response.status === 500) {
    const errorJson = await response.json();
    throw new Error(errorJson.message);
  }
  return response.json();
}
