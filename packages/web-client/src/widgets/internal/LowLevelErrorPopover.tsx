import { useEffect, useMemo } from "react";
import * as ReactDOM from "react-dom";

export type LowLevelErrorPopoverProps = {
  target?: HTMLDivElement | null;
} & React.PropsWithChildren;

const ARROW_SIZE = 12;
const TARGET_WIDTH = 3;

export default function LowLevelErrorPopover({
  target,
  children,
}: LowLevelErrorPopoverProps) {
  const popoverMainElement = useMemo<HTMLDivElement>(() => {
    const element = document.createElement("div");
    element.style.position = "fixed";
    element.style.maxWidth = "100vw";
    document.getElementById("tap-overlays")!.appendChild(element);
    return element;
  }, []);

  const popoverArrowElement = useMemo<HTMLDivElement>(() => {
    const element = document.createElement("div");
    element.style.position = "fixed";
    element.style.top = "4px";
    element.style.left = "4px";
    element.style.borderColor = "transparent";
    element.style.borderStyle = "solid";
    element.style.borderWidth = ARROW_SIZE + "px";
    element.style.borderBottomColor = "rgb(203, 37, 73)";
    document.getElementById("tap-overlays")!.appendChild(element);
    return element;
  }, []);

  const highlightElement = useMemo<HTMLDivElement>(() => {
    const element = document.createElement("div");
    element.style.position = "fixed";
    element.style.borderStyle = "solid";
    element.style.borderWidth = TARGET_WIDTH + "px";
    element.style.borderColor = "rgb(203, 37, 73)";
    element.style.pointerEvents = "none";
    document.getElementById("tap-overlays")!.appendChild(element);
    return element;
  }, []);

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

      const placeAboveTarget =
        window.innerHeight <
        targetRect.bottom + ARROW_SIZE + popoverRect.height;

      const left = Math.min(
        window.innerWidth - popoverRect.width,
        Math.max(
          0,
          targetRect.left + targetRect.width / 2 - popoverRect.width / 2
        )
      );

      if (placeAboveTarget) {
        popoverMainElement.style.top = `${
          Math.min(window.innerHeight, Math.max(0, targetRect.top)) -
          ARROW_SIZE -
          popoverRect.height +
          1
        }px`;
        popoverArrowElement.style.top = `${
          Math.min(window.innerHeight, Math.max(0, targetRect.top)) - ARROW_SIZE
        }px`;
        popoverArrowElement.style.transform = "rotate(180deg)";
      } else {
        popoverMainElement.style.top = `${
          Math.min(window.innerHeight, Math.max(0, targetRect.bottom)) +
          ARROW_SIZE -
          1
        }px`;
        popoverArrowElement.style.top = `${
          Math.min(window.innerHeight, Math.max(0, targetRect.bottom)) -
          ARROW_SIZE
        }px`;
        popoverArrowElement.style.transform = "";
      }

      highlightElement.style.top = `${targetRect.top - TARGET_WIDTH}px`;
      highlightElement.style.height = `${
        targetRect.height + TARGET_WIDTH * 2
      }px`;
      highlightElement.style.left = `${targetRect.left - TARGET_WIDTH}px`;
      highlightElement.style.width = `${targetRect.width + TARGET_WIDTH * 2}px`;

      popoverMainElement.style.left = `${left}px`;
      popoverArrowElement.style.left = `${
        targetRect.left + targetRect.width / 2 - ARROW_SIZE
      }px`;
    }

    requestAnimationFrame(updatePopoverPosition);

    return () => {
      doContinue = false;
      if (popoverArrowElement) {
        document
          .getElementById("tap-overlays")!
          .removeChild(popoverArrowElement);
      }
      if (popoverMainElement) {
        document
          .getElementById("tap-overlays")!
          .removeChild(popoverMainElement);
      }
      if (highlightElement) {
        document.getElementById("tap-overlays")!.removeChild(highlightElement);
      }
    };
  }, [target, popoverMainElement, popoverArrowElement, highlightElement]);

  return target ? ReactDOM.createPortal(children, popoverMainElement) : null;
}
