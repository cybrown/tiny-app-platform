import { useCallback } from "react";
import { Button, Switch, Text } from "../theme";

export default function ToolBar({
  onFormat,
  onApplyAndFormat,
  onClose,
  onShowDocumentation,
  appDebugMode,
  setAppDebugMode,
}: {
  onFormat(): void;
  onApplyAndFormat(): void;
  onClose(): void;
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
    <div>
      <div style={{ display: "flex" }}>
        <Button onClick={onFormat} text="Format" />
        <Button onClick={onApplyAndFormat} text="Save" />
        <Button onClick={onClose} text="Close" />
        <Button onClick={onShowDocumentation} text="Docs" />
        <Switch
          value={appDebugMode ?? false}
          onChange={onAppDebugModeChangeHandler}
        />
        <Text text="Debug" />
      </div>
    </div>
  );
}
