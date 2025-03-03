import { windowExists } from '../util/window';
import { customRpc, customRpcWs } from '../util/custom-rpc';
import { defineFunction } from 'tal-eval';
import { MessageStream, MessageStreamSink } from '../util/streams';

let sourcePathDirname: string | null = null;
try {
  if (windowExists && 'electronAPI' in window) {
    sourcePathDirname = (window.electronAPI as any).config().sourcePathDirname;
  }
} catch (err) {
  console.log('failed to initialize config event for sourcePathDirname');
}

export type ProcessLogItemData = {
  command: string;
  args: string[];
  exitStatus?: string;
  stdout?: ArrayBuffer;
  stage: 'pending' | 'timeout' | 'fulfilled' | 'rejected';
};

export const process_exec = defineFunction(
  'process_exec',
  [
    { name: 'name' },
    { name: 'args' },
    { name: 'cwd', onlyNamed: true },
    { name: 'env', onlyNamed: true },
    { name: 'timeout', onlyNamed: true },
  ],
  undefined,
  async (ctx, { name, args, cwd, env, timeout }) => {
    const logItem: ProcessLogItemData = {
      command: name,
      args,
      stage: 'pending',
    };
    const log = ctx.log('process', logItem);
    try {
      const result = await customRpc(
        'exec-process',
        JSON.stringify({
          fileName: name,
          args,
          env,
          cwd: cwd ?? sourcePathDirname,
          timeout,
        }),
        []
      );
      if (result.status !== 200) {
        throw new Error('Failed to execute process, check server logs');
      }
      const resultStdout = await result.arrayBuffer();
      log.data.exitStatus = result.headers.get('X-Exit-Status') ?? undefined;
      log.data.stage =
        result.headers.get('X-Exit-Status') == 'null' ? 'timeout' : 'fulfilled';
      log.data.stdout = resultStdout;
      return {
        exitStatus: result.headers.get('X-Exit-Status') ?? null,
        pid: Number(result.headers.get('X-Pid')),
        stdout: resultStdout,
      };
    } catch (err) {
      log.data.stage = 'rejected';
      throw err;
    }
  }
);

export const process_kill = defineFunction(
  'process_kill',
  [{ name: 'pid' }, { name: 'signal' }],
  undefined,
  async (_ctx, { pid, signal }) => {
    const result = await customRpc(
      'kill-process',
      JSON.stringify({
        pid,
        signal,
      }),
      []
    );
    if (result.status !== 204) {
      throw new Error('Failed to kill process, check server logs');
    }
  }
);

export type ProcessPtyObject = {
  pid: number;
  done: boolean;
  statusCode: null | number;
  data: MessageStream;
  send: (data: ArrayBuffer) => void;
  resize: (cols: number, rows: number) => void;
};

export const process_pty_create = defineFunction(
  'process_pty_create',
  [
    { name: 'name' },
    { name: 'args' },
    { name: 'cwd', onlyNamed: true },
    { name: 'env', onlyNamed: true },
    { name: 'timeout', onlyNamed: true },
  ],
  undefined,
  async (ctx, { name, args, cwd, env, timeout }) => {
    const result = await customRpcWs(
      'process_pty_create',
      {
        fileName: name,
        args,
        cwd: cwd ?? sourcePathDirname,
        env,
        timeout,
      },
      []
    );

    const dataStream = new MessageStreamSink();

    const { resolve: pidResolve, promise: pidPromise } =
      Promise.withResolvers();

    (async function () {
      while (true) {
        const message = await result.messages.next();
        if (message.done) break;

        if (message.value) {
          const messageKind = new Uint8Array(message.value)[0];
          const messageData = message.value.slice(1);
          switch (messageKind) {
            case 1:
              dataStream.push(messageData);
              break;
            case 4: {
              const arr = new Uint32Array(messageData);
              pidResolve(arr[0]);
              break;
            }
          }
        }
      }
    })();

    let processObject: ProcessPtyObject = {
      pid: Number(await pidPromise),
      done: false,
      statusCode: null as number | null,
      data: dataStream,
      send(p: ArrayBuffer) {
        if (!result.isOpen()) return;
        const frame = new Uint8Array(new ArrayBuffer(p.byteLength + 1));
        frame.set(new Uint8Array(p), 1);
        result.send(frame.buffer);
      },
      resize(cols: number, rows: number) {
        if (!result.isOpen()) return;
        const dv = new DataView(new ArrayBuffer(9));
        dv.setUint8(0, 1);
        dv.setUint32(1, cols, true);
        dv.setUint32(5, rows, true);
        result.send(dv.buffer);
      },
    };

    return processObject;
  }
);

const textEncoder = new TextEncoder();

export const process_pty_write = defineFunction(
  'process_pty_write',
  [{ name: 'process' }, { name: 'data' }],
  undefined,
  async (_ctx, { process, data }) => {
    (process as ProcessPtyObject).send(
      typeof data === 'string' ? textEncoder.encode(data).buffer : data
    );
  }
);

export const process_pty_resize = defineFunction(
  'process_pty_resize',
  [{ name: 'process' }, { name: 'cols' }, { name: 'rows' }],
  undefined,
  async (_ctx, { process, cols, rows }) => {
    (process as ProcessPtyObject).resize(cols, rows);
  }
);
