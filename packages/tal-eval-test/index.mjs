import * as tal from "tal-parser";
import { RuntimeContext } from "tal-eval";

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

for (let expression of expressions) {
  try {
    const evaluationResult = forceSync
      ? ctx.evaluate(expression)
      : await ctx.evaluateAsync(expression);
    const jsonResult = JSON.stringify(evaluationResult, null, "  ");
    process.stdout.write(jsonResult ?? "<void>");
  } catch (err) {
    process.stdout.write("<error: '" + err.message + "'>");
  }
  process.stdout.write("\n");
}
