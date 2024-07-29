import * as tal from "tal-parser";
import { lower, compile } from "tal-eval";

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

const expressions = lower(tal.parse(source));

try {
  const program = compile(expressions);
  Object.entries(program).forEach(([functionName, functionDef]) => {
    process.stdout.write(functionName);
    process.stdout.write("(" + functionDef.parameters.join(", ") + ")");
    process.stdout.write("\n");
    Object.entries(functionDef.body).forEach(([blockName, blockBody]) => {
      process.stdout.write("  ");
      process.stdout.write(blockName);
      process.stdout.write(":\n");
      blockBody.forEach((node) => {
        process.stdout.write("    ");
        const { kind, location, ...nodeRest } = node;
        process.stdout.write(kind);

        switch (kind) {
          case "Literal": {
            process.stdout.write(" ");
            process.stdout.write(JSON.stringify(node.value));
            break;
          }
          default: {
            if (Object.keys(nodeRest).length > 0) {
              process.stdout.write(" ".padStart(18 - kind.length));
              process.stdout.write(
                Object.entries(nodeRest)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(", ")
              );
            }
          }
        }

        process.stdout.write("\n");
      });
    });
  });
} catch (err) {
  process.stdout.write("<error: '" + err.stack + "'>");
}
