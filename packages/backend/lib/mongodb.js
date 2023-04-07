const mongodb = require("mongodb");

async function createMongoClient(uri) {
  const client = new mongodb.MongoClient(uri);
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  return client;
}

module.exports.createMongoClient = createMongoClient;
