import * as tal from "tal-parser";
import { RuntimeContext, compile, lower, VM } from "tal-eval";

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

const ast = tal.parse(`[${source}]`);
//console.log(toJson(ast))

const ast2 = lower(ast);
// console.log(toJson(ast2));

const ir = compile(ast2);
//console.log(toJson(ir));

function toJson(v) {
  return JSON.stringify(
    v,
    function(key, value) {
      if (key === "location") return;
      return value;
    },
    "  "
  );
}

/*
console.log(JSON.stringify(ir, function (key, value) {
    if (key === "location") return;
    return value;
}, "  "));
*/

const ctx = new RuntimeContext(() => null);
ctx.program = ir;

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

const vm = new VM(ctx /*, true */);
let result = vm.runMain();

// TODO: Put this trampoline in a VM Runner
/*
VM Runner:
  Run async: trampoline until result is finished
  Run sync: exception on pending, re-enter the vm with the exception
*/
if (result.kind == "PENDING") {
  await result.promise; // TODO: Make promise callable
  result = vm.resume(result.state);
}

if (result.kind == "ERROR") {
  console.error(result);
} else if (result.kind == "FINISHED") {
  result.result.forEach((value) => {
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
}
