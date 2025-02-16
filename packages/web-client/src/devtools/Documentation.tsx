import { useCallback, useMemo, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import { InputText, Link, Tabs, Text, View } from "../theme";
import { RegisterableFunction } from "tal-eval";

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
        ([, value]) =>
          value != null &&
          typeof value == "object" &&
          (("call" in value && typeof value.call == "function") ||
            ("callAsync" in value && typeof value.callAsync == "function"))
      )
      .map(([name, value]) => {
        return [name, value as RegisterableFunction<any>] as const;
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
              .map(([name, registerableFunction]) => (
                <View key={name} layout="flex-column">
                  <View key={name} layout="flex-row">
                    <Text text={name} weight="bold" />
                    {registerableFunction.documentation ? (
                      <Text
                        text={registerableFunction.documentation?.description}
                      />
                    ) : null}
                  </View>
                  <Link
                    text="Insert in editor"
                    url="#"
                    onClick={() =>
                      copyFunctionSnippet(
                        writeInEditor,
                        name,
                        registerableFunction
                      )
                    }
                  />
                  {registerableFunction.documentation ? (
                    <Text
                      text={
                        "Returns: " +
                        registerableFunction.documentation?.returns
                      }
                    />
                  ) : null}
                  {registerableFunction.documentation ? (
                    <ul style={{ paddingLeft: 16 }}>
                      {Object.entries(
                        registerableFunction.documentation.parameters
                      ).map(([name, description]) => (
                        <li key={name}>
                          <View layout="flex-row">
                            <Text text={name} weight="bold" />
                            <Text text={description} />
                          </View>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul style={{ paddingLeft: 16 }}>
                      {registerableFunction.parameters.map((d) => (
                        <li key={d.name}>
                          <Text text={d.name} />
                        </li>
                      ))}
                    </ul>
                  )}
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
                    <Text text={documentation.description} />
                  </View>
                  <Link
                    text="Insert in editor"
                    url="#"
                    onClick={() =>
                      copyWidgetSnippet(writeInEditor, name, documentation)
                    }
                  />
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
  registerableFunction: RegisterableFunction<any>
): void {
  writeInEditor(
    name +
      "(" +
      registerableFunction.parameters
        .map(
          (parameterDeclaration) =>
            parameterDeclaration.name +
            ": " +
            (registerableFunction.documentation?.parameterExamples?.[
              parameterDeclaration.name
            ] ?? "null")
        )
        .join(", ") +
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
