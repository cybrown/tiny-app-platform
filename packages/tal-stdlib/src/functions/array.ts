import { defineFunction } from 'tal-eval';

export const array_group = defineFunction(
  'array_group',
  [{ name: 'array' }, { name: 'key_extractor' }, { name: 'value_extractor' }],
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
  },
  undefined,
  {
    description:
      'Copies the array passed as first parameter and appends the second argument at its end',
    parameters: { array: 'Array to copy', value: 'Value to put at the end' },
    returns: 'Copy of array with value at its end',
  }
);

export const array_concat = defineFunction(
  'array_concat',
  [{ name: 'array' }, { name: 'other' }],
  (_ctx, { array, other }) => {
    return [...array, ...other];
  },
  undefined,
  {
    description: 'Concatenate two arrays',
    parameters: {
      array: 'Array',
      other: 'Array to concatenate',
    },
    returns: 'New array with concatenated values',
  }
);

export const array_contains = defineFunction(
  'array_contains',
  [{ name: 'array' }, { name: 'value' }],
  (ctx, { array, value }) => {
    return (array as any[]).includes(value);
  },
  undefined,
  {
    description: 'Check if an array contains a value',
    parameters: {
      array: 'Array to search value in',
      value: 'Value to search for',
    },
    returns: 'True if array contains value',
  }
);

export const array_length = defineFunction(
  'array_length',
  [{ name: 'array' }],
  (_ctx, { array }) => {
    return array.length;
  },
  undefined,
  {
    description: 'Get the length of an array',
    parameters: {
      array: 'Array to get the length from',
    },
    returns: 'Length of the array',
  }
);

export const array_unique = defineFunction(
  'array_unique',
  [{ name: 'array' }],
  (_ctx, { array }) => {
    return [...new Set(array as unknown[])];
  },
  undefined,
  {
    description: 'Create a new array without duplicates',
    parameters: {
      array: 'Source array',
    },
    returns: 'Array without duplicate',
  }
);

export const array_remove = defineFunction(
  'array_remove',
  [{ name: 'array' }, { name: 'index' }],
  (_ctx, { array, index }) => {
    return (array as unknown[]).filter((_value, i) => index !== i);
  },
  undefined,
  {
    description: 'Remove the element at the specified index from an array',
    parameters: {
      array: 'Source array',
      index: 'Index of the element to remove',
    },
    returns: 'New array without the removed element',
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
  },
  undefined,
  {
    description: 'Get the element at the specified index of an array',
    parameters: {
      array: 'Source array',
      index: 'Index of the element to retrieve',
    },
    returns: 'Element at the specified index',
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
    description: 'Mutates an array and sets a value at the specified index',
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
  },
  undefined,
  {
    description: 'Join array elements into a string with a separator',
    parameters: {
      array: 'Array of elements',
      separator: 'Separator string',
    },
    returns: 'Joined string',
  }
);

export const array_skip = defineFunction(
  'array_skip',
  [{ name: 'array' }, { name: 'offset' }],
  (_ctx, { array, offset }) => {
    return array.slice(offset);
  },
  undefined,
  {
    description: 'Skip the first N elements of an array',
    parameters: {
      array: 'Source array',
      offset: 'Number of elements to skip',
    },
    returns: 'Array starting from the offset',
  }
);

export const array_take = defineFunction(
  'array_take',
  [{ name: 'array' }, { name: 'take' }],
  (_ctx, { array, take }) => {
    return array.slice(0, take);
  },
  undefined,
  {
    description: 'Take the first N elements of an array',
    parameters: {
      array: 'Source array',
      take: 'Number of elements to take',
    },
    returns: 'Array of the first N elements',
  }
);

export const array_filter = defineFunction(
  'array_filter',
  [{ name: 'array' }, { name: 'predicate' }],
  (ctx, { array, predicate }) => {
    return (array as any[]).filter((it, index) =>
      ctx.callFunction(predicate, [it, index])
    );
  },
  undefined,
  {
    description: 'Filter an array using a predicate function',
    parameters: {
      array: 'Source array',
      predicate: 'Function returning true when the item matches',
    },
    returns: 'Array of elements that match the predicate',
  }
);

export const array_find = defineFunction(
  'array_find',
  [{ name: 'array' }, { name: 'predicate' }],
  (ctx, { array, predicate }) => {
    return (
      (array as any[]).find((it, index) =>
        ctx.callFunction(predicate, [it, index])
      ) ?? null
    );
  },
  undefined,
  {
    description: 'Find the first element in an array matching a predicate',
    parameters: {
      array: 'Source array',
      predicate: 'Function returning true when the item matches',
    },
    returns: 'The found element or null if none match',
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
  },
  {
    description: 'Map each element of an array using a mapper function',
    parameters: {
      array: 'Source array',
      mapper: 'Function to map each element',
    },
    returns: 'New array with mapped values',
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
  },
  {
    description:
      'Asynchronously map each element of an array in parallel using a mapper function',
    parameters: {
      array: 'Source array',
      mapper: 'Function returning a promise for each element',
    },
    returns: 'Promise resolving to an array of mapped values',
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
  },
  {
    description: 'Flat-map an array using a mapper function',
    parameters: {
      array: 'Source array',
      mapper: 'Function to map and flatten each element',
    },
    returns: 'New flattened array',
  }
);

export const array_sort = defineFunction(
  'array_sort',
  [{ name: 'array' }, { name: 'comparator' }],
  (ctx, { array, comparator }) => {
    return (array as any[])
      .slice()
      .sort((a, b) => ctx.callFunction(comparator, [a, b]) as number);
  },
  undefined,
  {
    description: 'Sort an array using a comparator function',
    parameters: {
      array: 'Source array',
      comparator: 'Function to compare two elements',
    },
    returns: 'New sorted array',
  }
);

export const array_reverse = defineFunction(
  'array_reverse',
  [{ name: 'array' }],
  (_ctx, { array }) => {
    return (array as any[]).slice().reverse();
  },
  undefined,
  {
    description: 'Reverse the elements of an array',
    parameters: {
      array: 'Source array',
    },
    returns: 'New array with elements in reverse order',
  }
);

export const array_reduce = defineFunction(
  'array_reduce',
  [{ name: 'array' }, { name: 'reducer' }],
  (ctx, { array, reducer }) => {
    return (array as any[]).reduce((previous, current) => {
      return ctx.callFunction(reducer, [previous, current]);
    });
  },
  undefined,
  {
    description: 'Reduce an array to a single value using a reducer function',
    parameters: {
      array: 'Source array',
      reducer: 'Function to reduce two values into one',
    },
    returns: 'The result of the reduction',
  }
);
