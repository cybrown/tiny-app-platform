const { createServer } = require("http");
const serveStatic = require("serve-static");
const {
  superHandler,
  createResponse,
  readBody,
  okJson,
  okText,
  noContent,
  sendResponse,
} = require("./http-utils");
const https = require("https");
const http = require("http");
const URL = require("url");
const path = require("path");
const FormData = require("form-data");
const fs = require("fs");
const contentDisposition = require("content-disposition");
const { createMongoClient } = require("./mongodb");
const bson = require("bson");
const child_process = require("child_process");
const { Client } = require("pg");

const server = createServer();

function httpRequest(method, urlStr, headers, body) {
  return new Promise((resolve, reject) => {
    const request = (urlStr.startsWith("https") ? https : http).request(
      urlStr,
      {
        method,
        headers,
      },
      (response) => {
        readBody(response)
          .then((body) => {
            if ("set-cookie" in response.headers) {
              response.headers["x-set-cookie"] = response.headers["set-cookie"];
            }
            return resolve(
              createResponse(response.statusCode, response.headers, body)
            );
          })
          .catch(reject);
      }
    );
    body.pipe(request);

    body.on("error", (err) => reject(err));
    request.on("error", (err) => reject(err));
  });
}

const routes = [
  {
    route: "/health",
    handler: async (req) => {
      return okJson({ up: true });
    },
  },
  {
    route: "/op/fetch",
    handler: async (req, params) => {
      const headers = {};
      let url;
      let method;
      Object.entries(req.headers).forEach(([key, value]) => {
        if (key === "x-fetch-method") {
          method = value;
        } else if (key === "x-fetch-url") {
          url = value;
        } else if (key.startsWith("x-fetch-header-")) {
          headers[key.slice("x-fetch-header-".length)] = value;
        }
      });
      if (!method) {
        return createResponse(400, null, "Missing x-fetch-method header");
      }
      if (!url) {
        return createResponse(400, null, "Missing x-fetch-url header");
      }
      try {
        return await httpRequest(method, url, headers, req);
      } catch (err) {
        console.error(err);
        return createResponse(500);
      }
    },
  },
  {
    route: "/op/http-request-form-data",
    handler: async (req, params) => {
      const headers = {};
      let url;
      let method;
      Object.entries(req.headers).forEach(([key, value]) => {
        if (key === "x-fetch-method") {
          method = value;
        } else if (key === "x-fetch-url") {
          url = value;
        } else if (key.startsWith("x-fetch-header-")) {
          headers[key.slice("x-fetch-header-".length)] = value;
        }
      });
      if (!method) {
        return createResponse(400, null, "Missing x-fetch-method header");
      }
      if (!url) {
        return createResponse(400, null, "Missing x-fetch-url header");
      }

      const body = await readBody(req);
      const formInfo = JSON.parse(body);

      const form = new FormData({ pauseStreams: false });
      await Promise.all(
        Object.entries(formInfo).map(async ([field, info]) => {
          let valueToAppend;
          let optionToAppend;
          switch (info.sourceKind) {
            case "string": {
              valueToAppend = info.value;
              break;
            }
            case "file": {
              valueToAppend = fs.createReadStream(info.value);
              break;
            }
            case "url": {
              valueToAppend = await new Promise((resolve, reject) => {
                const req = (info.value.startsWith("https")
                  ? https
                  : http
                ).request(info.value, (response) => {
                  let filename;
                  if (response.headers["content-disposition"]) {
                    const disposition = contentDisposition.parse(
                      response.headers["content-disposition"]
                    );
                    if (
                      disposition.type === "attachment" &&
                      disposition.parameters.filename
                    ) {
                      filename = disposition.parameters.filename;
                    }
                  }
                  if (!filename) {
                    filename =
                      path.basename(URL.parse(info.value).path) || "unnamed";
                  }
                  optionToAppend = {
                    contentType: response.headers["content-type"],
                    filename,
                  };
                  resolve(readBody(response));
                });
                req.end();
              });
              break;
            }
            default:
              throw new Error("info sourceKind not known: " + info.sourceKind);
          }
          form.append(field, valueToAppend, optionToAppend);
        })
      );

      try {
        return await httpRequest(
          method,
          url,
          { ...headers, ...form.getHeaders() },
          form
        );
      } catch (err) {
        console.error(err);
        return createResponse(500);
      }
    },
  },
  {
    route: "/op/mongodb-find",
    handler: async (req, params) => {
      const body = await readBody(req);
      const request = JSON.parse(body.toString());
      let { uri, query, options } = request;
      if (query) {
        query = bson.EJSON.parse(JSON.stringify(query));
      }
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
      let { uri, query, options } = request;
      query = bson.EJSON.parse(JSON.stringify(query));
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
      let { uri, query, data, options } = request;
      query = bson.EJSON.parse(JSON.stringify(query));
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
  {
    route: "/op/exec-process",
    handler: async (req, params) => {
      const body = await readBody(req);
      const request = JSON.parse(body.toString());
      let { fileName, args, cwd, timeout } = request;
      const result = await new Promise((resolve, reject) => {
        const childProcess = child_process.execFile(fileName, args, {
          cwd: cwd,
          encoding: "buffer",
        });
        const stdoutBuffers = [];
        childProcess.stdout.on("data", (data) => stdoutBuffers.push(data));
        childProcess.on("exit", () => resolve(Buffer.concat(stdoutBuffers)));
        childProcess.on("error", reject);
        if (timeout != null) {
          setTimeout(() => resolve(Buffer.concat(stdoutBuffers)), timeout);
        }
      });
      return createResponse(200, [], result);
    },
  },
  {
    route: "/op/pg-query",
    handler: async (req, pathParams) => {
      const body = await readBody(req);
      const request = JSON.parse(body.toString());
      let { uri, query, params } = request;

      const client = new Client({ connectionString: uri });
      try {
        await client.connect();

        const res = await client.query(query, params);

        let result = {};

        switch (res.command) {
          case "SELECT":
            result.rows = res.rows;
            break;
          case "INSERT":
            result.rowCount = res.rowCount;
            result.oid = res.oid;
            break;
          case "UPDATE":
            result.rowCount = res.rowCount;
            break;
          case "DELETE":
            result.rowCount = res.rowCount;
            break;
          default:
            result = res;
        }

        return okJson(result);
      } finally {
        await client.end();
      }
    },
  },
  {
    route: "/configuration",
    handler: async (req, pathParams) => {
      return okJson({
        features: [
          ...(process.env.hasOwnProperty("MONGODB_URI")
            ? ["remote-storage"]
            : []),
        ],
      });
    },
  },
  {
    route: "/apps/read/:name",
    handler: async (req, pathParams) => {
      const appName = pathParams.name;
      const uri = process.env.MONGODB_URI;
      const client = await createMongoClient(uri);
      try {
        const rUri = new URL.URL(uri);
        const dbName = rUri.pathname.slice(1);
        const db = client.db(dbName);
        const collection = db.collection("apps");
        const doc = await collection.findOne({ name: appName });
        return okText(doc ? doc.source : "\n");
      } finally {
        client.close();
      }
    },
  },
  {
    route: "/apps/write/:name",
    handler: async (req, pathParams) => {
      const appName = pathParams.name;
      const body = await readBody(req);
      const uri = process.env.MONGODB_URI;
      const client = await createMongoClient(uri);
      try {
        const rUri = new URL.URL(uri);
        const dbName = rUri.pathname.slice(1);
        const db = client.db(dbName);
        const collection = db.collection("apps");
        const doc = await collection.updateOne(
          {
            name: appName,
          },
          {
            $set: {
              source: body.toString(),
            },
          },
          {
            upsert: true,
          }
        );
      } finally {
        client.close();
      }
      return noContent();
    },
  },
];

const staticHandler = serveStatic("./public");
const staticHandlerFinal = serveStatic("./public", {
  fallthrough: false,
});

const handleRequest = superHandler(routes, (req, res) => {
  req.url = "/";
  staticHandlerFinal(req, res, (err) =>
    sendResponse(res, { status: err.statusCode ?? 500 })
  );
});

server.on("request", (req, res) =>
  staticHandler(req, res, () => handleRequest(req, res))
);

module.exports = server;
