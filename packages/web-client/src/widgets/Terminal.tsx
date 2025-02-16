import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import { Terminal as XTermTerminal } from "@xterm/xterm";
import { useEffect, useMemo, useRef } from "react";
import { MessageStream } from "tal-stdlib";
import "@xterm/xterm/css/xterm.css";

export type TerminalProps = {
  ctx?: RuntimeContext;
  stream: MessageStream;
  rows?: number;
};

export default function Terminal({ stream, rows }: TerminalProps) {
  const divRef = useRef<HTMLDivElement>(null);

  const term = useMemo(
    () =>
      new XTermTerminal({
        convertEol: true,
        ...(rows != null ? { rows } : {}),
      }),
    // Do not re-create the terminal when rows changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (!divRef.current) return;
    term.open(divRef.current);
    return () => {
      term.dispose();
    };
  }, [term]);

  useEffect(() => {
    if (!stream) return;
    term.clear();
    let doCancel = false;
    // eslint-disable-next-line no-loop-func
    (async function() {
      for await (const message of stream.messages()) {
        if (doCancel) return;
        term.write(message);
      }
    })().catch((err) => {
      // TODO: Log an error and show a notification
      console.error(err);
    });
    return () => {
      doCancel = true;
    };
  }, [term, stream]);

  return (
    <div style={{ display: "flex" }}>
      <div ref={divRef} />
      <div style={{ width: 30, height: 1 }}></div>
    </div>
  );
}

export const TerminalDocumentation: WidgetDocumentation<TerminalProps> = {
  description: "Output bytes in a terminal",
  props: {
    stream: "Stream of data to send to the terminal",
    rows: "Number of rows in the terminal",
  },
};
