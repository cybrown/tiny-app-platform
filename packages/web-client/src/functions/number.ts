import { defineFunction } from "tal-eval";

export const number_to_string = defineFunction(
  "number_to_string",
  [{ name: "number" }, { name: "precision" }],
  (ctx, { number, precision = null }) => {
    if (precision == null) {
      return String(number);
    }
    return (number as number).toFixed(precision);
  }
);

export const number_ceil = defineFunction(
  "number_ceil",
  [{ name: "number" }],
  (ctx, { number }) => {
    return Math.ceil(number);
  }
);

export const number_floor = defineFunction(
  "number_floor",
  [{ name: "number" }],
  (ctx, { number }) => {
    return Math.floor(number);
  }
);

export const number_round = defineFunction(
  "number_round",
  [{ name: "number" }, { name: "precision" }],
  (ctx, { number, precision = 0 }) => {
    if (precision === 0) {
      return Math.round(number);
    }
    return +(
      Math.round(Number(number + ("e+" + precision))) +
      ("e-" + precision)
    );
  }
);

export const number_trunc = defineFunction(
  "number_trunc",
  [{ name: "number" }],
  (ctx, { number }) => {
    return Math.trunc(number);
  }
);

export const number_abs = defineFunction(
  "number_abs",
  [{ name: "number" }],
  (ctx, { number }) => {
    return Math.abs(number);
  }
);

export const number_sign = defineFunction(
  "number_sign",
  [{ name: "number" }],
  (ctx, { number }) => {
    return Math.sign(number);
  }
);

export const number_random = defineFunction("number_random", [], (ctx) => {
  return Math.random();
});

export const number_randint = defineFunction(
  "number_randint",
  [{ name: "min" }, { name: "max" }],
  (ctx, { min = 0, max = 100 }) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
);
