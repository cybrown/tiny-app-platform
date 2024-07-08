import { useCallback, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import { NodeLocation, FunctionNode } from "tal-parser";
import { APP_DEBUG_MODE_ENV } from "../runtime/constants";
import styles from "./Debug.module.css";

type DebugProps = {
  ctx?: RuntimeContext;
  value: unknown;
  force?: boolean;
  extend?: number;
};

export default function Debug({ ctx, value, force, extend }: DebugProps) {
  // If ctx is null, the value is a raw value to show to the user
  if (force || !ctx || ctx.getLocalOr(APP_DEBUG_MODE_ENV, false)) {
    return (
      <div className={styles.Debug}>
        <RenderAny value={value} path="" extended={extend} />
      </div>
    );
  }
  return null;
}

function RenderAny({
  value,
  path,
  extended,
}: {
  value: unknown;
  path: string;
  extended?: number;
}): any {
  if (value === null) {
    return <span>null</span>;
  } else if (value === undefined) {
    return <span>undefined</span>;
  } else if (Array.isArray(value)) {
    return <RenderArray value={value} path={path} extended={extended} />;
  } else if (typeof value === "object") {
    if ("kind" in value && typeof value.kind === "string") {
      const kind = value.kind;
      if (typeof kind == "string") {
        return <RenderKindedRecord value={value} path={path} kind={kind} />;
      }
    }
    return <RenderObject value={value} path={path} extended={extended} />;
  } else if (["string", "number", "boolean"].includes(typeof value)) {
    const valueAsJson = JSON.stringify(value);
    const hasMore = valueAsJson.length > 250;
    return (
      <CopyOnClick value={typeof value === "string" ? value : valueAsJson}>
        {valueAsJson.slice(0, 250) + (hasMore ? " truncated..." : "")}
      </CopyOnClick>
    );
  } else if (typeof value == "function") {
    return (
      <span>native function {value.name ? "'" + value.name + "'" : ""}</span>
    );
  } else {
    console.log("Failed to render", value);
    return <span>Failed to render, check console</span>;
  }
}

function useIsOpen(defaultValue?: boolean) {
  const [isOpen, setIsOpen] = useState(defaultValue ?? false);
  const toggleIsOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);
  return [isOpen, toggleIsOpen] as const;
}

function RenderArray({
  value,
  path,
  extended,
}: {
  value: unknown[];
  path: string;
  extended?: number;
}) {
  const [isOpen, toggleIsOpen] = useIsOpen(!!extended);
  const [showAll, setShowAll] = useState(false);
  const handleClickMore = useCallback(() => {
    setShowAll(true);
  }, []);

  return (
    <span>
      <span onClick={toggleIsOpen}>
        {isOpen ? "🔽" : "▶️"}[{value.length}]
      </span>
      {isOpen ? (
        <>
          <div className={styles.offseted}>
            {(showAll ? value : value.slice(0, 10)).map((sub, i) => (
              <div key={i}>
                <CopyOnClick value={path + "[" + i + "]"}>{i}</CopyOnClick>:{" "}
                <RenderAny
                  value={sub}
                  path={path + "[" + i + "]"}
                  extended={extended ? extended - 1 : undefined}
                />
              </div>
            ))}
            {value.length > 10 && !showAll ? (
              <div onClick={handleClickMore}>
                more... (click to show all entries)
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </span>
  );
}

function RenderKindedRecord({
  value,
  path,
  kind,
}: {
  value: object;
  kind: string;
  path: string;
}) {
  switch (kind) {
    case "Function":
      const func = value as FunctionNode & {
        location: NodeLocation;
      }; // TODO: Find a better way to pass expression nodes
      return (
        <span>
          Function ({func.parameters.join(", ")}) defined at location{" "}
          {func.location.start.line}:{func.location.start.column}
        </span>
      );
  }
  if (
    "location" in value &&
    value.location &&
    typeof value.location == "object" &&
    "start" in value.location &&
    value.location.start &&
    typeof value.location.start == "object" &&
    "line" in value.location.start &&
    "column" in value.location.start &&
    typeof value.location.start.line == "number" &&
    typeof value.location.start.column == "number"
  ) {
    return (
      <span>
        {kind} defined at location {value.location.start.line}:
        {value.location.start.column}
      </span>
    );
  } else {
    return <span>{kind}</span>;
  }
}

function RenderObject({
  value,
  path,
  extended,
}: {
  value: object;
  path: string;
  extended?: number;
}) {
  const [isOpen, toggleIsOpen] = useIsOpen(!!extended);
  return (
    <span>
      <span onClick={toggleIsOpen}>
        {isOpen ? "🔽" : "▶️"}
        {getConstructorName(value)}
        {"{"}
        {returnKeysDescription(value)}
        {"}"}
      </span>
      {isOpen ? (
        <div className={styles.offseted}>
          {Object.entries(value).map(([key, sub]) => (
            <div key={key}>
              <CopyOnClick value={(path !== "" ? path + "." : "") + key}>
                {key}
              </CopyOnClick>
              :{" "}
              <RenderAny
                value={sub}
                path={(path !== "" ? path + "." : "") + key}
                extended={extended ? extended - 1 : undefined}
              />
            </div>
          ))}
        </div>
      ) : null}
    </span>
  );
}

function getConstructorName(value: any) {
  try {
    if (Object.getPrototypeOf(value).constructor !== Object) {
      return Object.getPrototypeOf(value).constructor.name + " ";
    }
  } catch (err) {
    return "";
  }
}

function returnKeysDescription(value: object): string {
  const keys = Object.keys(value);
  const keysToDisplay = keys.slice(0, 3);
  if (keys.length === 0) {
    return "";
  } else {
    return keysToDisplay.join(", ") + (keys.length > 3 ? ", ..." : "");
  }
}

function CopyOnClick({
  children,
  value,
}: React.PropsWithChildren<{
  value: string;
}>) {
  const handleClick = useCallback(() => {
    navigator.clipboard.writeText(value);
  }, [value]);
  return <span onClick={handleClick}>{children}</span>;
}

export const DebugDocumentation: WidgetDocumentation<DebugProps> = {
  description:
    "Inspect a value, hidden by default, use the debug checkbox in the dev tools to show it. Mainly for debugging purposes",
  props: {
    value: "Value to inspect, when debug env is true",
    force: "Force enable debug mode locally",
    extend: "Number of levels to extends by default",
  },
};
