import React, { useEffect, useMemo, useRef } from "react";
import styles from "./LowLevelOverlay.module.css";
import ReactDOM from "react-dom";

const variantToClassName = {
  center: styles.center,
  left: styles.left,
  right: styles.right,
  top: styles.top,
  bottom: styles.bottom,
};

type LowLevelOverlayProps = {
  position?: string;
  modal?: boolean;
  size?: string;
  onClose?: () => void;
} & React.PropsWithChildren;

type CloseOverlayRef = {
  current?: () => void;
};

let escapeStack: CloseOverlayRef[] = [];
let escapeListenerRegistered = false;

function escapeListenerHandler(event: KeyboardEvent) {
  if (event.key === "Escape") {
    const onClose = escapeStack[escapeStack.length - 1];
    if (escapeStack.length === 0) {
      document.removeEventListener("keydown", escapeListenerHandler);
      escapeListenerRegistered = false;
    }
    if (!onClose) {
      return;
    }
    if (onClose.current) {
      onClose.current();
      event.preventDefault();
      event.stopPropagation();
    }
  }
}

function registerEscapeListener(callback: CloseOverlayRef) {
  escapeStack.push(callback);
  if (!escapeListenerRegistered) {
    document.addEventListener("keydown", escapeListenerHandler);
    escapeListenerRegistered = true;
  }
}

function unregisterEscapeListener(callback: CloseOverlayRef) {
  escapeStack = escapeStack.filter((a) => a !== callback);
}

export default function LowLevelOverlay({
  children,
  onClose,
  position,
  modal,
  size,
}: LowLevelOverlayProps) {
  const onCloseRef = useRef(onClose);
  const modalRef = useRef(modal);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const backdropElement = useMemo<HTMLDivElement | null>(() => {
    if (!modalRef.current) {
      return null;
    }
    const element = document.createElement("div");
    element.classList.add(styles.backdrop);
    element.addEventListener("click", () => {
      onCloseRef.current && onCloseRef.current();
    });
    document.getElementById("tap-overlays")!.appendChild(element);
    return element;
  }, []);

  const overlayElement = useMemo<HTMLDivElement>(() => {
    const element = document.createElement("div");

    if (onCloseRef.current) {
      registerEscapeListener(onCloseRef);
    }

    // Make element focusable
    element.setAttribute("tabindex", "0");
    element.focus();

    element.classList.add(styles.overlay);
    element.classList.add(
      (variantToClassName as any)[position ?? "center"] ?? styles.center
    );
    if (size) {
      element.classList.add(styles[size] ?? "");
    }
    document.getElementById("tap-overlays")!.appendChild(element);
    return element;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setTimeout(() => {
      backdropElement?.classList.add(styles.openVisible);
      overlayElement.classList.add(styles.openVisible);
    });

    return () => {
      unregisterEscapeListener(onCloseRef);
      backdropElement?.classList.remove(styles.openVisible);
      overlayElement.classList.remove(styles.openVisible);
      setTimeout(() => {
        backdropElement &&
          document.getElementById("tap-overlays")!.removeChild(backdropElement);
        document.getElementById("tap-overlays")!.removeChild(overlayElement);
      }, 150);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ReactDOM.createPortal(children, overlayElement);
}
