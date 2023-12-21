import { useCallback, useState } from "react";
import { Closure, RuntimeContext, WidgetDocumentation } from "tal-eval";
import ConfirmPopup from "./internal/ConfirmPopup";
import ErrorPopin from "./internal/ErrorPopin";
import { useTheme } from "../theme";

type ButtonProps = {
  ctx: RuntimeContext;
  text: string;
  onClick: Closure;
  confirm?: string | boolean;
  secondary?: boolean;
  disabled?: boolean;
};

export default function Button({
  ctx,
  onClick,
  text,
  confirm,
  secondary,
  disabled,
}: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const doClickAction = useCallback(() => {
    (async () => {
      if (!onClick) {
        return;
      }
      try {
        setLastError(null);
        const evaluationPromise = ctx.callFunctionAsync(onClick, []);
        setIsLoading(true);
        await evaluationPromise;
      } catch (err) {
        setLastError(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [ctx, onClick]);

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const clickHandler = useCallback(() => {
    if (confirm) {
      setShowConfirmPopup(true);
    } else {
      doClickAction();
    }
  }, [confirm, doClickAction]);

  const [lastError, setLastError] = useState(null as any);

  const theme = useTheme();

  return (
    <>
      <ConfirmPopup
        show={showConfirmPopup}
        setShow={setShowConfirmPopup}
        confirm={confirm}
        onOk={doClickAction}
      />
      <theme.Button
        onClick={clickHandler}
        disabled={disabled || isLoading}
        text={text}
        secondary={secondary}
      />
      <ErrorPopin lastError={lastError} setLastError={setLastError} />
    </>
  );
}

export const ButtonDocumentation: WidgetDocumentation<ButtonProps> = {
  description: "A clickable button",
  props: {
    confirm: "Message to show to confirm the action",
    disabled: "Do not allow the user to interact with this widget",
    onClick: "Expression to evaluate on click",
    secondary: "Give the secondary style",
    text: "Message to show inside the button",
  },
};
