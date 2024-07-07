import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./App.module.css";
import {
  Program,
  RuntimeContext,
  compile,
  FetchedSource,
  SourceFetcher,
} from "tal-eval";
import * as tal from "tal-parser";
import { EditorApi } from "./devtools/Editor";
import AppRenderer from "./runtime/AppRenderer";
import { useHotkeys } from "react-hotkeys-hook";
import Button, { ButtonDocumentation } from "./widgets/Button";
import CheckBox, { CheckBoxDocumentation } from "./widgets/CheckBox";
import InputFile, { InputFileDocumentation } from "./widgets/InputFile";
import Text, { TextDocumentation } from "./widgets/Text";
import Radio, { RadioDocumentation } from "./widgets/Radio";
import Link, { LinkDocumentation } from "./widgets/Link";
import Select, { SelectDocumentation } from "./widgets/Select";
import Table, { TableDocumentation } from "./widgets/Table";
import InputText, { InputTextDocumentation } from "./widgets/InputText";
import Switch, { SwitchDocumentation } from "./widgets/Switch";
import Snippet, { SnippetDocumentation } from "./widgets/Snippet";
import Row, { RowDocumentation } from "./widgets/Row";
import Image, { ImageDocumentation } from "./widgets/Image";
import Column, { ColumnDocumentation } from "./widgets/Column";
import Loader, { LoaderDocumentation } from "./widgets/Loader";
import Html, { HtmlDocumentation } from "./widgets/Html";
import Overlay, { OverlayDocumentation } from "./widgets/Overlay";
import View, { ViewDocumentation } from "./widgets/View";
import { backendUrl } from "./runtime/configuration";
import Debug, { DebugDocumentation } from "./widgets/Debug";
import { APP_DEBUG_MODE_ENV } from "./runtime/constants";
import Pager, { PagerDocumentation } from "./widgets/Pager";
import { importStdlibInContext } from "tal-stdlib";
import { ThemeProvider, Theme, useTheme } from "./theme";
import toyBoxTheme from "./themes/toy-box";
import htmlTheme from "./themes/html";
import twbsTheme from "./themes/twbs";
import twbsDarkTheme from "./themes/twbs-dark";
import nesCssTheme from "./themes/nes-css";
import theme98 from "./themes/98";
import darkOrangeTheme from "./themes/dark-orange";
import mozaicLmTheme from "./themes/mozaic-lm";
import Tabs, { TabsDocumentation } from "./widgets/Tabs";
import { lowerForApp } from "tal-eval";
import WindowFrame, { WindowFrameDocumentation } from "./widgets/WindowFrame";
import LowLevelOverlay from "./widgets/internal/LowLevelOverlay";
import Devtools from "./devtools/Devtools";
import {
  NotificationDisplay,
  NotificationProvider,
} from "./runtime/notifications";
import UpdateAppNotification from "./runtime/UpdateAppNotification";
import { useForceRender } from "./utils";

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

const isDevModeEnabled = queryParams.hasOwnProperty("dev");

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

let showUpdateNotificationCallback: { value: (() => void) | null } = {
  value: null,
};

function getAppFromCache(name: string) {
  return localStorage.getItem("app-src-" + name);
}

function saveAppToCache(name: string, source: string) {
  localStorage.setItem("app-src-" + name, source);
}

async function getAppInBackground(name: string): Promise<FetchedSource> {
  const response = await fetch(backendUrl + "/apps/read/" + name);
  if (response.status === 404) {
    return { path: name, source: null };
  }
  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      "Failed to fetch remote app with status: " + response.status
    );
  }
  const appSource = await response.text();
  saveAppToCache(name, appSource);
  return { path: name, source: appSource };
}

async function getApp(name: string): Promise<FetchedSource> {
  const cachedApp = getAppFromCache(name);
  if (cachedApp != null) {
    // Check for updates in the background and show a notification if there is one
    getAppInBackground(name).then((fetchedSource) => {
      if (fetchedSource.source !== cachedApp && fetchedSource.source != null) {
        saveAppToCache(name, fetchedSource.source);
        showUpdateNotificationCallback.value &&
          showUpdateNotificationCallback.value();
      }
    });
    return { path: name, source: cachedApp };
  }
  const fetchedSource = await getAppInBackground(name);
  if (fetchedSource.source != null) {
    saveAppToCache(name, fetchedSource.source);
  }
  return fetchedSource;
}

const webSourceFetcher: SourceFetcher = {
  async fetch(path) {
    return getApp(path);
  },
  async normalizePath(path) {
    return path;
  },
};

const electronSourceFetcher: SourceFetcher = {
  async fetch(path) {
    return (window as any).electronAPI.getSourceForImport(path);
  },
  async normalizePath(path) {
    return path;
  },
};

async function saveApp(name: string, source: string) {
  saveAppToCache(name, source);
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
let sourcePath: string | null = null;
try {
  const config = (window as any).electronAPI.config();
  sourceFromFile = config.sourceFromFile;
  sourcePath = config.sourcePath;
} catch (err) {
  console.log("failed to initialize config event for sourceFromFile");
}

function buildContext(
  onStateChange: () => void,
  setPromptPasswordVisible: (visible: boolean) => void,
  resolveRef: React.MutableRefObject<((password: string) => void) | null>
): RuntimeContext {
  const ctx = new RuntimeContext(onStateChange);
  ctx.setSourceFetcher(
    (window as any).electronAPI ? electronSourceFetcher : webSourceFetcher
  );
  ctx.promptPassword = async () => {
    return new Promise((resolve, reject) => {
      setPromptPasswordVisible(true);
      resolveRef.current = resolve;
    });
  };
  importStdlibInContext(ctx);

  ctx.registerWidget("Button", Button, ButtonDocumentation);
  ctx.registerWidget("CheckBox", CheckBox, CheckBoxDocumentation);
  ctx.registerWidget("Column", Column, ColumnDocumentation);
  ctx.registerWidget("Debug", Debug, DebugDocumentation);
  ctx.registerWidget("Html", Html, HtmlDocumentation);
  ctx.registerWidget("Image", Image, ImageDocumentation);
  ctx.registerWidget("InputFile", InputFile, InputFileDocumentation);
  ctx.registerWidget("InputText", InputText, InputTextDocumentation);
  ctx.registerWidget("Link", Link, LinkDocumentation);
  ctx.registerWidget("Loader", Loader, LoaderDocumentation);
  ctx.registerWidget("Overlay", Overlay, OverlayDocumentation);
  ctx.registerWidget("Pager", Pager, PagerDocumentation);
  ctx.registerWidget("Radio", Radio, RadioDocumentation);
  ctx.registerWidget("Row", Row, RowDocumentation);
  ctx.registerWidget("Select", Select, SelectDocumentation);
  ctx.registerWidget("Snippet", Snippet, SnippetDocumentation);
  ctx.registerWidget("Switch", Switch, SwitchDocumentation);
  ctx.registerWidget("Table", Table, TableDocumentation);
  ctx.registerWidget("Tabs", Tabs, TabsDocumentation);
  ctx.registerWidget("Text", Text, TextDocumentation);
  ctx.registerWidget("View", View, ViewDocumentation);
  ctx.registerWidget("WindowFrame", WindowFrame, WindowFrameDocumentation);

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

const themes = [
  htmlTheme,
  toyBoxTheme,
  twbsTheme,
  twbsDarkTheme,
  nesCssTheme,
  theme98,
  darkOrangeTheme,
  mozaicLmTheme,
];

const selectedThemeFromQueryString = themes.find(
  (theme) => theme.id === queryParams.theme?.[0]
);

function App() {
  const currentAppName = "latestSource";

  // TODO: Do not load default app or local storage if is loading from server
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [isLoadError, setIsLoadError] = useState(false);
  const [app, setApp] = useState<Program | null>(null);
  const [theme, setTheme] = useState(
    selectedThemeFromQueryString ?? toyBoxTheme
  );
  const [editorApi, setEditorApi] = useState<EditorApi>();
  const [sourceToExecute, setSourceToExecute] = useState<string | null>(null);

  const executeSource = useCallback((newSource: string, path: string) => {
    console.log("execute at path: ", path);
    setSourceToExecute(newSource);
    if (newSource == null) {
      setApp(null);
      return;
    }
    latestExecutedSource.current = newSource;
    try {
      const hlast = tal.parse(newSource, path);
      const llast = lowerForApp(hlast);
      const bin = compile(llast);
      setApp(bin);
    } catch (err) {
      setParseError(err as Error);
      setApp(null);
    }
  }, []);

  const getSourcePath = useCallback(() => {
    if (sourcePath) {
      return sourcePath;
    }
    if (appNameFromUrl) {
      return appNameFromUrl;
    }
    return "localstorage";
  }, []);

  const remoteConfiguration = useMemo(() => getRemoteConfiguration(), []);

  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  showUpdateNotificationCallback.value = () => setShowUpdateNotification(true);

  useEffect(() => {
    (async function() {
      try {
        setIsLoadingApp(true);
        setIsLoadError(false);
        const configuration = (await remoteConfiguration) as {
          features: string[];
        };
        let sourceToExecute: string;
        if (
          configuration.features.includes("remote-storage") &&
          appNameFromUrl
        ) {
          const remoteAppSource = await getApp(appNameFromUrl);
          sourceToExecute = remoteAppSource.source ?? DEFAULT_APP_SOURCE;
        } else if (sourceFromFile && sourcePath) {
          sourceToExecute = sourceFromFile ?? DEFAULT_APP_SOURCE;
        } else {
          sourceToExecute =
            localStorage.getItem(currentAppName) ?? DEFAULT_APP_SOURCE;
        }
        executeSource(sourceToExecute, getSourcePath());
      } catch (err) {
        console.error("Failed to get server features");
        console.error(err);
        setIsLoadError(true);
      } finally {
        setIsLoadingApp(false);
      }
    })();
  }, [executeSource, getSourcePath, remoteConfiguration]);

  useEffect(() => {
    editorApi?.replaceAll(sourceToExecute ?? "");
  }, [sourceToExecute, editorApi]);

  const [passwordPromptVisible, setPasswordPromptVisible] = useState(false);
  const closePasswordPromptHandler = useCallback(() => {
    setPasswordPromptVisible(false);
  }, []);
  const resolvePasswordRef = useRef<((password: string) => void) | null>(null);
  const onSetPasswordHandler = useCallback((password: string) => {
    setPasswordPromptVisible(false);
    resolvePasswordRef.current && resolvePasswordRef.current(password);
    resolvePasswordRef.current = null;
  }, []);

  const forceRender = useForceRender();
  const ctx: RuntimeContext = useMemo(
    () =>
      buildContext(forceRender, setPasswordPromptVisible, resolvePasswordRef),
    [forceRender]
  );

  const updateSourceFunc = useRef<(() => string) | null>(null);

  const [parseError, setParseError] = useState<Error | null>(null);

  const [devtoolsVisible, setDevtoolsVisible] = useState(
    queryParams.hasOwnProperty("devtools")
  );

  const toggleDevtoolsVisibleKeyboardHandler = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      setDevtoolsVisible(!devtoolsVisible);
    },
    [setDevtoolsVisible, devtoolsVisible]
  );

  useHotkeys("ctrl+shift+d", toggleDevtoolsVisibleKeyboardHandler, [
    toggleDevtoolsVisibleKeyboardHandler,
  ]);

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
    setDevtoolsVisible(true);
  }, []);

  const closeEditorHandle = useCallback(() => {
    setDevtoolsVisible(false);
  }, []);

  const setAppDebugModeHandler = useCallback(
    (appDebugMode: boolean) => ctx.setLocal(APP_DEBUG_MODE_ENV, appDebugMode),
    [ctx]
  );

  const onFormatHandler = useCallback(() => {
    if (!updateSourceFunc.current) return;
    let sourceToFormat = updateSourceFunc.current();
    try {
      editorApi?.replaceAll(
        tal.stringify(tal.parse(sourceToFormat, getSourcePath()))
      );
    } catch (err) {
      console.error("Failed to format because of syntax error", err);
    }
  }, [editorApi, getSourcePath, updateSourceFunc]);

  const [lastCompileErrorToLog, setLastCompileErrorToLog] = useState<unknown>(
    null
  );

  useEffect(() => {
    if (!lastCompileErrorToLog) return;
    ctx.log("error", lastCompileErrorToLog);
    setLastCompileErrorToLog(null);
  }, [ctx, lastCompileErrorToLog]);

  const onApplyAndFormatWithSourceHandler = useCallback(
    (source: string) => {
      try {
        const app = tal.parse(source, getSourcePath());
        source = tal.stringify(app);
      } catch (err) {
        setLastCompileErrorToLog(err);
        console.error("Failed to format because of syntax error", err);
      } finally {
        persistSource(source);
        editorApi?.replaceAll(source);
        executeSource(source, getSourcePath());
      }
    },
    [editorApi, executeSource, getSourcePath, persistSource]
  );

  const onApplyAndFormatHandler = useCallback(() => {
    if (!updateSourceFunc.current) return;
    onApplyAndFormatWithSourceHandler(updateSourceFunc.current());
  }, [onApplyAndFormatWithSourceHandler, updateSourceFunc]);

  const latestExecutedSource = useRef<string | null>(null);

  const onCloseHandler = useCallback(() => {
    if (updateSourceFunc.current) {
      const sourceFromEditor = updateSourceFunc.current();
      if (latestExecutedSource.current !== sourceFromEditor) {
        // TODO: Find user friendly confirm dialogs
        // eslint-disable-next-line no-restricted-globals
        if (confirm("Close without saving ?")) {
          closeEditorHandle();
        }
      } else {
        closeEditorHandle();
      }
    }
  }, [closeEditorHandle]);

  const applyTheme = useCallback(
    (newTheme: Theme) => {
      theme.onUnload && theme.onUnload();
      newTheme.onLoad && newTheme.onLoad();
      setTheme(newTheme);
    },
    [theme]
  );

  useEffect(() => {
    (window as any).setTheme = (themeId: string) => {
      if (selectedThemeFromQueryString) {
        return;
      }
      const theme = themes.find((theme) => theme.id === themeId);
      if (theme) {
        applyTheme(theme);
      }
    };
  }, [applyTheme]);

  useEffect(() => {
    theme.onLoad && theme.onLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeUpdateAppNotificationHandler = useCallback(
    () => setShowUpdateNotification(false),
    []
  );

  return (
    <NotificationProvider>
      <ThemeProvider value={theme}>
        <div className={styles.App}>
          <div className={styles.AppRendererContainer}>
            {app ? (
              <AppRenderer ctx={ctx} app={app} />
            ) : parseError ? (
              <theme.View backgroundColor="rgb(230, 104, 104)" padding={0.5}>
                <theme.Text
                  text={`Error parsing source: ${parseError.message}`}
                  wrap
                  color="rgb(245, 242, 242)"
                />
                <theme.Text
                  text={`At line ${
                    (parseError as any)?.location?.start?.line
                  } column 
                ${(parseError as any)?.location?.start?.column}`}
                  wrap
                  color="rgb(245, 242, 242)"
                />
              </theme.View>
            ) : isLoadingApp ? (
              <theme.View layout="flex-column" padding={0.5}>
                <theme.View layout="flex-row">
                  <theme.Loader />
                  <theme.Text text="Loading app..." />
                </theme.View>
              </theme.View>
            ) : isLoadError ? (
              <theme.View backgroundColor="rgb(230, 104, 104)" padding={0.5}>
                <theme.Text
                  text="Error while loading app"
                  wrap
                  color="rgb(245, 242, 242)"
                />
              </theme.View>
            ) : (
              <theme.View backgroundColor="rgb(230, 104, 104)" padding={0.5}>
                <theme.Text
                  text="Unknown failure"
                  wrap
                  color="rgb(245, 242, 242)"
                />
              </theme.View>
            )}
          </div>
          {!devtoolsVisible && isDevModeEnabled ? (
            <button
              className={styles.BtnEdit}
              type="button"
              onClick={openEditorHandler}
            >
              Edit
            </button>
          ) : null}
        </div>

        {devtoolsVisible ? (
          <DevtoolsDrawer
            ctx={ctx}
            latestExecutedSource={latestExecutedSource}
            updateSourceFunc={updateSourceFunc}
            onCloseHandler={onCloseHandler}
            onFormatHandler={onFormatHandler}
            onApplyAndFormatHandler={onApplyAndFormatHandler}
            setAppDebugModeHandler={setAppDebugModeHandler}
            applyTheme={applyTheme}
            setEditorApi={setEditorApi}
            onApplyAndFormatWithSourceHandler={
              onApplyAndFormatWithSourceHandler
            }
          />
        ) : null}
        <div id="tap-overlays"></div>
        {showUpdateNotification ? (
          <UpdateAppNotification close={closeUpdateAppNotificationHandler} />
        ) : null}
        <NotificationDisplay />
        {passwordPromptVisible ? (
          <PasswordPromptOverlay
            close={closePasswordPromptHandler}
            setPassword={onSetPasswordHandler}
          />
        ) : null}
      </ThemeProvider>
    </NotificationProvider>
  );
}

type PasswordPromptOverlayProps = {
  close: () => void;
  setPassword: (password: string) => void;
};

function PasswordPromptOverlay({
  close,
  setPassword,
}: PasswordPromptOverlayProps) {
  const theme = useTheme();

  const [passwordField, setPasswordField] = useState("");

  const onUnlockHandler = useCallback(async () => {
    setPassword(passwordField);
  }, [passwordField, setPassword]);

  return (
    <LowLevelOverlay onClose={close} modal position="center">
      <theme.WindowFrame
        onClose={close}
        modal
        position="center"
        title="Unlock secrets"
      >
        <theme.View padding={0.5}>
          <theme.Text text="Enter your password:" />
          <theme.InputText
            type="password"
            value={passwordField}
            onChange={setPasswordField}
            onSubmit={onUnlockHandler}
            placeholder="Password"
          />
          <theme.Button text="Unlock" onClick={onUnlockHandler} />
        </theme.View>
      </theme.WindowFrame>
    </LowLevelOverlay>
  );
}

export default App;

type DevtoolsDrawerProps = {
  ctx: RuntimeContext;
  updateSourceFunc: React.MutableRefObject<(() => string) | null>;
  latestExecutedSource: React.MutableRefObject<string | null>;
  onCloseHandler(): void;
  onFormatHandler(): void;
  onApplyAndFormatHandler(): void;
  setAppDebugModeHandler(appDebugModeValue: boolean): void;
  applyTheme(newTheme: Theme): void;
  setEditorApi(editorApi: EditorApi): void;
  onApplyAndFormatWithSourceHandler(source: string): void;
};

function DevtoolsDrawer({
  ctx,
  latestExecutedSource,
  onCloseHandler,
  onFormatHandler,
  onApplyAndFormatHandler,
  setAppDebugModeHandler,
  applyTheme,
  updateSourceFunc,
  setEditorApi,
  onApplyAndFormatWithSourceHandler,
}: DevtoolsDrawerProps) {
  const theme = useTheme();

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (
        updateSourceFunc.current &&
        latestExecutedSource.current !== updateSourceFunc.current()
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [latestExecutedSource, updateSourceFunc]);

  return (
    <LowLevelOverlay size="xl" position="left" onClose={onCloseHandler} modal>
      <theme.WindowFrame
        title="Devtools"
        position="left"
        onClose={onCloseHandler}
        modal
      >
        <Devtools
          ctx={ctx}
          themes={themes}
          onFormatHandler={onFormatHandler}
          onApplyAndFormatHandler={onApplyAndFormatHandler}
          onDebugModeChange={setAppDebugModeHandler}
          theme={theme}
          onApplyTheme={applyTheme}
          updateSourceFunc={updateSourceFunc}
          setEditorApi={setEditorApi}
          onApplyAndFormatWithSourceHandler={onApplyAndFormatWithSourceHandler}
          onCloseHandler={onCloseHandler}
        />
      </theme.WindowFrame>
    </LowLevelOverlay>
  );
}
