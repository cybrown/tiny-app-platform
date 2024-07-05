import { customRpc } from '../util/custom-rpc';
import { defineFunction } from 'tal-eval';

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
  [{ name: 'name' }, { name: 'args' }, { name: 'timeout' }],
  undefined,
  async (ctx, { name, args, timeout }) => {
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
