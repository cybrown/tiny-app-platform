import * as tal from "tal-parser";
import { RuntimeContext, compile, lower, runAsync } from "tal-eval";

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

const syntaxTree = tal.parse(`[${source}]`);

const programTree = lower(syntaxTree);

const program = compile(programTree);

const ctx = new RuntimeContext(() => null);
ctx.program = program;

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

ctx.defineFunction(
  "only_async",
  [{ name: "arg1" }, { name: "arg2" }],
  null,
  () => new Promise((resolve) => resolve("async"))
);

ctx.defineFunction(
  "async_throw",
  [{ name: "arg1" }, { name: "arg2" }],
  null,
  () => new Promise((resolve, reject) => reject(new Error("Rejected")))
);

ctx.defineFunction(
  "array_map",
  [{ name: "array" }, { name: "mapper" }],
  (ctx, { array, mapper }) => {
    return array.map((it, index) => ctx.callFunction(mapper, [it, index]));
  },
  async (ctx, { array, mapper }) => {
    const result = [];
    for (let index = 0; index < array.length; index++) {
      const it = array[index];
      result.push(await ctx.callFunctionAsync(mapper, [it, index]));
    }
    return result;
  }
);

ctx.defineFunction(
  "array_map_parallel",
  [{ name: "array" }, { name: "mapper" }],
  undefined,
  async (ctx, { array, mapper }) => {
    return Promise.all(
      array.map((it, index) => ctx.callFunctionAsync(mapper, [it, index]))
    );
  }
);

ctx.defineFunction(
  "add_one_sleep",
  [{ name: "value" }],
  null,
  (ctx, { value }) =>
    new Promise((resolve) => setTimeout(() => resolve(value), 1000))
);

const result = await runAsync(ctx);

result.forEach((value) => {
  process.stdout.write(
    value === undefined
      ? "<void>"
      : JSON.stringify(
          value,
          function(key, value) {
            if (key === "ctx") {
              return "<RuntimeContext>";
            }
            return value;
          },
          "  "
        )
  );
  process.stdout.write("\n");
});
