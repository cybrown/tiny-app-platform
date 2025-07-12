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
  },
  {
    description:
      'Execute a system process with arguments and optional environment, working directory, and timeout',
    parameters: {
      name: 'Command to execute',
      args: 'Array of string arguments',
      cwd: 'Working directory path',
      env: 'Environment variables map',
      timeout: 'Timeout in milliseconds',
    },
    returns: 'Object containing exitStatus, pid, and stdout buffer',
  }
);

export const process_kill = defineFunction(
  'process_kill',
  [{ name: 'pid' }, { name: 'signal' }],
  undefined,
  async (_ctx, { pid, signal }) => {
    const result = await customRpc(
      'kill-process',
      JSON.stringify({ pid, signal }),
      []
    );
    if (result.status !== 204) {
      throw new Error('Failed to kill process, check server logs');
    }
  },
  {
    description: 'Kill a running process by PID and signal',
    parameters: {
      pid: 'Process ID to kill',
      signal: 'Signal name or number to send',
    },
    returns: 'Undefined if successful, throws on failure',
  }
);

export type ProcessPtyObject = {
  pid: number;
  done: boolean;
  statusCode: null | number;
  data: MessageStream;
  send(data: ArrayBuffer): void;
  resize(cols: number, rows: number): void;
  wait(): Promise<number>;
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

    const pidReceived = Promise.withResolvers();
    const processEnded = Promise.withResolvers<number>();

    (async function () {
      while (true) {
        const message = await result.messages.next();
        if (message.done) break;

        if (message.value) {
          const messageKind = new Uint8Array(message.value)[0];
          const messageData = message.value.slice(1);
          switch (messageKind) {
            case 1:
              // Received data
              dataStream.push(messageData);
              break;
            case 3: {
              // Received process status and process has stopped
              let arr = new Uint8Array(messageData);
              if (!arr[0])
                return processEnded.reject(
                  new Error('Failed to start process')
                );
              dataStream.end();
              return processEnded.resolve(arr[1]);
            }
            case 4: {
              // Received process pid
              const arr = new Uint32Array(messageData);
              pidReceived.resolve(arr[0]);
              break;
            }
          }
        }
      }
    })();

    let processObject: ProcessPtyObject = {
      pid: Number(await pidReceived.promise),
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
      wait() {
        return processEnded.promise;
      },
    };

    return processObject;
  },
  {
    description: 'Create a pseudo-terminal process with streaming I/O',
    parameters: {
      name: 'Command to execute in PTY',
      args: 'Array of string arguments',
      cwd: 'Working directory path',
      env: 'Environment variables map',
      timeout: 'Timeout in milliseconds',
    },
    returns: 'ProcessPtyObject with PID, data stream, and control methods',
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
  },
  {
    description: 'Send data to a PTY process stdin',
    parameters: {
      process: 'ProcessPtyObject to write to',
      data: 'String or ArrayBuffer data to send',
    },
    returns: 'Undefined',
  }
);

export const process_pty_resize = defineFunction(
  'process_pty_resize',
  [{ name: 'process' }, { name: 'cols' }, { name: 'rows' }],
  undefined,
  async (_ctx, { process, cols, rows }) => {
    (process as ProcessPtyObject).resize(cols, rows);
  },
  {
    description: 'Resize a PTY process terminal dimensions',
    parameters: {
      process: 'ProcessPtyObject to resize',
      cols: 'Number of columns',
      rows: 'Number of rows',
    },
    returns: 'Undefined',
  }
);

export const process_pty_wait = defineFunction(
  'process_pty_wait',
  [{ name: 'process' }],
  undefined,
  async (_ctx, { process }) => {
    return (process as ProcessPtyObject).wait();
  },
  {
    description: 'Wait for a PTY process to exit and return its status code',
    parameters: { process: 'ProcessPtyObject to wait on' },
    returns: 'Exit status code as number',
  }
);
