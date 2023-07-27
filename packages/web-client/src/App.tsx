import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./App.module.css";
import { RuntimeContext } from "tal-eval";
import * as tal from "tal-parser";
import { Editor, EditorApi } from "./editor/Editor";
import AppRenderer from "./AppRenderer";
import { useHotkeys } from "react-hotkeys-hook";
import Button, { ButtonDocumentation } from "./widgets/Button";
import CheckBox, { CheckBoxDocumentation } from "./widgets/CheckBox";
import InputFile, { InputFileDocumentation } from "./widgets/InputFile";
import HorizontalLayout, {
  HorizontalLayoutDocumentation,
} from "./widgets/HorizontalLayout";
import Text, { TextDocumentation } from "./widgets/Text";
import Link, { LinkDocumentation } from "./widgets/Link";
import ListLayout, { ListLayoutDocumentation } from "./widgets/ListLayout";
import Select, { SelectDocumentation } from "./widgets/Select";
import Table, { TableDocumentation } from "./widgets/Table";
import InputText, { InputTextDocumentation } from "./widgets/InputText";
import Switch, { SwitchDocumentation } from "./widgets/Switch";
import Snippet, { SnippetDocumentation } from "./widgets/Snippet";
import Box, { BoxDocumentation } from "./widgets/Box";
import Row, { RowDocumentation } from "./widgets/Row";
import Image, { ImageDocumentation } from "./widgets/Image";
import Column, { ColumnDocumentation } from "./widgets/Column";
import Loader, { LoaderDocumentation } from "./widgets/Loader";
import { backendUrl } from "./runtime/configuration";
import Debug, { DebugDocumentation } from "./widgets/Debug";
import { APP_DEBUG_MODE_ENV } from "./constants";
import errorStyles from "./runtime/styles.module.css";
import Pager, { PagerDocumentation } from "./widgets/Pager";
import Documentation from "./editor/Documentation";
import ToolBar from "./editor/Toolbar";
import { importStdlibInContext } from "tal-stdlib";

const queryParams = window.location.search
  .slice(1)
  .split("&")
  .map((keyValuePair) => keyValuePair.split("="))
  .reduce((prev, cur) => {
    if (!prev[cur[0]]) {
      prev[cur[0]] = [];
    }
    prev[cur[0]]!.push(decodeURIComponent(cur[1]));
    return prev;
  }, {} as { [key: string]: string[] | undefined });

const pathNameComponents = window.location.pathname.split("/");
const appNameFromPathName: string | undefined = pathNameComponents[1];
const appNameFromQueryParams: string | undefined = (queryParams?.name || [])[0];

const appNameFromUrl = appNameFromPathName || appNameFromQueryParams;

async function getRemoteConfiguration() {
  const response = await fetch(backendUrl + "/configuration");
  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      "Failed to fetch remote configuration with status: " + response.status
    );
  }
  return await response.json();
}

async function getApp(name: string) {
  const response = await fetch(backendUrl + "/apps/read/" + name);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      "Failed to fetch remote app with status: " + response.status
    );
  }
  return await response.text();
}

async function saveApp(name: string, source: string) {
  const response = await fetch(backendUrl + "/apps/write/" + name, {
    method: "POST",
    body: source,
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      "Failed to save remote app with status: " + response.status
    );
  }
  return await response.arrayBuffer();
}

let sourceFromFile: string | null = null;
let failedToLoadFromFile = false;
try {
  sourceFromFile = (window as any).electronAPI.config().sourceFromFile;
} catch (err) {
  failedToLoadFromFile = true;
  console.log("failed to initialize config event for sourceFromFile");
}

function buildContext(onStateChange: () => void): RuntimeContext {
  const ctx = new RuntimeContext(onStateChange);
  importStdlibInContext(ctx);

  ctx.registerWidget("Box", Box, BoxDocumentation);
  ctx.registerWidget("Button", Button, ButtonDocumentation);
  ctx.registerWidget("CheckBox", CheckBox, CheckBoxDocumentation);
  ctx.registerWidget("Column", Column, ColumnDocumentation);
  ctx.registerWidget(
    "HorizontalLayout",
    HorizontalLayout,
    HorizontalLayoutDocumentation
  );
  ctx.registerWidget("Debug", Debug, DebugDocumentation);
  ctx.registerWidget("Image", Image, ImageDocumentation);
  ctx.registerWidget("InputFile", InputFile, InputFileDocumentation);
  ctx.registerWidget("InputText", InputText, InputTextDocumentation);
  ctx.registerWidget("Link", Link, LinkDocumentation);
  ctx.registerWidget("ListLayout", ListLayout, ListLayoutDocumentation);
  ctx.registerWidget("Loader", Loader, LoaderDocumentation);
  ctx.registerWidget("Pager", Pager, PagerDocumentation);
  ctx.registerWidget("Row", Row, RowDocumentation);
  ctx.registerWidget("Select", Select, SelectDocumentation);
  ctx.registerWidget("Snippet", Snippet, SnippetDocumentation);
  ctx.registerWidget("Switch", Switch, SwitchDocumentation);
  ctx.registerWidget("Table", Table, TableDocumentation);
  ctx.registerWidget("Text", Text, TextDocumentation);

  return ctx;
}

const DEFAULT_APP_SOURCE = `var a = "40"
var b = "2"
Column {
  Text {
    text: "Hello ! You see this message because you do not have any program loaded."
  }

  Text {
    text: "Press Ctrl+Shift+D to open the text editor and edit this program."
  }

  Text {
    text: "Click on 'Apply & format' to run your program, and check the documentation with the 'Toggle reference documentation' button."
  }

  Text {
    text: "Tutorials and examples coming soon !"
  }

  Text {
    text: "Here's a small adder to start hacking your first app:"
  }

  Row {
    InputText { bindTo: a }
    InputText { bindTo: b }

    Text {
      text: "$a + $b = $result" | string_format({a: a, b: b, result: string_to_number(a) + string_to_number(b)})
    }
  }
}
`;

function App() {
  const currentAppName = "latestSource";

  // TODO: Do not load default app or local storage if is loading from server
  const [source, setSource] = useState<string | null>(null);
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [isLoadError, setIsLoadError] = useState(false);
  const [app, setApp] = useState<tal.Expression[] | null>(null);

  const executeSource = useCallback((newSource: string) => {
    if (newSource == null) {
      setApp(null);
      return;
    }
    try {
      setApp(tal.parse(newSource));
    } catch (err) {
      setParseError(err as Error);
      setApp(null);
    } finally {
      setSource(newSource);
    }
  }, []);

  useEffect(() => {
    (async function() {
      try {
        setIsLoadingApp(true);
        setIsLoadError(false);
        const configuration = (await getRemoteConfiguration()) as {
          features: string[];
        };
        let sourceToExecute: string;
        if (
          configuration.features.includes("remote-storage") &&
          appNameFromUrl
        ) {
          const remoteAppSource = await getApp(appNameFromUrl);
          sourceToExecute = remoteAppSource;
        } else {
          sourceToExecute = failedToLoadFromFile
            ? localStorage.getItem(currentAppName) ?? DEFAULT_APP_SOURCE
            : sourceFromFile ?? DEFAULT_APP_SOURCE;
        }
        setSource(sourceToExecute);
        executeSource(sourceToExecute);
      } catch (err) {
        console.error("Failed to get server features");
        console.error(err);
        setIsLoadError(true);
      } finally {
        setIsLoadingApp(false);
      }
    })();
  }, [executeSource]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, dummyStateUpdate] = useState(0);
  const ctx: RuntimeContext = useMemo(
    () => buildContext(() => dummyStateUpdate(Math.random())),
    []
  );
  const [updateSourceFunc, setUpdateSource] = useState<(() => string) | null>(
    null
  );

  const [parseError, setParseError] = useState<Error | null>(null);

  const [isDebugMode, setIsDebugMode] = useState(
    queryParams.hasOwnProperty("debug")
  );

  const toggleDebugModeKeyboardHandler = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      setIsDebugMode(!isDebugMode);
    },
    [setIsDebugMode, isDebugMode]
  );

  useHotkeys("ctrl+shift+d", toggleDebugModeKeyboardHandler, [
    toggleDebugModeKeyboardHandler,
  ]);

  const [showDocumentation, setShowDocumentation] = useState(false);

  const toggleShowDocumentationHandler = useCallback(
    () => setShowDocumentation(!showDocumentation),
    [showDocumentation]
  );

  const persistSource = useCallback((sourceFromEditor: string) => {
    localStorage.setItem(currentAppName, sourceFromEditor);
    // TODO: Find a better way to differentiate where the source is from
    if ((window as any).electronAPI) {
      (window as any).electronAPI.saveFile(sourceFromEditor);
    } else if (appNameFromUrl) {
      saveApp(appNameFromUrl, sourceFromEditor);
    }
  }, []);

  const openEditorHandler = useCallback(() => {
    setIsDebugMode(true);
  }, []);

  const closeEditorHandle = useCallback(() => {
    setIsDebugMode(false);
  }, []);

  const setAppDebutModeHandler = useCallback(
    (appDebugMode: boolean) => ctx.setLocal(APP_DEBUG_MODE_ENV, appDebugMode),
    [ctx]
  );

  const [editorApi, setEditorApi] = useState<EditorApi>();

  const onApplyHandler = useCallback(() => {
    if (updateSourceFunc) {
      const source = updateSourceFunc();
      persistSource(source);
      setSource(source);
      executeSource(source);
    }
  }, [executeSource, persistSource, updateSourceFunc]);

  const onFormatHandler = useCallback(() => {
    if (!updateSourceFunc) return;
    let sourceToFormat = updateSourceFunc();
    try {
      setSource(tal.stringify(tal.parse(sourceToFormat)));
    } catch (err) {
      console.error("Failed to format because of syntax error", err);
    }
  }, [updateSourceFunc]);

  const onApplyAndFormatHandler = useCallback(() => {
    if (!updateSourceFunc) return;
    let source = updateSourceFunc();
    try {
      const app = tal.parse(source);
      source = tal.stringify(app);
    } catch (err) {
      console.error("Failed to format because of syntax error", err);
    } finally {
      persistSource(source);
      setSource(source);
      executeSource(source);
    }
  }, [executeSource, persistSource, updateSourceFunc]);

  const onCloseHandler = useCallback(() => {
    // TODO: Find user friendly confirm dialogs
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Close without saving ?")) {
      closeEditorHandle();
    }
  }, [closeEditorHandle]);

  const onSaveAndFormatAndCloseHandler = useCallback(() => {
    onApplyAndFormatHandler();
    closeEditorHandle();
  }, [closeEditorHandle, onApplyAndFormatHandler]);

  const onWriteInEditorHandler = useCallback(
    (text: string) => {
      if (!editorApi) {
        return;
      }
      editorApi.replaceSelection(text);
      onFormatHandler();
    },
    [editorApi, onFormatHandler]
  );

  return (
    <>
      <div
        className={[
          sourceFromFile && !isDebugMode ? styles.electron : "",
          styles.App,
          isDebugMode ? styles.hasEditor : "",
        ].join(" ")}
      >
        {!isDebugMode ? (
          <button
            className={styles.BtnEdit}
            type="button"
            onClick={openEditorHandler}
          >
            Edit
          </button>
        ) : null}
        {isDebugMode ? (
          <div className={styles.EditorContainer}>
            <div className={styles.ToolBarContainer}>
              <ToolBar
                onApply={onApplyHandler}
                onFormat={onFormatHandler}
                onApplyAndFormat={onApplyAndFormatHandler}
                onClose={onCloseHandler}
                onSaveAndFormatAndClose={onSaveAndFormatAndCloseHandler}
                onShowDocumentation={toggleShowDocumentationHandler}
                appDebugMode={
                  ctx.getLocalOr(APP_DEBUG_MODE_ENV, false) as boolean
                }
                setAppDebugMode={setAppDebutModeHandler}
              />
            </div>
            {source ? (
              <Editor
                source={source}
                grabSetSource={setUpdateSource}
                onApiReady={setEditorApi}
              />
            ) : null}
          </div>
        ) : null}
        <div className={styles.AppRendererContainer}>
          {app ? (
            <AppRenderer ctx={ctx} app={app} />
          ) : parseError ? (
            <div className={errorStyles.RenderError}>
              <div>Error parsing source: {parseError.message}</div>
              <div>
                At line {(parseError as any)?.location?.start?.line} column{" "}
                {(parseError as any)?.location?.start?.column}
              </div>
              <button onClick={() => console.error(parseError)}>
                Click to console.error
              </button>
            </div>
          ) : isLoadingApp ? (
            <div>Loading app...</div>
          ) : isLoadError ? (
            <div>Error while loading app</div>
          ) : (
            <div>Unknown failure</div>
          )}
        </div>
      </div>
      {showDocumentation ? (
        <Documentation
          ctx={ctx}
          onClose={toggleShowDocumentationHandler}
          onWriteInEditor={onWriteInEditorHandler}
        />
      ) : null}
    </>
  );
}

export default App;
