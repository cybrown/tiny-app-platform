import {
  Closure,
  Opcode,
  RuntimeContext,
  WidgetDocumentation,
  metadataGet,
} from "tal-eval";
import RenderExpression from "../runtime/RenderExpression";
import React, { useCallback } from "react";
import LowLevelModal from "./internal/LowLevelModal";

type ModalProps = {
  ctx: RuntimeContext;
  children?: Opcode[];
  onClose?: Closure;
  position?: string;
  hasBackdrop?: boolean;
  size?: string;
};

export default function Modal({
  ctx,
  children,
  onClose,
  position,
  hasBackdrop,
  size,
}: ModalProps) {
  const childContext = ctx.createChild({});
  const onCloseHandler = useCallback(() => {
    onClose && ctx.callFunctionAsync(onClose, []);
  }, [ctx, onClose]);

  return (
    <LowLevelModal
      onClose={onCloseHandler}
      position={position}
      hasBackdrop={hasBackdrop ?? true}
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
    </LowLevelModal>
  );
}

export const ModalDocumentation: WidgetDocumentation<ModalProps> = {
  description: "Open an Modal",
  props: {
    children: "Widgets to render",
    onClose: "Function to call when Modal is closing",
    position: "Modal position: center (default) | left | right | top | bottom",
    hasBackdrop: "Show a backdrop behind the modal (default true)",
    size: "Size: xl",
  },
};
