import fs from 'fs';
import findFreePort from 'find-free-port';
import { run } from './run';

/*
TODO:
Sub commands: run, format, check ?
Current working directory in configuration
Non-http based custom-rpc
no serialization custom rpc

*/

(async function() {
  const port = (await findFreePort(16384))[0];

  (globalThis as any).backendUrl = 'http://127.0.0.1:' + port;

  const server = require('../../backend/lib/server.js');
  require('../../backend/lib/config.js').log = false;
  await new Promise(resolve =>
    server.listen({ port, host: '127.0.0.1' }, resolve)
  );

  const source = fs.readFileSync(process.stdin.fd, 'utf-8');
  try {
    await run(source, 'stdin');
  } finally {
    server.close();
  }
})();
