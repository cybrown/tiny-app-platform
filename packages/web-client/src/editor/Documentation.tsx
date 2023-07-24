import { useCallback, useMemo, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";

export default function Documentation({
  ctx,
  onClose,
  writeInEditor,
}: {
  ctx: RuntimeContext;
  onClose: () => void;
  writeInEditor(text: string): void;
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
            <div
              key={name}
              onClick={() => copyFunctionSnippet(writeInEditor, name, doc)}
            >
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
              onClick={() =>
                copyWidgetSnippet(writeInEditor, name, documentation)
              }
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

function copyFunctionSnippet(
  writeInEditor: (text: string) => void,
  name: string,
  documentation: any[]
): void {
  writeInEditor(
    name +
      "(" +
      documentation.map(({ name }) => name + ": null").join(", ") +
      ")"
  );
}

function copyWidgetSnippet(
  writeInEditor: (text: string) => void,
  name: string,
  documentation: WidgetDocumentation<any>
): void {
  writeInEditor(
    name +
      " { " +
      Object.entries(documentation.props)
        .map(([name]) => name + ": null")
        .join(", ") +
      " }"
  );
}
