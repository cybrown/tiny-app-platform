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
import { WindowFrame } from "../theme";

type OverlayProps = {
  ctx: RuntimeContext;
  children?: Opcode[];
  onClose?: Closure;
  position?: string;
  modal?: boolean;
  size?: string;
  title?: string;
  noFrame?: boolean;
};

export default function Overlay({
  ctx,
  children,
  onClose,
  position,
  modal,
  size,
  title,
  noFrame,
}: OverlayProps) {
  const childContext = ctx.createChild({});
  const onCloseHandler = useCallback(() => {
    onClose && ctx.callFunctionAsync(onClose, []);
  }, [ctx, onClose]);

  const content = (children ?? [])
    .flat(Infinity)
    .filter((child) => child)
    .map((child) => ({
      node: <RenderExpression ctx={childContext} ui={child} />,
      meta: metadataGet(child) ?? {},
    }))
    .map((child, index) => (
      <React.Fragment key={index}>{child.node}</React.Fragment>
    ));

  return (
    <LowLevelOverlay
      onClose={onCloseHandler}
      position={position}
      modal={modal ?? true}
      size={size}
    >
      {noFrame ? (
        content
      ) : (
        <WindowFrame
          title={title}
          onClose={onCloseHandler}
          position={position}
          modal={modal ?? true}
          size={size}
        >
          {content}
        </WindowFrame>
      )}
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
    size: "Size: m, l, xl",
    title: "Title to display",
    noFrame: "Hide window frame",
  },
};
