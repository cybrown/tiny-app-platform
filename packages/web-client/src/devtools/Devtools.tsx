import { RuntimeContext } from "tal-eval";
import { Select, Switch, Tabs, Theme, View } from "../theme";
import { EditorApi } from "./Editor";
import { useState } from "react";
import SourceTab from "./SourceTab";
import ConsoleTab from "./Console";
import { APP_DEBUG_MODE_ENV } from "../runtime/constants";

type DevtoolsProps = {
  ctx: RuntimeContext;
  theme: Theme;
  themes: Theme[];
  updateSourceFunc: React.MutableRefObject<(() => string) | null>;
  setEditorApi(api: EditorApi): void;
  onFormatHandler(): void;
  onApplyAndFormatHandler(): void;
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
  onDebugModeChange,
  onApplyTheme: applyTheme,
  setEditorApi,
  onApplyAndFormatWithSourceHandler,
  onCloseHandler,
}: DevtoolsProps) {
  const [currentTab, setCurrentTab] = useState("source");

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
      <Tabs
        tabs={[
          { label: "Source", value: "source" },
          { label: "Console", value: "console" },
        ]}
        value={currentTab}
        onChange={setCurrentTab}
        after={
          <Switch
            value={
              (ctx.getLocalOr(APP_DEBUG_MODE_ENV, false) as boolean) ?? false
            }
            onChange={onDebugModeChange}
            label="Debug"
          />
        }
      />

      {/* Avoid unloading SourceTab component to keep the editor state in memory even in other tabs */}
      <SourceTab
        ctx={ctx}
        onFormatHandler={onFormatHandler}
        onApplyAndFormatHandler={onApplyAndFormatHandler}
        updateSourceFunc={updateSourceFunc}
        setEditorApi={setEditorApi}
        onApplyAndFormatWithSourceHandler={onApplyAndFormatWithSourceHandler}
        onCloseHandler={onCloseHandler}
        hidden={currentTab !== "source"}
      />

      {currentTab === "console" ? <ConsoleTab ctx={ctx} /> : null}
    </View>
  );
}
