import { createResponse, readBody, okJson } from "../http-utils.mjs";
import URL from "url";
import * as bson from "bson";
import mongodb from "mongodb";

export async function createMongoClient(uri) {
  const client = new mongodb.MongoClient(uri);
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  return client;
}

export const operations = [
  {
    route: "/op/mongodb-find",
    handler: async (req, params) => {
      const body = await readBody(req);
      const request = JSON.parse(body.toString());
      let { uri, query: queryFromRequest, options } = request;
      const query = queryFromRequest
        ? bson.EJSON.parse(JSON.stringify(queryFromRequest))
        : {};
      const client = await createMongoClient(uri);
      try {
        const rUri = new URL.URL(uri);
        const dbName = rUri.pathname.slice(1);
        const db = client.db(dbName);
        const collection = db.collection(request.collection);
        const doc = await collection
          .find(query, { limit: 10, ...options })
          .toArray();
        return createResponse(
          200,
          { "Content-Type": "application/json" },
          bson.EJSON.stringify(doc)
        );
      } finally {
        client.close();
      }
    },
  },
  {
    route: "/op/mongodb-delete",
    handler: async (req, params) => {
      const body = await readBody(req);
      const request = JSON.parse(body.toString());
      let { uri, query: queryFromRequest, options, many } = request;
      const query = queryFromRequest
        ? bson.EJSON.parse(JSON.stringify(queryFromRequest))
        : {};
      const client = await createMongoClient(uri);
      try {
        const rUri = new URL.URL(uri);
        const dbName = rUri.pathname.slice(1);
        const db = client.db(dbName);
        const collection = db.collection(request.collection);
        const deleteResult = await (many
          ? collection.deleteMany(query, options)
          : collection.deleteOne(query, options));
        return okJson(deleteResult);
      } finally {
        client.close();
      }
    },
  },
  {
    route: "/op/mongodb-update-one",
    handler: async (req, params) => {
      const body = await readBody(req);
      const request = JSON.parse(body.toString());
      let { uri, query: queryFromRequest, data, options } = request;
      const query = queryFromRequest
        ? bson.EJSON.parse(JSON.stringify(queryFromRequest))
        : {};
      data = bson.EJSON.parse(JSON.stringify(data));
      const client = await createMongoClient(uri);
      try {
        const rUri = new URL.URL(uri);
        const dbName = rUri.pathname.slice(1);
        const db = client.db(dbName);
        const collection = db.collection(request.collection);
        const updateResult = await collection.updateOne(query, data, options);
        return okJson(updateResult);
      } finally {
        client.close();
      }
    },
  },
  {
    route: "/op/mongodb-insert-one",
    handler: async (req, params) => {
      const body = await readBody(req);
      const request = JSON.parse(body.toString());
      let { uri, data, options } = request;
      data = bson.EJSON.parse(JSON.stringify(data));
      const client = await createMongoClient(uri);
      try {
        const rUri = new URL.URL(uri);
        const dbName = rUri.pathname.slice(1);
        const db = client.db(dbName);
        const collection = db.collection(request.collection);
        const insertionResult = await collection.insertOne(data, options);
        return okJson(insertionResult);
      } finally {
        client.close();
      }
    },
  },
];
