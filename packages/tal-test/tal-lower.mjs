import * as tal from "tal-parser";
import * as tal_eval from "tal-eval";

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

const result = tal_eval.lower(tal.parse(source));

process.stdout.write(tal.stringify(result));
