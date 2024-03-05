import * as tal from "tal-parser";
import { RuntimeContext, compile, lower, VM } from "tal-eval";

const ast = tal.parse(`[
    let toto = []
    let index = 3
    set toto[index] = "value"
    toto[3]
]`);
const ast2 = lower(ast);
const ir = compile(ast2);

/*
console.log(JSON.stringify(ir, function (key, value) {
    if (key === "location") return;
    return value;
}, "  "));
*/

const ctx = new RuntimeContext(() => null);
ctx.program = ir;

const vm = new VM(ctx);
const result = vm.runMain();

result.result.forEach((value) => {
  process.stdout.write(JSON.stringify(value) ?? "<void>");
  process.stdout.write("\n");
});
