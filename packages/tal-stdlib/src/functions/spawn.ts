import { defineFunction } from 'tal-eval';

const ATTACHED_PROMISED = new WeakMap<AsyncTask, true>();

function isPromiseAttached(task: AsyncTask): boolean {
  return ATTACHED_PROMISED.has(task);
}

function attachTask(task: AsyncTask) {
  ATTACHED_PROMISED.set(task, true);
}

class AsyncTask {
  constructor(readonly promise: Promise<unknown>) {}
}

export const spawn = defineFunction(
  'spawn',
  [{ name: 'func' }],
  (ctx, { func }) => {
    const task = new AsyncTask(ctx.callFunctionAsync(func, []));
    task.promise.catch(() => {
      if (isPromiseAttached(task)) return;
      ctx.notify('Error in background task, check devtools for details');
    });
    return task;
  },
  undefined,
  {
    description: 'Run a function in background',
    parameters: {
      func: 'Function to run in background',
    },
    returns: 'Null',
  }
);

export const sleep = defineFunction(
  'sleep',
  [{ name: 'ms' }],
  undefined,
  (_ctx, { ms }) => new Promise((resolve) => setTimeout(resolve, ms))
);

export const wait = defineFunction(
  'wait',
  [{ name: 'tasks' }],
  undefined,
  (ctx, { tasks }) => {
    if (!Array.isArray(tasks)) {
      throw new Error('wait() expects an array');
    }

    for (const task of tasks) {
      attachTask(task);
    }

    return Promise.all(tasks.map((task) => task.promise));
  },
  {
    description: 'Wait for multiple running tasks',
    parameters: {
      tasks: 'Tasks run in background',
    },
    returns: 'Array of results of all tasks',
  }
);
