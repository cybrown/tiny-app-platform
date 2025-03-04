import { defineFunction } from 'tal-eval';
import { isMessageStream, MessageStreamSink } from '../util/streams';

export const skip = defineFunction(
  'skip',
  [{ name: 'value' }, { name: 'offset' }],
  (_ctx, { value, offset }) => {
    if (Array.isArray(value)) {
      return value.slice(offset);
    }
    throw new Error('Type not supported for skip');
  }
);

export const take = defineFunction(
  'take',
  [{ name: 'value' }, { name: 'take' }],
  (_ctx, { value, take }) => {
    if (Array.isArray(value)) {
      return value.slice(0, take);
    }
    throw new Error('Type not supported for take');
  }
);

export const filter = defineFunction(
  'filter',
  [{ name: 'value' }, { name: 'predicate' }],
  (ctx, { value, predicate }) => {
    if (Array.isArray(value)) {
      return (value as any[]).filter((it, index) =>
        ctx.callFunction(predicate, [it, index])
      );
    }
    throw new Error('Type not supported for filter');
  }
);

export const find = defineFunction(
  'find',
  [{ name: 'value' }, { name: 'predicate' }],
  (ctx, { value, predicate }) => {
    if (Array.isArray(value)) {
      return (value as any[]).find((it, index) =>
        ctx.callFunction(predicate, [it, index])
      );
    }
    throw new Error('Type not supported for find');
  }
);

export const find_index = defineFunction(
  'find_index',
  [{ name: 'value' }, { name: 'predicate' }],
  (ctx, { value, predicate }) => {
    if (Array.isArray(value)) {
      const foundIndex = (value as any[]).findIndex((it, index) =>
        ctx.callFunction(predicate, [it, index])
      );
      return foundIndex == -1 ? null : foundIndex;
    }
    throw new Error('Type not supported for find_index');
  },
  undefined,
  {
    description: 'Find the index of an element in an array using a predicate',
    parameters: {
      value: 'Value where to find the value from',
      predicate: 'Function returning true when the item matches',
    },
    returns: 'A number if the item is found, or else null',
  }
);

export const map = defineFunction(
  'map',
  [{ name: 'value' }, { name: 'mapper' }],
  (ctx, { value, mapper }) => {
    if (value == null) return null;
    if (Array.isArray(value)) {
      return (value as any[]).map((it, index) =>
        ctx.callFunction(mapper, [it, index])
      );
    }
    if (value instanceof MessageStreamSink) {
      throw new Error(
        'map() over MessageStream is not supported in synchronous mode.'
      );
    }
    return ctx.callFunction(mapper, [value, 0]);
  },
  async (ctx, { value, mapper }) => {
    if (value == null) return null;
    if (Array.isArray(value)) {
      const result = [];
      for (let index = 0; index < value.length; index++) {
        const it = value[index];
        result.push(await ctx.callFunctionAsync(mapper, [it, index]));
      }
      return result;
    }
    if (isMessageStream(value)) {
      const result: unknown[] = [];
      let index = 0;
      const messages = value.messages();
      while (true) {
        const currentMessage = await messages.next();
        if (currentMessage.done || currentMessage.value == null) break;
        result.push(
          await ctx.callFunctionAsync(mapper, [currentMessage.value, index])
        );
        index++;
      }
      return result;
    }
    return await ctx.callFunctionAsync(mapper, [value, 0]);
  }
);

export const map_parallel = defineFunction(
  'map_parallel',
  [{ name: 'value' }, { name: 'mapper' }],
  undefined,
  async (ctx, { value, mapper }) => {
    if (value == null) return null;
    if (Array.isArray(value)) {
      return Promise.all(
        (value as any[]).map((it, index) =>
          ctx.callFunctionAsync(mapper, [it, index])
        )
      );
    }
    throw new Error('Type not supported for map_parallel');
  }
);

export const flat_map = defineFunction(
  'flat_map',
  [{ name: 'value' }, { name: 'mapper' }],
  (ctx, { value, mapper }) => {
    if (Array.isArray(value)) {
      return (value as any[]).flatMap((it, index) =>
        ctx.callFunction(mapper, [it, index])
      );
    }
    throw new Error('Type not supported for flat_map');
  },
  async (ctx, { value, mapper }) => {
    if (Array.isArray(value)) {
      return (
        await Promise.all(
          (value as any[]).map((it, index) =>
            ctx.callFunctionAsync(mapper, [it, index])
          )
        )
      ).flat();
    }
    throw new Error('Type not supported for flat_map');
  }
);

export const sort = defineFunction(
  'sort',
  [{ name: 'value' }, { name: 'comparator' }],
  (ctx, { value, comparator }) => {
    if (Array.isArray(value)) {
      return (value as any[])
        .slice()
        .sort((a, b) => ctx.callFunction(comparator, [a, b]) as number);
    }
    throw new Error('Type not supported for sort');
  }
);

export const reverse = defineFunction(
  'reverse',
  [{ name: 'value' }],
  (_ctx, { value }) => {
    if (Array.isArray(value)) {
      return (value as any[]).slice().reverse();
    }
    throw new Error('Type not supported for reverse');
  }
);

export const reduce = defineFunction(
  'reduce',
  [{ name: 'value' }, { name: 'reducer' }],
  (ctx, { value, reducer }) => {
    if (Array.isArray(value)) {
      return (value as any[]).reduce((previous, current) => {
        return ctx.callFunction(reducer, [previous, current]);
      });
    }
    throw new Error('Type not supported for reduce');
  }
);

export const contains = defineFunction(
  'contains',
  [{ name: 'value' }, { name: 'element' }],
  (ctx, { value, element }) => {
    if (value == null) return false;
    if (Array.isArray(value)) {
      return (value as any[]).includes(element);
    }
    throw new Error('Type not supported for contains');
  }
);

export const length = defineFunction(
  'length',
  [{ name: 'value' }],
  (_ctx, { value }) => {
    if (Array.isArray(value) || typeof value == 'string') {
      return value.length;
    }
    throw new Error('Type not supported for length');
  }
);

export const unique = defineFunction(
  'unique',
  [{ name: 'value' }],
  (_ctx, { value }) => {
    if (Array.isArray(value)) {
      return [...new Set(value as unknown[])];
    }
    throw new Error('Type not supported for unique');
  }
);
