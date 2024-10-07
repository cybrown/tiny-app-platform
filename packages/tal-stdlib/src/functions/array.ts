import { defineFunction } from 'tal-eval';

export const array_group = defineFunction(
  'array_group',
  [{ name: 'array' }, { name: 'key_extractor' }, { name: 'value_extractor' }],
  (ctx, { array, key_extractor, value_extractor }) => {
    const result: { [key: string]: any } = {};
    (array as any[]).forEach(it => {
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
  },
  undefined,
  {
    description: 'Groups an array by a key',
    parameters: {
      array: 'The array to group',
      key_extractor: 'A function to extract the key from an element',
      value_extractor:
        'A function to extract the value from an element, optional',
    },
    returns:
      'A record with the keys extracted by key_extractor and the values extracted by value_extractor',
  }
);

export const array_to_record = defineFunction(
  'array_to_record',
  [
    { name: 'array' },
    { name: 'key_extractor' },
    { name: 'value_extractor' },
    { name: 'accumulator' },
  ],
  (ctx, { array, key_extractor, value_extractor, accumulator }) => {
    const result: { [key: string]: any } = {};
    if (accumulator) {
      (array as any[]).forEach(it => {
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
      (array as any[]).forEach(it => {
        const key = ctx.callFunction(key_extractor, [it]) as string;
        if (result.hasOwnProperty(key)) {
          throw new Error('Value already defined for key: ' + key);
        }
        const value = value_extractor
          ? ctx.callFunction(value_extractor, [it])
          : it;
        result[key] = value;
      });
    }
    return result;
  },
  undefined,
  {
    description: 'Converts an array to a record',
    parameters: {
      array: 'The array to convert',
      key_extractor: 'A function to extract the key from an element',
      value_extractor:
        'A function to extract the value from an element, optional',
      accumulator: 'A function to accumulate values for the same key, optional',
    },
    returns:
      'A record with the keys extracted by key_extractor and the values extracted by value_extractor',
  }
);

export const array_append = defineFunction(
  'array_append',
  [{ name: 'array' }, { name: 'value' }],
  (_ctx, { array, value }) => {
    return [...array, value];
  }
);

export const array_concat = defineFunction(
  'array_concat',
  [{ name: 'array' }, { name: 'other' }],
  (_ctx, { array, other }) => {
    return [...array, ...other];
  }
);

export const array_contains = defineFunction(
  'array_contains',
  [{ name: 'array' }, { name: 'value' }],
  (ctx, { array, value }) => {
    return (array as any[]).includes(value);
  }
);

export const array_length = defineFunction(
  'array_length',
  [{ name: 'array' }],
  (_ctx, { array }) => {
    return array.length;
  }
);

export const array_unique = defineFunction(
  'array_unique',
  [{ name: 'array' }],
  (_ctx, { array }) => {
    return [...new Set(array as unknown[])];
  }
);

export const array_remove = defineFunction(
  'array_remove',
  [{ name: 'array' }, { name: 'index' }],
  (_ctx, { array, index }) => {
    return (array as unknown[]).filter((_value, i) => index !== i);
  }
);

export const array_range = defineFunction(
  'array_range',
  [{ name: 'from' }, { name: 'to' }, { name: 'step' }],
  (_ctx, { from, to, step }) => {
    const pFrom = from ?? 0;
    const pStep = step ?? 1;
    const result: number[] = [];
    for (let i = pFrom; i < to; i += pStep) {
      result.push(i);
    }
    return result;
  },
  undefined,
  {
    description: 'Create an array of numbers with predefined values',
    parameters: {
      from: 'First value',
      to: 'Last value, excluded',
      step: 'Step between each values',
    },
    returns: 'The array with initialized values',
  }
);

export const array_get = defineFunction(
  'array_get',
  [{ name: 'array' }, { name: 'index' }],
  (_ctx, { array, index }) => {
    return array[index];
  }
);

export const array_set = defineFunction(
  'array_set',
  [{ name: 'array' }, { name: 'index' }, { name: 'value' }],
  (ctx, { array, index, value }) => {
    array[index] = value;
    ctx.forceRefresh();
    return value;
  },
  undefined,
  {
    description: 'Mutates an array and set a value at the specified index',
    parameters: {
      array: 'Array to mutate',
      index: 'Index to place the new value to',
      value: 'New value',
    },
    returns: 'The mutated array',
  }
);

export const array_join = defineFunction(
  'array_join',
  [{ name: 'array' }, { name: 'separator' }],
  (_ctx, { array, separator }) => {
    return array.join(separator);
  }
);

export const array_skip = defineFunction(
  'array_skip',
  [{ name: 'array' }, { name: 'offset' }],
  (_ctx, { array, offset }) => {
    return array.slice(offset);
  }
);

export const array_take = defineFunction(
  'array_take',
  [{ name: 'array' }, { name: 'take' }],
  (_ctx, { array, take }) => {
    return array.slice(0, take);
  }
);

export const array_filter = defineFunction(
  'array_filter',
  [{ name: 'array' }, { name: 'predicate' }],
  (ctx, { array, predicate }) => {
    return (array as any[]).filter((it, index) =>
      ctx.callFunction(predicate, [it, index])
    );
  }
);

export const array_find = defineFunction(
  'array_find',
  [{ name: 'array' }, { name: 'predicate' }],
  (ctx, { array, predicate }) => {
    return (array as any[]).find((it, index) =>
      ctx.callFunction(predicate, [it, index])
    );
  }
);

export const array_find_index = defineFunction(
  'array_find_index',
  [{ name: 'array' }, { name: 'predicate' }],
  (ctx, { array, predicate }) => {
    const foundIndex = (array as any[]).findIndex((it, index) =>
      ctx.callFunction(predicate, [it, index])
    );
    return foundIndex == -1 ? null : foundIndex;
  },
  undefined,
  {
    description: 'Find the index of an element in an array using a predicate',
    parameters: {
      array: 'Array where to find the value from',
      predicate: 'Function returning true when the item matches',
    },
    returns: 'A number if the item is found, or else null',
  }
);

export const array_map = defineFunction(
  'array_map',
  [{ name: 'array' }, { name: 'mapper' }],
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
  'array_map_parallel',
  [{ name: 'array' }, { name: 'mapper' }],
  undefined,
  async (ctx, { array, mapper }) => {
    return Promise.all(
      (array as any[]).map((it, index) =>
        ctx.callFunctionAsync(mapper, [it, index])
      )
    );
  }
);

export const array_flat_map = defineFunction(
  'array_flat_map',
  [{ name: 'array' }, { name: 'mapper' }],
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
  'array_sort',
  [{ name: 'array' }, { name: 'comparator' }],
  (ctx, { array, comparator }) => {
    return (array as any[])
      .slice()
      .sort((a, b) => ctx.callFunction(comparator, [a, b]) as number);
  }
);

export const array_reverse = defineFunction(
  'array_reverse',
  [{ name: 'array' }],
  (_ctx, { array }) => {
    return (array as any[]).slice().reverse();
  }
);

export const array_reduce = defineFunction(
  'array_reduce',
  [{ name: 'array' }, { name: 'reducer' }],
  (ctx, { array, reducer }) => {
    return (array as any[]).reduce((previous, current) => {
      return ctx.callFunction(reducer, [previous, current]);
    });
  }
);
