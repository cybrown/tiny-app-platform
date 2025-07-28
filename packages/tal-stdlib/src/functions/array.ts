import {
  defineFunction3,
  typeAny,
  typeArray,
  typeBoolean,
  typeDict,
  typeFunction,
  typeGenericPlaceholder,
  typeNull,
  typeNumber,
  typeString,
  typeUnion,
} from 'tal-eval';

export const array_group = defineFunction3(
  'array_group',
  [{ name: 'array' }, { name: 'key_extractor' }, { name: 'value_extractor' }],
  typeFunction(
    [
      { name: 'array', type: typeArray(typeGenericPlaceholder('T')) },
      {
        name: 'key_extractor',
        type: typeFunction(
          [{ name: 'item', type: typeGenericPlaceholder('T') }],
          [],
          typeString()
        ),
      },
      {
        name: 'value_extractor',
        type: typeUnion(
          typeNull(),
          typeFunction(
            [{ name: 'item', type: typeGenericPlaceholder('T') }],
            [],
            typeGenericPlaceholder('Value')
          )
        ),
      },
    ],
    ['T', 'Value'],
    typeDict(typeArray(typeGenericPlaceholder('Value')))
  ),
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

export const array_append = defineFunction3(
  'array_append',
  [{ name: 'array' }, { name: 'value' }],
  typeFunction(
    [
      {
        name: 'array',
        type: typeArray(typeGenericPlaceholder('T')),
      },
      { name: 'value', type: typeGenericPlaceholder('T') },
    ],
    ['T'],
    typeArray(typeGenericPlaceholder('T'))
  ),
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

export const array_concat = defineFunction3(
  'array_concat',
  [{ name: 'array' }, { name: 'other' }],
  typeFunction(
    [
      {
        name: 'array',
        type: typeArray(typeGenericPlaceholder('T')),
      },
      { name: 'other', type: typeArray(typeGenericPlaceholder('T')) },
    ],
    ['T'],
    typeArray(typeGenericPlaceholder('T'))
  ),
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

export const array_contains = defineFunction3(
  'array_contains',
  [{ name: 'array' }, { name: 'value' }],
  typeFunction(
    [
      {
        name: 'array',
        type: typeArray(typeGenericPlaceholder('T')),
      },
      { name: 'value', type: typeGenericPlaceholder('T') },
    ],
    ['T'],
    typeBoolean()
  ),
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

export const array_length = defineFunction3(
  'array_length',
  [{ name: 'array' }],
  typeFunction(
    [
      {
        name: 'array',
        type: typeArray(typeAny()),
      },
    ],
    [],
    typeNumber()
  ),
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

export const array_unique = defineFunction3(
  'array_unique',
  [{ name: 'array' }],
  typeFunction(
    [
      {
        name: 'array',
        type: typeArray(typeGenericPlaceholder('T')),
      },
    ],
    ['T'],
    typeArray(typeGenericPlaceholder('T'))
  ),
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

export const array_remove = defineFunction3(
  'array_remove',
  [{ name: 'array' }, { name: 'index' }],
  typeFunction(
    [
      {
        name: 'array',
        type: typeArray(typeGenericPlaceholder('T')),
      },
      { name: 'index', type: typeNumber() },
    ],
    ['T'],
    typeArray(typeGenericPlaceholder('T'))
  ),
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

export const array_range = defineFunction3(
  'array_range',
  [{ name: 'from' }, { name: 'to' }, { name: 'step' }],
  typeFunction(
    [
      {
        name: 'from',
        type: typeUnion(typeNumber(), typeNull()),
      },
      { name: 'to', type: typeNumber() },
      { name: 'step', type: typeUnion(typeNumber(), typeNull()) },
    ],
    [],
    typeArray(typeNumber())
  ),
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

export const array_get = defineFunction3(
  'array_get',
  [{ name: 'array' }, { name: 'index' }],
  typeFunction(
    [
      {
        name: 'array',
        type: typeArray(typeGenericPlaceholder('T')),
      },
      { name: 'index', type: typeNumber() },
    ],
    ['T'],
    typeUnion(typeGenericPlaceholder('T'), typeNull())
  ),
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

export const array_set = defineFunction3(
  'array_set',
  [{ name: 'array' }, { name: 'index' }, { name: 'value' }],
  typeFunction(
    [
      {
        name: 'array',
        type: typeArray(typeGenericPlaceholder('T')),
      },
      { name: 'index', type: typeNumber() },
      { name: 'value', type: typeGenericPlaceholder('T') },
    ],
    ['T'],
    typeArray(typeGenericPlaceholder('T'))
  ),
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

export const array_join = defineFunction3(
  'array_join',
  [{ name: 'array' }, { name: 'separator' }],
  typeFunction(
    [
      {
        name: 'array',
        type: typeArray(typeGenericPlaceholder('T')),
      },
      { name: 'separator', type: typeString() },
    ],
    ['T'],
    typeString()
  ),
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

export const array_skip = defineFunction3(
  'array_skip',
  [{ name: 'array' }, { name: 'offset' }],
  typeFunction(
    [
      {
        name: 'array',
        type: typeArray(typeGenericPlaceholder('T')),
      },
      { name: 'offset', type: typeNumber() },
    ],
    ['T'],
    typeArray(typeGenericPlaceholder('T'))
  ),
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

export const array_take = defineFunction3(
  'array_take',
  [{ name: 'array' }, { name: 'take' }],
  typeFunction(
    [
      {
        name: 'array',
        type: typeArray(typeGenericPlaceholder('T')),
      },
      { name: 'take', type: typeNumber() },
    ],
    ['T'],
    typeArray(typeGenericPlaceholder('T'))
  ),
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

export const array_filter = defineFunction3(
  'array_filter',
  [{ name: 'array' }, { name: 'predicate' }],
  typeFunction(
    [
      { name: 'array', type: typeArray(typeGenericPlaceholder('T')) },
      {
        name: 'mapper',
        type: typeFunction(
          [
            { name: 'item', type: typeGenericPlaceholder('T') },
            { name: 'index', type: typeNumber() },
          ],
          [],
          typeBoolean()
        ),
      },
    ],
    ['T'],
    typeArray(typeGenericPlaceholder('T'))
  ),
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

export const array_find = defineFunction3(
  'array_find',
  [{ name: 'array' }, { name: 'predicate' }],
  typeFunction(
    [
      {
        name: 'array',
        type: typeArray(typeGenericPlaceholder('T')),
      },
      {
        name: 'predicate',
        type: typeFunction(
          [
            {
              name: 'item',
              type: typeGenericPlaceholder('T'),
            },
            {
              name: 'index',
              type: typeNumber(),
            },
          ],
          [],
          typeBoolean()
        ),
      },
    ],
    ['T'],
    typeArray(typeGenericPlaceholder('T'))
  ),
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

export const array_find_index = defineFunction3(
  'array_find_index',
  [{ name: 'array' }, { name: 'predicate' }],
  typeFunction(
    [
      {
        name: 'array',
        type: typeArray(typeGenericPlaceholder('T')),
      },
      {
        name: 'predicate',
        type: typeFunction(
          [
            {
              name: 'item',
              type: typeGenericPlaceholder('T'),
            },
            {
              name: 'index',
              type: typeNumber(),
            },
          ],
          [],
          typeBoolean()
        ),
      },
    ],
    ['T'],
    typeUnion(typeGenericPlaceholder('T'), typeNull())
  ),
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

export const array_map = defineFunction3(
  'array_map',
  [{ name: 'array' }, { name: 'mapper' }],
  typeFunction(
    [
      { name: 'array', type: typeArray(typeGenericPlaceholder('T')) },
      {
        name: 'mapper',
        type: typeFunction(
          [
            { name: 'item', type: typeGenericPlaceholder('T') },
            { name: 'index', type: typeNumber() },
          ],
          [],
          typeGenericPlaceholder('U')
        ),
      },
    ],
    ['T', 'U'],
    typeArray(typeGenericPlaceholder('U'))
  ),
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

export const array_map_parallel = defineFunction3(
  'array_map_parallel',
  [{ name: 'array' }, { name: 'mapper' }],
  typeFunction(
    [
      { name: 'array', type: typeArray(typeGenericPlaceholder('T')) },
      {
        name: 'mapper',
        type: typeFunction(
          [
            { name: 'item', type: typeGenericPlaceholder('T') },
            { name: 'index', type: typeNumber() },
          ],
          [],
          typeGenericPlaceholder('U')
        ),
      },
    ],
    ['T', 'U'],
    typeArray(typeGenericPlaceholder('U'))
  ),
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

export const array_flat_map = defineFunction3(
  'array_flat_map',
  [{ name: 'array' }, { name: 'mapper' }],
  typeFunction(
    [
      {
        name: 'array',
        type: typeArray(typeGenericPlaceholder('T')),
      },
      {
        name: 'mapper',
        type: typeFunction(
          [
            { name: 'item', type: typeGenericPlaceholder('T') },
            { name: 'index', type: typeNumber() },
          ],
          [],
          typeArray(typeGenericPlaceholder('U'))
        ),
      },
    ],
    ['T', 'U'],
    typeArray(typeGenericPlaceholder('U'))
  ),
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

export const array_sort = defineFunction3(
  'array_sort',
  [{ name: 'array' }, { name: 'comparator' }],
  typeFunction(
    [
      {
        name: 'array',
        type: typeArray(typeGenericPlaceholder('T')),
      },
      {
        name: 'comparator',
        type: typeFunction(
          [
            { name: 'a', type: typeGenericPlaceholder('T') },
            { name: 'b', type: typeGenericPlaceholder('T') },
          ],
          [],
          typeNumber()
        ),
      },
    ],
    ['T'],
    typeArray(typeGenericPlaceholder('T'))
  ),
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

export const array_reverse = defineFunction3(
  'array_reverse',
  [{ name: 'array' }],
  typeFunction(
    [
      {
        name: 'array',
        type: typeArray(typeGenericPlaceholder('T')),
      },
    ],
    ['T'],
    typeArray(typeGenericPlaceholder('T'))
  ),
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

export const array_reduce = defineFunction3(
  'array_reduce',
  [{ name: 'array' }, { name: 'reducer' }],
  typeFunction(
    [
      {
        name: 'array',
        type: typeArray(typeGenericPlaceholder('T')),
      },
      {
        name: 'reducer',
        type: typeFunction(
          [
            { name: 'previous', type: typeGenericPlaceholder('U') },
            { name: 'current', type: typeGenericPlaceholder('T') },
          ],
          [],
          typeGenericPlaceholder('U')
        ),
      },
    ],
    ['T', 'U'],
    typeGenericPlaceholder('U')
  ),
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
