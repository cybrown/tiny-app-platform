import { RuntimeContext } from "tal-eval";
import { APP_DEBUG_MODE_ENV } from "../constants";
import {
  Button,
  Loader,
  Select,
  Table,
  Tabs,
  Text,
  Theme,
  View,
  WindowFrame,
} from "../theme";
import { EditorApi, Editor } from "./Editor";
import ToolBar from "./Toolbar";
import { useCallback, useState } from "react";
import Debug from "../widgets/Debug";
import { LogItem } from "tal-eval/dist/RuntimeContext";
import { HttpLogItemData } from "tal-stdlib";
import LowLevelOverlay from "../widgets/internal/LowLevelOverlay";

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
      />
      {currentTab === "source" ? (
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
      ) : currentTab === "console" ? (
        <ConsoleTab ctx={ctx} />
      ) : null}
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

type ConsoleTabProps = {
  ctx: RuntimeContext;
};

function ConsoleTab({ ctx }: ConsoleTabProps) {
  const logs = ctx.logs;
  if (!logs.length) {
    return <Text text="No logs to show yet" align="center" />;
  }
  return (
    <View>
      {logs
        .map((logItem) => (
          <View key={logItem.id} layout="flex-row">
            <Text
              weight="light"
              text={
                new Date(logItem.timestamp).toISOString().slice(11, 16) +
                " " +
                logItem.type
              }
            />
            <RenderLogItem item={logItem} />
          </View>
        ))
        .reverse()}
    </View>
  );
}

function RenderLogItem({ item }: { item: LogItem<unknown> }) {
  if (item.type === "http-request") {
    return <RenderHttpLogItem item={item as LogItem<HttpLogItemData>} />;
  }
  return <Debug force value={item} />;
}

function RenderHttpLogItem({ item }: { item: LogItem<HttpLogItemData> }) {
  const [detailsTabToShow, setDetailsTabToShow] = useState<
    null | "request" | "response" | "response-body"
  >(null);
  const showDetailsHandler = useCallback(
    () => setDetailsTabToShow("request"),
    []
  );
  const hideDetailsHandler = useCallback(() => setDetailsTabToShow(null), []);
  const copyAsCurl = useCallback(() => {
    const request = (item.data as HttpLogItemData).request;
    navigator.clipboard.writeText(requestToCurl(request));
  }, [item.data]);

  return (
    <View layout="flex-row">
      <Text
        text={(item.data as any).response?.status}
        weight="bold"
        color={statusToColor((item.data as any).response?.status?.toString())}
      />
      <Text weight="bold" text={(item.data as any).request.method} />
      <Text text={(item.data as any).request.url} />
      <Button text="Show details" onClick={showDetailsHandler} outline />
      <Button text="Copy as cURL" onClick={copyAsCurl} outline />
      {detailsTabToShow ? (
        <LowLevelOverlay onClose={hideDetailsHandler} modal position="right">
          <WindowFrame
            modal
            position="right"
            title="Request details"
            onClose={hideDetailsHandler}
          >
            <View layout="flex-row">
              {item.data.response ? (
                <Text text={item.data.response.status + ""} />
              ) : (
                <Loader size="sm" />
              )}
              <Text text={item.data.request.method} />
              <Text text={item.data.request.url} />
            </View>
            <Tabs
              value={detailsTabToShow}
              onChange={(newValue) => setDetailsTabToShow(newValue as any)}
              tabs={[
                { label: "Request", value: "request" },
                { label: "Response", value: "response" },
                { label: "Response body", value: "response-body" },
              ]}
            />
            {detailsTabToShow === "request" ? (
              <>
                {item.data.request.headers &&
                item.data.request.headers.length > 0 ? (
                  <Table
                    titles={[{ text: "Key" }, { text: "Value" }]}
                    rows={item.data.request.headers.map((entry) => ({
                      key: entry[0],
                      cells: [
                        { content: <Text text={entry[0]} /> },
                        { content: <Text wrap text={entry[1]} /> },
                      ],
                    }))}
                  />
                ) : (
                  <Text text="No headers" />
                )}
                <Text text="Body" size={1.1} />
                <Text preformatted text={item.data.request.body} />
              </>
            ) : detailsTabToShow === "response" ? (
              <>
                {item.data.response ? (
                  Object.keys(item.data.response.headers).length === 0 ? (
                    <Text text="No headers" />
                  ) : (
                    <Table
                      titles={[{ text: "Key" }, { text: "Value" }]}
                      rows={Object.entries(item.data.response.headers).map(
                        (entry) => ({
                          key: entry[0],
                          cells: [
                            { content: <Text text={entry[0]} /> },
                            { content: <Text wrap text={entry[1]} /> },
                          ],
                        })
                      )}
                    />
                  )
                ) : (
                  <Loader />
                )}
              </>
            ) : detailsTabToShow === "response-body" ? (
              <>
                {item.data.response ? (
                  <>
                    <Button
                      text="Copy"
                      outline
                      onClick={() =>
                        navigator.clipboard.writeText(
                          bytesToString(item?.data.response?.body)
                        )
                      }
                    />
                    <Text
                      preformatted
                      text={bytesToString(item.data.response.body)}
                    />
                  </>
                ) : (
                  <Loader />
                )}
              </>
            ) : null}
          </WindowFrame>
        </LowLevelOverlay>
      ) : null}
    </View>
  );
}

function bytesToString(bytes: ArrayBuffer): string {
  return new TextDecoder().decode(bytes);
}

function statusToColor(status: number): string | undefined {
  if (status == null) {
    return undefined;
  }
  if (status < 400) {
    return "green";
  } else if (status < 500) {
    return "#AF9510";
  } else {
    return "#DD0000";
  }
}

function requestToCurl(request: HttpLogItemData["request"]): string {
  const { method, url, body } = request;
  return (
    "curl " +
    [
      [
        method ? `-X '${method.replaceAll("'", "'\\''")}'` : null,
        url ? `'${escapeShellQuote(url)}'` : null,
      ]
        .filter(Boolean)
        .join(" "),
      ...(request.headers.length
        ? request.headers.map(
            ([name, value]) =>
              `-H '${escapeShellQuote(name)}: ${value.replaceAll(
                "'",
                "'\\''"
              )}'`
          )
        : []),
      body ? `-d '${escapeShellQuote(body)}'` : null,
    ]
      .filter(Boolean)
      .join(" \\\n     ")
  );
}

function escapeShellQuote(str: string): string {
  return str.replaceAll("'", "'\\''");
}
