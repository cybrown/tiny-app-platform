import { parse } from 'tal-parser';
import { lower, compile, runAsync, RuntimeContext } from 'tal-eval';
import { importStdlibInContext } from 'tal-stdlib';

export async function run(source: string, path: string) {
  const cst = parse(source, path);
  const ast = lower(cst);
  const program = compile(ast);
  const ctx = new RuntimeContext(() => null);
  importStdlibInContext(ctx);
  ctx.program = program;
  const returnValue = await runAsync(ctx, 'main', {}, process.argv);
  return returnValue;
}
