import { TableProps } from "../../theme";

export default function Table({ titles, rows, noHeader }: TableProps) {
  return (
    <div className="mc-datatable">
      <div className="mc-datatable__container">
        <div className="mc-datatable__main">
          <table className="mc-datatable__table">
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
                  {titles.map((title) => (
                    <th scope="col" key={title.text}>
                      <span className="mc-datatable__head-label">
                        {title.text}
                      </span>
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
        </div>
      </div>
    </div>
  );
}
