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

const ast = tal.parse(source);

const parents = [];

console.log("<program>");

for (const { node, mode } of tal.walk(ast)) {
  if (mode == "leave") {
    parents.pop();
  }
  console.log(
    "".padEnd((parents.length + 1) * 2, "  ") +
      "<" +
      (mode == "leave" ? "/" : "") +
      node.kind.toLowerCase() +
      (mode == "visit" ? " /" : "") +
      ">"
  );
  if (mode == "enter") {
    parents.push(node);
  }
}

console.log("</program>");
