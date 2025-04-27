import { createServer } from "http";
import serveStatic from "serve-static";
import {
  superHandler,
  createResponse,
  readBody,
  okBytes,
  okJson,
  okText,
  noContent,
  sendResponse,
  notFound,
} from "./http-utils.mjs";
import https from "https";
import http from "http";
import URL from "url";
import path from "path";
import FormData from "form-data";
import fs from "fs";
import contentDisposition from "content-disposition";
import {
  createMongoClient,
  operations as mongodbOperations,
} from "./drivers/mongodb.mjs";
import child_process from "child_process";
import pg_module from "pg";
const { Client } = pg_module;
import ssh2 from "ssh2";
import { createRedisClient } from "./redis.mjs";
import config from "./config.mjs";
import pty from "node-pty";
import { WebSocketServer } from "ws";
import { exec } from "child_process";
import sqlite3 from "better-sqlite3";

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
                const req = (
                  info.value.startsWith("https") ? https : http
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
  ...mongodbOperations,
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
      let { uri, query, params, ssl, insecure } = request;

      const sslOptions = ssl
        ? insecure
          ? {
              ssl: {
                rejectUnauthorized: false,
                allowPartialTrustChain: true,
              },
            }
          : { ssl: {} }
        : {};

      const client = new Client({
        connectionString: uri,
        ...sslOptions,
      });
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
    route: "/op/sqlite-query",
    handler: async (req, pathParams) => {
      const body = await readBody(req);
      const request = JSON.parse(body.toString());
      let { uri, query, params, forceResult } = request;

      const db = sqlite3(uri);
      db.pragma("journal_mode = WAL");

      const prepared = db.prepare(query);

      const result =
        forceResult || /^select /.test(query)
          ? prepared.all(...params)
          : prepared.run(...params);

      return okJson(result);
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

const wss = new WebSocketServer({ server });

const wsCommands = {
  process_pty_create: process_pty_create,
  ssh_exec: ssh_exec,
};

wss.on("connection", (client) => {
  client.on("error", (e) => {
    config.log && console.error("Error while receiving incoming connection", e);
  });

  client.once("message", async (message) => {
    const { command, headers, body } = JSON.parse(message);

    const websocketHandler = wsCommands[command];
    if (websocketHandler != null) {
      try {
        websocketHandler(client, body);
        const frame = Buffer.alloc(1);
        frame.writeUInt8(0, 0);
        client.send(frame);
      } catch (e) {
        const frame = Buffer.alloc(1);
        frame.writeUInt8(1, 0);
        client.send(Buffer.concat([frame, Buffer.from(e.message)]));
        client.close();
      }
    } else {
      const errorMessage = `Command not found: ` + command;
      const frame = Buffer.alloc(1);
      frame.writeUInt8(1, 0);
      client.send(Buffer.concat([frame, Buffer.from(errorMessage)]));
    }
  });
});

function process_pty_create(client, body) {
  if (process.env.hasOwnProperty("DISABLE_PROCESS_OPS")) {
    throw new Error("Process related operations disabled on this server");
  }

  setTimeout(() => {
    let { fileName, args, env, cwd, timeout } = body;

    const ptyProcess = pty.spawn(fileName, args, {
      name: "xterm-color",
      cols: 80,
      rows: 24,
      cwd,
      env: { ...process.env, ...env },
    });
    if (timeout != null) {
      setTimeout(() => killPtyProcess(ptyProcess), timeout);
    }

    client.on("message", (message) => {
      const messageKind = message[0];
      const messageBody = message.slice(1);
      switch (messageKind) {
        case 0: {
          // Write to process
          ptyProcess.write(messageBody);
          break;
        }
        case 1: {
          // Resize
          const cols = messageBody.readUInt32LE(0);
          const rows = messageBody.readUInt32LE(4);
          ptyProcess.resize(cols, rows);
          break;
        }
      }
    });

    client.on("close", () => {
      killPtyProcess(ptyProcess);
    });
    client.on("error", (err) => {
      config.log && console.error("request error:", err);
      killPtyProcess(ptyProcess);
    });

    const frame = Buffer.alloc(5);
    frame.writeUInt8(4, 0);
    frame.writeUInt32LE(ptyProcess.pid, 1);
    client.send(frame);

    ptyProcess.onExit((statusCode) => {
      const frame = Buffer.alloc(3);
      frame.writeUint8(3, 0);
      frame.writeUint8(statusCode != null ? 1 : 0, 1);
      frame.writeUint8(statusCode.exitCode ?? 0, 2);
      client.send(frame);
      client.close();
    });

    ptyProcess.onData((data) => {
      const frameHeader = Buffer.alloc(1);
      frameHeader.writeUInt8(1, 0);
      client.send(Buffer.concat([frameHeader, Buffer.from(data)]));
    });
  });
}

/**
 *
 * @param {WebSocket} client
 * @param {*} body
 */
async function ssh_exec(client, body) {
  setTimeout(async () => {
    const { host, port, username, password, timeout, command, pty } = body;

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

    client.on("close", () => {
      conn.destroy();
    });

    client.on("error", () => {
      conn.destroy();
    });

    conn.on("error", () => {
      client.close();
    });

    /**
     * @type {ssh2.ClientChannel}
     */
    let clientStream = null;

    const pendingMessages = [];

    client.on("message", (data) => {
      if (clientStream == null) {
        pendingMessages.push(data);
      } else {
        handleMessage(data);
      }
    });

    /**
     *
     * @param {Buffer} data
     */
    function handleMessage(data) {
      switch (data[0]) {
        case 0: {
          // stdin
          clientStream.write(data.slice(1));
          break;
        }
        case 3: {
          //resize
          const cols = data.readUInt32LE(1);
          const rows = data.readUInt32LE(5);
          clientStream.setWindow(rows, cols);
          break;
        }
      }
    }

    conn.on("ready", () => {
      conn.exec(command, { pty: pty ?? false }, (err, stream) => {
        if (err) throw err;

        clientStream = stream;

        for (const pendingMessage of pendingMessages) {
          handleMessage(pendingMessage);
        }
        pendingMessages.length = 0;

        stream.on("close", (code) => {
          const frame = Buffer.alloc(3);
          frame.writeUint8(3, 0);
          frame.writeUint8(code != null ? 1 : 0, 1);
          frame.writeUint8(code ?? 0, 2);
          client.send(frame);
          conn.end();
          client.close();
        });

        stream.on("data", (data) => {
          const frameHeader = Buffer.alloc(1);
          frameHeader.writeUInt8(1, 0);
          client.send(Buffer.concat([frameHeader, data]));
        });

        stream.stderr.on("data", (data) => {
          const frameHeader = Buffer.alloc(1);
          frameHeader.writeUInt8(2, 0);
          client.send(Buffer.concat([frameHeader, data]));
        });
      });
    });
  });
}

export default server;

async function killPtyProcess(ptyProcess) {
  if (process.platform == "win32") {
    return new Promise((resolve, reject) => {
      exec(
        `C:\\Windows\\System32\\taskkill.exe /PID ${ptyProcess.pid} /T /F`,
        (err) => {
          if (err) {
            console.error("Failed to kill process");
            console.error(err);
            return reject(err);
          }
          resolve();
        }
      );
    });
  } else {
    ptyProcess.kill("SIGKILL");
  }
}
