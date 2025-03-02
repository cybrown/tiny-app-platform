import { Closure, RuntimeContext, WidgetDocumentation } from "tal-eval";
import { Terminal as XTermTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useEffect, useMemo, useRef } from "react";
import { MessageStream, ProcessPtyObject } from "tal-stdlib";
import "@xterm/xterm/css/xterm.css";

export type TerminalProps = {
  ctx: RuntimeContext;
  stream: MessageStream;
  rows?: number;
  onData?: Closure;
  onResize?: Closure;
  process?: ProcessPtyObject;
};

export default function Terminal({
  ctx,
  stream,
  rows,
  onData,
  onResize,
  process,
}: TerminalProps) {
  const divRef = useRef<HTMLDivElement>(null);

  if (process && (onResize || onData || stream)) {
    throw new Error(
      "process prop is exclusive with onResize, onData and stream"
    );
  }

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
    divRef.current.style.width = "100%";
    term.open(divRef.current);
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.onData((str) => {
      if (onData) {
        ctx.callFunctionAsync(onData, [str]);
      } else if (process) {
        process.send(str);
      }
    });
    term.onResize((size) => {
      if (onResize) {
        ctx.callFunctionAsync(onResize, [size]);
      } else if (process) {
        process.resize(size.cols, size.rows);
      }
    });
    fitAddon.fit();

    const observer = new ResizeObserver(() => {
      fitAddon.fit();
    });

    observer.observe(divRef.current);

    return () => {
      term.dispose();
      observer.disconnect();
    };
  }, [term]);

  useEffect(() => {
    if (!stream && !process) return;
    term.clear();
    let doCancel = false;
    // eslint-disable-next-line no-loop-func
    (async function () {
      for await (const message of process
        ? process.data.messages()
        : stream.messages()) {
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
  }, [term, stream, process]);

  return (
    <div style={{ display: "flex" }}>
      <div ref={divRef} />
    </div>
  );
}

export const TerminalDocumentation: WidgetDocumentation<TerminalProps> = {
  description: "Output bytes in a terminal",
  props: {
    stream: "Stream of data to send to the terminal",
    rows: "Number of rows in the terminal",
    onData: "Input data handler",
    onResize: "Resize event handler",
    process:
      "A process object created by process_run_pty, exclusive with stream, onData and onResize",
  },
};
