import { useCallback, useMemo, useState } from "react";
import { RuntimeContext, WidgetDocumentation } from "tal-eval";
import styles from "./Snippet.module.css";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-json.min";
import usePressEscape from "./internal/usePressEscape";

type SnippetProps = {
  ctx: RuntimeContext;
  text: string;
  language: string;
  format?: boolean;
  noMaxHeight?: boolean;
};

export default function Snippet({
  ctx,
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
    <div
      className={[
        styles.Snippet,
        noMaxHeight ? styles.noMaxHeight : "",
        viewMore ? styles.viewMore : "",
      ].join(" ")}
    >
      {fullScreen ? (
        <div className={styles.fullScreen}>
          <div className={styles.floatingFullscreenToolbar}>
            <button onClick={copyClickHandler}>Copy</button>
            {format ? (
              <button onClick={copyFormattedClickHandler}>
                Copy formatted
              </button>
            ) : null}
            <button onClick={toggleFullScreen}>Close</button>
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
            <button onClick={copyClickHandler}>Copy</button>
            {format ? (
              <button onClick={copyFormattedClickHandler}>
                Copy formatted
              </button>
            ) : null}
            <button onClick={viewMoreHandler}>View more</button>
            <button onClick={toggleFullScreen}>Fullscreen</button>
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
};
