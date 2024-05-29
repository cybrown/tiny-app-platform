import React, { useEffect, useMemo, useRef } from "react";
import styles from "./LowLevelModal.module.css";
import ReactDOM from "react-dom";

const variantToClassName = {
  center: styles.center,
  left: styles.left,
  right: styles.right,
  top: styles.top,
  bottom: styles.bottom,
};

type LowLevelModalProps = {
  position?: string;
  hasBackdrop?: boolean;
  size?: string;
  onClose?: () => void;
} & React.PropsWithChildren;

export default function LowLevelModal({
  children,
  onClose,
  position,
  hasBackdrop,
  size,
}: LowLevelModalProps) {
  const onCloseRef = useRef(onClose);
  const hasBackdropRef = useRef(hasBackdrop);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const backdropElement = useMemo<HTMLDivElement | null>(() => {
    if (!hasBackdropRef.current) {
      return null;
    }
    const element = document.createElement("div");
    element.classList.add(styles.backdrop);
    element.addEventListener("click", () => {
      onCloseRef.current && onCloseRef.current();
    });
    document.body.appendChild(element);
    return element;
  }, []);

  const modalElement = useMemo<HTMLDivElement>(() => {
    const element = document.createElement("div");
    element.classList.add(styles.modal);
    element.classList.add(
      (variantToClassName as any)[position ?? "center"] ?? styles.center
    );
    if (size) {
      element.classList.add(styles[size] ?? "");
    }
    document.body.appendChild(element);
    return element;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setTimeout(() => {
      backdropElement?.classList.add(styles.openVisible);
      modalElement.classList.add(styles.openVisible);
    });

    return () => {
      backdropElement?.classList.remove(styles.openVisible);
      modalElement.classList.remove(styles.openVisible);
      setTimeout(() => {
        backdropElement && document.body.removeChild(backdropElement);
        document.body.removeChild(modalElement);
      }, 150);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ReactDOM.createPortal(children, modalElement);
}
