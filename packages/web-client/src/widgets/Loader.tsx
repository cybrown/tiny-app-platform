import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import { LoaderSize, Loader as ThemedLoader } from "../theme";

type LoaderProps = {
  ctx: RuntimeContext;
  primary?: boolean;
  secondary?: boolean;
  size?: LoaderSize;
  max?: number;
  value?: number;
};

export default function Loader({
  primary,
  secondary,
  size,
  value,
  max,
}: LoaderProps) {
  return (
    <ThemedLoader
      primary={primary}
      secondary={secondary}
      size={size}
      value={value}
      max={max}
    />
  );
}

export const LoaderDocumentation: WidgetDocumentation<LoaderProps> = {
  description: "Show a loading indicator",
  props: {
    primary: "Use primary style",
    secondary: "Use secondary style",
    size: "Size of the loader: sm, md (default), lg",
    max: "Maximum value, optional",
    value: "Current value, optional",
  },
};
