import React, { useEffect, useState } from "react";
import { useContext } from "react";

export function OverlayPlaceholder() {
  const ctx = useContext(OverlayContext);

  if (ctx.currentOverlay) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50vh",
            left: "50vw",
            transform: "translateX(-50%) translateY(-50%)",
          }}
        >
          {ctx.currentOverlay.content}
        </div>
      </div>
    );
  }
  return null;
}

export function OverlayProvider({ children }: React.PropsWithChildren) {
  const [dummy, setDummy] = useState<OverlayContent | null>(null);
  return (
    <OverlayContext.Provider
      value={{
        currentOverlay: dummy,
        setOverlayContent: setDummy,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
}

function useSetOverlayContent() {
  return useContext(OverlayContext).setOverlayContent;
}

export function Overlay({ children }: React.PropsWithChildren) {
  const setOverlayContent = useSetOverlayContent();
  useEffect(() => {
    setOverlayContent({
      content: children,
    });
    return () => {
      setOverlayContent(null);
    };
  }, [children, setOverlayContent]);
  return null;
}

interface OverlayContent {
  content: React.ReactNode;
}

interface OverlayContextState {
  currentOverlay: OverlayContent | null;
  setOverlayContent(children: OverlayContent | null): void;
}

const OverlayContext = React.createContext<OverlayContextState>({
  currentOverlay: null,
  setOverlayContent() {},
});
