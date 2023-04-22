import * as tal from "tal-parser";

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

const result = tal.parse(source);

const jsonResult = JSON.stringify(
  result,
  (key, value) => (key == "location" || key == "newLines" ? undefined : value), // We are not interested in testing location yet
  "  "
);

process.stdout.write(jsonResult);
