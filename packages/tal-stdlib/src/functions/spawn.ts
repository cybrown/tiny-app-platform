import { defineFunction } from 'tal-eval';

export const spawn = defineFunction(
  'spawn',
  [{ name: 'func' }],
  (ctx, { func }) => {
    (async function() {
      ctx.callFunctionAsync(func, []).catch(() => {
        ctx.notify('Error in background, check devtools for details');
      });
    })();
    return null;
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
  (_ctx, { ms }) => new Promise(resolve => setTimeout(resolve, ms))
);
