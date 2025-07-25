import { useCallback, useMemo, useState } from "react";
import {
  typeBoolean,
  typeFunction,
  typeKindedRecord,
  typeNull,
  typeString,
  typeUnion,
  WidgetDocumentation,
} from "tal-eval";
import styles from "./Snippet.module.css";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-bash.min";
import "prismjs/components/prism-java.min";
import "prismjs/components/prism-json.min";
import "prismjs/components/prism-python.min";
import "prismjs/components/prism-sql.min";
import "prismjs/components/prism-typescript.min";
import "prismjs/components/prism-yaml.min";
import usePressEscape from "./internal/usePressEscape";
import { Button, Container } from "../theme";

type SnippetProps = {
  text: string;
  language: string;
  format?: boolean;
  noMaxHeight?: boolean;
};

export default function Snippet({
  text,
  language,
  format,
  noMaxHeight,
}: SnippetProps) {
  const copyClickHandler = useCallback(() => {
    navigator.clipboard.writeText(text);
  }, [text]);

  const textToRender = useMemo(() => {
    if (language === "json" && format) {
      try {
        return JSON.stringify(JSON.parse(text), null, "  ");
      } catch (err) {}
    }
    return text;
  }, [format, language, text]);

  const copyFormattedClickHandler = useCallback(() => {
    navigator.clipboard.writeText(textToRender);
  }, [textToRender]);

  const htmlToRender: undefined | string = useMemo(() => {
    if (language != null) {
      return Prism.highlight(textToRender, Prism.languages[language], language);
    }
  }, [language, textToRender]);

  const [fullScreen, setFullScreen] = useState(false);

  const toggleFullScreen = useCallback(() => {
    setFullScreen(!fullScreen);
  }, [fullScreen]);

  const quitFullScreen = useCallback(() => setFullScreen(false), []);

  usePressEscape(quitFullScreen);

  const [viewMore, setViewMore] = useState(false);

  const viewMoreHandler = useCallback(() => {
    setViewMore(!viewMore);
  }, [viewMore]);

  return (
    <Container height={noMaxHeight ? undefined : viewMore ? 16 : 8}>
      <div className={styles.Snippet}>
        {fullScreen ? (
          <div className={styles.fullScreen}>
            <div className={styles.floatingFullscreenToolbar}>
              <Button onClick={copyClickHandler} text="Copy" />
              {format ? (
                <Button
                  onClick={copyFormattedClickHandler}
                  text="Copy formatted"
                />
              ) : null}
              <Button onClick={toggleFullScreen} text="Close" />
            </div>
            <div className={styles.scroller}>
              {htmlToRender ? (
                <pre
                  className={styles.preFullscreen}
                  dangerouslySetInnerHTML={{ __html: htmlToRender }}
                />
              ) : (
                <pre className={styles.preFullscreen}>{textToRender}</pre>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className={styles.floatingToolBar}>
              <Button onClick={copyClickHandler} text="Copy" />
              {format ? (
                <Button
                  onClick={copyFormattedClickHandler}
                  text="Copy formatted"
                />
              ) : null}
              {!noMaxHeight ? (
                <Button onClick={viewMoreHandler} text="View more" />
              ) : null}
              <Button onClick={toggleFullScreen} text="Fullscreen" />
            </div>
            <div className={styles.preContainer}>
              {htmlToRender ? (
                <pre
                  className={styles.preInline}
                  dangerouslySetInnerHTML={{ __html: htmlToRender }}
                />
              ) : (
                <pre className={styles.preInline}>{textToRender}</pre>
              )}
            </div>
          </>
        )}
      </div>
    </Container>
  );
}

export const SnippetDocumentation: WidgetDocumentation<SnippetProps> = {
  description: "Show code samples",
  props: {
    format: "true to try to format the source",
    language:
      "Language to highlight and format, one of: html, javascript, json, xml",
    noMaxHeight: "Allow the widget to occupy all the vertical space it needs",
    text: "Snippet content to show",
  },
  type: typeFunction(
    [
      { name: "format", type: typeUnion(typeNull(), typeBoolean()) },
      { name: "language", type: typeUnion(typeNull(), typeString()) },
      { name: "noMaxHeight", type: typeUnion(typeNull(), typeBoolean()) },
      { name: "text", type: typeString() },
    ],
    [],
    typeKindedRecord()
  ),
};
