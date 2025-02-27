import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConfirmPopup from "../internal/ConfirmPopup";
import ErrorPopover from "../internal/ErrorPopover";
import { Link, Button as ThemedButton } from "../../theme";
import commonStyles from "./common.module.css";
import {
  keyboardEventToShortcutDefinition,
  KEYS_TO_IGNORE,
  ShortcutDefinition,
  shortcutDefinitionEquals,
  stringifyShortcutDefinition,
  stringShortcutToShortcutDefinition,
} from "../internal/keyboard-util";

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
const enabledShortcuts: Set<string> = new Set();

function shouldTriggerEvent(
  e: KeyboardEvent,
  shortcut: ShortcutDefinition
): boolean {
  try {
    const tagName = (e.target as any).tagName;
    if (tagName === "INPUT" || tagName === "TEXTAREA") return false;
    if ((e.target as HTMLElement).contentEditable == "true") return false;
  } catch {}
  const currentDefinition = keyboardEventToShortcutDefinition(e);
  return shortcutDefinitionEquals(currentDefinition, shortcut);
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
    const shortcutDefinition = stringShortcutToShortcutDefinition(shortcut);
    const shortcutDefinitionStringCanonical =
      stringifyShortcutDefinition(shortcutDefinition);
    if (enabledShortcuts.has(shortcutDefinitionStringCanonical)) {
      throw new Error("Shortcut already assigned: " + shortcut);
    }
    const handler = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (KEYS_TO_IGNORE.includes(e.key)) return;
      if (shouldTriggerEvent(e, shortcutDefinition) && onClick) {
        doClickAction();
      }
    };
    enabledShortcuts.add(shortcutDefinitionStringCanonical);
    document.addEventListener("keydown", handler);
    return () => {
      enabledShortcuts.delete(shortcutDefinitionStringCanonical);
      document.removeEventListener("keydown", handler);
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
    () =>
      shortcut
        ? text +
          " (" +
          stringifyShortcutDefinition(
            stringShortcutToShortcutDefinition(shortcut)
          ) +
          ")"
        : text,
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
