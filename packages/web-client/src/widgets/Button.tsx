import { useCallback, useState } from "react";
import { FunctionExpression } from "tal-parser";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import ConfirmPopup from "./internal/ConfirmPopup";
import ErrorPopin from "./internal/ErrorPopin";
import StyledButton from "./internal/StyledButton";

type ButtonProps = {
  ctx: RuntimeContext;
  text: string;
  onClick: FunctionExpression;
  confirm?: string | boolean;
  secondary?: boolean;
};

export default function Button({
  ctx,
  onClick,
  text,
  confirm,
  secondary,
}: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const doClickAction = useCallback(() => {
    (async () => {
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

  return (
    <>
      <ConfirmPopup
        show={showConfirmPopup}
        setShow={setShowConfirmPopup}
        confirm={confirm}
        onOk={doClickAction}
      />
      <StyledButton
        onClick={clickHandler}
        disabled={isLoading}
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
    onClick: "Expression to evaluate on click",
    secondary: "Give the secondary style",
    text: "Message to show inside the button",
  },
};
