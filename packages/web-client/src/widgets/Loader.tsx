import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import { LoaderSize, Loader as ThemedLoader } from "../theme";

type LoaderProps = {
  ctx: RuntimeContext;
  primary?: boolean;
  secondary?: boolean;
  size?: LoaderSize;
};

export default function Loader({ primary, secondary, size }: LoaderProps) {
  return <ThemedLoader primary={primary} secondary={secondary} size={size} />;
}

export const LoaderDocumentation: WidgetDocumentation<LoaderProps> = {
  description: "Show a loading indicator",
  props: {
    primary: "Use primary style",
    secondary: "Use secondary style",
    size: "Size of the loader: sm, md (default), lg",
  },
};
