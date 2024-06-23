import { RuntimeContext } from "tal-eval";
import { APP_DEBUG_MODE_ENV } from "../constants";
import { Select, Theme, View } from "../theme";
import { EditorApi, Editor } from "./Editor";
import ToolBar from "./Toolbar";

type DevtoolsProps = {
  ctx: RuntimeContext;
  theme: Theme;
  themes: Theme[];
  updateSourceFunc: React.MutableRefObject<(() => string) | null>;
  setEditorApi(api: EditorApi): void;
  onFormatHandler(): void;
  onApplyAndFormatHandler(): void;
  onToggleShowDocumentation(): void;
  onDebugModeChange(mode: boolean): void;
  onApplyTheme(newTheme: Theme): void;
  onApplyAndFormatWithSourceHandler(source: string): void;
  onCloseHandler(): void;
};

export default function Devtools({
  ctx,
  themes,
  theme,
  updateSourceFunc,
  onFormatHandler,
  onApplyAndFormatHandler,
  onToggleShowDocumentation,
  onDebugModeChange,
  onApplyTheme: applyTheme,
  setEditorApi,
  onApplyAndFormatWithSourceHandler,
  onCloseHandler,
}: DevtoolsProps) {
  return (
    <View>
      <Select
        options={themes.map((theme) => ({
          label: theme.name,
          value: theme.id,
        }))}
        value={theme.id}
        onChange={(newIndex) => applyTheme(themes[newIndex])}
      />
      <SourceTab
        ctx={ctx}
        onFormatHandler={onFormatHandler}
        onApplyAndFormatHandler={onApplyAndFormatHandler}
        onToggleShowDocumentation={onToggleShowDocumentation}
        onDebugModeChange={onDebugModeChange}
        updateSourceFunc={updateSourceFunc}
        setEditorApi={setEditorApi}
        onApplyAndFormatWithSourceHandler={onApplyAndFormatWithSourceHandler}
        onCloseHandler={onCloseHandler}
      />
    </View>
  );
}

type SourceTabProps = {
  ctx: RuntimeContext;
  updateSourceFunc: React.MutableRefObject<(() => string) | null>;
  setEditorApi(api: EditorApi): void;
  onFormatHandler(): void;
  onApplyAndFormatHandler(): void;
  onToggleShowDocumentation(): void;
  onDebugModeChange(mode: boolean): void;
  onApplyAndFormatWithSourceHandler(source: string): void;
  onCloseHandler(): void;
};

function SourceTab({
  ctx,
  onFormatHandler,
  onApplyAndFormatHandler,
  onToggleShowDocumentation,
  onDebugModeChange,
  updateSourceFunc,
  setEditorApi,
  onApplyAndFormatWithSourceHandler,
  onCloseHandler,
}: SourceTabProps) {
  return (
    <>
      <ToolBar
        onFormat={onFormatHandler}
        onApplyAndFormat={onApplyAndFormatHandler}
        onShowDocumentation={onToggleShowDocumentation}
        appDebugMode={ctx.getLocalOr(APP_DEBUG_MODE_ENV, false) as boolean}
        setAppDebugMode={onDebugModeChange}
      />
      <Editor
        grabSetSource={(a) => (updateSourceFunc.current = a())}
        onApiReady={setEditorApi}
        onSaveAndFormat={onApplyAndFormatWithSourceHandler}
        onCloseEditor={onCloseHandler}
      />
    </>
  );
}
