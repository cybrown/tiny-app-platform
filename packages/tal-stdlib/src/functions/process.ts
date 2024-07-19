import { customRpc } from '../util/custom-rpc';
import { defineFunction } from 'tal-eval';
import {
  BufferedMessageStream,
  MessageStreamSink,
  streamToMessages,
} from '../util/streams';

let sourcePathDirname: string | null = null;
try {
  sourcePathDirname = (window as any).electronAPI.config().sourcePathDirname;
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
  [{ name: 'name' }, { name: 'args' }, { name: 'env' }, { name: 'timeout' }],
  undefined,
  async (ctx, { name, args, env, timeout }) => {
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
          cwd: sourcePathDirname,
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
        stdout: resultStdout,
      };
    } catch (err) {
      log.data.stage = 'rejected';
      throw err;
    }
  }
);

export const process_exec_stream = defineFunction(
  'process_exec_stream',
  [{ name: 'name' }, { name: 'args' }, { name: 'env' }, { name: 'timeout' }],
  undefined,
  async (_ctx, { name, args, env, timeout }) => {
    const result = await customRpc(
      'exec-process-stream',
      JSON.stringify({
        fileName: name,
        args,
        cwd: sourcePathDirname,
        env,
        timeout,
      }),
      []
    );
    if (result.status !== 200) {
      throw new Error('Failed to execute process, check server logs');
    }
    const output = result.body?.getReader();

    const stdoutSink = new MessageStreamSink();
    const stderrSink = new MessageStreamSink();

    const stdoutBuffer = new BufferedMessageStream(stdoutSink);
    const stderrBuffer = new BufferedMessageStream(stderrSink);

    (async function() {
      if (!output) return;
      for await (const message of streamToMessages(output)) {
        const outid = new DataView(message.buffer).getUint8(0);
        if (outid === 1) {
          stdoutSink.push(message.slice(1));
        }
        if (outid === 2) {
          stderrSink.push(message.slice(1));
        }
      }
      stdoutSink.end();
      stderrSink.end();
    })();

    return {
      // TODO: Exit status has no meaning here, return a Promise ?
      exitStatus: result.headers.get('X-Exit-Status') ?? null,
      stdout: stdoutBuffer,
      stderr: stderrBuffer,
    };
  }
);
