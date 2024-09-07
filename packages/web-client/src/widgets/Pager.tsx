import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import { useCallback } from "react";
import { InputProps, InputPropsDocs } from "./internal/inputProps";
import SemanticPager from "./semantic/Pager";

type PagerProps = {
  ctx: RuntimeContext;
  max: number;
  perPage: number;
  showPrevNext?: boolean;
  size?: number;
} & InputProps<number>;

export default function Pager({ ctx, onChange, ...commonProps }: PagerProps) {
  const onChangeHandler = useCallback(
    (newValue: number) => {
      if (!onChange) return;
      return ctx.callFunctionAsync(onChange, [newValue]);
    },
    [ctx, onChange]
  );

  return <SemanticPager onChange={onChangeHandler} {...commonProps} />;
}

export const PagerDocumentation: WidgetDocumentation<PagerProps> = {
  description: "Select a page in a paginated data source",
  props: {
    max: "Maximum page number",
    perPage: "Elements fetched per page",
    showPrevNext: "Show previous and next buttons",
    size: "Number of pages to show before and after current",
    ...InputPropsDocs,
  },
};
