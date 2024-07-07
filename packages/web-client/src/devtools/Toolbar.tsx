import { Button, View } from "../theme";

export default function ToolBar({
  onFormat,
  onApplyAndFormat,
  onShowDocumentation,
  onRedo,
  onUndo,
  onConvertToSecret,
}: {
  onUndo(): void;
  onRedo(): void;
  onFormat(): void;
  onApplyAndFormat(): void;
  onShowDocumentation(): void;
  onConvertToSecret(): void;
}) {
  return (
    <View layout="flex-row">
      <Button outline onClick={onUndo} text="↩️" />
      <Button outline onClick={onRedo} text="↪️" />
      <Button outline onClick={onFormat} text="🧹" />
      <Button outline onClick={onApplyAndFormat} text="💾" />
      <Button outline onClick={onShowDocumentation} text="📘" />
      <Button outline onClick={onConvertToSecret} text="🔑" />
    </View>
  );
}
