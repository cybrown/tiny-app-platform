import { useMemo } from "react";

export function useMakeId() {
  return useMemo(() => Math.random().toString(), []);
}
