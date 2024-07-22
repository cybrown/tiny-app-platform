import { defineFunction } from 'tal-eval';
import { MessageStreamSink, streamMerge } from '../util/streams';

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

export const stream_create = defineFunction(
  'stream_create',
  [],
  (_ctx, {}) => {
    return new MessageStreamSink();
  },
  undefined,
  {
    description: 'Create a new stream',
    returns: 'A new stream to write data to and read data from',
    parameters: {},
  }
);

export const stream_write = defineFunction(
  'stream_write',
  [{ name: 'stream' }, { name: 'data' }],
  (_ctx, { stream, data }) => {
    stream.push(data);
  },
  undefined,
  {
    description: 'Write data to a stream',
    returns: 'The stream the data was written to',
    parameters: {
      stream: 'Stream to write data to',
      data: 'Data to write to the stream',
    },
  }
);

export const stream_close = defineFunction(
  'stream_close',
  [{ name: 'stream' }],
  (_ctx, { stream }) => {
    stream.end();
  },
  undefined,
  {
    description: 'Closes a stream',
    returns: 'Nothing',
    parameters: {
      stream: 'The stream to close',
    },
  }
);

export const stream_read = defineFunction(
  'stream_read',
  [{ name: 'stream' }],
  undefined,
  async (_ctx, { stream }) => {
    const { value, done } = await stream.next();
    if (!done) {
      return value;
    }
    return null;
  },
  {
    description: 'Read data from a stream',
    returns: 'The latest data in the stream',
    parameters: { stream: 'Stream to read data from' },
  }
);
