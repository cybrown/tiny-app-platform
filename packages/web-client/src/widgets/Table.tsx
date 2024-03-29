import { Closure, RuntimeContext, WidgetDocumentation } from "tal-eval";
import RenderExpression from "../runtime/RenderExpression";
import styles from "./Table.module.css";
import Debug from "./Debug";

type TableModelColumn =
  | ({
      useRemaining?: boolean;
      width?: string | number;
    } & (
      | {
          description: string;
          display?: Closure;
        }
      | {
          field: string;
        }
    ))
  | string;

type EffectiveTableModelColumn = {
  useRemaining?: boolean;
  width?: string | number;
  description: string;
  display?: Closure;
};

type TableProps = {
  ctx: RuntimeContext;
  values: unknown[];
  columns?: TableModelColumn[];
  bordered?: boolean;
  striped?: boolean;
  noHeader?: boolean;
  noHighlight?: boolean;
  _key?: Closure;
};

export default function Table({
  ctx,
  columns,
  values,
  bordered,
  striped = true,
  noHeader,
  noHighlight,
  _key,
}: TableProps) {
  let effectiveColumns: EffectiveTableModelColumn[] = [];
  if (!columns) {
    const columnsToAdd = new Set<string>();
    (values ?? []).forEach((value) => {
      if (value && typeof value == "object") {
        Object.keys(value).forEach((name) => columnsToAdd.add(name));
      }
    });
    columnsToAdd.forEach((name) => {
      effectiveColumns.push({ description: name });
    });
  } else {
    effectiveColumns = columns.map((col) => {
      if (typeof col == "string") {
        return {
          description: col,
        };
      } else if (typeof col == "object" && "field" in col) {
        return {
          description: col.field,
          useRemaining: col.useRemaining,
          width: col.width,
        };
      } else {
        return col;
      }
    });
  }

  const numberOfColsWithRemaining = effectiveColumns.filter(
    (col) => typeof col == "object" && col.useRemaining
  ).length;
  const remainingPercent =
    numberOfColsWithRemaining > 0 ? 100 / numberOfColsWithRemaining + "%" : "";

  return (
    <div className={styles.TableContainer}>
      {!_key ? (
        <div>
          Warning: No _key prop on Table widget, behavior may be undefined
        </div>
      ) : null}
      <table
        className={`${styles.Table} ${bordered ? styles.bordered : ""} ${
          striped ? styles.striped : ""
        } ${noHighlight ? "" : styles["highlight-on-hover"]}`}
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
              <tr key={_key ? (ctx.callFunction(_key, [value]) as any) : index}>
                {(effectiveColumns ?? []).map((col) => (
                  <td key={col.description}>
                    {col.display ? (
                      <RenderExpression
                        ctx={ctx}
                        evaluatedUI={ctx.callFunction(col.display, [value])}
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
    striped: "Alternate background color, default true",
    noHeader: "Skip the header",
    noHighlight: "Do not highlight rows on hover",
    _key: "A function to compute a key from a value",
  },
};
