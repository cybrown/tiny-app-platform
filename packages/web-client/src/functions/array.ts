import { defineFunction } from "tal-eval";

export const array_group = defineFunction(
  "array_group",
  [{ name: "array" }, { name: "key_extractor" }, { name: "value_extractor" }],
  (ctx, { array, key_extractor, value_extractor }) => {
    const result: { [key: string]: any } = {};
    (array as any[]).forEach((it) => {
      const key = ctx.callFunction(key_extractor, [it]) as string;
      const value = value_extractor
        ? ctx.callFunction(value_extractor, [it])
        : it;
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(value);
    });
    return result;
  }
);

export const array_to_object = defineFunction(
  "array_to_object",
  [
    { name: "array" },
    { name: "key_extractor" },
    { name: "value_extractor" },
    { name: "accumulator" },
  ],
  (
    ctx,
    { array, key_extractor, value_extractor, accumulator }
  ) => {
    const result: { [key: string]: any } = {};
    if (accumulator) {
      (array as any[]).forEach((it) => {
        const key = ctx.callFunction(key_extractor, [it]) as string;
        const value = value_extractor
          ? ctx.callFunction(value_extractor, [it])
          : it;
        if (result.hasOwnProperty(key)) {
          result[key] = ctx.callFunction(accumulator, [result[key], value]);
        } else {
          result[key] = value;
        }
      });
    } else {
      (array as any[]).forEach((it) => {
        const key = ctx.callFunction(key_extractor, [it]) as string;
        if (result.hasOwnProperty(key)) {
          throw new Error("Value already defined for key: " + key);
        }
        const value = value_extractor
          ? ctx.callFunction(value_extractor, [it])
          : it;
        result[key] = value;
      });
    }
    return result;
  }
);

export const array_append = defineFunction(
  "array_append",
  [{ name: "array" }, { name: "value" }],
  (ctx, { array, value }) => {
    return [...array, value];
  }
);

export const array_concat = defineFunction(
  "array_concat",
  [{ name: "array" }, { name: "other" }],
  (ctx, { array, other }) => {
    return [...array, ...other];
  }
);

export const array_length = defineFunction(
  "array_length",
  [{ name: "array" }],
  (ctx, { array }) => {
    return array.length;
  }
);

export const array_unique = defineFunction(
  "array_unique",
  [{ name: "array" }],
  (ctx, { array }) => {
    return [...new Set(array as unknown[])];
  }
);

export const array_remove = defineFunction(
  "array_remove",
  [{ name: "array" }, { name: "index" }],
  (ctx, { array, index }) => {
    return (array as unknown[]).filter((value, i) => index !== i);
  }
);

export const array_range = defineFunction(
  "array_range",
  [{ name: "from" }, { name: "to" }, { name: "step" }],
  (ctx, { from = 0, to, step = 1 }) => {
    const result: number[] = [];
    for (let i = from; i < to; i += step) {
      result.push(i);
    }
    return result;
  }
);

export const array_get = defineFunction(
  "array_get",
  [{ name: "array" }, { name: "index" }],
  (ctx, { array, index }) => {
    return array[index];
  }
);

export const array_join = defineFunction(
  "array_join",
  [{ name: "array" }, { name: "separator" }],
  (ctx, { array, separator }) => {
    return array.join(separator);
  }
);

export const array_skip = defineFunction(
  "array_skip",
  [{ name: "array" }, { name: "offset" }],
  (ctx, { array, offset }) => {
    return array.slice(offset);
  }
);

export const array_take = defineFunction(
  "array_take",
  [{ name: "array" }, { name: "take" }],
  (ctx, { array, take }) => {
    return array.slice(0, take);
  }
);

export const array_filter = defineFunction(
  "array_filter",
  [{ name: "array" }, { name: "filter" }],
  (ctx, { array, filter }) => {
    return (array as any[]).filter((it, index) =>
      ctx.callFunction(filter, [it, index])
    );
  }
);

export const array_map = defineFunction(
  "array_map",
  [{ name: "array" }, { name: "mapper" }],
  (ctx, { array, mapper }) => {
    return (array as any[]).map((it, index) =>
      ctx.callFunction(mapper, [it, index])
    );
  },
  async (ctx, { array, mapper }) => {
    const result = [];
    for (let index = 0; index < array.length; index++) {
      const it = array[index];
      result.push(await ctx.callFunctionAsync(mapper, [it, index]));
    }
    return result;
  }
);

export const array_map_parallel = defineFunction(
  "array_map_parallel",
  [{ name: "array" }, { name: "mapper" }],
  (ctx, { array, mapper }) => {
    return (array as any[]).map((it, index) =>
      ctx.callFunction(mapper, [it, index])
    );
  },
  async (ctx, { array, mapper }) => {
    return Promise.all(
      (array as any[]).map((it, index) =>
        ctx.callFunctionAsync(mapper, [it, index])
      )
    );
  }
);

export const array_flat_map = defineFunction(
  "array_flat_map",
  [{ name: "array" }, { name: "mapper" }],
  (ctx, { array, mapper }) => {
    return (array as any[]).flatMap((it, index) =>
      ctx.callFunction(mapper, [it, index])
    );
  },
  async (ctx, { array, mapper }) => {
    return (
      await Promise.all(
        (array as any[]).map((it, index) =>
          ctx.callFunctionAsync(mapper, [it, index])
        )
      )
    ).flat();
  }
);

export const array_sort = defineFunction(
  "array_sort",
  [{ name: "array" }, { name: "comparator" }],
  (ctx, { array, comparator }) => {
    return (array as any[])
      .slice()
      .sort((a, b) => ctx.callFunction(comparator, [a, b]) as number);
  }
);

export const array_reverse = defineFunction(
  "array_reverse",
  [{ name: "array" }],
  (ctx, { array }) => {
    return (array as any[]).slice().reverse();
  }
);
