import { useEffect, useRef } from "react";
import { Closure, RuntimeContext, runForAllStack } from "tal-eval";
import RenderError from "./RenderError";
import RenderExpression from "./RenderExpression";

export default function CustomWidgetHost({
  ctx,
  widget,
  props,
  children,
}: {
  ctx: RuntimeContext;
  widget: Closure;
  props: Record<string, unknown>;
  children: unknown[];
}) {
  const state = useRef({
    childCtx: widget.ctx.createChildForWidget({ ...props, children }),
    name: widget.name,
    oldProps: props,
    oldChildren: children,
  });

  useEffect(
    () => () => {
      state.current.childCtx.triggerDestructors();
    },
    []
  );

  if (widget.name !== state.current.name) {
    state.current.childCtx.triggerDestructors();
    state.current = {
      childCtx: ctx.createChildForWidget({ ...props, children }),
      name: widget.name,
      oldProps: props,
      oldChildren: children,
    };
  } else {
    let hasSetNewProp = false;
    for (let [key, value] of Object.entries(state.current.oldProps)) {
      if (props[key] !== value) {
        state.current.childCtx.setOwnLocalWithoutRender(key, props[key]);
        hasSetNewProp = true;
      }
    }

    if (hasSetNewProp) {
      state.current.oldProps = props;
    }

    if (children.length !== state.current.oldChildren.length) {
      state.current.childCtx.setOwnLocalWithoutRender("children", children);
    } else {
      for (let i = 0; i < children.length; i++) {
        if (children[i] !== state.current.oldChildren[i]) {
          state.current.childCtx.setOwnLocalWithoutRender("children", children);
          state.current.oldChildren = children;
          break;
        }
      }
    }
  }

  const { childCtx } = state.current;

  // TODO: Show expected render but have an error popover arround the widget
  if (childCtx.onCreateError) {
    return (
      <RenderError
        ctx={childCtx}
        phase="on_create"
        expression={null}
        err={childCtx.onCreateError}
      />
    );
  }

  const ui = (runForAllStack(childCtx, widget.name) as unknown[]).filter(
    (a) => a != null
  );
  childCtx.setCreated();
  return <RenderExpression ctx={childCtx} ui={ui} />;
}
