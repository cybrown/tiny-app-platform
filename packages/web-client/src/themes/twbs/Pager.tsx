import { useCallback } from "react";
import { PagerProps, PagerOnChangeAction } from "../../theme";

export default function Pager({
  firstState = "HIDDEN",
  lastState = "HIDDEN",
  previousState = "HIDDEN",
  nextState = "HIDDEN",
  values,
  onChange,
  value,
}: PagerProps) {
  const currentPage = value ?? 1;

  const updateValue = useCallback(
    (value: PagerOnChangeAction) => {
      onChange && onChange(value);
    },
    [onChange]
  );

  return (
    <ul className="pagination">
      {firstState !== "HIDDEN" ? (
        <li className="page-item">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            className={
              "page-link " + (firstState === "DISABLED" ? "disabled" : "")
            }
            href="#"
            onClick={(e) => {
              e.preventDefault();
              updateValue("FIRST");
            }}
          >
            {"<<"}
          </a>
        </li>
      ) : null}
      {previousState !== "HIDDEN" ? (
        <li className="page-item">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            className={
              "page-link " + (previousState === "DISABLED" ? "disabled" : "")
            }
            href="#"
            onClick={(e) => {
              e.preventDefault();
              updateValue("PREVIOUS");
            }}
          >
            {"<"}
          </a>
        </li>
      ) : null}
      {(values ?? []).map((index) => (
        <li className={"page-item " + (currentPage === index ? "active" : "")}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            className={"page-link"}
            onClick={(e) => {
              e.preventDefault();
              updateValue(index);
            }}
          >
            {index}
          </a>
        </li>
      ))}
      {nextState !== "HIDDEN" ? (
        <li className="page-item">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            className={
              "page-link " + (nextState === "DISABLED" ? "disabled" : "")
            }
            href="#"
            onClick={(e) => {
              e.preventDefault();
              updateValue("NEXT");
            }}
          >
            {">"}
          </a>
        </li>
      ) : null}
      {lastState !== "HIDDEN" ? (
        <li className="page-item">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            className={
              "page-link " + (lastState === "DISABLED" ? "disabled" : "")
            }
            href="#"
            onClick={(e) => {
              e.preventDefault();
              updateValue("LAST");
            }}
          >
            {">>"}
          </a>
        </li>
      ) : null}
    </ul>
  );
}
