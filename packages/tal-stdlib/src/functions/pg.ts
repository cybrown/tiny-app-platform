import { customRpc } from '../util/custom-rpc';
import { defineFunction, RuntimeContext } from 'tal-eval';

export const pg_query = defineFunction(
  'pg_query',
  [{ name: 'uri', onlyNamed: true }, { name: 'query' }, { name: 'params' }],
  undefined,
  pg_query_impl
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
}) {
  const response = await customRpc('pg-query', params);
  if (response.status === 500) {
    const errorJson = await response.json();
    throw new Error(errorJson.message);
  }
  return response.json();
}
