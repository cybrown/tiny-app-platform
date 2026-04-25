import { customRpcWs } from '../util/custom-rpc';
import { defineFunction } from 'tal-eval';
import { MessageStream } from '../util/streams';

export type SshConnectionObject = {
  done: boolean;
  stdout: MessageStream;
  stderr: MessageStream;
  write(data: ArrayBuffer): void;
  resize(cols: number, rows: number): void;
  wait(): Promise<number>;
};

export type FsLogItemData = {
  path: string;
  operation: 'read';
  result?: unknown;
  stage: 'pending' | 'fulfilled' | 'rejected';
};

export const fs_read = defineFunction(
  'fs_read',
  [{ name: 'path' }],
  undefined,
  async (ctx, { path }) => {
    const logItemData: FsLogItemData = {
      path,
      operation: 'read',
      stage: 'pending',
    };
    const logItem = ctx.log('fs', logItemData);
    try {
      const result = await customRpcWs(
        'fs_read',
        {
          path,
        },
        []
      );

      return new Promise((resolve, reject) => {
        (async function () {
          let doContinue = true;
          while (doContinue) {
            const { value: message, done } = await result.messages.next();

            if (done || message == null) {
              break;
            }

            const dv = new DataView(message);
            const outid = dv.getUint8(0);
            switch (outid) {
              case 1:
                logItem.data.stage = 'fulfilled';
                resolve(message.slice(1));
                doContinue = false;
                break;
              case 2:
                // should not happen
                doContinue = false;
                break;
              case 3:
                logItem.data.stage = 'rejected';
                reject(new Error('Failed to read file'));
                doContinue = false;
                break;
            }
          }
          ctx.forceRefresh();
        })();
      });
    } catch (e) {
      logItem.data.stage = 'rejected';
      throw e;
    }
  },
  {
    description: 'Read a whole file from file system',
    parameters: {
      path: 'Path of the file',
    },
    returns: 'bytes of the file',
  }
);
