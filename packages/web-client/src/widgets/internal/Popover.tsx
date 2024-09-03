import { useEffect, useMemo } from "react";
import * as ReactDOM from "react-dom";

export type PopoverProps = {
  target?: HTMLDivElement | null;
  onKeepVisibleChange?(keepVisible: boolean): void;
} & React.PropsWithChildren;

export default function Popover({
  target,
  children,
  onKeepVisibleChange,
}: PopoverProps) {
  const popoverMainElement = useMemo<HTMLDivElement>(() => {
    const element = document.createElement("div");
    element.style.position = "fixed";
    element.style.maxWidth = "100vw";
    document.getElementById("tap-overlays")!.appendChild(element);
    return element;
  }, []);

  useEffect(() => {
    popoverMainElement.addEventListener("pointerenter", () => {
      if (onKeepVisibleChange) {
        onKeepVisibleChange(true);
      }
    });
    popoverMainElement.addEventListener("pointerleave", () => {
      if (onKeepVisibleChange) {
        onKeepVisibleChange(false);
      }
    });
  }, [popoverMainElement, onKeepVisibleChange]);

  useEffect(() => {
    let doContinue = true;
    let oldKey: Readonly<
      [number, number, number, number, number, number, number, number]
    > | null = null;

    function updatePopoverPosition() {
      if (doContinue) {
        requestAnimationFrame(updatePopoverPosition);
      }
      if (!target) {
        return;
      }

      const popoverRect = popoverMainElement.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      const key = [
        targetRect.top,
        targetRect.left,
        targetRect.width,
        targetRect.height,
        popoverRect.width,
        popoverRect.height,
        window.innerWidth,
        window.innerHeight,
      ] as const;

      if (oldKey) {
        let i = 0;
        for (i = 0; i < 8; i++) {
          if (key[i] !== oldKey[i]) {
            break;
          }
        }
        if (i === 8) return;
      }

      oldKey = key;

      const left = Math.min(
        window.innerWidth - popoverRect.width,
        Math.max(0, targetRect.left)
      );

      popoverMainElement.style.top = `${Math.min(
        window.innerHeight,
        Math.max(0, targetRect.top)
      )}px`;

      popoverMainElement.style.left = `${left}px`;
    }

    requestAnimationFrame(updatePopoverPosition);

    return () => {
      doContinue = false;

      popoverMainElement &&
        document
          .getElementById("tap-overlays")!
          .removeChild(popoverMainElement);
    };
  }, [target, popoverMainElement]);

  return target ? ReactDOM.createPortal(children, popoverMainElement) : null;
}
