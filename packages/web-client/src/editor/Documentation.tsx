import { useCallback, useMemo, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import { FunctionDef } from "tal-eval/dist/core";
import { Button, InputText, Text } from "../theme";

export default function Documentation({
  ctx,
  onClose,
  onWriteInEditor: writeInEditor,
}: {
  ctx: RuntimeContext;
  onClose(): void;
  onWriteInEditor(text: string): void;
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
          (("call" in value && typeof value.call == "function") ||
            ("callAsync" in value && typeof value.callAsync == "function"))
      )
      .map(([name, value]) => {
        const parameters = (value as FunctionDef).parameters;
        return [name, parameters] as const;
      });
  }, [ctx]);

  const [searchTerm, setSearchTerm] = useState("");

  const onSearchChange = useCallback((searchString: string) => {
    setSearchTerm(searchString);
  }, []);

  return (
    <div>
      <div style={{ display: "flex" }}>
        <Text text="Search :" />
        <InputText value={searchTerm} onChange={onSearchChange} />
        <Button onClick={onClose} text="Close" />
      </div>
      <div style={{ overflow: "auto" }}>
        <Text text="Functions" size={1.4} />
        <Text text="Click on any function to copy a code snippet" />
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
              <Text text={name} weight="bold" />
              <ul style={{ paddingLeft: 16 }}>
                {doc.map((d) => (
                  <li key={d.name}>
                    <Text text={d.name} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        <Text text="Widgets" size={1.4} />
        <Text text="Click on any widget to copy a code snippet" />
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
              <div style={{ display: "flex" }}>
                <Text text={name + ":\u00A0"} weight="bold" size={1.1} />
                <Text text={documentation.description} />
              </div>
              <ul style={{ paddingLeft: 16 }}>
                {Object.entries(documentation.props).map(
                  ([name, description]) => (
                    <li key={name}>
                      <div style={{ display: "flex" }}>
                        <Text text={name + ":\u00A0"} weight="bold" />
                        <Text text={description} weight="light" />
                      </div>
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
