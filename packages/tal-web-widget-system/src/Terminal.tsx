import {
  Closure,
  RuntimeContext,
  typeAny,
  typeFunction,
  typeKindedRecord,
  typeNull,
  typeNumber,
  typeRecord,
  typeString,
  typeUnion,
  WidgetDocumentation,
} from "tal-eval";
import { Terminal as XTermTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useEffect, useMemo, useRef } from "react";
import {
  MessageStream,
  ProcessPtyObject,
  SshConnectionObject,
} from "tal-stdlib";
import "@xterm/xterm/css/xterm.css";

export type TerminalProps = {
  ctx: RuntimeContext;
  stream: MessageStream;
  rows?: number;
  onData?: Closure;
  onResize?: Closure;
  process?: ProcessPtyObject;
  ssh?: SshConnectionObject;
};

const textEncoder = new TextEncoder();

export default function Terminal({
  ctx,
  stream,
  rows,
  onData,
  onResize,
  process,
  ssh,
}: TerminalProps) {
  const divRef = useRef<HTMLDivElement>(null);

  if (
    [ssh, process, onResize || onData || stream]
      .filter(Boolean)
      .reduce((a, b) => a + (b ? 1 : 0), 0) > 1
  ) {
    throw new Error(
      "Props process, (onResize, onData and stream) and ssh are exclusive"
    );
  }

  const term = useMemo<XTermTerminal>(
    () => {
      return new XTermTerminal({
        convertEol: true,
        ...(rows != null ? { rows } : {}),
      });
    },
    // Do not re-create the terminal when rows changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const fitApplied = useRef(false);

  useEffect(() => {
    if (!divRef.current) return;

    if (!fitApplied.current) {
      divRef.current.style.width = "100%";
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      fitAddon.fit();
      term.open(divRef.current);
      const observer = new ResizeObserver(() => {
        fitAddon.fit();
      });
      observer.observe(divRef.current);
      fitApplied.current = true;
    }

    const disposeOnData = term.onData((str) => {
      const asArrayBuffer = textEncoder.encode(str).buffer;
      if (onData) {
        ctx.callFunctionAsync(onData, [asArrayBuffer]);
      } else if (process) {
        process.send(asArrayBuffer);
      } else if (ssh) {
        ssh.write(asArrayBuffer);
      }
    });
    const disposeOnResize = term.onResize((size) => {
      if (onResize) {
        ctx.callFunctionAsync(onResize, [size]);
      } else if (process) {
        process.resize(size.cols, size.rows);
      } else if (ssh) {
        ssh.resize(size.cols, size.rows);
      }
    });

    return () => {
      disposeOnData.dispose();
      disposeOnResize.dispose();
    };
  }, [term, process, ssh, onResize, onData, stream]);

  useEffect(() => {
    if (!term) return;
    if (!stream && !process && !ssh) return;
    term.reset();
    let doCancel = false;
    // eslint-disable-next-line no-loop-func
    (async function () {
      for await (const message of process
        ? process.data.messages()
        : ssh
        ? ssh.stdout.messages()
        : stream.messages()) {
        if (doCancel) break;
        term.write(new Uint8Array(message));
      }
    })().catch((err) => {
      // TODO: Log an error and show a notification
      console.error(err);
    });
    return () => {
      doCancel = true;
    };
  }, [term, stream, process, ssh]);

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
      "A process object created by process_run_pty, exclusive with ssh, stream, onData and onResize",
    ssh: "An SSH connection object created by ssh_exec, exclusive with process, stream, onData and onResize",
  },
  type: typeFunction(
    [
      { name: "stream", type: typeAny() }, // TODO: Fix typeAny when opaque types are implemented for stream
      { name: "rows", type: typeUnion(typeNull(), typeNumber()) },
      {
        name: "onData",
        type: typeUnion(
          typeNull(),
          typeFunction([{ name: "data", type: typeString() }], [], typeAny())
        ),
      },
      {
        name: "onResize",
        type: typeUnion(
          typeNull(),
          typeFunction(
            [
              {
                name: "size",
                type: typeRecord({ cols: typeNumber(), rows: typeNumber() }),
              },
            ],
            [],
            typeAny()
          )
        ),
      },
      { name: "process", type: typeAny() }, // TODO: Fix typeAny when opaque types are implemented for process
      { name: "ssh", type: typeAny() }, // TODO: Fix typeAny when opaque types are implemented for ssh connection
    ],
    [],
    typeKindedRecord()
  ),
};
