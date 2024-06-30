import { useCallback, useState } from "react";

export function useForceRender() {
  const [, set] = useState({});
  return useCallback(() => set({}), []);
}
