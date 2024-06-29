import { Button, Link, Switch, View } from "../theme";

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
  return (
    <View layout="flex-row">
      <Button outline onClick={onFormat} text="Format" />
      <Button outline onClick={onApplyAndFormat} text="💾" />
      <Switch
        value={appDebugMode ?? false}
        onChange={setAppDebugMode}
        label="Debug"
      />
      <Link text="Show documentation" onClick={onShowDocumentation} url="#" />
    </View>
  );
}
