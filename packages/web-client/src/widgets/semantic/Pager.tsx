import { useCallback, useRef, useState } from "react";
import { BaseInputProps } from "../internal/inputProps";
import ErrorPopover from "../internal/ErrorPopover";
import { PagerOnChangeAction, Pager as ThemedPager } from "../../theme";
import commonStyles from "./common.module.css";

type PagerProps = {
  max: number;
  perPage: number;
  showPrevNext?: boolean;
  size?: number;
} & BaseInputProps<number>;

export default function Pager({
  max,
  perPage,
  onChange,
  value,
  disabled,
  showPrevNext,
  size,
}: PagerProps) {
  const currentPage = value;
  const pages = [];
  const difference = size ?? 3;
  const maxPage = Math.ceil(max / perPage);
  let minToShow = Math.max(1, currentPage - difference);
  const maxToShow = Math.min(minToShow + difference * 2, maxPage);
  minToShow = Math.max(1, maxToShow - difference * 2);
  for (let i = minToShow; i <= maxToShow; i++) {
    pages.push(i);
  }

  const [lastError, setLastError] = useState(null as any);

  const updateValue = useCallback(
    async (value: number) => {
      if (!onChange) return;
      try {
        await onChange(value);
      } catch (err) {
        setLastError(err);
      }
    },
    [onChange]
  );

  const onChangeHandler = useCallback(
    (change: PagerOnChangeAction) => {
      switch (change) {
        case "FIRST":
          updateValue(1);
          break;
        case "PREVIOUS":
          updateValue(Math.max(1, currentPage - 1));
          break;
        case "NEXT":
          updateValue(Math.min(maxPage, currentPage + 1));
          break;
        case "LAST":
          updateValue(maxPage);
          break;
        default:
          updateValue(change);
          break;
      }
    },
    [currentPage, maxPage, updateValue]
  );

  const popoverTargetRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={commonStyles.refWrapper} ref={popoverTargetRef}>
      <ThemedPager
        firstState={currentPage === 1 ? "DISABLED" : "ENABLED"}
        previousState={
          showPrevNext ? (currentPage === 1 ? "DISABLED" : "ENABLED") : "HIDDEN"
        }
        disabled={disabled}
        lastState={currentPage === maxPage ? "DISABLED" : "ENABLED"}
        nextState={
          showPrevNext
            ? currentPage === maxPage
              ? "DISABLED"
              : "ENABLED"
            : "HIDDEN"
        }
        values={pages}
        value={currentPage}
        onChange={onChangeHandler}
        lastIndex={maxPage}
        size={difference}
      />
      <ErrorPopover
        target={popoverTargetRef.current}
        lastError={lastError}
        setLastError={setLastError}
      />
    </div>
  );
}
