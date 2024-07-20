export async function* streamToMessages(
  stream: ReadableStreamDefaultReader<Uint8Array>
) {
  const reader = new ReadableReader(stream);
  let buffer = new Uint8Array(0);

  while (reader.hasMore || buffer.length) {
    // When there's not enough bytes to read the length, read more from the stream until there's enough
    while (buffer.length < 4) {
      if (!(reader.hasMore || buffer.length)) return;
      buffer = concatUint8Arrays(
        buffer,
        await reader.readOrThrow(
          'Not enough data to read message length: ' + buffer.length
        )
      );
    }

    // buffer has more than 4 bytes, read length and infer expected message length
    let expectedMessageLength = new DataView(buffer.buffer).getUint32(0);

    // Read more data until there's enough to read the expected message
    while (buffer.length - 4 < expectedMessageLength) {
      buffer = concatUint8Arrays(
        buffer,
        await reader.readOrThrow('Not enough data to read message')
      );
    }

    // Yield messages until there's not enough data to complete one message
    while (buffer.length - 4 >= expectedMessageLength) {
      yield buffer.slice(4, 4 + expectedMessageLength);
      buffer = buffer.slice(4 + expectedMessageLength);

      if (buffer.length < 4) break;
      expectedMessageLength = new DataView(buffer.buffer).getUint32(0);
    }
  }
}

/**
 * Helper class to read from a ReadableStreamDefaultReader<Uint8Array>
 */
class ReadableReader {
  private isDone = false;

  public get hasMore() {
    return !this.isDone;
  }

  constructor(private reader: ReadableStreamDefaultReader<Uint8Array>) {}

  async readOrThrow(message: string) {
    if (this.isDone) throw new Error(message);
    const { done, value } = await this.reader.read();
    if (done || !value) this.isDone = true;
    return value;
  }
}

/**
 * Concatenate two Uint8Arrays or only the first one if the second one is undefined
 */
function concatUint8Arrays(
  a: Uint8Array,
  b: Uint8Array | undefined
): Uint8Array {
  if (!b) return a;
  const result = new Uint8Array(a.length + b.length);
  result.set(a);
  result.set(b, a.length);
  return result;
}

export interface MessageStream {
  messages(): AsyncGenerator<Uint8Array, void, unknown>;
}

export class MessageStreamSink implements MessageStream {
  private promise = Promise.withResolvers<Uint8Array | undefined>();
  private promiseQueue: Promise<Uint8Array | undefined>[] = [];
  private done = false;

  push(message: Uint8Array) {
    if (this.done) throw new Error('Cannot push to a done MessageStreamSink');
    this.promise.resolve(message);
    this.promiseQueue.push(this.promise.promise);
    this.promise = Promise.withResolvers<Uint8Array | undefined>();
  }

  end() {
    this.promise.resolve(undefined);
    this.promiseQueue.push(this.promise.promise);
    this.promise = Promise.withResolvers<Uint8Array | undefined>();
    this.done = true;
  }

  private isRead = false;

  async *messages() {
    if (this.isRead) {
      throw new Error('Cannot read from a MessageStreamSink more than once');
    }
    this.isRead = true;

    while (true) {
      while (this.promiseQueue.length) {
        const nextMessage = await this.promiseQueue.shift()!;
        if (!nextMessage) {
          break;
        }
        yield nextMessage;
      }
      await this.promise.promise;
      if (this.done) {
        break;
      }
    }
  }
}

export class BufferedMessageStream implements MessageStream {
  private buffer: Uint8Array[] = [];
  private done = false;
  private currentPromise = Promise.withResolvers<Uint8Array | undefined>();
  private promiseQueue: Promise<Uint8Array | undefined>[] = [];

  constructor(source: MessageStream) {
    (async () => {
      for await (const message of source.messages()) {
        this.push(message);
      }
      this.end();
    })();
  }

  private push(message: Uint8Array) {
    this.buffer.push(message);
    this.currentPromise.resolve(message);
    this.promiseQueue.push(this.currentPromise.promise);
    this.currentPromise = Promise.withResolvers<Uint8Array | undefined>();
  }

  private end() {
    this.done = true;
    this.currentPromise.resolve(undefined);
    this.promiseQueue.push(this.currentPromise.promise);
    this.currentPromise = Promise.withResolvers<Uint8Array | undefined>();
  }

  async *messages() {
    let index = 0;
    while (true) {
      while (index < this.buffer.length) {
        yield this.buffer[index++];
      }

      while (this.promiseQueue.length) {
        await this.promiseQueue.shift();

        while (index < this.buffer.length) {
          yield this.buffer[index++];
        }
      }

      await this.currentPromise.promise;
      if (this.done) {
        break;
      }
    }
  }
}

class MergedMessageStream implements MessageStream {
  constructor(private sourceA: MessageStream, private sourceB: MessageStream) {}

  private isRead = false;

  async *messages() {
    if (this.isRead) {
      throw new Error('Cannot read from a MessageStreamSink more than once');
    }
    this.isRead = true;

    const messagesFromA = this.sourceA.messages();
    const messagesFromB = this.sourceB.messages();

    let nextMessageFromA = nullable(messagesFromA.next());
    let nextMessageFromB = nullable(messagesFromB.next());

    while (nextMessageFromA != null || nextMessageFromB != null) {
      const multiplexedResponse = await Promise.race(
        [
          nextMessageFromA == null
            ? null
            : nextMessageFromA.then(response => ({ origin: 'a', response })),
          nextMessageFromB == null
            ? null
            : nextMessageFromB.then(response => ({ origin: 'b', response })),
        ].filter(Boolean)
      );

      if (!multiplexedResponse) continue;

      if (multiplexedResponse.origin === 'a') {
        nextMessageFromA = multiplexedResponse.response.done
          ? null
          : messagesFromA.next();
      } else if (multiplexedResponse.origin === 'b') {
        nextMessageFromB = multiplexedResponse.response.done
          ? null
          : messagesFromB.next();
      }

      if (multiplexedResponse.response.value) {
        yield multiplexedResponse.response.value;
      }
    }
  }
}

export function streamMerge(
  sourceA: MessageStream,
  sourceB: MessageStream
): MessageStream {
  return new MergedMessageStream(sourceA, sourceB);
}

// Infer a nullable type for a value
function nullable<T>(value: T): T | null {
  return value;
}
