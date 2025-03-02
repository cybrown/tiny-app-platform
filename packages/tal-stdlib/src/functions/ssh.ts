import { customRpc, customRpcWs } from '../util/custom-rpc';
import { defineFunction } from 'tal-eval';
import {
  BufferedMessageStream,
  MessageStream,
  MessageStreamSink,
  streamToMessages,
} from '../util/streams';

export type SshConnectionObject = {
  done: boolean;
  statusCode: number | null;
  stdout: MessageStream;
  stderr: MessageStream;
  write(data: ArrayBuffer): void;
  resize(cols: number, rows: number): void;
};

export const ssh_exec = defineFunction(
  'ssh_exec',
  [
    { name: 'command' },
    { name: 'env' },
    { name: 'timeout' },
    { name: 'host' },
    { name: 'port' },
    { name: 'username' },
    { name: 'password' },
    { name: 'pty' },
  ],
  undefined,
  async (
    ctx,
    { command, env, timeout, host, port, username, password, pty }
  ) => {
    const result = await customRpcWs(
      'ssh_exec',
      {
        command,
        env,
        timeout,
        host,
        port,
        username,
        password,
        pty,
      },
      []
    );

    const stdoutSink = new MessageStreamSink();
    const stderrSink = new MessageStreamSink();

    const stdoutBuffer = new BufferedMessageStream(stdoutSink);
    const stderrBuffer = new BufferedMessageStream(stderrSink);

    let sshConnectionObject: SshConnectionObject = {
      done: false,
      statusCode: null as number | null,
      stdout: stdoutBuffer,
      stderr: stderrBuffer,
      write(data: ArrayBuffer) {
        const i8 = new Uint8Array(new ArrayBuffer(1 + data.byteLength));
        const dv = new DataView(i8.buffer);
        dv.setUint8(0, 0);
        i8.set(new Uint8Array(data), 1);
        result.send(dv.buffer);
      },
      resize(cols: number, rows: number) {
        const dv = new DataView(new ArrayBuffer(9));
        dv.setUint8(0, 3);
        dv.setUint32(1, cols, true);
        dv.setUint32(5, rows, true);
        result.send(dv.buffer);
      }
    };

    (async function () {
      while (true) {
        const { value: message, done } = await result.messages.next();

        if (done || message == null) {
          break;
        }

        const dv = new DataView(message.buffer);
        const outid = dv.getUint8(0);
        switch (outid) {
          case 1:
            stdoutSink.push(message.slice(1));
            break;
          case 2:
            stderrSink.push(message.slice(1));
            break;
          case 3:
            if (dv.getUint8(1) === 1) {
              sshConnectionObject.statusCode = dv.getUint8(2);
            }
            break;
        }
      }
      stdoutSink.end();
      stderrSink.end();
      sshConnectionObject.done = true;
      ctx.forceRefresh();
    })();

    return sshConnectionObject;
  }
);

export const ssh_write = defineFunction(
  'ssh_write',
  [{ name: 'connection' }, { name: 'data' }],
  undefined,
  async (ctx, { connection, data }) => {
    let dataToSend = data;
    if (typeof data == 'string') {
      dataToSend = new TextEncoder().encode(data);
    }
    (connection as SshConnectionObject).write(dataToSend);
  },
  {
    description: 'Send data to an open ssh connection',
    parameters: {
      connection: 'Connection to send data to',
      data: 'Data to send',
    },
    returns: 'Nothing',
  }
);

export const ssh_resize = defineFunction(
  'ssh_resize',
  [{ name: 'connection' }, { name: 'cols' }, { name: 'rows' }],
  undefined,
  async (ctx, { connection, cols, rows }) => {
    (connection as SshConnectionObject).resize(cols, rows);
  },
  {
    description: 'Resize the terminal window of an SSH connection',
    parameters: {
      connection: 'Connection to resize',
      cols: 'Number of columns in the terminal',
      rows: 'Number of rows in the terminal',
    },
    returns: 'Nothing',
  }
);
