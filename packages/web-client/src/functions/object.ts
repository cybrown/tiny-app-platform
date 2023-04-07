import { defineFunction } from "tal-eval";

export const object_keys = defineFunction(
  "object_keys",
  [{ name: "object" }],
  (ctx, { object }) => {
    return Object.keys(object);
  }
);

export const object_values = defineFunction(
  "object_values",
  [{ name: "object" }],
  (ctx, { object }) => {
    return Object.values(object);
  }
);

export const object_entries = defineFunction(
  "object_entries",
  [{ name: "object" }],
  (ctx, { object }) => {
    return Object.entries(object);
  }
);

export const object_get = defineFunction(
  "object_get",
  [{ name: "object" }, { name: "member" }],
  (ctx, { object, member }) => {
    return object[member];
  }
);

export const object_set = defineFunction(
  "object_set",
  [{ name: "object" }, { name: "key" }, { name: "value" }],
  (ctx, { object, key, value }) => {
    return { ...object, [key]: value };
  }
);

export const object_merge = defineFunction(
  "object_merge",
  [{ name: "object" }, { name: "other" }],
  (ctx, { object, other }) => {
    return { ...object, ...other };
  }
);
