const { createResponse, readBody, okJson } = require("../http-utils");
const URL = require("url");
const bson = require("bson");
const mongodb = require("mongodb");

async function createMongoClient(uri) {
  const client = new mongodb.MongoClient(uri);
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  return client;
}

operations = [
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
    route: "/op/mongodb-delete-one",
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
        const deleteResult = await collection.deleteOne(query, options);
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

module.exports.createMongoClient = createMongoClient;
module.exports.operations = operations;
