import { customRpc } from '../util/custom-rpc';
import { defineFunction } from 'tal-eval';
import {
  BufferedMessageStream,
  MessageStreamSink,
  streamToMessages,
} from '../util/streams';

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
    const result = await customRpc(
      'ssh-exec',
      JSON.stringify({
        command,
        env,
        timeout,
        host,
        port,
        username,
        password,
        pty,
      }),
      []
    );
    if (result.status !== 200) {
      throw new Error('Failed to run ssh, check server logs');
    }
    const output = result.body?.getReader();

    const stdoutSink = new MessageStreamSink();
    const stderrSink = new MessageStreamSink();

    const stdoutBuffer = new BufferedMessageStream(stdoutSink);
    const stderrBuffer = new BufferedMessageStream(stderrSink);

    let sshConnectionObject = {
      done: false,
      statusCode: null as number | null,
      stdout: stdoutBuffer,
      stderr: stderrBuffer,
    };

    (async function() {
      if (!output) return;
      for await (const message of streamToMessages(output)) {
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
