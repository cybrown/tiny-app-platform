import { TableProps } from "../../theme";
import styles from "./Table.module.css";

export default function Table({
  titles,
  rows,
  bordered,
  striped = true,
  noHeader,
  noHighlight,
}: TableProps) {
  return (
    <table
      className={`nes-table ${styles.Table} ${bordered ? "is-bordered" : ""} ${
        striped ? styles.striped : ""
      } ${noHighlight ? "" : styles["highlight-on-hover"]}`}
    >
      <colgroup>
        {titles.map((title) => (
          <col
            key={title.text}
            span={1}
            style={{
              ...(title.width
                ? {
                    minWidth: title.width,
                    width: title.width,
                  }
                : {}),
              /*
              ...(title.remainingPercent
                ? {
                    width: title.remainingPercent,
                  }
                : {}),
                */
            }}
          />
        ))}
      </colgroup>
      {noHeader ? null : (
        <thead>
          <tr>
            {titles.map((title) => (
              <th key={title.text}>{title.text}</th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            {row.cells.map((cell, index) => (
              <td key={index}>{cell.content}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
