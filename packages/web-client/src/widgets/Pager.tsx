import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import { AddressableExpression } from "tal-parser";
import StyledButton from "./internal/StyledButton";

type PagerProps = {
  ctx: RuntimeContext;
  bindTo: AddressableExpression;
  max: number;
  perPage: number;
};

export default function Pager({ ctx, bindTo, max, perPage }: PagerProps) {
  const currentPage = ctx.evaluate(bindTo) as any;
  const pages = [];
  const difference = 3;
  const maxPage = Math.ceil(max / perPage);
  let minToShow = Math.max(1, currentPage - difference);
  const maxToShow = Math.min(minToShow + difference * 2, maxPage);
  minToShow = Math.max(1, maxToShow - difference * 2);
  for (let i = minToShow; i <= maxToShow; i++) {
    pages.push(i);
  }
  return (
    <div>
      <StyledButton
        text="<<"
        secondary
        disabled={currentPage === 1}
        onClick={() => ctx.setValue(bindTo, 1)}
      />
      <StyledButton
        text="<"
        secondary
        disabled={currentPage === 1}
        onClick={() => ctx.setValue(bindTo, Math.max(1, currentPage - 1))}
      />
      {pages.map((index) => (
        <StyledButton
          key={index}
          text={index + ""}
          secondary={currentPage !== index}
          onClick={() => ctx.setValue(bindTo, index)}
        />
      ))}
      <StyledButton
        text=">"
        secondary
        disabled={currentPage === maxPage}
        onClick={() => ctx.setValue(bindTo, Math.min(maxPage, currentPage + 1))}
      />
      <StyledButton
        text=">>"
        secondary
        disabled={currentPage === maxPage}
        onClick={() => ctx.setValue(bindTo, maxPage)}
      />
    </div>
  );
}

export const PagerDocumentation: WidgetDocumentation<PagerProps> = {
  description: "Select a page in a paginated data source",
  props: {
    bindTo: "Current page",
    max: "Maximum page number",
    perPage: "Elements fetched per page",
  },
};
