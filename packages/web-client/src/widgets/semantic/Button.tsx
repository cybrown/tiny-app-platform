import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConfirmPopup from "../internal/ConfirmPopup";
import ErrorPopover from "../internal/ErrorPopover";
import { Link, Button as ThemedButton } from "../../theme";
import commonStyles from "./common.module.css";

type ButtonProps = {
  onClick?: () => unknown;
  text: string;
  confirm?: string | boolean;
  secondary?: boolean;
  disabled?: boolean;
  outline?: boolean;
  link?: boolean;
  shortcut?: string;
};

// TODO: Allow same shortcuts for different modals ?
// TODO: Allow modifiers
const enabledShortcuts: Set<string> = new Set();

function shouldTriggerEvent(e: KeyboardEvent, shortcut: string): boolean {
  try {
    const tagName = (e.target as any).tagName;
    if (tagName === "INPUT" || tagName === "TEXTAREA") return false;
  } catch {}
  if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return false;
  return shortcut.toLocaleLowerCase() === e.key.toLocaleLowerCase();
}

export default function Button({
  onClick,
  text,
  confirm,
  secondary,
  disabled,
  outline,
  link,
  shortcut,
}: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const doClickAction = useCallback(() => {
    if (isLoading) return;
    (async () => {
      if (!onClick) return;
      try {
        setLastError(null);
        const evaluationPromise = onClick();
        setIsLoading(true);
        await evaluationPromise;
      } catch (err) {
        setLastError(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [onClick, isLoading]);

  useEffect(() => {
    if (!shortcut || !shortcut.length || disabled) return;
    if (enabledShortcuts.has(shortcut)) {
      throw new Error("Shortcut already assigned: " + shortcut);
    }
    const handler = (e: KeyboardEvent) => {
      if (shouldTriggerEvent(e, shortcut) && onClick) {
        doClickAction();
      }
    };
    enabledShortcuts.add(shortcut);
    document.addEventListener("keypress", handler);
    return () => {
      enabledShortcuts.delete(shortcut);
      document.removeEventListener("keypress", handler);
    };
  }, [doClickAction, onClick, shortcut, disabled]);

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const clickHandler = useCallback(() => {
    if (confirm) {
      setShowConfirmPopup(true);
    } else {
      doClickAction();
    }
  }, [confirm, doClickAction]);

  const [lastError, setLastError] = useState(null as any);

  const popoverTargetRef = useRef<HTMLDivElement | null>(null);

  const textToDisplay = useMemo(
    () => (shortcut ? text + " (" + shortcut.toUpperCase() + ")" : text),
    [text, shortcut]
  );

  return (
    <div className={commonStyles.refWrapper} ref={popoverTargetRef}>
      <ConfirmPopup
        show={showConfirmPopup}
        setShow={setShowConfirmPopup}
        confirm={confirm}
        onOk={doClickAction}
      />
      {link ? (
        <Link
          text={textToDisplay}
          onClick={disabled ? undefined : clickHandler}
          disabled={disabled}
          url="#default"
          secondary={secondary}
        />
      ) : (
        <ThemedButton
          onClick={clickHandler}
          disabled={disabled || isLoading}
          text={textToDisplay}
          secondary={secondary}
          outline={outline}
          link={link}
        />
      )}
      <ErrorPopover
        lastError={lastError}
        setLastError={setLastError}
        target={popoverTargetRef.current}
      />
    </div>
  );
}
