import styles from "./Tabs.module.css";
import { TabsProps, Text } from "../../theme";
import { metadataGet } from "tal-eval";

function computeChildStyles(meta: any) {
  if (!meta) {
    return {};
  }
  return {
    ...(meta.scroller ? { overflowY: "auto" as const } : {}),
  };
}

export default function Tabs({ value, onChange, tabs }: TabsProps) {
  const content = tabs.find((tab) => tab.id === value)?.content();

  return (
    <div>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${styles.tab} ${
              tab.id === value ? styles.selected : ""
            }`}
            onClick={() => onChange(tab.id)}
          >
            <Text text={tab.title} />
          </div>
        ))}
        <div className={styles.tabSpacer} />
      </div>
      {content ? (
        <div
          className={styles.content}
          style={computeChildStyles(metadataGet(content))}
        >
          {content}
        </div>
      ) : null}
    </div>
  );
}
