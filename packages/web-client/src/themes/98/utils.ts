import { useRef } from "react";

export function useMakeId() {
  const ref = useRef(Math.random().toString());
  return ref.current;
}
