import { customRpc } from "../util/custom-rpc";
import { defineFunction, RuntimeContext } from "tal-eval";

export const pg_query = defineFunction(
  "pg_query",
  [{ name: "uri" }, { name: "query" }, { name: "params" }],
  undefined,
  pg_query_impl
);

async function pg_query_impl(
  _ctx: RuntimeContext,
  value: { [key: string]: any }
) {
  const response = await pgQuery({
    uri: value.uri,
    query: value.query,
    params: value.params,
  });
  return response;
}

async function pgQuery(params: {
  uri: string;
  query: string;
  params: unknown;
}) {
  const response = await customRpc("pg-query", params);
  if (response.status === 500) {
    const errorJson = await response.json();
    throw new Error(errorJson.message);
  }
  return response.json();
}
