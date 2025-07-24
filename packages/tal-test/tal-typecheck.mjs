import * as tal from "tal-parser";
import { lower, TypeChecker, typeToString } from "tal-eval";

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

const typeChecker = new TypeChecker();

let type;

if (Array.isArray(expressions)) {
  type = typeChecker.checkArray(expressions);
} else {
  type = typeChecker.check(expressions);
}

if (typeChecker.errors) {
  for (let error of typeChecker.errors) {
    process.stdout.write(
      `(${error[0].location?.start.line}:${error[0].location?.start.column}) `
    );
    process.stdout.write(error[1]);
    process.stdout.write("\n");
  }
}

if (type) {
  process.stdout.write(typeToString(type));
  process.stdout.write("\n");
}
