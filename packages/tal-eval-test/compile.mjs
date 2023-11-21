import * as tal from "tal-parser";
import { RuntimeContext, compile } from "tal-eval";

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

try {
  const program = compile(expressions);
  Object.entries(program).forEach(([name, { parameters, body }]) => {
    process.stdout.write(name + ": " + parameters.map(p => p.name).join(", ") + "\n");
    printIrNode(body);
  });
} catch (err) {
  process.stdout.write("<error: '" + err.stack + "'>");
}

function printIrNode(node, space = "  ") {
  const { kind, children, location, ...rest } = node;
  process.stdout.write(space + kind);
  if (Object.entries(rest).length > 0) {
    process.stdout.write(" " + JSON.stringify(rest));
  }
  process.stdout.write("\n");
  (children ?? []).forEach((subNode) => printIrNode(subNode, space + "  "));
}
