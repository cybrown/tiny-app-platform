import { defineFunction } from 'tal-eval';
import { streamMerge } from '../util/streams';

export const stream_merge = defineFunction(
  'stream_merge',
  [{ name: 'a' }, { name: 'b' }],
  (_ctx, { a, b }) => streamMerge(a, b),
  undefined,
  {
    description: 'Merge two streams',
    returns: 'A stream that is the merge of the two input streams',
    parameters: {
      a: 'The first stream to merge',
      b: 'The second stream to merge',
    },
  }
);
