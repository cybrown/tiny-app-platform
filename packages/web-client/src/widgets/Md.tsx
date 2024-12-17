import React from "react";
import Markdown, { ReactRenderer } from "marked-react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import Snippet from "./Snippet";
import { Text } from "../theme";

type MdProps = {
  ctx: RuntimeContext;
  doc: string;
};

// Check supported languages in Snippet.tsx
const SUPPORTED_LANGUAGES = [
  "bash",
  "css",
  "html",
  "java",
  "javascript",
  "json",
  "python",
  "sql",
  "typescript",
  "yaml",
];

const renderer: Partial<ReactRenderer> = {
  code(snippet, lang) {
    if (typeof snippet != "string") throw new Error("snippet must be a string");
    if (typeof lang != "string") throw new Error("language must be a string");

    const langIsSupported = SUPPORTED_LANGUAGES.includes(lang);

    return (
      <>
        {!langIsSupported ? (
          <Text
            text={
              "Language " +
              lang +
              " is not supported, fallback to plain text code renderer:"
            }
          />
        ) : null}
        <Snippet
          ctx={null as any}
          language={SUPPORTED_LANGUAGES.includes(lang) ? lang : "text"}
          text={snippet}
        />
      </>
    );
  },
};

export default function Md({ ctx, doc }: MdProps) {
  return <Markdown value={doc} renderer={renderer} />;
}

export const MdDocumentation: WidgetDocumentation<MdProps> = {
  description: "Render MarkDown",
  props: {
    doc: "Raw markdown document",
  },
};
