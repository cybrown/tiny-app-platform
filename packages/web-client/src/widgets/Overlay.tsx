import {
  Closure,
  Opcode,
  RuntimeContext,
  WidgetDocumentation,
  metadataGet,
} from "tal-eval";
import RenderExpression from "../runtime/RenderExpression";
import React, { useCallback } from "react";
import LowLevelOverlay from "./internal/LowLevelOverlay";

type OverlayProps = {
  ctx: RuntimeContext;
  children?: Opcode[];
  onClose?: Closure;
  position?: string;
  modal?: boolean;
  size?: string;
};

export default function Overlay({
  ctx,
  children,
  onClose,
  position,
  modal,
  size,
}: OverlayProps) {
  const childContext = ctx.createChild({});
  const onCloseHandler = useCallback(() => {
    onClose && ctx.callFunctionAsync(onClose, []);
  }, [ctx, onClose]);

  return (
    <LowLevelOverlay
      onClose={onCloseHandler}
      position={position}
      modal={modal ?? true}
      size={size}
    >
      {(children ?? [])
        .flat(Infinity)
        .filter((child) => child)
        .map((child) => ({
          node: <RenderExpression ctx={childContext} ui={child} />,
          meta: metadataGet(child) ?? {},
        }))
        .map((child, index) => (
          <React.Fragment key={index}>{child.node}</React.Fragment>
        ))}
    </LowLevelOverlay>
  );
}

export const OverlayDocumentation: WidgetDocumentation<OverlayProps> = {
  description: "Open an Overlay",
  props: {
    children: "Widgets to render",
    onClose: "Function to call when Overlay is closing",
    position:
      "Overlay position: center (default) | left | right | top | bottom",
    modal: "Make the Overlay modal (default true)",
    size: "Size: xl",
  },
};
