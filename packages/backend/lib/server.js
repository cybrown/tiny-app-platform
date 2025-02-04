const { createServer } = require("http");
const serveStatic = require("serve-static");
const {
  superHandler,
  createResponse,
  readBody,
  okBytes,
  okJson,
  okText,
  noContent,
  sendResponse,
  notFound,
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
const ssh2 = require("ssh2");
const { createRedisClient } = require("./redis");
const config = require("./config");

const server = createServer();

function httpRequest(method, urlStr, headers, body, insecure = false) {
  return new Promise((resolve, reject) => {
    const request = (urlStr.startsWith("https") ? https : http).request(
      urlStr,
      {
        method,
        headers,
        rejectUnauthorized: !insecure,
      },
      (response) => {
        readBody(response)
          .then((body) => {
            const responseHeaders = Object.fromEntries(
              Object.entries(response.headers).map(([key, value]) => [
                "x-fetch-header-" + key,
                value,
              ])
            );
            responseHeaders["x-fetch-status-code"] = response.statusCode;

            // Forward this header as is to let the browser decompress the body
            if (response.headers["content-encoding"]) {
              responseHeaders["content-encoding"] =
                response.headers["content-encoding"];
            }

            return resolve(createResponse(200, responseHeaders, body));
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
      let insecure = false;
      Object.entries(req.headers).forEach(([key, value]) => {
        if (key === "x-fetch-method") {
          method = value;
        } else if (key === "x-fetch-url") {
          url = value;
        } else if (key.startsWith("x-fetch-header-")) {
          headers[key.slice("x-fetch-header-".length)] = value;
        } else if (key.startsWith("x-fetch-insecure")) {
          insecure = JSON.parse(value);
          if (typeof insecure != "boolean") {
            throw new Error("Parameter insecure must be a boolean");
          }
        }
      });
      if (!method) {
        return createResponse(400, null, "Missing x-fetch-method header");
      }
      if (!url) {
        return createResponse(400, null, "Missing x-fetch-url header");
      }
      try {
        return await httpRequest(method, url, headers, req, insecure);
      } catch (err) {
        config.log && console.error(err);
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
        config.log && console.error(err);
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
      if (process.env.hasOwnProperty("DISABLE_PROCESS_OPS")) {
        return createResponse(
          400,
          null,
          "Process related operations disabled on this server"
        );
      }
      const body = await readBody(req);
      const request = JSON.parse(body.toString());
      let { fileName, args, env, cwd, timeout } = request;
      let exitStatus = null;
      let pid = "";
      const result = await new Promise((resolve, reject) => {
        const childProcess = child_process.execFile(fileName, args, {
          cwd,
          env: { ...process.env, ...env },
          encoding: "buffer",
        });
        pid = childProcess.pid;
        const stdoutBuffers = [];
        childProcess.stdout.on("data", (data) => stdoutBuffers.push(data));
        childProcess.on("exit", () => {
          exitStatus = childProcess.exitCode;
          resolve(Buffer.concat(stdoutBuffers));
        });
        childProcess.on("error", reject);
        if (timeout != null) {
          setTimeout(() => {
            childProcess.kill("SIGKILL");
            resolve(Buffer.concat(stdoutBuffers));
          }, timeout);
        }
      });
      return createResponse(
        200,
        { "x-exit-status": exitStatus, "x-pid": pid },
        result
      );
    },
  },
  {
    route: "/op/kill-process",
    handler: async (req) => {
      if (process.env.hasOwnProperty("DISABLE_PROCESS_OPS")) {
        return createResponse(
          400,
          null,
          "Process related operations disabled on this server"
        );
      }
      const body = await readBody(req);
      const request = JSON.parse(body.toString());
      let { pid, signal } = request;
      process.kill(pid, signal ?? undefined);
      return noContent();
    },
  },
  {
    route: "/op/exec-process-stream",
    handler: async (req, params) => {
      if (process.env.hasOwnProperty("DISABLE_PROCESS_OPS")) {
        return createResponse(
          400,
          null,
          "Process related operations disabled on this server"
        );
      }
      const body = await readBody(req);
      const request = JSON.parse(body.toString());
      let { fileName, args, env, cwd, timeout } = request;
      const childProcess = child_process.execFile(fileName, args, {
        cwd,
        env: { ...process.env, ...env },
        encoding: "buffer",
      });
      if (timeout != null) {
        setTimeout(() => childProcess.kill("SIGKILL"), timeout);
      }

      req.on("close", () => childProcess.kill("SIGKILL"));
      req.on("error", (err) => {
        config.log && console.error("request error:", err);
        childProcess.kill("SIGKILL");
      });

      // Use raw response to finely control it
      return (res) => {
        res.writeHead(200, {
          "x-pid": childProcess.pid,
        });
        childProcess.on("close", (statusCode) => {
          const frame = Buffer.alloc(7);
          frame.writeUInt32BE(3, 0);
          frame.writeUint8(3, 4);
          frame.writeUint8(statusCode != null ? 1 : 0, 5);
          frame.writeUint8(statusCode ?? 0, 6);
          res.write(frame);
          res.end();
        });
        childProcess.on("error", (err) => {
          config.log && console.error("childProcess error:", err);
          childProcess.kill("SIGKILL");
        });
        res.on("close", () => childProcess.kill("SIGKILL"));
        res.on("error", (err) => {
          config.log && console.error("response error:", err);
          childProcess.kill("SIGKILL");
        });

        // Frame: 4 bytes for length, 1 byte for (1: stdout, 2: stderr), then the data

        childProcess.stdout.on("data", (data) => {
          const frameHeader = Buffer.alloc(4 + 1);
          frameHeader.writeUInt32BE(1 + data.length, 0);
          frameHeader.writeUInt8(1, 4);
          res.write(frameHeader);
          res.write(data);
        });
        childProcess.stderr.on("data", (data) => {
          const frameHeader = Buffer.alloc(4 + 1);
          frameHeader.writeUInt32BE(data.length + 1, 0);
          frameHeader.writeUInt8(2, 4);
          res.write(frameHeader);
          res.write(data);
        });
      };
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

        let result = {
          command: res.command,
        };

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
            result.rowCount = res.rowCount;
            result.oid = res.oid;
            result.rows = res.rows;
            result.fields = res.fields;
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
        if (doc) {
          return okText(doc.source);
        } else {
          return notFound();
        }
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
        await collection.updateOne(
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
  {
    route: "/op/ssh-exec",
    handler: async (req) => {
      const body = await readBody(req);
      const request = JSON.parse(body.toString());
      const { host, port, username, password, timeout, command, pty } = request;

      const conn = new ssh2.Client();

      conn.connect({
        host,
        port: port ?? 22,
        username,
        password,
      });

      if (timeout != null) {
        setTimeout(() => conn.destroy(), timeout);
      }

      return (res) => {
        res.on("close", () => {
          conn.destroy();
        });

        res.on("error", () => {
          conn.destroy();
        });

        conn.on("ready", () => {
          conn.exec(command, { pty: pty ?? false }, (err, stream) => {
            if (err) throw err;
            stream.on("close", (code) => {
              const frame = Buffer.alloc(7);
              frame.writeUInt32BE(3, 0);
              frame.writeUint8(3, 4);
              frame.writeUint8(code != null ? 1 : 0, 5);
              frame.writeUint8(code ?? 0, 6);
              res.write(frame);
              conn.end();
              res.end();
            });

            stream.on("data", (data) => {
              const frameHeader = Buffer.alloc(4 + 1);
              frameHeader.writeUInt32BE(1 + data.length, 0);
              frameHeader.writeUInt8(1, 4);
              res.write(frameHeader);
              res.write(data);
            });

            stream.stderr.on("data", (data) => {
              const frameHeader = Buffer.alloc(4 + 1);
              frameHeader.writeUInt32BE(data.length + 1, 0);
              frameHeader.writeUInt8(2, 4);
              res.write(frameHeader);
              res.write(data);
            });

            res.writeHead(200, {});
          });
        });
      };
    },
  },
  {
    route: "/op/redis",
    handler: async (req) => {
      const body = await readBody(req);
      const request = JSON.parse(body.toString());
      const { url, command, args, insecure } = request;

      const client = await createRedisClient({
        url,
        insecure,
      });

      try {
        const response = await client.sendCommand([command, ...args]);
        return okBytes(response);
      } finally {
        await client.quit();
      }
    },
  },
];

const servePublic = serveStatic("./public");
const servePublicWithoutFallThrough = serveStatic("./public", {
  fallthrough: false,
});

// Consider URL not containing a dot as a request to index.html
function isUrlAllowedForIndexHtml(url) {
  return !url.includes(".");
}

const handleRequest = superHandler(routes, (req, res) => {
  // If the URL is suitable for index.html, change it to "/" to force the static handler to serve it
  if (isUrlAllowedForIndexHtml(req.url)) {
    req.url = "/";
  }
  servePublicWithoutFallThrough(req, res, (err) =>
    sendResponse(res, { status: err.statusCode ?? 500 })
  );
});

server.on("request", (req, res) => {
  config.log && console.log(req.method, req.url);
  servePublic(req, res, () => handleRequest(req, res));
});

module.exports = server;
