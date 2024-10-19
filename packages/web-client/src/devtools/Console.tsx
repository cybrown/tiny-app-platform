import { PropsWithChildren, useCallback, useState } from "react";
import { RuntimeContext, EvaluationError } from "tal-eval";
import { LogItem } from "tal-eval/dist/RuntimeContext";
import {
  HttpLogItemData,
  MongoLogItemData,
  PgLogItemData,
  ProcessLogItemData,
  RedisLogItemData,
} from "tal-stdlib";
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
import { useForceRender } from "../utils";

type ConsoleTabProps = {
  ctx: RuntimeContext;
};

function isUnknownLogType(type: string): boolean {
  return (
    type !== "log" &&
    type !== "error" &&
    type !== "mongo" &&
    type !== "pg" &&
    type !== "http-request" &&
    type !== "process"
  );
}

export default function ConsoleTab({ ctx }: ConsoleTabProps) {
  const logs = ctx.logs;
  // TODO: Remove this when logs are immutable
  const forceRender = useForceRender();
  const [includeLogs, setIncludeLogs] = useState(true);
  const [includeBugs, setIncludeBugs] = useState(true);
  const [includeMongo, setIncludeMongo] = useState(true);
  const [includePg, setIncludePg] = useState(true);
  const [includeHttp, setIncludeHttp] = useState(true);
  const [includeRedis, setIncludeRedis] = useState(true);
  const [includeProcess, setIncludeProcess] = useState(true);
  const [includeUnknown, setIncludeUnknown] = useState(true);

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
        <CheckBox label="📜" value={includeLogs} onChange={setIncludeLogs} />
        <CheckBox label="🐞" value={includeBugs} onChange={setIncludeBugs} />
        <CheckBox label="🌱" value={includeMongo} onChange={setIncludeMongo} />
        <CheckBox label="🎲" value={includeRedis} onChange={setIncludeRedis} />
        <ViewChild flexGrow={1}> </ViewChild>
        <CheckBox
          label="❓"
          value={includeUnknown}
          onChange={setIncludeUnknown}
        />
        <Button outline text="Clear" onClick={clearConsoleHandler} />
      </View>
      <View layout="flex-row">
        <CheckBox label="🐘" value={includePg} onChange={setIncludePg} />
        <CheckBox
          label="🐚"
          value={includeProcess}
          onChange={setIncludeProcess}
        />
        <CheckBox label="🌐" value={includeHttp} onChange={setIncludeHttp} />
      </View>
      {logs
        .filter(
          (logItem) =>
            (logItem.type === "log" && includeLogs) ||
            (logItem.type === "error" && includeBugs) ||
            (logItem.type === "pg" && includePg) ||
            (logItem.type === "mongo" && includeMongo) ||
            (logItem.type === "http-request" && includeHttp) ||
            (logItem.type === "process" && includeProcess) ||
            (logItem.type === "redis" && includeRedis) ||
            (isUnknownLogType(logItem.type) && includeUnknown)
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
    case "log":
      return <RenderLogLogItem item={item as LogItem<unknown>} />;
    case "http-request":
      return <RenderHttpLogItem item={item as LogItem<HttpLogItemData>} />;
    case "mongo":
      return <RenderMongoLogItem item={item as LogItem<MongoLogItemData>} />;
    case "pg":
      return <RenderPgLogItem item={item as LogItem<PgLogItemData>} />;
    case "process":
      return (
        <RenderProcessLogItem item={item as LogItem<ProcessLogItemData>} />
      );
    case "redis":
      return <RenderRedisLogItem item={item as LogItem<RedisLogItemData>} />;
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
      <Text text="🐞" />
      <Button text="🔎" onClick={showDetailsHandler} outline />
      <Text
        text={
          (item.data instanceof EvaluationError
            ? item.data.detailedMessage
            : (item.data as any).message) ?? "<No error message>"
        }
        ellipsis
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

function RenderProcessLogItem({ item }: { item: LogItem<ProcessLogItemData> }) {
  const { command, args, stage, exitStatus, stdout } = item.data;

  const [isDetailsTabVisible, setDetailsTabVisible] = useState<boolean>(false);
  const showDetailsHandler = useCallback(() => setDetailsTabVisible(true), []);
  const hideDetailsHandler = useCallback(() => setDetailsTabVisible(false), []);

  return (
    <>
      <Text text="🐚" />
      <Button text="🔎" onClick={showDetailsHandler} outline />
      {stage === "fulfilled" ? (
        <Text
          text={exitStatus + ""}
          color={exitStatus === "0" ? "green" : "#AF9510"}
          weight="bold"
        />
      ) : stage === "rejected" ? (
        <Text text="KO" color="red" weight="bold" />
      ) : stage === "timeout" ? (
        <Text text="TIMEOUT" color="red" weight="bold" />
      ) : (
        <Loader size="md" />
      )}
      <Text text={command} />
      {(args ?? []).map((arg, index) => (
        <Text key={index} text={arg} />
      ))}
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
            <Button
              text="Copy command"
              outline
              onClick={() =>
                navigator.clipboard.writeText(
                  [
                    command,
                    ...(args ?? []).map((arg) => `'${escapeShellQuote(arg)}'`),
                  ].join(" ")
                )
              }
            />
            <View layout="flex-row">
              <Text text="Command:" />
              <Text text={command} />
            </View>
            <View layout="flex-row">
              <Text text="Args:" />
              {(args ?? []).map((arg, index) => (
                <Text key={index} text={arg} />
              ))}
            </View>
            <View layout="flex-row">
              <Text text="Stage:" />
              <Text text={stage} />
            </View>
            <View layout="flex-row">
              <Text text="Exit status:" />
              <Text text={exitStatus ? exitStatus : "N/A"} />
            </View>
            {stdout ? (
              <>
                <Text text="Stdout" size={1.1} />
                <Text preformatted text={bytesToString(stdout)} />
              </>
            ) : null}
          </WindowFrame>
        </LowLevelOverlay>
      ) : null}
    </>
  );
}

function RenderLogLogItem({ item }: { item: LogItem<unknown> }) {
  const [isDetailsVisible, setDetailsVisible] = useState<boolean>(false);
  const showDetailsHandler = useCallback(() => setDetailsVisible(true), []);
  const hideDetailsHandler = useCallback(() => setDetailsVisible(false), []);

  const copyAsString = useCallback(() => {
    try {
      navigator.clipboard.writeText(String(item.data));
    } catch (err) {
      console.error(err);
    }
  }, [item.data]);

  const copyAsJSON = useCallback(() => {
    try {
      navigator.clipboard.writeText(JSON.stringify(item.data));
    } catch (err) {
      console.error(err);
    }
  }, [item.data]);

  return (
    <>
      <Text text="📜" />
      <Button text="🔎" onClick={showDetailsHandler} outline />
      <Text
        text={
          item.data === null
            ? "null"
            : item.data === undefined
            ? "undefined"
            : typeof item.data == "object"
            ? "{" + Object.keys(item.data).join(", ") + "}"
            : String(item.data)
        }
      />
      {isDetailsVisible ? (
        <LowLevelOverlay
          onClose={hideDetailsHandler}
          modal
          position="right"
          size="l"
        >
          <WindowFrame
            modal
            position="right"
            title="Log details"
            onClose={hideDetailsHandler}
          >
            <View layout="flex-row">
              <Button text="Copy as String" onClick={copyAsString} outline />
              <Button text="Copy as JSON" onClick={copyAsJSON} outline />
            </View>
            <Text text={new Date(item.timestamp).toISOString()} />
            <Debug value={item.data} extend={2} />
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
                { label: "Response Text", value: "response-body" },
                { label: "Response JSON", value: "response-body-json" },
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
                {typeof item.data.request.body === "string" ? (
                  <TryDebugJson str={item.data.request.body}>
                    <Text preformatted text={item.data.request.body} />
                  </TryDebugJson>
                ) : typeof item.data.request.body === "object" ? (
                  <Debug value={item.data.request.body} extend={2} />
                ) : (
                  <Text text="Failed to show request body, only strings and json objects are supported" />
                )}
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
            ) : detailsTabToShow === "response-body-json" ? (
              item.data.response ? (
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
                  <TryDebugJson bytes={item?.data.response?.body}>
                    <Text text="Invalid JSON" color="red" />
                  </TryDebugJson>
                </>
              ) : (
                <Loader />
              )
            ) : null}
          </WindowFrame>
        </LowLevelOverlay>
      ) : null}
    </>
  );
}

function TryDebugJson({
  bytes,
  str,
  children,
}: ({ bytes: any; str?: undefined } | { bytes?: undefined; str: string }) &
  PropsWithChildren) {
  try {
    if (bytes) {
      return <Debug value={JSON.parse(bytesToString(bytes))} extend={1} />;
    }
    if (str) {
      return <Debug value={JSON.parse(str)} extend={1} />;
    }
    return <>{children ?? null}</>;
  } catch (e) {
    return <>{children ?? null}</>;
  }
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

function RenderRedisLogItem({ item }: { item: LogItem<RedisLogItemData> }) {
  const [detailsTabToShow, setDetailsTabToShow] = useState<
    null | "command" | "result" | "result-json"
  >(null);
  const showDetailsHandler = useCallback(
    () => setDetailsTabToShow("command"),
    []
  );
  const hideDetailsHandler = useCallback(() => setDetailsTabToShow(null), []);

  const copyAsRedisCli = useCallback(() => {
    const command = item.data as RedisLogItemData;
    navigator.clipboard.writeText(commandToRedisCli(command));
  }, [item.data]);

  const copyUrl = useCallback(() => {
    const request = item.data as RedisLogItemData;
    navigator.clipboard.writeText(request.url);
  }, [item.data]);

  return (
    <>
      <Text text="🎲" />
      <Button text="🔎" onClick={showDetailsHandler} outline />
      <RedisCommandSummary data={item.data} />
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
            title="Command details"
            onClose={hideDetailsHandler}
          >
            <View layout="flex-row">
              <RedisCommandSummary data={item.data} />
            </View>
            <View layout="flex-row">
              <Button text="Copy URL" onClick={copyUrl} outline />
              <Button
                text="Copy as redis-cli"
                onClick={copyAsRedisCli}
                outline
              />
            </View>
            <Tabs
              value={detailsTabToShow}
              onChange={(newValue) => setDetailsTabToShow(newValue as any)}
              tabs={[
                { label: "Command", value: "command" },
                { label: "Result", value: "result" },
                { label: "Result JSON", value: "result-json" },
              ]}
            />
            {detailsTabToShow === "command" ? (
              <>
                <Text text={item.data.url} />
                {item.data.insecure ? <Text text="⚠️ Insecure" /> : null}
                <Text text={item.data.command.toUpperCase()} weight="bold" />
                {item.data.args.map((arg, index) => (
                  <Text text={arg} key={index} />
                ))}
              </>
            ) : detailsTabToShow === "result" ? (
              <>
                {item.data.result ? (
                  <>
                    <Button
                      text="Copy"
                      outline
                      onClick={() =>
                        navigator.clipboard.writeText(
                          bytesToString(item?.data.result)
                        )
                      }
                    />
                    <Text preformatted text={bytesToString(item.data.result)} />
                  </>
                ) : (
                  <Loader />
                )}
              </>
            ) : detailsTabToShow === "result-json" ? (
              item.data.result ? (
                <>
                  <Button
                    text="Copy"
                    outline
                    onClick={() =>
                      navigator.clipboard.writeText(
                        bytesToString(item?.data.result)
                      )
                    }
                  />
                  <TryDebugJson bytes={item?.data.result}>
                    <Text text="Invalid JSON" color="red" />
                  </TryDebugJson>
                </>
              ) : (
                <Loader />
              )
            ) : null}
          </WindowFrame>
        </LowLevelOverlay>
      ) : null}
    </>
  );
}

function RedisCommandSummary({ data }: { data: RedisLogItemData }) {
  return (
    <>
      {data.result && data.stage === "fulfilled" ? (
        <Text text="OK" weight="bold" color="green" />
      ) : data.stage === "rejected" ? (
        <Text text="KO" weight="bold" color="red" />
      ) : (
        <Loader size="md" />
      )}
      <Text weight="bold" text={data.command.toUpperCase()} />
      <Text text={data.args.join(" ")} ellipsis />
    </>
  );
}

function bytesToString(bytes: ArrayBuffer): string {
  return new TextDecoder().decode(bytes);
}

function escapeShellQuote(str: string): string {
  return str.replaceAll("'", "'\\''");
}

function commandToRedisCli(command: RedisLogItemData): string {
  return [
    "redis-cli",
    `-u '${escapeShellQuote(command.url)}'`,
    ...(command.insecure ? ["--insecure"] : []),
    command.command,
    ...command.args.map((arg) => `'${escapeShellQuote(arg)}'`),
  ].join(" ");
}
