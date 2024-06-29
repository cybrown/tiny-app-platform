import { useCallback, useMemo, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import { FunctionDef } from "tal-eval/dist/core";
import { InputText, Link, Tabs, Text, View } from "../theme";

export default function Documentation({
  ctx,
  onWriteInEditor: writeInEditor,
}: {
  ctx: RuntimeContext;
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

  const [tabValue, setTabValue] = useState<"widgets" | "functions">("widgets");

  return (
    <View>
      <InputText
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search functions, widgets..."
      />
      <Tabs
        value={tabValue}
        onChange={setTabValue as any}
        tabs={[
          { label: "Widgets", value: "widgets" },
          { label: "Functions", value: "functions" },
        ]}
      />
      <div style={{ overflow: "auto" }}>
        {tabValue === "functions" ? (
          <View>
            {functionsData
              .filter(
                ([name]) =>
                  !searchTerm ||
                  searchTerm === "" ||
                  name
                    .toLocaleLowerCase()
                    .includes(searchTerm.toLocaleLowerCase())
              )
              .map(([name, doc]) => (
                <View key={name} layout="flex-column">
                  <View key={name} layout="flex-row">
                    <Text text={name} weight="bold" />
                    <Link
                      text="copy"
                      onClick={() =>
                        copyFunctionSnippet(writeInEditor, name, doc)
                      }
                    />
                  </View>
                  <ul style={{ paddingLeft: 16 }}>
                    {doc.map((d) => (
                      <li key={d.name}>
                        <Text text={d.name} />
                      </li>
                    ))}
                  </ul>
                </View>
              ))}
          </View>
        ) : (
          <View>
            {Object.entries(widgetsData)
              .filter(
                ([name]) =>
                  !searchTerm ||
                  searchTerm === "" ||
                  name
                    .toLocaleLowerCase()
                    .includes(searchTerm.toLocaleLowerCase())
              )
              .map(([name, documentation]) => (
                <div key={name}>
                  <View layout="flex-row">
                    <Text text={name} weight="bold" size={1.1} />
                    <Link
                      text="copy"
                      onClick={() =>
                        copyWidgetSnippet(writeInEditor, name, documentation)
                      }
                    />
                    <Text text={documentation.description} />
                  </View>
                  <ul style={{ paddingLeft: 16 }}>
                    {Object.entries(documentation.props).map(
                      ([name, description]) => (
                        <li key={name}>
                          <View layout="flex-row">
                            <Text text={name} weight="bold" />
                            <Text text={description} weight="light" />
                          </View>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ))}
          </View>
        )}
      </div>
    </View>
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
