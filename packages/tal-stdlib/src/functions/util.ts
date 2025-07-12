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
  },
  undefined,
  {
    description: 'Skip the first N elements of a value',
    parameters: {
      value: 'Value to skip elements from',
      offset: 'Number of elements to skip',
    },
    returns: 'Value starting from the offset',
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
  },
  undefined,
  {
    description: 'Take the first N elements of a value',
    parameters: {
      value: 'Value to take elements from',
      take: 'Number of elements to take',
    },
    returns: 'Value containing the first N elements',
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
  },
  undefined,
  {
    description: 'Filter a value using a predicate function',
    parameters: {
      value: 'Value to filter',
      predicate: 'Function returning true to keep an element',
    },
    returns: 'Value containing elements that match the predicate',
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
  },
  undefined,
  {
    description: 'Find the first element in a value matching a predicate',
    parameters: {
      value: 'Value to search',
      predicate: 'Function returning true for the match',
    },
    returns: 'First matching element or undefined',
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
    description: 'Find the index of an element in a value using a predicate',
    parameters: {
      value: 'Value to search',
      predicate: 'Function returning true for the match',
    },
    returns: 'Index of the element or null if not found',
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
        'map() over MessageStream is not supported synchronously'
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
  },
  {
    description: 'Map over a value using a mapper function',
    parameters: {
      value: 'Value to map',
      mapper: 'Function to apply to each element',
    },
    returns: 'Value of mapped results or null',
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
  },
  {
    description: 'Map over a value in parallel using an async mapper',
    parameters: {
      value: 'Value to map',
      mapper: 'Async function to apply to each element',
    },
    returns: 'Value with mapped results',
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
  },
  {
    description: 'Flat map over a value using a mapper function',
    parameters: {
      value: 'Value to flat map',
      mapper: 'Function or async function returning values to flatten',
    },
    returns: 'Flattened mapped results',
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
  },
  undefined,
  {
    description: 'Sort a value using a comparator function',
    parameters: {
      value: 'Value to sort',
      comparator: 'Function(a, b) returning number indicating order',
    },
    returns: 'Sorted value',
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
  },
  undefined,
  {
    description: 'Reverse a value',
    parameters: { value: 'Value to reverse' },
    returns: 'Reversed value',
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
  },
  undefined,
  {
    description: 'Reduce a value to a single result using a reducer function',
    parameters: {
      value: 'Value to reduce',
      reducer: 'Function(previous, current) returning accumulator',
    },
    returns: 'Reduced result',
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
  },
  undefined,
  {
    description: 'Check if a value contains an element',
    parameters: {
      value: 'Value to check',
      element: 'Element to find',
    },
    returns: 'True if element is contained',
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
  },
  undefined,
  {
    description: 'Get the length of a value',
    parameters: { value: 'Value to measures' },
    returns: 'Length as number',
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
  },
  undefined,
  {
    description: 'Get unique elements from a value',
    parameters: { value: 'Value to deduplicate' },
    returns: 'Value containing unique elements',
  }
);

export const notify = defineFunction(
  'notify',
  [{ name: 'title' }, { name: 'body' }, { name: 'modal' }],
  undefined,
  async (_ctx, { title, body, modal }) => {
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
    if (Notification.permission != 'granted') {
      return;
    }

    const notification = await createNotification(title, body, modal);

    notification.addEventListener('click', () => {
      window.focus();
    });
  },
  {
    description: 'Show a notification with title and body',
    parameters: {
      title: 'Notification title',
      body: 'Notification body text',
      modal: 'Whether the notification requires interaction',
    },
    returns: 'Nothing',
  }
);

let createNotification = createNotificationTryingAllMethods;

async function createNotificationTryingAllMethods(
  title: string,
  body: string,
  modal: boolean
): Promise<Notification> {
  try {
    const notification = await createNotificationViaConstructor(
      title,
      body,
      modal
    );
    createNotification = createNotificationViaConstructor;
    return notification;
  } catch (err) {
    const notification = await createNotificationViaServiceWorker(
      title,
      body,
      modal
    );
    createNotification = createNotificationViaServiceWorker;
    return notification;
  }
}

async function createNotificationViaServiceWorker(
  title: string,
  body: string,
  modal: boolean
) {
  const registration = await navigator.serviceWorker.ready;
  const tag = Math.random().toString();

  await registration.showNotification(title ?? 'Notification', {
    body: body ?? '',
    requireInteraction: !!modal,
    tag,
  });

  return (await registration.getNotifications({ tag }))[0];
}

async function createNotificationViaConstructor(
  title: string,
  body: string,
  modal: boolean
) {
  return new Notification(title, {
    body,
    requireInteraction: modal,
  });
}
