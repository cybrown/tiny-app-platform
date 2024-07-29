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
  (key, value) => {
    // We are not interested in testing location yet
    if (key === "location" || key === "newLines") {
      return undefined;
    }
    // Unwrap Literal expression to keep only their value
    if (
      value &&
      typeof value === "object" &&
      "kind" in value &&
      value.kind === "Literal"
    ) {
      return value.value;
    }
    return value;
  },
  "  "
);

process.stdout.write(jsonResult);
