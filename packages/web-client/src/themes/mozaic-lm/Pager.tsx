import { useCallback, useMemo } from "react";
import { PagerProps } from "../../theme";
import Select from "./Select";

export default function Pager(props: PagerProps) {
  const { value, onChange, lastIndex, disabled } = props;

  const values = useMemo(() => {
    if (lastIndex === 1) {
      return [1];
    }
    const result = [];
    for (let i = 1; i <= lastIndex; i++) {
      result.push(i);
    }
    return result;
  }, [lastIndex]);

  const updateValue = useCallback(
    (value: number) => {
      onChange && onChange(value + 1);
    },
    [onChange]
  );

  const goPrevious = useCallback(() => {
    onChange && onChange("PREVIOUS");
  }, [onChange]);

  const goNext = useCallback(() => {
    onChange && onChange("NEXT");
  }, [onChange]);

  return (
    <nav className="mc-pagination" role="navigation" aria-label="pagination">
      <button
        className="mc-button mc-button--solid-neutral mc-button--square mc-button--s@from-l"
        aria-label="Previous page"
        onClick={goPrevious}
        disabled={disabled || value === 1}
      >
        {"<"}
      </button>

      <div className="mc-pagination__field">
        <Select
          value={"" + value}
          onChange={updateValue}
          options={(values ?? []).map((value) => ({
            label: `Page ${value} of ${lastIndex}`,
            value: "" + value,
          }))}
          disabled={disabled}
        />
      </div>

      <button
        type="button"
        className="mc-button mc-button--solid-neutral mc-button--square mc-button--s@from-l"
        aria-label="Next Page"
        onClick={goNext}
        disabled={disabled || value === lastIndex}
      >
        {">"}
      </button>
    </nav>
  );
}
