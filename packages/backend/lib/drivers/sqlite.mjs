import sqlite3 from "better-sqlite3";
import { readBody, okJson } from "../http-utils.mjs";

export const operations = [
  {
    route: "/op/sqlite-query",
    handler: async (req, pathParams) => {
      const body = await readBody(req);
      const request = JSON.parse(body.toString());
      let { uri, query, params, forceResult } = request;

      const db = sqlite3(uri);
      db.pragma("journal_mode = WAL");

      const prepared = db.prepare(query);

      const result =
        forceResult || /^select /i.test(query)
          ? prepared.all(...(params ?? []))
          : prepared.run(...(params ?? []));

      return okJson(result);
    },
  },
];
