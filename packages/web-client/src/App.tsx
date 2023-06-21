import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./App.module.css";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import * as tal from "tal-parser";
import { Editor } from "./editor/Editor";
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
import {
  array_append,
  array_concat,
  array_filter,
  array_flat_map,
  array_get,
  array_group,
  array_join,
  array_length,
  array_map_parallel,
  array_map,
  array_range,
  array_remove,
  array_reverse,
  array_skip,
  array_sort,
  array_take,
  array_to_object,
  array_unique,
  array_reduce,
} from "./functions/array";
import { bytes_to_string } from "./functions/bytes";
import { cheerio_load, cheerio_find } from "./functions/cheerio";
import {
  typeof$,
  if$,
  try$,
  throw$,
  log,
  set_system_property,
  is_defined,
  default$,
  watch,
  expression_eval,
} from "./functions/core";
import { event_on, event_trigger } from "./functions/event";
import { json_parse, json_stringify, jmespath_search } from "./functions/json";
import {
  mongodb_delete_one,
  mongodb_find,
  mongodb_insert_one,
  mongodb_update_one,
} from "./functions/mongodb";
import {
  object_keys,
  object_values,
  object_entries,
  object_get,
  object_merge,
  object_set,
} from "./functions/object";
import { process_exec } from "./functions/process";
import {
  string_to_bytes,
  string_to_number,
  string_split,
  string_locale_compare,
  string_trim,
  string_contains,
  string_format,
  string_ends_with,
  string_starts_with,
  string_lower,
  string_pad_end,
  string_pad_start,
  string_repeat,
  string_slice,
  string_trim_end,
  string_trim_start,
  string_upper,
} from "./functions/string";
import { http_request, http_request_form } from "./functions/http";
import Column, { ColumnDocumentation } from "./widgets/Column";
import Loader, { LoaderDocumentation } from "./widgets/Loader";
import { pg_query } from "./functions/pg";
import { uuid_v4 } from "./functions/uuid";
import { backendUrl } from "./runtime/configuration";
import Debug, { DebugDocumentation } from "./widgets/Debug";
import { APP_DEBUG_MODE_ENV } from "./constants";
import {
  number_to_string,
  number_ceil,
  number_floor,
  number_round,
  number_abs,
  number_sign,
  number_trunc,
  number_random,
  number_randint,
} from "./functions/number";
import errorStyles from "./runtime/styles.module.css";
import Pager, { PagerDocumentation } from "./widgets/Pager";
import { regex_match } from "./functions/regex";
import {
  storage_list,
  storage_read,
  storage_remove,
  storage_write,
} from "./functions/storage";
import { time_day_of_week, time_parse } from "./functions/time";

const queryParams = window.location.search
  .slice(1)
  .split("&")
  .map((keyValuePair) => keyValuePair.split("="))
  .reduce((prev, cur) => {
    if (!prev[cur[0]]) {
      prev[cur[0]] = [];
    }
    prev[cur[0]].push(decodeURIComponent(cur[1]));
    return prev;
  }, {} as { [key: string]: string[] });

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

  ctx.registerFunction(default$);
  ctx.registerFunction(expression_eval);
  ctx.registerFunction(if$);
  ctx.registerFunction(log);
  ctx.registerFunction(throw$);
  ctx.registerFunction(try$);
  ctx.registerFunction(typeof$);
  ctx.registerFunction(watch);

  ctx.registerFunction(array_append);
  ctx.registerFunction(array_concat);
  ctx.registerFunction(array_filter);
  ctx.registerFunction(array_flat_map);
  ctx.registerFunction(array_get);
  ctx.registerFunction(array_group);
  ctx.registerFunction(array_join);
  ctx.registerFunction(array_length);
  ctx.registerFunction(array_map);
  ctx.registerFunction(array_map_parallel);
  ctx.registerFunction(array_range);
  ctx.registerFunction(array_unique);
  ctx.registerFunction(array_reduce);
  ctx.registerFunction(array_remove);
  ctx.registerFunction(array_reverse);
  ctx.registerFunction(array_skip);
  ctx.registerFunction(array_sort);
  ctx.registerFunction(array_take);
  ctx.registerFunction(array_to_object);
  ctx.registerFunction(bytes_to_string);
  ctx.registerFunction(cheerio_find);
  ctx.registerFunction(cheerio_load);
  ctx.registerFunction(event_on);
  ctx.registerFunction(event_trigger);
  ctx.registerFunction(http_request_form);
  ctx.registerFunction(http_request);
  ctx.registerFunction(is_defined);
  ctx.registerFunction(jmespath_search);
  ctx.registerFunction(json_parse);
  ctx.registerFunction(json_stringify);
  ctx.registerFunction(mongodb_delete_one);
  ctx.registerFunction(mongodb_find);
  ctx.registerFunction(mongodb_insert_one);
  ctx.registerFunction(mongodb_update_one);
  ctx.registerFunction(number_to_string);
  ctx.registerFunction(number_ceil);
  ctx.registerFunction(number_floor);
  ctx.registerFunction(number_round);
  ctx.registerFunction(number_abs);
  ctx.registerFunction(number_sign);
  ctx.registerFunction(number_trunc);
  ctx.registerFunction(number_random);
  ctx.registerFunction(number_randint);
  ctx.registerFunction(object_entries);
  ctx.registerFunction(object_get);
  ctx.registerFunction(object_keys);
  ctx.registerFunction(object_merge);
  ctx.registerFunction(object_set);
  ctx.registerFunction(object_values);
  ctx.registerFunction(pg_query);
  ctx.registerFunction(process_exec);
  ctx.registerFunction(regex_match);
  ctx.registerFunction(set_system_property);
  ctx.registerFunction(storage_list);
  ctx.registerFunction(storage_read);
  ctx.registerFunction(storage_remove);
  ctx.registerFunction(storage_write);
  ctx.registerFunction(string_contains);
  ctx.registerFunction(string_ends_with);
  ctx.registerFunction(string_format);
  ctx.registerFunction(string_locale_compare);
  ctx.registerFunction(string_lower);
  ctx.registerFunction(string_split);
  ctx.registerFunction(string_starts_with);
  ctx.registerFunction(string_upper);
  ctx.registerFunction(string_slice);
  ctx.registerFunction(string_repeat);
  ctx.registerFunction(string_trim_start);
  ctx.registerFunction(string_trim_end);
  ctx.registerFunction(string_pad_start);
  ctx.registerFunction(string_pad_end);
  ctx.registerFunction(string_to_bytes);
  ctx.registerFunction(string_to_number);
  ctx.registerFunction(string_trim);
  ctx.registerFunction(time_parse);
  ctx.registerFunction(time_day_of_week);
  ctx.registerFunction(uuid_v4);

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

  useEffect(() => {
    (async function() {
      try {
        setIsLoadingApp(true);
        setIsLoadError(false);
        const configuration = (await getRemoteConfiguration()) as {
          features: string[];
        };
        if (
          configuration.features.includes("remote-storage") &&
          queryParams.name
        ) {
          const remoteAppSource = await getApp(queryParams.name[0]);
          setSource(remoteAppSource);
        } else {
          setSource(
            failedToLoadFromFile
              ? localStorage.getItem(currentAppName) ?? DEFAULT_APP_SOURCE
              : sourceFromFile ?? DEFAULT_APP_SOURCE
          );
        }
      } catch (err) {
        console.error("Failed to get server features");
        console.error(err);
        setIsLoadError(true);
      } finally {
        setIsLoadingApp(false);
      }
    })();
  }, []);

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

  const app = useMemo(() => {
    if (source == null) {
      return null;
    }
    try {
      return tal.parse(source);
    } catch (err) {
      setParseError(err as Error);
      return null;
    }
  }, [source]);

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

  const setSourceFromToolbar = useCallback((sourceFromEditor: string) => {
    localStorage.setItem(currentAppName, sourceFromEditor);
    // TODO: Find a better way to differentiate where the source is from
    if ((window as any).electronAPI) {
      (window as any).electronAPI.saveFile(sourceFromEditor);
    } else if (queryParams.name) {
      saveApp(queryParams.name[0], sourceFromEditor);
    }
    setSource(sourceFromEditor);
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
                setSource={setSourceFromToolbar}
                updateSourceFunc={updateSourceFunc}
                closeEditor={closeEditorHandle}
                toggleShowFunctionReference={toggleShowDocumentationHandler}
                appDebugMode={
                  ctx.getLocalOr(APP_DEBUG_MODE_ENV, false) as boolean
                }
                setAppDebugMode={setAppDebutModeHandler}
              />
            </div>
            {source ? (
              <Editor source={source} grabSetSource={setUpdateSource} />
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
        <Documentation ctx={ctx} onClose={toggleShowDocumentationHandler} />
      ) : null}
    </>
  );
}

function Documentation({
  ctx,
  onClose,
}: {
  ctx: RuntimeContext;
  onClose: () => void;
}) {
  const widgetsData = useMemo(() => {
    return ctx.listWidgets();
  }, [ctx]);
  const functionsData = useMemo(() => {
    return ctx
      .listLocals()
      .filter(
        ([name, value]) =>
          value != null &&
          typeof value == "object" &&
          (typeof (value as any).call == "function" ||
            typeof (value as any).callAsync == "function")
      )
      .map(([name, value]) => {
        const parameters = (value as any).parameters as any[];
        return [name, parameters] as [string, any[]];
      });
  }, [ctx]);

  const [searchTerm, setSearchTerm] = useState("");

  const onSearchChange = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      setSearchTerm((e.target as any).value);
    },
    []
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: "50%",
        right: 0,
        background: "rgb(218, 218, 218)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div>
        Search: <input onInput={onSearchChange} />
        <button onClick={onClose}>Close</button>
      </div>
      <div style={{ overflow: "auto" }}>
        <h2>Functions</h2>
        <em style={{ display: "block", paddingBottom: 16 }}>
          Click on any function to copy a code snippet
        </em>
        {functionsData
          .filter(
            ([name]) =>
              !searchTerm ||
              searchTerm === "" ||
              name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
          )
          .map(([name, doc]) => (
            <div key={name} onClick={() => copyFunctionSnippet(name, doc)}>
              <div>
                <strong>{name}</strong>
              </div>
              <ul style={{ paddingLeft: 16 }}>
                {doc.map((d) => (
                  <li key={d.name}>
                    {d.name}
                    {d.env ? ` (env: ${d.env})` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        <h2>Widgets</h2>
        <em style={{ display: "block", paddingBottom: 16 }}>
          Click on any widget to copy a code snippet
        </em>
        {Object.entries(widgetsData)
          .filter(
            ([name]) =>
              !searchTerm ||
              searchTerm === "" ||
              name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
          )
          .map(([name, documentation]) => (
            <div
              key={name}
              onClick={() => copyWidgetSnippet(name, documentation)}
            >
              <div>
                <strong>{name}</strong>: {documentation.description}
              </div>
              <ul style={{ paddingLeft: 16 }}>
                {Object.entries(documentation.props).map(
                  ([name, description]) => (
                    <li key={name}>
                      {name}
                      {description ? `: ${description}` : null}
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}

function copyFunctionSnippet(name: string, documentation: any[]): void {
  navigator.clipboard.writeText(
    name +
      "(" +
      documentation.map(({ name }) => name + ": null").join(", ") +
      ")"
  );
}

function copyWidgetSnippet(
  name: string,
  documentation: WidgetDocumentation<any>
): void {
  navigator.clipboard.writeText(
    name +
      " { " +
      Object.entries(documentation.props)
        .map(([name]) => name + ": null")
        .join(", ") +
      " }"
  );
}

export default App;

function ToolBar({
  setSource,
  updateSourceFunc,
  closeEditor,
  toggleShowFunctionReference,
  appDebugMode,
  setAppDebugMode,
}: {
  setSource: (newSource: string) => void;
  updateSourceFunc: (() => string) | null;
  closeEditor(): void;
  toggleShowFunctionReference(): void;
  appDebugMode: boolean;
  setAppDebugMode(debugModeEnabled: boolean): void;
}) {
  const applyChanges = useCallback(() => {
    if (updateSourceFunc) {
      const newSource = updateSourceFunc();
      setSource(newSource);
    }
  }, [setSource, updateSourceFunc]);

  const formatClickHandler = useCallback(() => {
    if (!updateSourceFunc) return;
    let sourceToSave = updateSourceFunc();
    try {
      const app = tal.parse(sourceToSave);
      sourceToSave = tal.stringify(app);
    } catch (err) {
      console.error("Failed to format because of syntax error", err);
    } finally {
      setSource(sourceToSave);
    }
  }, [setSource, updateSourceFunc]);

  const saveAndFormatAndCloseClickHandler = useCallback(() => {
    formatClickHandler();
    closeEditor();
  }, [formatClickHandler, closeEditor]);

  const closeClickHandler = useCallback(() => {
    // TODO: Find user friendly confirm dialogs
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Close without saving ?")) {
      closeEditor();
    }
  }, [closeEditor]);

  const onAppDebugModeChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAppDebugMode(e.target.checked);
    },
    [setAppDebugMode]
  );

  const inputDebugId = useMemo(() => Math.random().toString(), []);

  return (
    <div>
      <button onClick={applyChanges}>Apply</button>
      <button onClick={formatClickHandler}>Apply & format</button>
      <button onClick={saveAndFormatAndCloseClickHandler}>
        Save & format & Close
      </button>
      <button onClick={closeClickHandler}>Close</button>
      <button onClick={toggleShowFunctionReference}>
        Reference documentation
      </button>
      <input
        type="checkbox"
        id={inputDebugId}
        checked={appDebugMode ?? false}
        onChange={onAppDebugModeChangeHandler}
      ></input>
      <label htmlFor={inputDebugId}>Debug</label>
    </div>
  );
}
