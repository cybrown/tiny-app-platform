import { defineFunction } from "tal-eval";
import { search } from "jmespath";

export const json_parse = defineFunction(
  "json_parse",
  [{ name: "string" }],
  (ctx, { string }) => {
    return JSON.parse(string);
  }
);

export const json_stringify = defineFunction(
  "json_stringify",
  [{ name: "any" }],
  (ctx, { any }) => {
    return JSON.stringify(any);
  }
);

export const jmespath_search = defineFunction(
  "jmespath_search",
  [{ name: "json" }, { name: "query" }],
  (ctx, { json, query }) => {
    return search(json, query as string);
  }
);
