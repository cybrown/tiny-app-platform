import { useCallback } from "react";
import { Button, Switch, Text } from "../theme";

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
    (newValue: boolean) => {
      setAppDebugMode(newValue);
    },
    [setAppDebugMode]
  );

  return (
    <div>
      <div style={{ display: "flex" }}>
        <Button onClick={onApply} text="Apply" />
        <Button onClick={onFormat} text="Format" />
        <Button onClick={onApplyAndFormat} text="Apply & format" />
        <Button
          onClick={onSaveAndFormatAndClose}
          text="Save & format & Close"
        />
        <Button onClick={onClose} text="Close" />
        <Button onClick={onShowDocumentation} text="Reference documentation" />
        <Switch
          value={appDebugMode ?? false}
          onChange={onAppDebugModeChangeHandler}
        />
        <Text text="Debug" />
      </div>
    </div>
  );
}
