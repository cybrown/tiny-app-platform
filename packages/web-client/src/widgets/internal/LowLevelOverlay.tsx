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
