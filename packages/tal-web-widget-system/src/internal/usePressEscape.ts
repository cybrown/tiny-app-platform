import { useEffect } from "react";

export default function usePressEscape(action: () => void) {
  useEffect(() => {
    function quitFullScreenEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        action();
      }
    }
    document.addEventListener("keydown", quitFullScreenEscape);
    return () => document.removeEventListener("keydown", quitFullScreenEscape);
  }, [action]);
}
