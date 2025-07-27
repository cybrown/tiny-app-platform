import { useState, useMemo } from "react";
import { AnyForSwitchCasesCompleteness } from "../util";

export type ErrorReportOverlayState = {
  visible: boolean;
};

export type ErrorReportOverlayAction =
  | {
      kind: "open";
    }
  | { kind: "close" };

export function errorReportOverlayReducer(
  state: ErrorReportOverlayState,
  action: ErrorReportOverlayAction
): ErrorReportOverlayState {
  switch (action.kind) {
    case "close":
      return { ...state, visible: false };
    case "open":
      return { ...state, visible: true };
    default: {
      const _: never = action;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      _;
      throw new Error(
        "Unknown kind: " + (action as AnyForSwitchCasesCompleteness).kind
      );
    }
  }
}

export type ErrorReportOverlayController = {
  state: ErrorReportOverlayState;
  open(): void;
  close(): void;
};

export function useErrorReportOverlayController(): ErrorReportOverlayController {
  const [state, setState] = useState({ visible: false });
  return useMemo(() => {
    return {
      state,
      open() {
        setState((state) => errorReportOverlayReducer(state, { kind: "open" }));
      },
      close() {
        setState((state) =>
          errorReportOverlayReducer(state, { kind: "close" })
        );
      },
    };
  }, [state]);
}
