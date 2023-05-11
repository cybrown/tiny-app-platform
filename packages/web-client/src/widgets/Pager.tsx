import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import StyledButton from "./internal/StyledButton";
import { useCallback } from "react";
import { InputProps, InputPropsDocs } from "./internal/inputProps";

type PagerProps = {
  ctx: RuntimeContext;
  max: number;
  perPage: number;
} & InputProps<number>;

export default function Pager({
  ctx,
  bindTo,
  max,
  perPage,
  onChange,
  value,
}: PagerProps) {
  const currentPage = bindTo ? (ctx.evaluate(bindTo) as any) : value;
  const pages = [];
  const difference = 3;
  const maxPage = Math.ceil(max / perPage);
  let minToShow = Math.max(1, currentPage - difference);
  const maxToShow = Math.min(minToShow + difference * 2, maxPage);
  minToShow = Math.max(1, maxToShow - difference * 2);
  for (let i = minToShow; i <= maxToShow; i++) {
    pages.push(i);
  }

  const updateValue = useCallback(
    (value: number) => {
      if (bindTo) {
        ctx.setValue(bindTo, value);
      }
      if (onChange) {
        ctx.callFunctionAsync(onChange, [value]);
      }
    },
    [bindTo, ctx, onChange]
  );

  return (
    <div>
      <StyledButton
        text="<<"
        secondary
        disabled={currentPage === 1}
        onClick={() => updateValue(1)}
      />
      <StyledButton
        text="<"
        secondary
        disabled={currentPage === 1}
        onClick={() => updateValue(Math.max(1, currentPage - 1))}
      />
      {pages.map((index) => (
        <StyledButton
          key={index}
          text={index + ""}
          secondary={currentPage !== index}
          onClick={() => updateValue(index)}
        />
      ))}
      <StyledButton
        text=">"
        secondary
        disabled={currentPage === maxPage}
        onClick={() => updateValue(Math.min(maxPage, currentPage + 1))}
      />
      <StyledButton
        text=">>"
        secondary
        disabled={currentPage === maxPage}
        onClick={() => updateValue(maxPage)}
      />
    </div>
  );
}

export const PagerDocumentation: WidgetDocumentation<PagerProps> = {
  description: "Select a page in a paginated data source",
  props: {
    max: "Maximum page number",
    perPage: "Elements fetched per page",
    ...InputPropsDocs,
  },
};
