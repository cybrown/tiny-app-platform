import { Closure, RuntimeContext, WidgetDocumentation } from "tal-eval";
import RenderExpression from "../runtime/RenderExpression";
import styles from "./Table.module.css";
import Debug from "./Debug";
import { Table as ThemedTable } from "../theme";
import { APP_DEBUG_MODE_ENV } from "../runtime/constants";
import { useState } from "react";

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
  | string
  | null;

type EffectiveTableModelColumn = {
  useRemaining?: boolean;
  width?: string | number;
  description: string;
  display?: Closure;
  sort?: Closure | string;
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
      effectiveColumns.push({ description: name, sort: name });
    });
  } else {
    effectiveColumns = columns
      .filter((col) => col != null)
      .map((col) => {
        if (typeof col == "string") {
          return {
            description: col,
            sort: col,
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

  const [sortColumn, setSortColumn] = useState<[number, 1 | -1] | null>(null);

  let rowsToRender = (values ?? []).map((value, index) => {
    const sort = sortColumn && (effectiveColumns ?? [])[sortColumn[0]]?.sort;
    return {
      key: _key ? (ctx.callFunction(_key, [value]) as any) : index,
      sortValue:
        typeof sort === "string"
          ? (value as any)[sort]
          : sort
          ? ctx.callFunction(sort, [value])
          : null,
      cells: (effectiveColumns ?? []).map((col) => ({
        content: col.display ? (
          <RenderExpression
            ctx={ctx}
            ui={ctx.callFunction(col.display, [value])}
          />
        ) : (value as any)[col.description] !== undefined ? (
          <Debug value={(value as any)[col.description]} />
        ) : null,
      })),
    };
  });

  if (sortColumn) {
    rowsToRender = rowsToRender.sort((a, b) => {
      if (a.sortValue == b.sortValue) return 0;
      return (
        -1 *
        ((a.sortValue as any) < (b.sortValue as any) ? 1 : -1) *
        sortColumn[1]
      );
    });
  }

  return (
    <div className={styles.TableContainer}>
      {!_key ? (
        <div>
          Warning: No _key prop on Table widget, behavior may be undefined
        </div>
      ) : null}
      <ThemedTable
        bordered={bordered}
        noHeader={noHeader}
        noHighlight={noHighlight}
        striped={striped}
        titles={effectiveColumns.map((col, index) => ({
          text:
            col.description +
            (sortColumn?.[0] === index
              ? sortColumn[1] === 1
                ? " ▲"
                : " ▼"
              : ""),
          width: col.width,
          remainingPercent: col.useRemaining ? remainingPercent : null,
        }))}
        onTitleClick={(index) => {
          if (effectiveColumns[index].sort == null) return;
          if (sortColumn?.[0] === index) {
            if (sortColumn[1] === 1) {
              setSortColumn([index, -1]);
            } else {
              setSortColumn(null);
            }
          } else {
            setSortColumn([index, 1]);
          }
        }}
        rows={rowsToRender}
      />
      {ctx.getLocalOr(APP_DEBUG_MODE_ENV, false) ? (
        <Debug value={values} />
      ) : null}
    </div>
  );
}

export const TableDocumentation: WidgetDocumentation<TableProps> = {
  description: "Show data in form of a table, with customizable columns",
  props: {
    columns:
      "Column definition, array of description (string), display (function that takes one entry and renders its cell), sort (function that takes one entry and returns the sortable value), width and useRemaining",
    values: "Array of entries",
    bordered: "Add borders",
    striped: "Alternate background color, default true",
    noHeader: "Skip the header",
    noHighlight: "Do not highlight rows on hover",
    _key: "A function to compute a key from a value",
  },
};
