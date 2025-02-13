import fs from 'fs';
import findFreePort from 'find-free-port';
import { parse, Node } from 'tal-parser';
import {
  lowerSingle,
  compile,
  runAsync,
  RuntimeContext,
  Program,
  EvaluationError,
} from 'tal-eval';
import { importStdlibInContext } from 'tal-stdlib';
import repl from 'node:repl';
import tty from 'node:tty';

/*
TODO:
Sub commands: run, format, check ?
Current working directory in configuration
Non-http based custom-rpc
no serialization custom rpc

*/

(async function() {
  const backend = await startBackend();

  if (!tty.isatty(process.stdin.fd)) {
    try {
      const source = fs.readFileSync(process.stdin.fd, 'utf-8');

      const ctx = createContext();

      const result = await doRun(source, ctx);
      if (result.kind == 'more') {
        throw new Error('Parse error: not expected end of input');
      }
    } catch (err) {
      console.error(err);
    } finally {
      backend.close();
    }
  } else {
    const ctx = createContext();
    let buffer = '';
    repl.start({
      ignoreUndefined: true,
      eval: async (evalCmd, _context, _file, cb) => {
        try {
          const source = buffer + evalCmd;
          const result = await doRun(source, ctx);

          if (result.kind == 'done') {
            buffer = '';
            cb(null, result.value);
          } else if (result.kind == 'more') {
            buffer = source.slice(result.offset);
          }
        } catch (err) {
          buffer = '';
          cb(err as any, undefined);
        }
      },
    });
  }
})();

function createContext() {
  const rootCtx = new RuntimeContext(() => null);
  importStdlibInContext(rootCtx);
  const ctx = rootCtx.createChild({});
  let program: Program = {};
  ctx.program = program;
  return ctx;
}

async function startBackend() {
  const port = (await findFreePort(16384))[0];
  (globalThis as any).backendUrl = 'http://127.0.0.1:' + port;
  const server = require('../../backend/lib/server.js');
  require('../../backend/lib/config.js').log = false;
  await new Promise(resolve =>
    server.listen({ port, host: '127.0.0.1' }, resolve)
  );
  return {
    close() {
      server.close();
    },
  };
}

async function doRun(
  source: string,
  ctx: RuntimeContext
): Promise<
  { kind: 'done'; value: unknown } | { kind: 'more'; offset: number }
> {
  const csts: Node[] = [];
  let parseError: unknown;
  let lastOffset = 0;

  try {
    try {
      parse(source, 'stdin', node => {
        csts.push(node);
      });
    } catch (err) {
      parseError = err;
    }

    let lastResult: unknown;

    for (const cst of csts) {
      const ast = lowerSingle(cst);
      const newProgram = compile(ast);
      if (!ctx.program) throw new Error('Context must have a program');
      for (const key in newProgram) {
        ctx.program[key] = newProgram[key];
      }
      lastResult = await runAsync(ctx, 'main');
      if (!cst.location) {
        throw new Error('Missing location on Syntax Tree');
      }
      lastOffset = cst.location.end.offset;
    }

    if (parseError) {
      throw parseError;
    }

    return { kind: 'done', value: lastResult };
  } catch (err) {
    if (err instanceof EvaluationError) {
      const errorMsg = `Error at ${err.node.location?.start.line}:${err.node.location?.start.column} : ${err.detailedMessage}`;
      return { kind: 'done', value: errorMsg };
    } else if (
      typeof err == 'object' &&
      err &&
      'name' in err &&
      err.name == 'SyntaxError' &&
      // TODO: Better detection of more input could have been expected
      'found' in err &&
      err.found == null
    ) {
      return { kind: 'more', offset: lastOffset };
    } else {
      throw err;
    }
  }
}
