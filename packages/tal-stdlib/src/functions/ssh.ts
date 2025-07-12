import { customRpcWs } from '../util/custom-rpc';
import { defineFunction } from 'tal-eval';
import { MessageStream, MessageStreamSink } from '../util/streams';

export type SshConnectionObject = {
  done: boolean;
  stdout: MessageStream;
  stderr: MessageStream;
  write(data: ArrayBuffer): void;
  resize(cols: number, rows: number): void;
  wait(): Promise<number>;
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
    const endPromise = Promise.withResolvers<number>();

    let sshConnectionObject: SshConnectionObject = {
      done: false,
      stdout: stdoutSink,
      stderr: stderrSink,
      write(data: ArrayBuffer) {
        if (!result.isOpen()) return;
        const i8 = new Uint8Array(new ArrayBuffer(1 + data.byteLength));
        const dv = new DataView(i8.buffer);
        dv.setUint8(0, 0);
        i8.set(new Uint8Array(data), 1);
        result.send(dv.buffer);
      },
      resize(cols: number, rows: number) {
        if (!result.isOpen()) return;
        const dv = new DataView(new ArrayBuffer(9));
        dv.setUint8(0, 3);
        dv.setUint32(1, cols, true);
        dv.setUint32(5, rows, true);
        result.send(dv.buffer);
      },
      wait() {
        return endPromise.promise;
      },
    };

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
            stdoutSink.push(message.slice(1));
            break;
          case 2:
            stderrSink.push(message.slice(1));
            break;
          case 3:
            if (dv.getUint8(1) === 1) {
              endPromise.resolve(dv.getUint8(2));
            } else {
              endPromise.reject(new Error('Failed to run ssh'));
            }
            doContinue = false;
            break;
        }
      }
      stdoutSink.end();
      stderrSink.end();
      sshConnectionObject.done = true;
      ctx.forceRefresh();
    })();

    return sshConnectionObject;
  },
  {
    description: 'Execute an SSH command with interactive I/O',
    parameters: {
      command: 'Command string to run on remote host',
      env: 'Environment variables map (optional)',
      timeout: 'Timeout in milliseconds (optional)',
      host: 'SSH server host',
      port: 'SSH server port',
      username: 'Username for authentication',
      password: 'Password for authentication',
      pty: 'Whether to allocate a pseudo-terminal',
    },
    returns: 'SshConnectionObject for interacting with the session',
  }
);

export const ssh_write = defineFunction(
  'ssh_write',
  [{ name: 'connection' }, { name: 'data' }],
  undefined,
  async (ctx, { connection, data }) => {
    let dataToSend = data;
    if (typeof data == 'string') {
      dataToSend = new TextEncoder().encode(data).buffer;
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

export const ssh_wait = defineFunction(
  'ssh_wait',
  [{ name: 'connection' }],
  undefined,
  async (ctx, { connection }) => {
    return await (connection as SshConnectionObject).wait();
  },
  {
    description: 'Wait for the SSH connection to close',
    parameters: {
      connection: 'Connection to resize',
    },
    returns: 'Nothing',
  }
);
