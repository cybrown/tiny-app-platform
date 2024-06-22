import { useCallback } from "react";
import { Button, Link, Switch } from "../theme";

export default function ToolBar({
  onFormat,
  onApplyAndFormat,
  onShowDocumentation,
  appDebugMode,
  setAppDebugMode,
}: {
  onFormat(): void;
  onApplyAndFormat(): void;
  onShowDocumentation(): void;
  appDebugMode: boolean;
  setAppDebugMode(debugModeEnabled: boolean): void;
}) {
  const onAppDebugModeChangeHandler = useCallback(
    (newValue: boolean) => {
      setAppDebugMode(newValue);
    },
    [setAppDebugMode]
  );

  return (
    <div style={{ display: "flex", gap: "4px" }}>
      <Button outline onClick={onFormat} text="Format" />
      <Button outline onClick={onApplyAndFormat} text="💾" />
      <Switch
        value={appDebugMode ?? false}
        onChange={onAppDebugModeChangeHandler}
        label="Debug"
      />
      <Link text="Show documentation" onClick={onShowDocumentation} url="#" />
    </div>
  );
}
