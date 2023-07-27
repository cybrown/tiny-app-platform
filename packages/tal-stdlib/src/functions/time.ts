import { defineFunction } from "tal-eval";

export const time_parse = defineFunction(
  "time_parse",
  [{ name: "str" }],
  (_ctx, { str }) => {
    return new Date(str);
  }
);

export const time_day_of_week = defineFunction(
  "time_day_of_week",
  [{ name: "time" }],
  (_ctx, { time }) => {
    return time.getDay();
  }
);
