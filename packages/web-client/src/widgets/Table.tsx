import { FunctionValue, RuntimeContext, WidgetDocumentation } from "tal-eval";
import RenderExpression from "../runtime/RenderExpression";
import styles from "./Table.module.css";
import Debug from "./Debug";

type TableModelColumn = {
  description: string;
  display: FunctionValue;
};

type TableProps = {
  ctx: RuntimeContext;
  values: unknown[];
  columns?: TableModelColumn[];
  bordered?: boolean;
  striped?: boolean;
  noHeader?: boolean;
};

export default function Table({
  ctx,
  columns,
  values,
  bordered,
  striped,
  noHeader,
}: TableProps) {
  let effectiveColumns: any[] = [];
  if (!columns) {
    const columnsToAdd = new Set<string>();
    values.forEach((value) => {
      if (value && typeof value == "object") {
        Object.keys(value).forEach((name) => columnsToAdd.add(name));
      }
    });
    columnsToAdd.forEach((name) => {
      effectiveColumns.push({ description: name });
    });
  } else {
    effectiveColumns = columns;
  }

  const numberOfColsWithRemaining = effectiveColumns.filter(
    (col) => col.useRemaining
  ).length;
  const remainingPercent =
    numberOfColsWithRemaining > 0 ? 100 / numberOfColsWithRemaining + "%" : "";

  return (
    <div className={styles.TableContainer}>
      <table
        className={`${styles.Table} ${bordered ? styles.bordered : ""} ${
          striped ? styles.striped : ""
        }`}
      >
        <colgroup>
          {effectiveColumns.map((col) => (
            <col
              key={col.description}
              span={1}
              style={{
                ...(col.width
                  ? {
                      minWidth: col.width,
                      width: col.width,
                    }
                  : {}),
                ...(col.useRemaining
                  ? {
                      width: remainingPercent,
                    }
                  : {}),
              }}
            />
          ))}
        </colgroup>
        {noHeader ? null : (
          <thead>
            <tr>
              {effectiveColumns.map((col) => (
                <th key={col.description}>{col.description}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {(values ?? []).map((value, index) => {
            return (
              <tr key={index}>
                {(effectiveColumns ?? []).map((col) => (
                  <td key={col.description}>
                    {col.display ? (
                      <RenderExpression
                        ctx={ctx}
                        expression={{
                          kind: "Value",
                          value: ctx.callFunction(col.display, [value]),
                        }}
                      />
                    ) : (value as any)[col.description] !== undefined ? (
                      <Debug value={(value as any)[col.description]} />
                    ) : null}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const TableDocumentation: WidgetDocumentation<TableProps> = {
  description: "Show data in form of a table, with customizable columns",
  props: {
    columns:
      "Column definition, array of description (string), display (function that takes one entry and renders its cell), width and useRemaining",
    values: "Array of entries",
    bordered: "Add borders",
    striped: "Alternate background color",
    noHeader: "Skip the header",
  },
};
