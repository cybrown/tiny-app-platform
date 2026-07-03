import { Button, View } from "tal-web-theme-api";

export default function ToolBar({
  onFormat,
  onApplyAndFormat,
  onShowDocumentation,
  onRedo,
  onUndo,
  onExtendSelection,
  onWrapSelection,
  onShowTypeCheck,
  onCheckTypeErrors,
}: {
  onUndo(): void;
  onRedo(): void;
  onFormat(): void;
  onApplyAndFormat(): void;
  onShowDocumentation(): void;
  onExtendSelection(): void;
  onWrapSelection(): void;
  onShowTypeCheck(): void;
  onCheckTypeErrors(): void;
}) {
  return (
    <View layout="flex-row">
      <Button outline onClick={onApplyAndFormat} text="💾" />
      <Button outline onClick={onUndo} text="↩️" />
      <Button outline onClick={onRedo} text="↪️" />
      <Button outline onClick={onFormat} text="🧹" />
      <Button outline onClick={onExtendSelection} text="↔️" />
      <Button outline onClick={onWrapSelection} text="🌯" />
      <Button outline onClick={onShowDocumentation} text="📘" />
      <Button outline onClick={onShowTypeCheck} text="🔍" />
      <Button outline onClick={onCheckTypeErrors} text="⚙️" />
    </View>
  );
}
