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
import { HttpLogItemData, MongoLogItemData } from "tal-stdlib";
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
              preformatted
              text={new Date(logItem.timestamp).toISOString().slice(11, 23)}
            />
            <RenderLogItem item={logItem} />
          </View>
        ))
        .reverse()}
    </View>
  );
}

function RenderLogItem({ item }: { item: LogItem<unknown> }) {
  switch (item.type) {
    case "http-request":
      return <RenderHttpLogItem item={item as LogItem<HttpLogItemData>} />;
    case "mongo":
      return <RenderMongoLogItem item={item as LogItem<MongoLogItemData>} />;
  }
  return <Debug force value={item} />;
}

function RenderMongoLogItem({ item }: { item: LogItem<MongoLogItemData> }) {
  const { query, stage, result } = item.data;

  const [detailsTabToShow, setDetailsTabToShow] = useState<
    null | "query" | "result"
  >(null);
  const showDetailsHandler = useCallback(
    () => setDetailsTabToShow("query"),
    []
  );
  const hideDetailsHandler = useCallback(() => setDetailsTabToShow(null), []);

  return (
    <>
      <Text text="🌱" />
      <Button text="🔎" onClick={showDetailsHandler} outline />
      {stage === "fulfilled" ? (
        <Text text="OK" color="green" weight="bold" />
      ) : stage === "rejected" ? (
        <Text text="KO" color="red" weight="bold" />
      ) : (
        <Loader size="md" />
      )}
      <Text text={query.operation.toUpperCase()} weight="bold" />
      <Text text={query.collection} />
      {query.operation === "find" ||
      query.operation === "delete-one" ||
      query.operation === "update-one" ? (
        <Text text={JSON.stringify(query.query)} ellipsis />
      ) : null}
      <Text text={JSON.stringify(query.data)} ellipsis />
      {detailsTabToShow ? (
        <LowLevelOverlay
          onClose={hideDetailsHandler}
          modal
          position="right"
          size="l"
        >
          <WindowFrame
            modal
            position="right"
            title="Query details"
            onClose={hideDetailsHandler}
          >
            <View layout="flex-row">
              <Text text="URL:" />
              <Text text={query.uri} />
            </View>
            <View layout="flex-row">
              <Text text="Operation:" />
              <Text text={query.operation} />
            </View>
            <View layout="flex-row">
              <Text text="Collection:" />
              <Text text={query.collection} />
            </View>
            <Tabs
              value={detailsTabToShow}
              onChange={(newValue) => setDetailsTabToShow(newValue as any)}
              tabs={[
                { label: "Query", value: "query" },
                { label: "Result", value: "result" },
              ]}
            />
            {detailsTabToShow === "query" ? (
              <>
                <Text text="Query" size={1.1} />
                <Debug force value={query.query} extend={2} />
                <Text text="Data" size={1.1} />
                <Debug force value={query.data} extend={2} />
              </>
            ) : detailsTabToShow === "result" ? (
              <>
                <Text text="Result" size={1.1} />
                <Debug force value={result} extend={2} />
              </>
            ) : null}
          </WindowFrame>
        </LowLevelOverlay>
      ) : null}
    </>
  );
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

  const copyUrl = useCallback(() => {
    const request = (item.data as HttpLogItemData).request;
    navigator.clipboard.writeText(request.url);
  }, [item.data]);

  return (
    <>
      <Text text="🌐" />
      <Button text="🔎" onClick={showDetailsHandler} outline />
      <HttpRequestSummary data={item.data} />
      {detailsTabToShow ? (
        <LowLevelOverlay
          onClose={hideDetailsHandler}
          modal
          position="right"
          size="l"
        >
          <WindowFrame
            modal
            position="right"
            title="Request details"
            onClose={hideDetailsHandler}
          >
            <View layout="flex-row">
              <HttpRequestSummary data={item.data} />
            </View>
            <View layout="flex-row">
              <Button text="Copy URL" onClick={copyUrl} outline />
              <Button text="Copy as cURL" onClick={copyAsCurl} outline />
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
    </>
  );
}

function HttpRequestSummary({ data }: { data: HttpLogItemData }) {
  return (
    <>
      {data.response && data.stage === "fulfilled" ? (
        <Text
          text={data.response?.status + ""}
          weight="bold"
          color={statusToColor(data.response?.status)}
        />
      ) : data.stage === "rejected" ? (
        <Text text="KO" weight="bold" color="red" />
      ) : (
        <Loader size="md" />
      )}
      <Text weight="bold" text={data.request.method.toUpperCase()} />
      <Text text={data.request.url} ellipsis />
    </>
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
        method ? `-X '${method.replaceAll("'", "'\\''").toUpperCase()}'` : null,
        url ? `'${escapeShellQuote(url)}'` : null,
      ]
        .filter(Boolean)
        .join(" "),
      ...(request.headers && request.headers.length
        ? request.headers.map(
            ([name, value]) =>
              `-H '${escapeShellQuote(name)}: ${escapeShellQuote(value)}'`
          )
        : []),
      body
        ? `-d '${escapeShellQuote(
            typeof body === "string" ? body : JSON.stringify(body)
          )}'`
        : null,
    ]
      .filter(Boolean)
      .join(" \\\n     ")
  );
}

function escapeShellQuote(str: string): string {
  return str.replaceAll("'", "'\\''");
}
