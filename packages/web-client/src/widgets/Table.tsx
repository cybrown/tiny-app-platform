import { Expression } from "tal-parser";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import RenderExpression from "../runtime/RenderExpression";
import styles from "./Table.module.css";

type TableModelColumn = {
  description: string;
  display: Expression;
};

type TableProps = {
  ctx: RuntimeContext;
  values: unknown[];
  columns: TableModelColumn[];
};

export default function Table({ ctx, columns, values }: TableProps) {
  return (
    <table className={styles.Table}>
      <thead>
        <tr>
          {(columns ?? []).map((col) => (
            <th key={col.description}>{col.description}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(values ?? []).map((value, index) => {
          return (
            <tr key={index}>
              {(columns ?? []).map((col) => (
                <td key={col.description}>
                  <RenderExpression
                    ctx={ctx}
                    expression={{
                      kind: "Value",
                      value: ctx.callFunction(col.display as any, [value]),
                    }}
                  />
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export const TableDocumentation: WidgetDocumentation<TableProps> = {
  description: "Show data in form of a table, with customizable columns",
  props: {
    columns:
      "Column definition, array of description (string) and display (function that takes one entry and renders its cell)",
    values: "Array of entries",
  },
};
