import { Closure, Opcode, RuntimeContext, WidgetDocumentation } from "tal-eval";
import RenderExpression from "../runtime/RenderExpression";
import { WindowFrame as ThemedWindowFrame } from "../theme";
import { metadataGet } from "tal-eval";
import React, { useCallback } from "react";

export type WindowFrameProps = {
  ctx: RuntimeContext;
  children: Opcode[];
  drag?: boolean;
  onClose: Closure;
};

export default function WindowFrame({
  ctx,
  children,
  drag,
  onClose,
}: WindowFrameProps) {
  const childContext = ctx.createChild({});

  const doOnCloseAction = useCallback(() => {
    (async () => {
      if (!onClose) {
        return;
      }
      try {
        const evaluationPromise = ctx.callFunctionAsync(onClose, []);
        await evaluationPromise;
      } catch (err) {
        console.log("Error while closing a WindowFrame", err);
      }
    })();
  }, [ctx, onClose]);

  return (
    <ThemedWindowFrame
      modal
      onClose={doOnCloseAction}
      title={document.title}
      drag={drag}
    >
      {children
        .flat(Infinity)
        .filter((child) => child)
        .map((child) => ({
          node: <RenderExpression ctx={childContext} ui={child} />,
          meta: metadataGet(child) ?? {},
        }))
        .map((child, index) => (
          <React.Fragment key={index}>{child.node}</React.Fragment>
        ))}
    </ThemedWindowFrame>
  );
}

export const WindowFrameDocumentation: WidgetDocumentation<WindowFrameProps> = {
  description: "A Window Frame to contain widgets inside a Window",
  props: {
    children: "Widgets to render",
    onClose: "Handler to call when close button is pressed",
    drag: "Make window draggable on Electron",
  },
};
