import { WindowFrameProps, useTheme } from "../../theme";

export function WindowFrame({ children }: WindowFrameProps) {
  const theme = useTheme();
  return (
    <div style={{ backgroundColor: theme.colors.background }}>{children}</div>
  );
}
