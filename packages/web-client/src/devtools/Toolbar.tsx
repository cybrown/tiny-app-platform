import { Button, View } from "../theme";

export default function ToolBar({
  onFormat,
  onApplyAndFormat,
  onShowDocumentation,
  onRedo,
  onUndo,
}: {
  onUndo(): void;
  onRedo(): void;
  onFormat(): void;
  onApplyAndFormat(): void;
  onShowDocumentation(): void;
}) {
  return (
    <View layout="flex-row">
      <Button outline onClick={onUndo} text="↩️" />
      <Button outline onClick={onRedo} text="↪️" />
      <Button outline onClick={onFormat} text="🧹" />
      <Button outline onClick={onApplyAndFormat} text="💾" />
      <Button outline onClick={onShowDocumentation} text="📘" />
    </View>
  );
}
