import React, { useEffect, useRef } from "react";
import {
  Closure,
  RuntimeContext,
  typeAny,
  typeFunction,
  typeKindedRecord,
  typeNull,
  typeString,
  typeUnion,
  WidgetDocumentation,
} from "tal-eval";

type HtmlProps = {
  ctx: RuntimeContext;
  html: string;
  root?: string;
  onCreated?: Closure;
};

export default function Html({ ctx, html, root, onCreated }: HtmlProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!onCreated) return;
    ctx.callFunction(onCreated, [ref.current]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return React.createElement(root ?? "div", {
    ref: ref,
    dangerouslySetInnerHTML: { __html: html },
  });
}

export const HtmlDocumentation: WidgetDocumentation<HtmlProps> = {
  description: "Render HTML",
  props: {
    html: "Raw html string to render",
    root: "Root element to use, div by default",
    onCreated: "Function to call when DOM node is created",
  },
  type: typeFunction(
    [
      { name: "html", type: typeString() },
      { name: "root", type: typeUnion(typeNull(), typeString()) },
      {
        name: "onCreated",
        type: typeUnion(
          typeNull(),
          typeFunction(
            [
              {
                name: "element",
                type: typeAny() /* TODO: Use opaque type when available for dom node */,
              },
            ],
            [],
            typeAny()
          )
        ),
      },
    ],
    [],
    typeKindedRecord()
  ),
};
