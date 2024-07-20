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

export const process_exec_stream = defineFunction(
  'process_exec_stream',
  [{ name: 'name' }, { name: 'args' }, { name: 'env' }, { name: 'timeout' }],
  undefined,
  async (ctx, { name, args, env, timeout }) => {
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

    let processObject = {
      pid: Number(result.headers.get('X-Pid')),
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
              processObject.statusCode = dv.getUint8(2);
            }
            break;
        }
      }
      stdoutSink.end();
      stderrSink.end();
      processObject.done = true;
      ctx.forceRefresh();
    })();

    return processObject;
  }
);
