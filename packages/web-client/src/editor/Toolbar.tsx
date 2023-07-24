import { useCallback, ChangeEvent, useMemo } from "react";

export default function ToolBar({
  onApply,
  onFormat,
  onApplyAndFormat,
  onClose,
  onSaveAndFormatAndClose,
  onShowDocumentation,
  appDebugMode,
  setAppDebugMode,
}: {
  onApply(): void;
  onFormat(): void;
  onApplyAndFormat(): void;
  onSaveAndFormatAndClose(): void;
  onClose(): void;
  onShowDocumentation(): void;
  appDebugMode: boolean;
  setAppDebugMode(debugModeEnabled: boolean): void;
}) {
  const onAppDebugModeChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAppDebugMode(e.target.checked);
    },
    [setAppDebugMode]
  );

  const inputDebugId = useMemo(() => Math.random().toString(), []);

  return (
    <div>
      <button onClick={onApply}>Apply</button>
      <button onClick={onFormat}>Format</button>
      <button onClick={onApplyAndFormat}>Apply & format</button>
      <button onClick={onSaveAndFormatAndClose}>Save & format & Close</button>
      <button onClick={onClose}>Close</button>
      <button onClick={onShowDocumentation}>Reference documentation</button>
      <input
        type="checkbox"
        id={inputDebugId}
        checked={appDebugMode ?? false}
        onChange={onAppDebugModeChangeHandler}
      ></input>
      <label htmlFor={inputDebugId}>Debug</label>
    </div>
  );
}
