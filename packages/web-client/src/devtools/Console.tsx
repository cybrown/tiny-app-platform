import { useCallback, useState } from "react";
import { RuntimeContext, EvaluationError } from "tal-eval";
import { LogItem } from "tal-eval/dist/RuntimeContext";
import { HttpLogItemData, MongoLogItemData, PgLogItemData } from "tal-stdlib";
import {
  View,
  Button,
  Loader,
  WindowFrame,
  Tabs,
  Table,
  Text,
  CheckBox,
} from "../theme";
import Debug from "../widgets/Debug";
import ViewChild from "../widgets/ViewChild";
import LowLevelOverlay from "../widgets/internal/LowLevelOverlay";

type ConsoleTabProps = {
  ctx: RuntimeContext;
};

// TODO: Remove this when logs are immutable
function useForceRender() {
  const [, set] = useState({});
  return useCallback(() => set({}), []);
}

export default function ConsoleTab({ ctx }: ConsoleTabProps) {
  const logs = ctx.logs;
  const forceRender = useForceRender();
  const [includeBugs, setIncludeBugs] = useState(true);
  const [includeMongo, setIncludeMongo] = useState(true);
  const [includePg, setIncludePg] = useState(true);
  const [includeHttp, setIncludeHttp] = useState(true);

  const clearConsoleHandler = useCallback(() => {
    ctx.clearLogs();
    forceRender();
  }, [ctx, forceRender]);

  if (!logs.length) {
    return <Text text="No logs to show yet" align="center" />;
  }
  return (
    <View>
      <View layout="flex-row">
        <CheckBox label="🪲" value={includeBugs} onChange={setIncludeBugs} />
        <CheckBox label="🌱" value={includeMongo} onChange={setIncludeMongo} />
        <CheckBox label="🐘" value={includePg} onChange={setIncludePg} />
        <CheckBox label="🌐" value={includeHttp} onChange={setIncludeHttp} />
        <ViewChild flexGrow={1}> </ViewChild>
        <Button outline text="Clear" onClick={clearConsoleHandler} />
      </View>
      {logs
        .filter(
          (logItem) =>
            (logItem.type === "error" && includeBugs) ||
            (logItem.type === "pg" && includePg) ||
            (logItem.type === "mongo" && includeMongo) ||
            (logItem.type === "http-request" && includeHttp)
        )
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
    case "pg":
      return <RenderPgLogItem item={item as LogItem<PgLogItemData>} />;
    case "error":
      return <RenderErrorLogItem item={item} />;
  }
  return <Debug force value={item} />;
}

function RenderErrorLogItem({ item }: { item: LogItem<unknown> }) {
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const showDetailsHandler = useCallback(() => setShowDetails(true), []);
  const hideDetailsHandler = useCallback(() => setShowDetails(false), []);

  return (
    <>
      <Text text="🪲" />
      <Button text="🔎" onClick={showDetailsHandler} outline />
      <Text
        text={
          item.data instanceof EvaluationError
            ? item.data.detailedMessage
            : (item as any).message ?? "<No error message>"
        }
      />
      {showDetails ? (
        <LowLevelOverlay
          onClose={hideDetailsHandler}
          modal
          position="right"
          size="l"
        >
          <WindowFrame
            modal
            position="right"
            title="Error details"
            onClose={hideDetailsHandler}
          >
            <Debug force value={item.data} extend={3} />
          </WindowFrame>
        </LowLevelOverlay>
      ) : null}
    </>
  );
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

function RenderPgLogItem({ item }: { item: LogItem<PgLogItemData> }) {
  const { uri, query, stage, params, result } = item.data;

  const [isDetailsTabVisible, setDetailsTabVisible] = useState<boolean>(false);
  const showDetailsHandler = useCallback(() => setDetailsTabVisible(true), []);
  const hideDetailsHandler = useCallback(() => setDetailsTabVisible(false), []);

  return (
    <>
      <Text text="🐘" />
      <Button text="🔎" onClick={showDetailsHandler} outline />
      {stage === "fulfilled" ? (
        <Text text="OK" color="green" weight="bold" />
      ) : stage === "rejected" ? (
        <Text text="KO" color="red" weight="bold" />
      ) : (
        <Loader size="md" />
      )}
      <Text text={query} ellipsis />
      {isDetailsTabVisible ? (
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
              <Text text="URI:" />
              <Text text={uri} />
            </View>
            <View layout="flex-row">
              <Text text="Query:" />
              <Text text={query} />
            </View>
            <View layout="flex-row">
              <Text text="Params:" />
              <Text text={JSON.stringify(params)} />
            </View>
            <Text text="Result" size={1.1} />
            <Debug force value={result} extend={3} />
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
