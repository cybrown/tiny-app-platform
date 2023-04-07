import { customRpc } from "../runtime/custom-rpc";
import { defineFunction } from "tal-eval";

let sourcePathDirname: string | null = null;
try {
  sourcePathDirname = (window as any).electronAPI.config().sourcePathDirname;
} catch (err) {
  console.log("failed to initialize config event for sourcePathDirname");
}

export const process_exec = defineFunction(
  "process_exec",
  [{ name: "name" }, { name: "args" }, { name: "timeout" }],
  undefined,
  async (ctx, { name, args, timeout }) => {
    const result = await customRpc(
      "exec-process",
      JSON.stringify({
        fileName: name,
        args,
        cwd: sourcePathDirname,
        timeout,
      }),
      []
    );
    return result.arrayBuffer();
  }
);
