export interface MessageStream {
  messages(): AsyncGenerator<ArrayBuffer, void, unknown>;
}

export class MessageStreamSink implements MessageStream {
  private promise = Promise.withResolvers<ArrayBuffer | undefined>();
  private promiseQueue: Promise<ArrayBuffer | undefined>[] = [];
  private done = false;

  push(message: ArrayBuffer) {
    if (this.done) throw new Error('Cannot push to a done MessageStream');
    this.promise.resolve(message);
    this.promiseQueue.push(this.promise.promise);
    this.promise = Promise.withResolvers<ArrayBuffer | undefined>();
  }

  end() {
    this.promise.resolve(undefined);
    this.promiseQueue.push(this.promise.promise);
    this.promise = Promise.withResolvers<ArrayBuffer | undefined>();
    this.done = true;
  }

  async next() {
    if (this.isRead) {
      throw new Error('Cannot read from a MessageStreamSink more than once');
    }
    this.isRead = true;

    while (true) {
      if (this.promiseQueue.length) {
        this.isRead = false;
        const value = await this.promiseQueue.shift();
        return { value, done: false };
      }

      if (this.done) {
        this.isRead = false;
        return { value: null, done: true };
      }

      await this.promise.promise;
    }
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
