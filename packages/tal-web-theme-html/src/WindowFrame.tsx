import { WindowFrameProps, useTheme } from "tal-web-theme-api";

export function WindowFrame({ children }: WindowFrameProps) {
  const theme = useTheme();
  return (
    <div style={{ backgroundColor: theme.colors.background }}>{children}</div>
  );
}
