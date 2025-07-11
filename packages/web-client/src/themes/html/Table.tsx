import { TableProps, Text } from "../../theme";
import styles from "./Table.module.css";

export default function Table({
  titles,
  rows,
  bordered,
  striped = true,
  noHeader,
  noHighlight,
  onTitleClick,
}: TableProps) {
  return (
    <table
      className={`${styles.Table} ${bordered ? styles.bordered : ""} ${
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
              ...(title.remainingPercent
                ? {
                    width: title.remainingPercent,
                  }
                : {}),
            }}
          />
        ))}
      </colgroup>
      {noHeader ? null : (
        <thead>
          <tr>
            {titles.map((title, index) => (
              <th
                key={title.text}
                onClick={() => onTitleClick && onTitleClick(index)}
              >
                <Text text={title.text} weight="bold" />
              </th>
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
