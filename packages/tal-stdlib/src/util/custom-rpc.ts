import { getBackendurl } from './configuration';
import { MessageStreamSink } from './streams';

export async function customRpc(
  command: string,
  body: unknown,
  headers: [string, string][] = []
) {
  return fetch(getBackendurl() + '/op/' + command, {
    method: 'post',
    headers: headers,
    // TODO: allow more types to be passed as raw, such as array buffer
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

export async function customRpcWs(
  command: string,
  body: unknown,
  headers: [string, string][] = []
) {
  const client = new WebSocket(getBackendurl() + '/ws');

  const messages = new MessageStreamSink();

  const {
    promise: successPromise,
    resolve: successResolve,
    reject: successReject,
  } = Promise.withResolvers<void>();

  let isFirstMessage = true;

  async function firstMessageHandler(message: MessageEvent<Blob>) {
    if (isFirstMessage) {
      isFirstMessage = false;
      const firstMessage = new Uint8Array(await message.data.arrayBuffer());
      const status = firstMessage[0];
      if (status > 0) {
        const errorMessage = new TextDecoder().decode(firstMessage.slice(1));
        successReject(new Error(errorMessage));
        return;
      }
      successResolve();
    } else {
      messages.push(await message.data.arrayBuffer());
    }
  }
  client.addEventListener('message', firstMessageHandler);
  client.addEventListener('error', successReject);

  await new Promise((resolve) => {
    client.addEventListener('open', resolve);
  });

  client.send(
    JSON.stringify({
      command,
      body,
      headers,
    })
  );

  await successPromise;

  return {
    send(data: ArrayBuffer) {
      client.send(data);
    },
    messages,
    close() {
      client.close();
    },
    isOpen() {
      return client.readyState == client.OPEN
    }
  };
}
