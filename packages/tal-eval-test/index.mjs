import * as fs from "fs";
import { join } from "path";
import * as tal from "tal-parser";
import { RuntimeContext, run, runAsync, compile } from "tal-eval";

let forceSync = false;

for (const arg of process.argv) {
  if (arg === "--force-sync") {
    forceSync = true;
  }
}

const source = await new Promise((resolve, reject) => {
  const buffers = [];

  process.stdin.on("data", (data) => {
    buffers.push(data);
  });

  process.stdin.on("end", () => {
    resolve(Buffer.concat(buffers).toString());
  });
  process.stdin.on("error", reject);
});

const expressions = tal.parse(source);
const ctx = new RuntimeContext(() => {});

ctx.getSource = (sourcePath) => {
  const absolutePath = join(process.cwd(), sourcePath);
  return new Promise((resolve, reject) => {
    fs.readFile(
      absolutePath,
      {
        encoding: "utf-8",
      },
      (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      }
    );
  });
};

ctx.defineFunction(
  "give_hello",
  [{ name: "method" }, { name: "url" }],
  () => "Hello",
  (ctx, args, posargs) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("Hello");
      }, 100);
    });
  }
);

ctx.defineFunction(
  "predefined_function",
  [{ name: "arg1" }, { name: "arg2" }],
  (ctx, { arg1, arg2 }, posargs) => {
    return (
      "arg1: <" +
      arg1 +
      ">, arg2: <" +
      arg2 +
      ">, rest: <" +
      posargs.join(", ") +
      ">"
    );
  }
);

ctx.defineFunction(
  "sync_or_async",
  [{ name: "arg1" }, { name: "arg2" }],
  () => "sync",
  () => new Promise((resolve) => resolve("async"))
);

try {
  const program = compile(expressions);
  ctx.program = program;
  const evaluationResult = forceSync
    ? run(ctx, program, "main", true)
    : await runAsync(ctx, program, "main", true);
  evaluationResult.forEach((result, index) => {
    if (result instanceof Error) {
      process.stdout.write("<error: '" + result.message + "'>");
    } else {
      const jsonResult = JSON.stringify(result, jsonStringifyReplacer, "  ");
      process.stdout.write(jsonResult ?? "<void>");
    }
    if (index < evaluationResult.length - 1) {
      process.stdout.write("\n");
    }
  });
} catch (err) {
  process.stdout.write("<error: '" + err + "'>");
}
process.stdout.write("\n");

function jsonStringifyReplacer(key, value) {
  if (value instanceof RuntimeContext) {
    return "<RuntimeContext>";
  }
  return value;
}
