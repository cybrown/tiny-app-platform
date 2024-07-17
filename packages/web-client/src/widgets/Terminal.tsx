import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import { Terminal as XTermTerminal } from "@xterm/xterm";
import { useEffect, useMemo, useRef } from "react";
import "@xterm/xterm/css/xterm.css";

export type TerminalProps = {
  ctx?: RuntimeContext;
  bytes: ReadableStreamDefaultReader<Uint8Array>;
  ignoreStdout?: boolean;
  ignoreStderr?: boolean;
};

export default function Terminal({
  ctx,
  bytes,
  ignoreStdout,
  ignoreStderr,
}: TerminalProps) {
  const divRef = useRef<HTMLDivElement>(null);

  const term = useMemo(() => new XTermTerminal({ convertEol: true }), []);

  useEffect(() => {
    if (!divRef.current) return;
    term.open(divRef.current);
    return () => {
      term.dispose();
    };
  }, [term]);

  useEffect(() => {
    if (!bytes) return;
    term.clear();
    let doCancel = false;
    async function readStream() {
      for await (const message of streamToMessages(bytes)) {
        if (doCancel) return;
        const outid = new DataView(message.buffer).getUint8(0);

        if (outid === 1 && !ignoreStdout) {
          term.write(message.slice(1));
        }
        if (outid === 2 && !ignoreStderr) {
          term.write(message.slice(1));
        }
      }
    }
    readStream().catch((err) => {
      // TODO: Log an error and show a notification
      console.error(err);
    });
    return () => {
      doCancel = true;
    };
  }, [term, bytes, ignoreStderr, ignoreStdout]);

  return (
    <div style={{ display: "flex" }}>
      <div ref={divRef} />
      <div style={{width: 30, height: 1}}></div>
    </div>
  );
}

export const TerminalDocumentation: WidgetDocumentation<TerminalProps> = {
  description: "Output bytes in a terminal",
  props: {
    bytes: "Data to display",
    ignoreStdout: "Ignore stdout",
    ignoreStderr: "Ignore stderr",
  },
};

// TODO: Extract the logic to split the stream into messages
async function* streamToMessages(
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
          "Not enough data to read message length: " + buffer.length
        )
      );
    }

    // buffer has more than 4 bytes, read length and infer expected message length
    let expectedMessageLength = new DataView(buffer.buffer).getUint32(0);

    // Read more data until there's enough to read the expected message
    while (buffer.length - 4 < expectedMessageLength) {
      buffer = concatUint8Arrays(
        buffer,
        await reader.readOrThrow("Not enough data to read message")
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
